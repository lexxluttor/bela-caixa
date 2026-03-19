
/* Bela Caixa - sincronização revisada e estável */
var SYNC_URL='/.netlify/functions/sync';
var SYNC_KEYS=['clientes','produtos','vendas','creditos','fiados','pagamentos'];
var _syncDirty=localStorage.getItem('bm_sync_dirty')==='1';
var _syncBusy=false;
var _syncEveryMs=600000; // 10 min
var _syncTimer=null;
var _syncDebounce=null;

function uid(prefix){
  prefix = prefix || 'id';
  return prefix + '_' + Math.random().toString(36).slice(2,10) + '_' + Date.now().toString(36);
}
function nowIso(){ return new Date().toISOString(); }

function getDeletedState(){
  try{
    var raw = JSON.parse(localStorage.getItem('bm_deleted') || '{}');
    return {
      clientes: Array.isArray(raw.clientes) ? raw.clientes : [],
      produtos: Array.isArray(raw.produtos) ? raw.produtos : [],
      vendas: Array.isArray(raw.vendas) ? raw.vendas : [],
      creditos: Array.isArray(raw.creditos) ? raw.creditos : [],
      fiados: Array.isArray(raw.fiados) ? raw.fiados : [],
      pagamentos: Array.isArray(raw.pagamentos) ? raw.pagamentos : []
    };
  }catch(e){
    return {clientes:[],produtos:[],vendas:[],creditos:[],pagamentos:[]};
  }
}
function setDeletedState(obj){
  localStorage.setItem('bm_deleted', JSON.stringify({
    clientes: Array.isArray(obj.clientes) ? obj.clientes : [],
    produtos: Array.isArray(obj.produtos) ? obj.produtos : [],
    vendas: Array.isArray(obj.vendas) ? obj.vendas : [],
    creditos: Array.isArray(obj.creditos) ? obj.creditos : [],
    fiados: Array.isArray(obj.fiados) ? obj.fiados : [],
    pagamentos: Array.isArray(obj.pagamentos) ? obj.pagamentos : []
  }));
}
function markDeleted(bucket, id){
  if(!bucket || !id) return;
  var st = getDeletedState();
  if(!Array.isArray(st[bucket])) st[bucket] = [];
  if(st[bucket].indexOf(String(id)) === -1) st[bucket].push(String(id));
  setDeletedState(st);
  markLocalDirty();
  scheduleSyncSoon();
}
function clearDeletedState(){
  setDeletedState({clientes:[],produtos:[],vendas:[],creditos:[],pagamentos:[]});
}

function fmtDt(v){
  if(!v) return '—';
  try{return new Date(v).toLocaleString('pt-BR');}catch(e){return v;}
}
function setSS(s,m){
  var d=document.getElementById('sdot'), t=document.getElementById('stxt');
  if(d)d.className='sdot '+s;
  if(t)t.textContent=m;
  var ps=document.getElementById('ps-status');
  var pu=document.getElementById('ps-ultimo-sync');
  var pb=document.getElementById('ps-ultimo-backup');
  var pm=document.getElementById('ps-modo');
  if(ps)ps.textContent=m||'';
  if(pu)pu.textContent=fmtDt(localStorage.getItem('bm_sync_remote_at')||localStorage.getItem('bm_sync_local_at'));
  if(pb)pb.textContent=fmtDt(localStorage.getItem('bm_backup_last_at'));
  if(pm)pm.textContent=navigator.onLine?'Online':'Offline';
}

function ensureRecordIds(list, prefix){
  if(!Array.isArray(list)) return [];
  var changed = false;
  var out = list.map(function(item){
    if(!item || typeof item !== 'object') return item;
    var obj = Object.assign({}, item);
    if(!obj.id){
      obj.id = uid(prefix);
      changed = true;
    }
    if(!obj.updatedAt){
      obj.updatedAt = nowIso();
      changed = true;
    }
    return obj;
  });
  return out;
}

function normalizeDbShape(db){
  db = db || {};
  return {
    clientes: ensureRecordIds(db.clientes || [], 'cli'),
    produtos: ensureRecordIds(db.produtos || [], 'pro'),
    vendas: ensureRecordIds(db.vendas || [], 'ven'),
    creditos: ensureRecordIds(db.creditos || [], 'cre'),
    fiados: ensureRecordIds(db.fiados || [], 'fia'),
    pagamentos: ensureRecordIds(db.pagamentos || [], 'pag')
  };
}

function collectDB(){
  var db={};
  SYNC_KEYS.forEach(function(k){ db[k]=DB.get(k); });
  db = normalizeDbShape(db);
  db._deleted = getDeletedState();
  return db;
}

function markLocalDirty(){
  var now=nowIso();
  localStorage.setItem('bm_sync_local_at', now);
  localStorage.setItem('bm_sync_dirty', '1');
  _syncDirty=true;
  setSS('sync','Alterações locais pendentes');
}

function scheduleSyncSoon(){
  if(_syncDebounce) clearTimeout(_syncDebounce);
  _syncDebounce=setTimeout(function(){
    if(navigator.onLine){ syncPushNow(); }
  }, 2500);
}

function rerenderAfterSync(){
  ['renderDash','renderVendas','renderReceb','renderCob','renderClientes','renderClis','renderProd','renderProds','renderCaixa','renderCred','renderHist','renderRel'].forEach(function(fn){
    try{ if(typeof window[fn]==='function') window[fn](); }catch(e){}
  });
}

function installSyncHooks(){
  if(window.DB && DB.set && !DB._syncWrapped){
    var origSet=DB.set;
    DB.set=function(k,v){
      var value = v;
      if(SYNC_KEYS.indexOf(k) >= 0){
        var prefixMap = {clientes:'cli',produtos:'pro',vendas:'ven',creditos:'cre',fiados:'fia',pagamentos:'pag'};
        value = ensureRecordIds(Array.isArray(v) ? v : [], prefixMap[k] || 'row');
      }
      var r=origSet.call(DB,k,value);
      try{
        markLocalDirty();
        scheduleSyncSoon();
      }catch(e){}
      return r;
    };
    DB._syncWrapped=true;
  }
}

async function syncUp(){
  if(_syncBusy || !_syncDirty) return;
  installSyncHooks();
  _syncBusy=true;
  setSS('sync','Enviando dados...');
  try{
    var body={action:'push', localUpdatedAt: localStorage.getItem('bm_sync_local_at') || '', db: collectDB()};
    var res=await fetch(SYNC_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    var data=await res.json();
    if(data && data.ok){
      if(data.updatedAt) localStorage.setItem('bm_sync_remote_at', data.updatedAt);
      if(data.backupAt) localStorage.setItem('bm_backup_last_at', data.backupAt);
      localStorage.setItem('bm_sync_dirty','0');
      _syncDirty=false;
      clearDeletedState();
      setSS('ok','Sincronizado '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}));
      return true;
    }else{
      setSS('err','Falha ao enviar');
      return false;
    }
  }catch(e){
    setSS('err','Offline — usando dados locais');
    return false;
  }finally{
    _syncBusy=false;
  }
}

function applyRemoteDB(payload){
  if(!payload || !payload.db) return false;
  var db = normalizeDbShape(payload.db);
  localStorage.setItem('bm_clientes', JSON.stringify(db.clientes || []));
  localStorage.setItem('bm_produtos', JSON.stringify(db.produtos || []));
  localStorage.setItem('bm_vendas', JSON.stringify(db.vendas || []));
  localStorage.setItem('bm_creditos', JSON.stringify(db.creditos || []));
  localStorage.setItem('bm_fiados', JSON.stringify(db.fiados || []));
  localStorage.setItem('bm_pagamentos', JSON.stringify(db.pagamentos || []));
  if(payload.updatedAt) localStorage.setItem('bm_sync_remote_at', payload.updatedAt);
  if(payload.backupAt) localStorage.setItem('bm_backup_last_at', payload.backupAt);
  return true;
}

async function syncDown(force){
  if(_syncBusy) return false;
  installSyncHooks();
  _syncBusy=true;
  setSS('sync','Verificando novidades...');
  try{
    var res=await fetch(SYNC_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'pull', since: force ? '' : (localStorage.getItem('bm_sync_remote_at') || '')})
    });
    var data=await res.json();
    if(data && data.ok){
      if(data.changed && applyRemoteDB(data)){
        rerenderAfterSync();
        setSS('ok','Dados atualizados do servidor');
      }else{
        if(data.updatedAt) localStorage.setItem('bm_sync_remote_at', data.updatedAt);
        if(data.backupAt) localStorage.setItem('bm_backup_last_at', data.backupAt);
        setSS('ok','Sem novidades no servidor');
      }
      return true;
    }else{
      setSS('err','Sem resposta do servidor');
      return false;
    }
  }catch(e){
    setSS('err','Offline — dados locais');
    return false;
  }finally{
    _syncBusy=false;
  }
}

async function syncPushNow(){
  markLocalDirty();
  return await syncUp();
}
async function syncNow(){
  await syncPushNow();
  await syncDown(true);
}

async function backupNowServidor(){
  setSS('sync','Gerando backup...');
  try{
    var res=await fetch(SYNC_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'backupNow'})
    });
    var data=await res.json();
    if(data && data.ok){
      if(data.backupAt) localStorage.setItem('bm_backup_last_at', data.backupAt);
      setSS('ok','Backup gerado');
      if(typeof toast==='function') toast('✅ Backup no servidor gerado!','ok');
    }else{
      setSS('err','Falha no backup');
    }
  }catch(e){
    setSS('err','Falha no backup');
  }
}

function openSyncPanel(){
  var p=document.getElementById('ov-sync');
  if(p)p.classList.add('on');
  setSS((navigator.onLine?'ok':'err'), document.getElementById('stxt') ? document.getElementById('stxt').textContent : 'Sincronização');
}
function closeSyncPanel(){
  var p=document.getElementById('ov-sync');
  if(p)p.classList.remove('on');
}

function startSyncLoop(){
  installSyncHooks();
  setSS('sync','Iniciando sincronização...');
  syncDown(true);
  if(_syncTimer) clearInterval(_syncTimer);
  _syncTimer=setInterval(function(){
    if(_syncDirty){ syncUp(); }
    else{ syncDown(false); }
  }, _syncEveryMs);
  window.addEventListener('online', function(){ setSS('sync','Conexão retomada'); syncNow(); });
  window.addEventListener('offline', function(){ setSS('err','Offline — dados locais'); });
}

function gerarObjetoBackup(){
  return {
    app: 'Bela Caixa',
    version: 'backup-local-v4',
    exportedAt: nowIso(),
    data: Object.assign({}, collectDB(), {
      _cfg: (function(){
        try{
          return {
            bm_cfg: JSON.parse(localStorage.getItem('bm_cfg') || '{}'),
            bm_cfg_obj: JSON.parse(localStorage.getItem('bm_cfg_obj') || '{}'),
            adm_senha: localStorage.getItem('adm_senha') || ''
          };
        }catch(e){
          return { bm_cfg:{}, bm_cfg_obj:{}, adm_senha:'' };
        }
      })()
    })
  };
}
function exportarBackup(){
  try{
    var backup = gerarObjetoBackup();
    var stamp = nowIso().slice(0,19).replace(/[:T]/g,'-');
    var blob = new Blob([JSON.stringify(backup, null, 2)], {type:'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup-bela-caixa-' + stamp + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
    if(typeof toast==='function') toast('✅ Backup gerado!','ok');
  }catch(e){
    if(typeof toast==='function') toast('❌ Erro ao gerar backup!');
    else alert('Erro ao gerar backup');
  }
}
function aplicarBackupObjeto(obj){
  if(!obj || !obj.data) throw new Error('Arquivo de backup inválido');
  var db = normalizeDbShape(obj.data);
  localStorage.setItem('bm_clientes', JSON.stringify(db.clientes || []));
  localStorage.setItem('bm_produtos', JSON.stringify(db.produtos || []));
  localStorage.setItem('bm_vendas', JSON.stringify(db.vendas || []));
  localStorage.setItem('bm_creditos', JSON.stringify(db.creditos || []));
  localStorage.setItem('bm_fiados', JSON.stringify(db.fiados || []));
  localStorage.setItem('bm_pagamentos', JSON.stringify(db.pagamentos || []));
  setDeletedState(obj.data._deleted || {clientes:[],produtos:[],vendas:[],creditos:[],pagamentos:[]});
  var cfg = obj.data._cfg || {};
  try{
    localStorage.setItem('bm_cfg', JSON.stringify(cfg.bm_cfg || {}));
    localStorage.setItem('bm_cfg_obj', JSON.stringify(cfg.bm_cfg_obj || {}));
    if(cfg.adm_senha !== undefined) localStorage.setItem('adm_senha', cfg.adm_senha || '');
  }catch(e){}
}
function restaurarBackupArquivo(ev){
  var file = ev && ev.target && ev.target.files ? ev.target.files[0] : null;
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    try{
      var obj = JSON.parse(String(reader.result || '{}'));
      if(!confirm('Restaurar este backup e substituir os dados atuais?')) return;
      aplicarBackupObjeto(obj);
      if(typeof toast==='function') toast('✅ Backup restaurado! Recarregando...','ok');
      setTimeout(function(){ location.reload(); }, 700);
    }catch(e){
      if(typeof toast==='function') toast('❌ Arquivo inválido!');
      else alert('Arquivo inválido');
    }
  };
  reader.readAsText(file);
  if(ev.target) ev.target.value = '';
}


function installDeleteSyncHooks(){
  try{
    var origDelCli = window.delCli;
    if(typeof origDelCli === 'function' && !origDelCli._syncWrappedDelete){
      var wrappedDelCli = function(id){
        markDeleted('clientes', id);
        return origDelCli.apply(this, arguments);
      };
      wrappedDelCli._syncWrappedDelete = true;
      window.delCli = wrappedDelCli;
    }
  }catch(e){}
  try{
    var origDelProd = window.delProd;
    if(typeof origDelProd === 'function' && !origDelProd._syncWrappedDelete){
      var wrappedDelProd = function(id){
        markDeleted('produtos', id);
        return origDelProd.apply(this, arguments);
      };
      wrappedDelProd._syncWrappedDelete = true;
      window.delProd = wrappedDelProd;
    }
  }catch(e){}
  try{
    var origCancelVenda = window.cancelarVenda;
    if(typeof origCancelVenda === 'function' && !origCancelVenda._syncWrappedDelete){
      var wrappedCancelVenda = function(id){
        markDeleted('vendas', id);
        markDeleted('fiados', id);
        return origCancelVenda.apply(this, arguments);
      };
      wrappedCancelVenda._syncWrappedDelete = true;
      window.cancelarVenda = wrappedCancelVenda;
    }
  }catch(e){}
  try{
    var origDelFiado = window.delFiado;
    if(typeof origDelFiado === 'function' && !origDelFiado._syncWrappedDelete){
      var wrappedDelFiado = function(id){
        markDeleted('fiados', id);
        return origDelFiado.apply(this, arguments);
      };
      wrappedDelFiado._syncWrappedDelete = true;
      window.delFiado = wrappedDelFiado;
    }
  }catch(e){}
  try{
    var origExcReceb = window.excluirRecebCaixa;
    if(typeof origExcReceb === 'function' && !origExcReceb._syncWrappedDelete){
      var wrappedExcReceb = function(id){
        markDeleted('pagamentos', id);
        return origExcReceb.apply(this, arguments);
      };
      wrappedExcReceb._syncWrappedDelete = true;
      window.excluirRecebCaixa = wrappedExcReceb;
    }
  }catch(e){}
}

window.addEventListener('load', function(){
  setTimeout(function(){
    try{
      installDeleteSyncHooks();
      startSyncLoop();
    }catch(e){}
  }, 400);
});



/* BLINDAGEM DE DADOS */
(function(){
  const BLIND_KEYS = ["clientes","produtos","vendas","creditos","pagamentos"];
  const PREFIX = { clientes:"cli", produtos:"pro", vendas:"ven", creditos:"cre", pagamentos:"pag" };

  function nowIso(){ return new Date().toISOString(); }
  function uid(prefix){
    prefix = prefix || "id";
    return prefix + "_" + Math.random().toString(36).slice(2,10) + "_" + Date.now().toString(36);
  }
  function normalizeForCompare(obj){
    if(!obj || typeof obj !== "object") return obj;
    const copy = JSON.parse(JSON.stringify(obj));
    delete copy.updatedAt;
    delete copy.createdAt;
    return copy;
  }
  function ensureMeta(list, prefix, previousList){
    list = Array.isArray(list) ? list : [];
    previousList = Array.isArray(previousList) ? previousList : [];
    const stamp = nowIso();
    const prevMap = new Map(
      previousList.filter(x => x && typeof x === "object" && x.id)
                  .map(x => [String(x.id), x])
    );
    return list.map(function(item){
      if(!item || typeof item !== "object") return item;
      const obj = Object.assign({}, item);
      if(!obj.id) obj.id = uid(prefix);
      const prev = prevMap.get(String(obj.id));
      if(prev){
        const same = JSON.stringify(normalizeForCompare(prev)) === JSON.stringify(normalizeForCompare(obj));
        obj.createdAt = prev.createdAt || prev.updatedAt || obj.createdAt || obj.data || stamp;
        obj.updatedAt = same ? (prev.updatedAt || obj.updatedAt || obj.createdAt || obj.data || stamp) : stamp;
      }else{
        obj.createdAt = obj.createdAt || obj.updatedAt || obj.data || stamp;
        obj.updatedAt = obj.updatedAt || obj.createdAt;
      }
      return obj;
    });
  }

  function installDbBlind(){
    if(!window.DB || typeof DB.set !== "function" || DB._blindWrapped) return;
    const origSet = DB.set;
    DB.set = function(key, value){
      let finalValue = value;
      if(BLIND_KEYS.indexOf(key) >= 0){
        let previous = [];
        try{ previous = typeof DB.get === "function" ? (DB.get(key) || []) : []; }catch(e){ previous = []; }
        finalValue = ensureMeta(Array.isArray(value) ? value : [], PREFIX[key] || "row", previous);
      }
      const result = origSet.call(DB, key, finalValue);
      if(BLIND_KEYS.indexOf(key) >= 0){
        try{ localStorage.setItem("bm_" + key, JSON.stringify(finalValue)); }catch(e){}
      }
      return result;
    };
    DB._blindWrapped = true;
  }

  function blindAllData(){
    BLIND_KEYS.forEach(function(key){
      let current = [];
      try{
        current = (window.DB && typeof DB.get === "function") ? (DB.get(key) || []) : JSON.parse(localStorage.getItem("bm_" + key) || "[]");
      }catch(e){ current = []; }
      const fixed = ensureMeta(current, PREFIX[key] || "row", current);
      try{ localStorage.setItem("bm_" + key, JSON.stringify(fixed)); }catch(e){}
      if(window.DB && typeof DB.set === "function"){
        try{ DB.set(key, fixed); }catch(e){}
      }
    });
  }

  window.blindAllData = blindAllData;

  window.addEventListener("load", function(){
    setTimeout(function(){
      installDbBlind();
      blindAllData();
    }, 250);
  });
})();
