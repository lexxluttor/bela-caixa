/* =========================================================
   Bela Modas — Módulo separado: Unificação de Produtos
   Carregar DEPOIS do js/app-core.js
   Exemplo no index:
   <script src="./js/app-core.js"></script>
   <script src="./js/produtos-unificacao.js"></script>
   ========================================================= */
(function(){
  'use strict';

  var BMU = window.BMUnificacaoProdutos = window.BMUnificacaoProdutos || {};
  BMU.selecionados = BMU.selecionados || {};
  BMU.modalAberto = false;

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function n(v){ return (typeof numBM === 'function') ? numBM(v) : (Number(v)||0); }
  function money(v){ return (typeof R === 'function') ? R(v) : ('R$ '+Number(v||0).toFixed(2)); }
  function estoque(p){ return (typeof estoqueProdBM === 'function') ? estoqueProdBM(p) : n(p && (p.estq != null ? p.estq : p.estoque)); }
  function toastBM(msg,tipo){ if(typeof toast === 'function') toast(msg,tipo); else alert(msg); }
  function isArquivado(p){ return !!(p && (p.arquivado || p.archived || p.unificadoPara || p.unificado_para)); }
  function produtosTodos(){ return (window.DB && DB.get) ? (DB.get('produtos') || []) : []; }
  function produtosAtivos(lista){ return (lista || produtosTodos()).filter(function(p){ return p && !isArquivado(p); }); }
  function salvarProdutos(lista){ if(window.DB && DB.set) DB.set('produtos', lista || []); }
  function textoBusca(p){
    if(typeof textoBuscaProdBM === 'function') return textoBuscaProdBM(p);
    return [p&&p.nome,p&&p.cod,p&&p.codigo,p&&p.ean,p&&p.codigos_barras,p&&p.codigosBarras,p&&p.desc2,p&&p.cat,p&&p.grupo,p&&p.subcat,p&&p.subcategoria]
      .map(function(v){return String(v||'').toLowerCase();}).join(' ');
  }
  function extrairCodigos(valor){
    if(typeof extrairCodigosBarras === 'function') return extrairCodigosBarras(valor);
    return String(valor==null?'':valor).split(/[\n,;|]+/).map(function(v){return String(v).replace(/\s+/g,'').trim();}).filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i;});
  }
  function codigosProduto(p){
    var lista=[];
    ['ean','codigo_barras','codBarras','codigoDeBarras','codigos_barras','codigosBarras'].forEach(function(k){
      extrairCodigos(p && p[k]).forEach(function(c){ if(lista.indexOf(c)<0) lista.push(c); });
    });
    return lista;
  }
  function setCodigosProduto(p, lista){
    lista = (lista || []).filter(Boolean).filter(function(v,i,a){ return a.indexOf(v)===i; });
    var txt = lista.join('\n');
    p.ean = txt;
    p.codigo_barras = txt;
    p.codBarras = txt;
    p.codigos_barras = txt;
    p.codigosBarras = txt;
  }
  function limparCodigosProdutoArquivado(p){
    p.ean_arquivado = p.ean || '';
    p.codigo_barras_arquivado = p.codigo_barras || p.codBarras || '';
    p.codigos_barras_arquivados = p.codigos_barras || p.codigosBarras || '';
    p.ean = '';
    p.codigo_barras = '';
    p.codBarras = '';
    p.codigoDeBarras = '';
    p.codigos_barras = '';
    p.codigosBarras = '';
  }
  function agora(){ return (typeof nowLocalISO === 'function') ? nowLocalISO() : new Date().toISOString(); }

  function injetarCss(){
    if(document.getElementById('bmu-css')) return;
    var css = document.createElement('style');
    css.id = 'bmu-css';
    css.textContent = [
      '.bmu-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0 12px;padding:10px 12px;border:1px solid rgba(156,27,62,.18);border-radius:14px;background:#fff7fa;box-shadow:0 4px 14px rgba(70,0,20,.06);}',
      '.bmu-toolbar-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:#6f1730;font-size:13px;font-weight:800;}',
      '.bmu-count{background:#ffffff;border:1px solid rgba(156,27,62,.2);padding:6px 10px;border-radius:999px;color:#7a4050;font-size:12px;}',
      '.bmu-master,.bmu-check{width:17px;height:17px;accent-color:#9c1b3e;cursor:pointer;}',
      '.bmu-row-selected{background:#fff1f6!important;outline:2px solid rgba(156,27,62,.12);}',
      '.bmu-btn{border:0;border-radius:12px;padding:10px 14px;background:#9c1b3e;color:#fff;font-weight:900;cursor:pointer;box-shadow:0 4px 10px rgba(156,27,62,.18);}',
      '.bmu-btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;}',
      '.bmu-btn2{border:1px solid #d8b7c1;border-radius:12px;padding:10px 14px;background:#fff;color:#7a4050;font-weight:900;cursor:pointer;}',
      '.bmu-link{border:0;background:#2980b9;color:#fff;border-radius:8px;padding:7px 9px;font-weight:900;cursor:pointer;}',
      '.bmu-ov{position:fixed;inset:0;z-index:99999;background:rgba(25,10,20,.32);display:flex;align-items:center;justify-content:center;padding:22px;}',
      '.bmu-box{width:min(980px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:22px;box-shadow:0 20px 55px rgba(0,0,0,.25);border:1px solid #ead1d8;color:#2c0a14;}',
      '.bmu-head{position:sticky;top:0;background:linear-gradient(180deg,#fff,#fff7fa);z-index:1;display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid #ead1d8;}',
      '.bmu-title{font-size:22px;font-weight:900;color:#7b1430;}',
      '.bmu-close{border:0;background:#fff0f4;color:#7b1430;border-radius:10px;font-size:18px;font-weight:900;padding:6px 10px;cursor:pointer;}',
      '.bmu-body{padding:18px 22px 22px;}',
      '.bmu-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:16px;}',
      '.bmu-card{border:1px solid #ead1d8;background:#fff;border-radius:16px;padding:14px;}',
      '.bmu-card h3{margin:0 0 10px;color:#7b1430;font-size:15px;}',
      '.bmu-list{display:flex;flex-direction:column;gap:8px;}',
      '.bmu-prod{border:1px solid #eee;border-radius:12px;padding:10px;background:#fff;display:flex;gap:10px;align-items:flex-start;}',
      '.bmu-prod:hover{background:#fff8fb;}',
      '.bmu-prod strong{color:#2c0a14;font-size:14px;}',
      '.bmu-meta{font-size:12px;color:#7a4050;margin-top:3px;line-height:1.35;}',
      '.bmu-keep{border-color:#9c1b3e;background:#fff4f8;}',
      '.bmu-input{width:100%;box-sizing:border-box;border:1px solid #d8b7c1;border-radius:12px;background:#fff;color:#2c0a14;padding:11px 12px;font-size:14px;outline:none;}',
      '.bmu-input:focus{border-color:#9c1b3e;box-shadow:0 0 0 3px rgba(156,27,62,.12);}',
      '.bmu-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px;}',
      '.bmu-stat{border:1px solid #ead1d8;border-radius:14px;background:#fff7fa;padding:12px;}',
      '.bmu-stat span{display:block;color:#7a4050;font-size:12px;font-weight:800;}',
      '.bmu-stat b{display:block;margin-top:3px;color:#2c0a14;font-size:18px;}',
      '.bmu-alert{margin-top:10px;border:1px solid #f0c36b;background:#fff8e6;color:#5c3c00;border-radius:12px;padding:10px;font-size:13px;font-weight:800;}',
      '.bmu-codes{margin-top:10px;max-height:135px;overflow:auto;border:1px dashed #d8b7c1;border-radius:12px;padding:9px;background:#fff;font-size:12px;color:#2c0a14;white-space:pre-wrap;}',
      '.bmu-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid #ead1d8;}',
      '@media(max-width:850px){.bmu-grid{grid-template-columns:1fr}.bmu-summary{grid-template-columns:1fr}.bmu-toolbar{align-items:flex-start;flex-direction:column}.bmu-actions{flex-direction:column}.bmu-btn,.bmu-btn2{width:100%;}}'
    ].join('\n');
    document.head.appendChild(css);
  }

  function garantirCabecalhoProdutos(){
    var tb=document.getElementById('p-tb');
    if(!tb) return;
    var tr = tb.closest('table') && tb.closest('table').querySelector('thead tr');
    if(!tr || tr.dataset.bmu === '1') return;
    var th=document.createElement('th');
    th.innerHTML='<input type="checkbox" class="bmu-master" id="bmu-master" title="Selecionar todos da lista" onchange="BMUnificacaoProdutos.toggleTodos(this.checked)">';
    tr.insertBefore(th, tr.firstElementChild);
    tr.dataset.bmu='1';
  }

  function garantirToolbar(){
    var tb=document.getElementById('p-tb');
    if(!tb || document.getElementById('bmu-toolbar')) return;
    var table = tb.closest('table');
    var wrap = table ? (table.closest('.tw') || table.parentElement) : tb.parentElement;
    if(!wrap || !wrap.parentElement) return;
    var bar=document.createElement('div');
    bar.id='bmu-toolbar';
    bar.className='bmu-toolbar';
    bar.innerHTML='<div class="bmu-toolbar-left">🔗 Unificação de produtos <span class="bmu-count" id="bmu-count">0 selecionado(s)</span><span class="tm">Marque produtos parecidos e unifique em um principal.</span></div><button class="bmu-btn" id="bmu-open" type="button" disabled onclick="BMUnificacaoProdutos.abrirModal()">🔗 Unificar selecionados</button>';
    wrap.parentElement.insertBefore(bar, wrap);
  }

  function atualizarToolbar(){
    var ids=idsSelecionados();
    var c=document.getElementById('bmu-count');
    if(c) c.textContent=ids.length+' selecionado(s)';
    var b=document.getElementById('bmu-open');
    if(b) b.disabled=ids.length<2;
    var master=document.getElementById('bmu-master');
    if(master){
      var checks=[].slice.call(document.querySelectorAll('.bmu-check'));
      master.checked = checks.length>0 && checks.every(function(ch){return ch.checked;});
      master.indeterminate = checks.some(function(ch){return ch.checked;}) && !master.checked;
    }
  }
  function idsSelecionados(){
    return Object.keys(BMU.selecionados).filter(function(id){ return BMU.selecionados[id]; });
  }
  BMU.toggle = function(id, marcado){
    BMU.selecionados[String(id)] = !!marcado;
    var row=document.querySelector('tr[data-bmu-id="'+String(id).replace(/"/g,'\\"')+'"]');
    if(row) row.classList.toggle('bmu-row-selected', !!marcado);
    atualizarToolbar();
  };
  BMU.toggleTodos = function(marcado){
    document.querySelectorAll('.bmu-check').forEach(function(ch){
      ch.checked=!!marcado;
      BMU.toggle(ch.value, !!marcado);
    });
  };
  BMU.limparSelecao = function(){
    BMU.selecionados={};
    document.querySelectorAll('.bmu-check').forEach(function(ch){ ch.checked=false; });
    document.querySelectorAll('tr[data-bmu-id]').forEach(function(tr){ tr.classList.remove('bmu-row-selected'); });
    atualizarToolbar();
  };

  function renderProdsUnificacao(){
    if(typeof normalizarEstoquesProdutosBM === 'function' && !window._estoquesNormalizadosUmaVez){
      normalizarEstoquesProdutosBM();
      window._estoquesNormalizadosUmaVez=true;
    }
    injetarCss(); garantirCabecalhoProdutos(); garantirToolbar();
    var inp=document.getElementById('p-sc');
    var q=(inp?inp.value:'').trim().toLowerCase();
    var todos=produtosAtivos(produtosTodos());
    var limite=q ? 150 : 220;
    var prods=[];
    for(var i=0;i<todos.length;i++){
      var p=todos[i]||{};
      if(!q || textoBusca(p).includes(q)){
        prods.push(p);
        if(prods.length>=limite) break;
      }
    }
    var rows=prods.map(function(p){
      var id=String(p.id||'');
      var est=estoque(p);
      var checked=BMU.selecionados[id]?' checked':'';
      var selected=BMU.selecionados[id]?' class="bmu-row-selected"':'';
      var codigos=codigosProduto(p).length;
      return '<tr data-bmu-id="'+esc(id)+'"'+selected+'>'+ 
        '<td><input class="bmu-check" type="checkbox" value="'+esc(id)+'"'+checked+' onchange="BMUnificacaoProdutos.toggle(this.value,this.checked)"></td>'+
        '<td><b style="color:var(--gold);">'+esc(p.cod||p.codigo||'')+'</b></td>'+
        '<td><b>'+esc(p.nome||'')+'</b>'+(p.desc2?'<br><span class="tm">'+esc(p.desc2)+'</span>':'')+(codigos?'<br><span class="tm">📦 Códigos: '+codigos+'</span>':'')+'</td>'+ 
        '<td><b>'+esc(p.grupo||((typeof categoriaPrincipalPorSubcategoria==='function')?categoriaPrincipalPorSubcategoria(p.subcategoria||p.subcat||p.cat||''):'—'))+'</b><br><span class="tm">'+esc(p.subcategoria||p.subcat||p.cat||'—')+'</span></td>'+ 
        '<td class="txt-go">'+money(n(p.preco))+'</td>'+ 
        '<td>'+est+'</td>'+ 
        '<td><span style="display:flex;gap:4px;flex-wrap:wrap;">'+
          '<button class="btn bb xs" onclick="abrirModalEtiquetas(\''+esc(id)+'\')">🏷️</button>'+ 
          '<button class="btn bh xs" onclick="abrirMdProd(\''+esc(id)+'\')">✏️</button>'+ 
          '<button class="bmu-link" title="Unificar este produto com outro" onclick="BMUnificacaoProdutos.unificarUm(\''+esc(id)+'\')">🔗</button>'+ 
          '<button class="btn bd2 xs" onclick="delProd(\''+esc(id)+'\')">🗑️</button>'+ 
        '</span></td></tr>';
    }).join('');
    var tb=document.getElementById('p-tb');
    if(tb) tb.innerHTML=rows||'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--txt2);">Nenhum produto encontrado</td></tr>';
    var st=document.getElementById('p-status');
    if(st){
      var totalMatch = q ? todos.filter(function(p){return textoBusca(p||{}).includes(q);}).length : todos.length;
      st.textContent = totalMatch>limite ? 'Mostrando '+limite+' de '+totalMatch+' resultados. Continue digitando para filtrar.' : totalMatch+' resultado(s)';
    }
    atualizarToolbar();
  }

  BMU.unificarUm = function(id){
    BMU.selecionados={};
    BMU.selecionados[String(id)] = true;
    toastBM('Marque mais um produto para unificar com este.','info');
    if(typeof renderProds === 'function') renderProds();
  };

  function produtosSelecionados(){
    var ids=idsSelecionados();
    var set={}; ids.forEach(function(id){set[String(id)]=true;});
    return produtosAtivos(produtosTodos()).filter(function(p){ return set[String(p.id)]; });
  }
  function resumoProdutos(lista){
    var estoqueTotal=0, codigos=[];
    (lista||[]).forEach(function(p){
      estoqueTotal += estoque(p);
      codigosProduto(p).forEach(function(c){ if(codigos.indexOf(c)<0) codigos.push(c); });
    });
    var precos=[];
    (lista||[]).forEach(function(p){ var pr=n(p.preco).toFixed(2); if(precos.indexOf(pr)<0) precos.push(pr); });
    return {estoqueTotal:estoqueTotal, codigos:codigos, precos:precos};
  }

  BMU.abrirModal = function(){
    var lista=produtosSelecionados();
    if(lista.length<2){ toastBM('Selecione pelo menos 2 produtos.','warn'); return; }
    injetarCss();
    BMU.modalAberto=true;
    var res=resumoProdutos(lista);
    var primeiro=String(lista[0].id);
    var html='<div class="bmu-ov" id="bmu-modal">'+
      '<div class="bmu-box">'+
        '<div class="bmu-head"><div class="bmu-title">🔗 Unificar '+lista.length+' produtos</div><button class="bmu-close" onclick="BMUnificacaoProdutos.fecharModal()">×</button></div>'+
        '<div class="bmu-body">'+
          '<div class="bmu-grid">'+
            '<div class="bmu-card"><h3>Produtos selecionados</h3><div class="bmu-list" id="bmu-lista">'+
              lista.map(function(p){return '<label class="bmu-prod" data-keep-row="'+esc(p.id)+'"><input type="radio" name="bmu-keep" value="'+esc(p.id)+'" '+(String(p.id)===primeiro?'checked':'')+' onchange="BMUnificacaoProdutos.atualizarPrincipal()"><div><strong>'+esc(p.nome||'')+'</strong><div class="bmu-meta">'+esc(p.cod||p.codigo||'')+' • '+money(n(p.preco))+' • Estoque: '+estoque(p)+' • Códigos: '+codigosProduto(p).length+'</div></div></label>';}).join('')+
            '</div></div>'+
            '<div class="bmu-card"><h3>Produto principal</h3><div class="bmu-meta" style="margin-bottom:8px;">Escolha qual cadastro continuará ativo. Os outros serão arquivados.</div><label class="bmu-meta">Novo nome opcional</label><input class="bmu-input" id="bmu-novo-nome" placeholder="Ex: Blusa R$ 49,99"><div class="bmu-summary"><div class="bmu-stat"><span>Estoque final</span><b>'+res.estoqueTotal+'</b></div><div class="bmu-stat"><span>Códigos mantidos</span><b>'+res.codigos.length+'</b></div><div class="bmu-stat"><span>Arquivados</span><b>'+(lista.length-1)+'</b></div></div>'+
            (res.precos.length>1?'<div class="bmu-alert">⚠️ Atenção: existem preços diferentes entre os produtos selecionados. O preço do produto principal será mantido.</div>':'')+
            '<details style="margin-top:10px;"><summary style="cursor:pointer;font-weight:900;color:#7b1430;">Ver códigos de barras que serão mantidos</summary><div class="bmu-codes">'+esc(res.codigos.join('\n')||'Nenhum código informado')+'</div></details></div>'+ 
          '</div>'+ 
          '<div class="bmu-actions"><button class="bmu-btn2" onclick="BMUnificacaoProdutos.fecharModal()">Cancelar</button><button class="bmu-btn" onclick="BMUnificacaoProdutos.confirmar()">✅ Confirmar unificação</button></div>'+ 
        '</div>'+ 
      '</div></div>';
    var old=document.getElementById('bmu-modal'); if(old) old.remove();
    document.body.insertAdjacentHTML('beforeend', html);
    BMU.atualizarPrincipal();
  };
  BMU.atualizarPrincipal = function(){
    var keep=(document.querySelector('input[name="bmu-keep"]:checked')||{}).value;
    document.querySelectorAll('[data-keep-row]').forEach(function(el){ el.classList.toggle('bmu-keep', String(el.getAttribute('data-keep-row'))===String(keep)); });
  };
  BMU.fecharModal = function(){ var m=document.getElementById('bmu-modal'); if(m) m.remove(); BMU.modalAberto=false; };

  BMU.confirmar = function(){
    var lista=produtosSelecionados();
    var keepId=(document.querySelector('input[name="bmu-keep"]:checked')||{}).value;
    if(lista.length<2 || !keepId){ toastBM('Seleção inválida.','warn'); return; }
    var novoNome=(document.getElementById('bmu-novo-nome')||{}).value || '';
    novoNome=novoNome.trim();
    var prods=produtosTodos();
    var ids={}; lista.forEach(function(p){ ids[String(p.id)]=true; });
    var principal=prods.find(function(p){ return String(p.id)===String(keepId); });
    if(!principal){ toastBM('Produto principal não encontrado.','warn'); return; }
    var res=resumoProdutos(lista);
    var nomesArquivados=[];
    principal.estq=res.estoqueTotal;
    principal.estoque=res.estoqueTotal;
    setCodigosProduto(principal, res.codigos);
    if(novoNome) principal.nome=novoNome;
    principal.unificacaoAtualizadaEm=agora();
    principal.unificacaoOrigemIds=Object.keys(ids).filter(function(id){return id!==String(keepId);});
    principal.unificacaoQtdProdutos=lista.length;
    prods.forEach(function(p){
      if(!p || !ids[String(p.id)] || String(p.id)===String(keepId)) return;
      nomesArquivados.push(p.nome || p.cod || p.id);
      p.arquivado=true;
      p.archived=true;
      p.unificadoPara=String(keepId);
      p.unificado_para=String(keepId);
      p.unificadoEm=agora();
      p.unificadoNomePrincipal=principal.nome || '';
      p.estq=0;
      p.estoque=0;
      limparCodigosProdutoArquivado(p);
    });
    principal.unificacaoArquivadosNomes=nomesArquivados;
    salvarProdutos(prods);
    BMU.fecharModal();
    BMU.limparSelecao();
    if(typeof renderProds === 'function') renderProds();
    if(typeof renderPGrid === 'function') setTimeout(function(){ try{renderPGrid();}catch(e){} }, 80);
    toastBM('✅ Produtos unificados com sucesso!','ok');
  };

  function renderPGridAtivos(){
    if(typeof normalizarEstoquesProdutosBM === 'function' && !window._estoquesNormalizadosUmaVez){ normalizarEstoquesProdutosBM(); window._estoquesNormalizadosUmaVez=true; }
    var el=document.getElementById('pgrid'); if(!el) return;
    var q=(document.getElementById('v-psrch')?document.getElementById('v-psrch').value||'':'').trim().toLowerCase();
    var todos=produtosAtivos(produtosTodos());
    var limite=q ? 160 : 240;
    var prods=[];
    for(var i=0;i<todos.length;i++){
      var p=todos[i]||{};
      if(!q || textoBusca(p).includes(q)){ prods.push(p); if(prods.length>=limite) break; }
    }
    var catIco={Vestidos:'👗',Blusas:'👚',Calças:'👖',Saias:'👘',Acessórios:'💍',Calçados:'👠',Lingerie:'🩱',Outros:'🛍️'};
    el.innerHTML=prods.map(function(p){
      var est=estoque(p);
      return '<div class="pcard" onclick="addProd(\''+esc(p.id)+'\')"><div style="font-size:22px;">'+(catIco[p.cat]||'🛍️')+'</div><div class="pcard-c">'+esc(p.cod||p.codigo||'')+'</div><div class="pcard-n">'+esc(p.nome||'')+'</div><div class="pcard-p">'+money(n(p.preco))+'</div><div class="pcard-c">Estoque: '+est+'</div></div>';
    }).join('')||'<div style="color:var(--txt2);padding:16px;font-size:13px;">Nenhum produto cadastrado</div>';
  }

  function instalarPatches(){
    injetarCss();
    if(typeof window.renderProds === 'function') window.renderProds = renderProdsUnificacao;
    if(typeof window.renderPGrid === 'function') window.renderPGrid = renderPGridAtivos;

    var addOriginal = window.addProd;
    if(typeof addOriginal === 'function' && !addOriginal._bmuPatch){
      var patched=function(pid){
        var p=produtosTodos().find(function(x){return String(x && x.id)===String(pid);});
        if(p && isArquivado(p) && (p.unificadoPara || p.unificado_para)){
          return addOriginal(String(p.unificadoPara || p.unificado_para));
        }
        if(p && isArquivado(p)){ toastBM('Produto arquivado por unificação. Use o cadastro principal.','warn'); return; }
        return addOriginal(pid);
      };
      patched._bmuPatch=true;
      window.addProd=patched;
    }

    window.buscarProdutoPorCodigoOuCodigoBarras = function(valor){
      var alvo = (typeof normalizarCodigoBarra==='function') ? normalizarCodigoBarra(valor) : String(valor==null?'':valor).replace(/\s+/g,'').trim();
      if(!alvo) return null;
      return produtosAtivos(produtosTodos()).find(function(p){
        var cod = (typeof normalizarCodigoBarra==='function') ? normalizarCodigoBarra(p && (p.cod||p.codigo||'')) : String(p&&(p.cod||p.codigo||'')).replace(/\s+/g,'').trim();
        var pertence = (typeof codigoPertenceProduto==='function') ? codigoPertenceProduto(p, alvo) : (codigosProduto(p).indexOf(alvo)>=0);
        return pertence || cod === alvo;
      }) || null;
    };

    window.buscarProdutoManual = function(){
      if(typeof normalizarEstoquesProdutosBM === 'function') normalizarEstoquesProdutosBM();
      var inp=document.getElementById('v-desc');
      var sg=document.getElementById('v-desc-sg');
      if(!inp||!sg) return;
      var q=(inp.value||'').trim().toLowerCase();
      if(!q){ if(typeof limparBuscaProdutoManual==='function') limparBuscaProdutoManual(); return; }
      var res=produtosAtivos(produtosTodos()).filter(function(p){ return textoBusca(p).includes(q); }).slice(0,8);
      if(!res.length){ if(typeof limparBuscaProdutoManual==='function') limparBuscaProdutoManual(); return; }
      sg.innerHTML=res.map(function(p){
        var estq=estoque(p); var cls=estq<=0?'zero':(estq<=3?'low':'');
        return '<div class="v-sug-item" onclick="selecionarProdutoManual(\''+esc(p.id)+'\')"><div class="v-sug-nome">'+esc(p.nome||'')+'</div><div class="v-sug-meta"><span>'+esc(p.cod||'')+'</span><span>'+money(n(p.preco))+'</span><span class="v-sug-estq '+cls+'">Estoque: '+estq+'</span></div></div>';
      }).join('');
      if(typeof posSugProdutoManual==='function') posSugProdutoManual();
      sg.style.display='block';
    };
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', instalarPatches);
  else instalarPatches();
})();
