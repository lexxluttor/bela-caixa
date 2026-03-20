/*!
 * Bela Modas Sheets Sync — PC principal
 * Fluxo novo:
 * - PC é a única ponta que escreve
 * - Mobile apenas consulta via GET no Apps Script
 * - Merge por id + updatedAt
 * - Exclusão persistente via tombstones em bm_deleted_* e planilha _deleted
 */
(function(){
  "use strict";

  const API_URL = "https://script.google.com/macros/s/AKfycbzH4m2rIWkzHLf_SPldVWBk6uSbhmwWz_OLZENRr0A-9XOzCtHsU5fbLtJCm-ZKss0k/exec";
  const SYNC_INTERVAL_MS = 20000;
  const LOCAL_TABLES = ["clientes","produtos","vendas","pagamentos","creditos"];
  const REMOTE_BY_LOCAL = {
    clientes: "clientes",
    produtos: "produtos",
    vendas: "vendas",
    pagamentos: "recebimentos",
    creditos: "cobrancas"
  };
  const LOCAL_BY_REMOTE = {
    clientes: "clientes",
    produtos: "produtos",
    vendas: "vendas",
    recebimentos: "pagamentos",
    cobrancas: "creditos"
  };

  let syncTimer = null;
  let debounceTimer = null;
  let syncing = false;
  let patchDone = false;
  let _rawSet = localStorage.setItem.bind(localStorage);

  function pad2(n){ return String(n).padStart(2, "0"); }
  function isoNow(){
    const d = new Date();
    return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate())+"T"+
      pad2(d.getHours())+":"+pad2(d.getMinutes())+":"+pad2(d.getSeconds());
  }
  function deepClone(v){ return JSON.parse(JSON.stringify(v)); }
  function safeParse(text, fallback){ try{ return JSON.parse(text); }catch(e){ return fallback; } }
  function readLocal(name){ return safeParse(localStorage.getItem("bm_"+name) || "[]", []); }
  function writeLocal(name, rows){ _rawSet("bm_"+name, JSON.stringify(Array.isArray(rows)?rows:[])); }
  function readDeleted(name){ return safeParse(localStorage.getItem("bm_deleted_"+name) || "[]", []); }
  function writeDeleted(name, rows){ _rawSet("bm_deleted_"+name, JSON.stringify(Array.isArray(rows)?rows:[])); }
  function parseStamp(v){ if(!v) return 0; const t = new Date(v).getTime(); return Number.isFinite(t) ? t : 0; }
  function newestStamp(row){
    if(!row) return 0;
    return Math.max(parseStamp(row.updatedAt), parseStamp(row.deletedAt), parseStamp(row.createdAt), parseStamp(row.data));
  }
  function normalizeCell(v){
    if(v === undefined || v === null) return "";
    if(v instanceof Date) return v.toISOString();
    if(typeof v === "object") return JSON.stringify(v);
    return v;
  }
  function ensureBaseRow(row, prefix){
    row = row || {};
    const stamp = row.updatedAt || row.createdAt || row.data || isoNow();
    return Object.assign({}, row, {
      id: String(row.id || (prefix + "_" + Math.random().toString(36).slice(2,10))),
      createdAt: row.createdAt || row.data || stamp,
      updatedAt: row.updatedAt || stamp,
      deletedAt: row.deletedAt || ""
    });
  }

  function normalizeClient(r){
    r = ensureBaseRow(r, "cli");
    return {
      id: r.id,
      nome: r.nome || "",
      tel: r.tel || r.telefone || "",
      cpf: r.cpf || "",
      end: r.end || r.endereco || "",
      obs: r.obs || "",
      data: r.data || r.createdAt || r.updatedAt || isoNow(),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: r.deletedAt || ""
    };
  }
  function normalizeProduct(r){
    r = ensureBaseRow(r, "pro");
    return {
      id: r.id,
      nome: r.nome || "",
      preco: Number(r.preco || 0),
      estq: Number(r.estq != null ? r.estq : (r.estoque != null ? r.estoque : 0)),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: r.deletedAt || ""
    };
  }
  function normalizeVenda(r){
    r = ensureBaseRow(r, "ven");
    return {
      id: r.id,
      cid: String(r.cid || ""),
      cliNome: r.cliNome || r.cliente || "Balcão",
      forma: r.forma || r.forma_pagamento || "",
      total: Number(r.total || 0),
      itens: Array.isArray(r.itens) ? r.itens : safeParse(r.itens_json || "[]", []),
      data: r.data || r.createdAt || r.updatedAt || isoNow(),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: r.deletedAt || ""
    };
  }
  function normalizePagamento(r){
    r = ensureBaseRow(r, "pag");
    return {
      id: r.id,
      vid: String(r.vid || r.venda_id || ""),
      cid: String(r.cid || ""),
      val: Number(r.val || r.valor || 0),
      forma: r.forma || r.forma_pagamento || "",
      obs: r.obs || "",
      data: r.data || r.createdAt || r.updatedAt || isoNow(),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: r.deletedAt || ""
    };
  }
  function normalizeCredito(r){
    r = ensureBaseRow(r, "cre");
    return {
      id: r.id,
      cid: String(r.cid || ""),
      vid: String(r.vid || ""),
      cliNome: r.cliNome || r.cliente || "",
      desc: r.desc || r.descricao || "",
      val: Number(r.val || r.valor || 0),
      status: r.status || "aberto",
      vencimento: r.vencimento || r.data || r.createdAt || isoNow(),
      data: r.data || r.vencimento || r.createdAt || isoNow(),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: r.deletedAt || ""
    };
  }

  function normalizeLocalTable(name, rows){
    rows = Array.isArray(rows) ? rows : [];
    if(name === "clientes") return rows.filter(x=>x && x.id).map(normalizeClient);
    if(name === "produtos") return rows.filter(x=>x && x.id).map(normalizeProduct);
    if(name === "vendas") return rows.filter(x=>x && x.id).map(normalizeVenda);
    if(name === "pagamentos") return rows.filter(x=>x && x.id).map(normalizePagamento);
    if(name === "creditos") return rows.filter(x=>x && x.id).map(normalizeCredito);
    return [];
  }
  function serializeRemote(name, rows, clientesAtivos){
    rows = Array.isArray(rows) ? rows : [];
    if(name === "clientes") return rows.map(function(c){ c = normalizeClient(c); return { id:c.id, nome:c.nome, telefone:c.tel, cpf:c.cpf, endereco:c.end, obs:c.obs, data:c.data, createdAt:c.createdAt, updatedAt:c.updatedAt, deletedAt:c.deletedAt }; });
    if(name === "produtos") return rows.map(function(p){ p = normalizeProduct(p); return { id:p.id, nome:p.nome, preco:p.preco, estoque:p.estq, createdAt:p.createdAt, updatedAt:p.updatedAt, deletedAt:p.deletedAt }; });
    if(name === "vendas") return rows.map(function(v){ v = normalizeVenda(v); return { id:v.id, cid:v.cid, cliente:v.cliNome, total:v.total, forma_pagamento:v.forma, itens_json:JSON.stringify(v.itens || []), data:v.data, createdAt:v.createdAt, updatedAt:v.updatedAt, deletedAt:v.deletedAt }; });
    if(name === "pagamentos") return rows.map(function(p){ p = normalizePagamento(p); const vendaId = p.vid || (p.cid ? ("cid:" + p.cid) : ""); return { id:p.id, venda_id:vendaId, valor:p.val, forma_pagamento:p.forma, obs:p.obs, data:p.data, createdAt:p.createdAt, updatedAt:p.updatedAt, deletedAt:p.deletedAt }; });
    if(name === "creditos") {
      const cliById = new Map((clientesAtivos || []).map(function(c){ return [String(c.id), c]; }));
      return rows.map(function(c){ c = normalizeCredito(c); const cli = cliById.get(String(c.cid || "")) || {}; return { id:c.id, cid:c.cid, vid:c.vid, cliente:c.cliNome || cli.nome || "", descricao:c.desc, valor:c.val, status:c.status, vencimento:c.vencimento, data:c.data, createdAt:c.createdAt, updatedAt:c.updatedAt, deletedAt:c.deletedAt }; });
    }
    return [];
  }

  function deserializeRemote(data){
    const clientes = normalizeLocalTable("clientes", (data.clientes || []).map(function(r){ return { id:r.id, nome:r.nome, telefone:r.telefone, cpf:r.cpf, endereco:r.endereco, obs:r.obs, data:r.data, createdAt:r.createdAt, updatedAt:r.updatedAt, deletedAt:r.deletedAt }; }));
    const produtos = normalizeLocalTable("produtos", (data.produtos || []).map(function(r){ return { id:r.id, nome:r.nome, preco:r.preco, estoque:r.estoque, createdAt:r.createdAt, updatedAt:r.updatedAt, deletedAt:r.deletedAt }; }));
    const vendas = normalizeLocalTable("vendas", (data.vendas || []).map(function(r){ return { id:r.id, cid:r.cid, cliente:r.cliente, total:r.total, forma_pagamento:r.forma_pagamento, itens_json:r.itens_json, data:r.data, createdAt:r.createdAt, updatedAt:r.updatedAt, deletedAt:r.deletedAt }; }));
    const pagamentos = normalizeLocalTable("pagamentos", (data.recebimentos || []).map(function(r){ return { id:r.id, venda_id:r.venda_id, valor:r.valor, forma_pagamento:r.forma_pagamento, obs:r.obs, data:r.data, createdAt:r.createdAt, updatedAt:r.updatedAt, deletedAt:r.deletedAt }; }));
    const creditos = normalizeLocalTable("creditos", (data.cobrancas || []).map(function(r){ return { id:r.id, cid:r.cid, vid:r.vid, cliente:r.cliente, descricao:r.descricao, valor:r.valor, status:r.status, vencimento:r.vencimento, data:r.data, createdAt:r.createdAt, updatedAt:r.updatedAt, deletedAt:r.deletedAt }; }));
    const deleted = { clientes:[], produtos:[], vendas:[], pagamentos:[], creditos:[] };
    (data._deleted || []).forEach(function(r){
      if(!r || !r.id) return;
      const localName = LOCAL_BY_REMOTE[String(r.sheet || "")] || "";
      if(!localName || !deleted[localName]) return;
      deleted[localName].push({
        id: String(r.id),
        sheet: String(r.sheet || ""),
        createdAt: r.createdAt || r.data || r.deletedAt || r.updatedAt || isoNow(),
        data: r.data || r.createdAt || r.deletedAt || r.updatedAt || isoNow(),
        updatedAt: r.updatedAt || r.deletedAt || isoNow(),
        deletedAt: r.deletedAt || r.updatedAt || isoNow()
      });
    });
    return { clientes, produtos, vendas, pagamentos, creditos, deleted };
  }

  function mergeMaps(a, b){
    const map = new Map();
    [].concat(a || [], b || []).forEach(function(row){
      if(!row || !row.id) return;
      const id = String(row.id);
      const cur = map.get(id);
      if(!cur){ map.set(id, deepClone(row)); return; }
      const curStamp = newestStamp(cur);
      const nextStamp = newestStamp(row);
      if(nextStamp > curStamp || (nextStamp === curStamp && !cur.deletedAt && row.deletedAt)) {
        map.set(id, deepClone(row));
      }
    });
    return map;
  }
  function splitMerged(rowsA, rowsB){
    const map = mergeMaps(rowsA, rowsB);
    const active = [];
    const deleted = [];
    map.forEach(function(row){ if(row.deletedAt) deleted.push(deepClone(row)); else active.push(deepClone(row)); });
    return { active, deleted, all: active.concat(deleted) };
  }
  function buildTombstones(prevRows, nextRows, localName){
    const prevMap = new Map((prevRows || []).filter(x => x && x.id).map(x => [String(x.id), x]));
    const nextIds = new Set((nextRows || []).filter(x => x && x.id).map(x => String(x.id)));
    const out = [];
    prevMap.forEach(function(row, id){
      if(!nextIds.has(id)){
        const stamp = isoNow();
        out.push({
          id: id,
          sheet: REMOTE_BY_LOCAL[localName] || localName,
          createdAt: row.createdAt || row.data || stamp,
          data: row.data || row.createdAt || stamp,
          updatedAt: stamp,
          deletedAt: stamp
        });
      }
    });
    return out;
  }

  function setStatus(text, isError){
    let el = document.getElementById("belaSheetsSyncStatus");
    if(!el){
      el = document.createElement("div");
      el.id = "belaSheetsSyncStatus";
      el.style.cssText = "position:fixed;right:12px;bottom:126px;z-index:99999;padding:8px 10px;border-radius:999px;color:#fff;font-size:12px;box-shadow:0 8px 18px rgba(0,0,0,.18);transition:background .3s";
      document.body.appendChild(el);
    }
    el.style.background = isError ? "rgba(180,30,30,.92)" : "rgba(17,24,39,.88)";
    el.textContent = text;
  }
  function installButton(){
    if(document.getElementById("belaSheetsSyncButton")) return;
    const btn = document.createElement("button");
    btn.id = "belaSheetsSyncButton";
    btn.textContent = "⟳ Sincronizar";
    btn.style.cssText = "position:fixed;right:12px;bottom:82px;z-index:99999;border:none;border-radius:14px;padding:10px 12px;font-weight:800;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.12);background:#b14f4f;color:#fff";
    btn.onclick = function(){ syncNow(); };
    document.body.appendChild(btn);
  }

  async function fetchJson(url){
    const r = await fetch(url, { method:"GET", cache:"no-store" });
    if(!r.ok) throw new Error("GET falhou: " + r.status);
    const text = await r.text();
    let data;
    try{ data = JSON.parse(text); }catch(e){ throw new Error("Resposta GET não é JSON válido"); }
    if(data && data.ok === false) throw new Error(data.error || "Erro no GET");
    return data;
  }
  async function postSheet(payload){
    const body = new URLSearchParams();
    body.append("payload", JSON.stringify(payload));
    const r = await fetch(API_URL, {
      method:"POST",
      headers:{ "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8" },
      body: body.toString()
    });
    if(!r.ok) throw new Error("POST falhou: " + r.status);
    const text = await r.text();
    let data;
    try{ data = JSON.parse(text); }catch(e){ throw new Error("Resposta POST não é JSON válido"); }
    if(!data || data.ok !== true) throw new Error((data && data.error) || "Erro no POST");
    return data;
  }

  function collectLocalState(){
    const s = {};
    LOCAL_TABLES.forEach(function(name){ s[name] = normalizeLocalTable(name, readLocal(name)); });
    return s;
  }
  function collectDeletedState(){
    const s = {};
    LOCAL_TABLES.forEach(function(name){
      s[name] = (readDeleted(name) || []).filter(x => x && x.id).map(function(x){
        return {
          id: String(x.id),
          sheet: x.sheet || REMOTE_BY_LOCAL[name] || name,
          createdAt: x.createdAt || x.data || x.deletedAt || x.updatedAt || isoNow(),
          data: x.data || x.createdAt || x.deletedAt || x.updatedAt || isoNow(),
          updatedAt: x.updatedAt || x.deletedAt || isoNow(),
          deletedAt: x.deletedAt || x.updatedAt || isoNow()
        };
      });
    });
    return s;
  }
  function writeMergedLocal(merged){
    LOCAL_TABLES.forEach(function(name){
      writeLocal(name, merged[name].active);
      writeDeleted(name, merged[name].deleted);
    });
    _rawSet("bm_last_sync_at", isoNow());
  }
  async function pushMerged(merged){
    const clientesAtivos = merged.clientes.active;
    for(const localName of LOCAL_TABLES){
      const remoteSheet = REMOTE_BY_LOCAL[localName];
      await postSheet({ action:"upsert", sheet: remoteSheet, rows: serializeRemote(localName, merged[localName].all, clientesAtivos) });
    }
    let deletedRows = [];
    LOCAL_TABLES.forEach(function(name){
      merged[name].deleted.forEach(function(row){
        deletedRows.push({
          id: String(row.id),
          sheet: REMOTE_BY_LOCAL[name] || name,
          createdAt: row.createdAt || row.data || row.deletedAt || row.updatedAt || isoNow(),
          data: row.data || row.createdAt || row.deletedAt || row.updatedAt || isoNow(),
          updatedAt: row.updatedAt || row.deletedAt || isoNow(),
          deletedAt: row.deletedAt || row.updatedAt || isoNow()
        });
      });
    });
    await postSheet({ action:"upsert", sheet:"_deleted", rows: deletedRows });
  }

  function patchStorage(){
    if(patchDone) return;
    patchDone = true;
    localStorage.setItem = function(key, value){
      const strKey = String(key || "");
      if(/^bm_(clientes|produtos|vendas|pagamentos|creditos)$/.test(strKey)){
        const localName = strKey.replace(/^bm_/, "");
        const prevRows = normalizeLocalTable(localName, safeParse(localStorage.getItem(strKey) || "[]", []));
        const nextRows = normalizeLocalTable(localName, safeParse(String(value || "[]"), []));
        const currentDeleted = readDeleted(localName);
        const added = buildTombstones(prevRows, nextRows, localName);
        const mergedDeleted = splitMerged(currentDeleted, added).deleted;
        writeDeleted(localName, mergedDeleted);
      }
      _rawSet(key, value);
      if(/^bm_(clientes|produtos|vendas|pagamentos|creditos)$/.test(strKey)) scheduleSync();
    };
  }
  function scheduleSync(){
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(syncNow, 1200);
  }

  async function syncNow(){
    if(syncing) return;
    syncing = true;
    try{
      setStatus("☁ Sincronizando...");
      const localState = collectLocalState();
      const localDeleted = collectDeletedState();
      const remoteState = deserializeRemote(await fetchJson(API_URL));
      const merged = {};
      LOCAL_TABLES.forEach(function(name){
        merged[name] = splitMerged(
          [].concat(localState[name] || [], localDeleted[name] || []),
          [].concat(remoteState[name] || [], (remoteState.deleted && remoteState.deleted[name]) || [])
        );
      });
      writeMergedLocal(merged);
      await pushMerged(merged);
      const hhmm = new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
      setStatus("✓ Sincronizado " + hhmm);
      return merged;
    }catch(err){
      console.error("Erro ao sincronizar:", err);
      setStatus("✗ Erro na sincronização", true);
      throw err;
    }finally{
      syncing = false;
    }
  }

  function start(){
    installButton();
    patchStorage();
    syncNow();
    window.addEventListener("focus", syncNow);
    document.addEventListener("visibilitychange", function(){ if(document.visibilityState === "visible") syncNow(); });
    clearInterval(syncTimer);
    syncTimer = setInterval(syncNow, SYNC_INTERVAL_MS);
  }

  window.BelaSheetsSync = { syncNow: syncNow, scheduleSync: scheduleSync, isoNow: isoNow };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
