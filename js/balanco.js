/* ================= BALANÇO DE ESTOQUE — MODO REAL =================
   Módulo extraído do index e otimizado com índices em memória.
   Mantém as mesmas funções globais usadas pela interface.
==================================================================== */
var BAL_KEY = 'bm_balanco_real_aberto';
var balUltimaConferencia = [];
var balAutoAddTimer = null;
var balCacheCategoria = '';
var balCacheProdutosRef = null;
var balCacheProdutos = [];
var balCachePorCodigo = Object.create(null);
var balCachePorId = Object.create(null);

function balNovoEstado(){
  return {id:'BAL-'+Date.now(),data:new Date().toISOString(),contagens:{},codigos:{},leituras:[]};
}
function balGet(){try{return JSON.parse(localStorage.getItem(balKeyAtual())||'null')||balNovoEstado();}catch(e){return balNovoEstado();}}
function balSet(st){localStorage.setItem(balKeyAtual(),JSON.stringify(st||balNovoEstado()));}
function balNormalizarCodigo(v){return String(v==null?'':v).replace(/\s+/g,'').trim();}
function balCodigosProduto(p){
  var bruto=[p&&p.ean,p&&p.codigo_barras,p&&p.codBarras,p&&p.codigoDeBarras,p&&p.codigos_barras,p&&p.codigosBarras].filter(Boolean).join(',');
  var arr=String(bruto).split(/[\n,;|]+/).map(function(x){return balNormalizarCodigo(x);}).filter(Boolean);
  var ref=balNormalizarCodigo(p&&(p.cod||p.codigo||'')); if(ref) arr.push(ref);
  return arr.filter(function(v,i,a){return a.indexOf(v)===i;});
}
function balInvalidarCache(){
  balCacheCategoria='';
  balCacheProdutosRef=null;
  balCacheProdutos=[];
  balCachePorCodigo=Object.create(null);
  balCachePorId=Object.create(null);
}
function balGarantirCache(){
  var todos=DB.get('produtos')||[];
  var cat=balCategoriaSelecionada();
  if(balCacheProdutosRef===todos && balCacheCategoria===cat) return;
  balCacheCategoria=cat;
  balCacheProdutosRef=todos;
  balCacheProdutos=todos.filter(function(p){return balCategoriaProduto(p)===cat;});
  balCachePorCodigo=Object.create(null);
  balCachePorId=Object.create(null);
  balCacheProdutos.forEach(function(p){
    var id=String(p.id||p.cod||'');
    if(id) balCachePorId[id]=p;
    balCodigosProduto(p).forEach(function(c){if(c && !balCachePorCodigo[c]) balCachePorCodigo[c]=p;});
  });
}
function balBuscarProduto(codigo){
  var alvo=balNormalizarCodigo(codigo); if(!alvo) return null;
  balGarantirCache();
  return balCachePorCodigo[alvo]||null;
}
function balEstoqueProduto(p){var n=Number(String((p&&(p.estoque!=null?p.estoque:p.estq))||0).replace(',','.'));return Number.isFinite(n)?n:0;}
function balNomeProduto(p){return (p&&(p.nome||p.descricao||p.desc))||'Produto sem nome';}
function balFmt(n){n=Number(n||0);return n.toLocaleString('pt-BR',{maximumFractionDigits:2});}

function balCategoriaSelecionada(){
  var el=document.getElementById('bal-categoria');
  var v=el ? String(el.value||'ROUPAS') : 'ROUPAS';
  return ['ROUPAS','CALÇADOS','ACESSÓRIOS'].indexOf(v)>=0 ? v : 'ROUPAS';
}
function balKeyAtual(){return BAL_KEY+'_'+balCategoriaSelecionada();}
function balCategoriaProduto(p){
  var grupo=String((p&&(p.grupo||p.categoria_principal||p.categoriaPrincipal))||'').toUpperCase();
  if(['ROUPAS','CALÇADOS','ACESSÓRIOS'].indexOf(grupo)>=0) return grupo;
  var sub=(p&&(p.cat||p.subcat||p.subcategoria||p.categoria||''))||'';
  if(typeof categoriaPrincipalPorSubcategoria==='function'){
    var g=String(categoriaPrincipalPorSubcategoria(sub)||'').toUpperCase();
    if(['ROUPAS','CALÇADOS','ACESSÓRIOS'].indexOf(g)>=0) return g;
  }
  var txt=String((p&&(p.nome||p.descricao||p.desc||sub))||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  if(/tenis|chinelo|sandalia|sapato|bota|sapatilha|papete|tamanco|rasteira/.test(txt)) return 'CALÇADOS';
  if(/bolsa|mochila|cinto|carteira|bone|acessorio|meia|oculos|pulseira|colar|brinco|tiara|relogio/.test(txt)) return 'ACESSÓRIOS';
  return 'ROUPAS';
}
function balProdutosCategoria(){
  balGarantirCache();
  return balCacheProdutos;
}
function balTrocarCategoria(){
  balInvalidarCache();
  balUltimaConferencia=[];
  var card=document.getElementById('bal-simulacao-card');
  if(card) card.style.display='none';
  balRender();
  setTimeout(function(){var c=document.getElementById('bal-cod');if(c)c.focus();},50);
}

function initBalancoReal(){
  balInvalidarCache();
  balRender();
  setTimeout(function(){var c=document.getElementById('bal-cod');if(c)c.focus();},80);
  var cod=document.getElementById('bal-cod');
  if(cod&&!cod.dataset.boundBal){
    cod.dataset.boundBal='1';
    cod.addEventListener('keydown',function(e){
      if(e.key==='Enter'){
        e.preventDefault();
        if(balAutoAddTimer){clearTimeout(balAutoAddTimer);balAutoAddTimer=null;}
        balAdicionarLeitura();
      }
    });
    cod.addEventListener('input',function(){
      var valorAtual=balNormalizarCodigo(this.value);
      var p=balBuscarProduto(this.value), el=document.getElementById('bal-found'); if(!el)return;
      if(p) el.innerHTML='Encontrado: <strong>'+balNomeProduto(p)+'</strong> · estoque atual: <strong>'+balFmt(balEstoqueProduto(p))+'</strong>';
      else el.textContent=this.value.trim()?'Nenhum produto encontrado para este código.':'Bipe um produto para iniciar a contagem.';

      if(balAutoAddTimer){clearTimeout(balAutoAddTimer);balAutoAddTimer=null;}
      // MODO TESTE: leitura automática. Scanners normalmente enviam Enter; este timer cobre leitores que só digitam o código.
      // Só dispara automático para códigos numéricos longos, evitando adicionar enquanto alguém digita referência curta manualmente.
      if(/^\d{6,}$/.test(valorAtual)){
        balAutoAddTimer=setTimeout(function(){
          var campo=document.getElementById('bal-cod');
          if(campo && balNormalizarCodigo(campo.value)===valorAtual){
            balAdicionarLeitura();
          }
        },260);
      }
    });
  }
}
function balAdicionarLeitura(){
  if(balAutoAddTimer){clearTimeout(balAutoAddTimer);balAutoAddTimer=null;}
  var codEl=document.getElementById('bal-cod'), qtdEl=document.getElementById('bal-qtd');
  var codigo=balNormalizarCodigo(codEl&&codEl.value);
  var qtdTxt=String((qtdEl&&qtdEl.value)||'').trim();
  var qtd=qtdTxt?Number(qtdTxt.replace(',','.')):1;
  if(!codigo){if(typeof toast==='function')toast('Informe ou bipe um código.');return;}
  if(!Number.isFinite(qtd)||qtd<=0){if(typeof toast==='function')toast('Quantidade inválida.');return;}
  var prod=balBuscarProduto(codigo);
  if(!prod){if(typeof toast==='function')toast('Produto não encontrado para o código: '+codigo);return;}
  var id=String(prod.id||prod.cod||codigo), st=balGet();
  st.contagens[id]=Number(st.contagens[id]||0)+qtd;
  st.codigos[id]=codigo;
  st.leituras.push({produto_id:id,codigo:codigo,qtd:qtd,data:new Date().toISOString(),produto_nome:balNomeProduto(prod)});
  balSet(st);
  if(codEl)codEl.value=''; if(qtdEl)qtdEl.value='';
  var found=document.getElementById('bal-found');
  if(found)found.innerHTML='Adicionado: <strong>'+balNomeProduto(prod)+'</strong> · quantidade: <strong>'+balFmt(qtd)+'</strong>';
  balAtualizarLinha(id,st);
  balRenderStats();
  setTimeout(function(){if(codEl)codEl.focus();},50);
}
function balLimparCampos(){var cod=document.getElementById('bal-cod'),qtd=document.getElementById('bal-qtd');if(cod)cod.value='';if(qtd)qtd.value='';var f=document.getElementById('bal-found');if(f)f.textContent='Bipe um produto para iniciar a contagem.';if(cod)cod.focus();}
function balProdutoPorId(id){balGarantirCache();return balCachePorId[String(id)]||null;}
function balRemoverItem(id){var st=balGet();delete st.contagens[String(id)];delete st.codigos[String(id)];st.leituras=(st.leituras||[]).filter(function(l){return String(l.produto_id)!==String(id);});balSet(st);balRender();}
function balAlterarQtd(id,val){var qtd=Number(String(val||'').replace(',','.')), st=balGet(); if(!Number.isFinite(qtd)||qtd<0)return; if(qtd===0){delete st.contagens[String(id)];delete st.codigos[String(id)];}else st.contagens[String(id)]=qtd; balSet(st);balRenderStats();}
function balResetarBalanco(){if(!confirm('Limpar o balanço aberto desta categoria? Nenhum estoque será alterado agora.'))return;localStorage.removeItem(balKeyAtual());balUltimaConferencia=[];var card=document.getElementById('bal-simulacao-card');if(card)card.style.display='none';balRender();}
function balRenderStats(){
  var st=balGet(), produtos=balProdutosCategoria(), ids=Object.keys(st.contagens||{});
  ids=ids.filter(function(id){return !!balProdutoPorId(id);});
  var totalContado=ids.reduce(function(s,id){return s+Number(st.contagens[id]||0);},0);
  var stats=[['Categoria',balCategoriaSelecionada(),'stb'],['Produtos da categoria',produtos.length,'stb'],['Produtos lidos',ids.length,'stg'],['Peças contadas',balFmt(totalContado),'stgo'],['Leituras feitas',(st.leituras||[]).length,'sto']];
  var el=document.getElementById('bal-stats'); if(el)el.innerHTML=stats.map(function(x){return '<div class="st '+x[2]+'"><div class="sl">'+x[0]+'</div><div class="sv">'+x[1]+'</div></div>';}).join('');
}
function balHtmlLinha(id,st){
  var p=balProdutoPorId(id), nome=p?balNomeProduto(p):'Produto não encontrado', est=p?balEstoqueProduto(p):0, contado=Number(st.contagens[id]||0), codigo=st.codigos[id]||'';
  var safe=String(id).replace(/'/g,"\\'");
  return '<tr data-bal-id="'+String(id).replace(/"/g,'&quot;')+'"><td><strong>'+nome+'</strong><div class="tm">ID: '+id+'</div></td><td>'+codigo+'</td><td>'+balFmt(est)+'</td><td><input class="fi" style="max-width:95px" type="number" min="0" step="1" value="'+contado+'" onchange="balAlterarQtd(\''+safe+'\', this.value)"></td><td><button class="btn bd2 xs" type="button" onclick="balRemoverItem(\''+safe+'\')">Remover</button></td></tr>';
}
function balAtualizarLinha(id,st){
  var tb=document.getElementById('bal-lidos'); if(!tb)return;
  var vazio=tb.querySelector('td.empty'); if(vazio)tb.innerHTML='';
  var linha=tb.querySelector('tr[data-bal-id="'+(window.CSS&&CSS.escape?CSS.escape(String(id)):String(id).replace(/"/g,'\\"'))+'"]');
  var html=balHtmlLinha(String(id),st);
  if(linha) linha.outerHTML=html; else tb.insertAdjacentHTML('beforeend',html);
}
function balRender(){
  balRenderStats();
  var st=balGet(), ids=Object.keys(st.contagens||{}).filter(function(id){return !!balProdutoPorId(id);}), tb=document.getElementById('bal-lidos');
  if(tb){
    if(!ids.length) tb.innerHTML='<tr><td colspan="5" class="empty">Nenhum produto lido ainda.</td></tr>';
    else tb.innerHTML=ids.map(function(id){return balHtmlLinha(id,st);}).join('');
  }
}
function balGerarConferencia(){
  var st=balGet(), produtos=balProdutosCategoria();
  var linhas=produtos.map(function(p){
    var id=String(p.id||p.cod||''), sistema=balEstoqueProduto(p), contado=Number((st.contagens||{})[id]||0), diff=contado-sistema;
    return {id:id,nome:balNomeProduto(p),codigo:(balCodigosProduto(p)[0]||''),sistema:sistema,contado:contado,diff:diff};
  });
  linhas.sort(function(a,b){if(a.diff!==0&&b.diff===0)return-1;if(a.diff===0&&b.diff!==0)return 1;return a.nome.localeCompare(b.nome);});
  balUltimaConferencia=linhas;
  var card=document.getElementById('bal-simulacao-card'); if(card)card.style.display='block';
  var comDiff=linhas.filter(function(x){return x.diff!==0;}), zerados=linhas.filter(function(x){return x.sistema!==0&&x.contado===0;});
  var pos=linhas.reduce(function(s,x){return s+(x.diff>0?x.diff:0);},0), neg=linhas.reduce(function(s,x){return s+(x.diff<0?x.diff:0);},0);
  var resumo=[['Produtos com diferença',comDiff.length,'str'],['Zerados por não leitura',zerados.length,'sto'],['Ajustes positivos','+'+balFmt(pos),'stg'],['Ajustes negativos',balFmt(neg),'str']];
  var r=document.getElementById('bal-resumo'); if(r)r.innerHTML=resumo.map(function(x){return '<div class="st '+x[2]+'"><div class="sl">'+x[0]+'</div><div class="sv">'+x[1]+'</div></div>';}).join('');
  var tb=document.getElementById('bal-simulacao');
  if(tb)tb.innerHTML=linhas.map(function(x){var cls=x.diff>0?'bal-diff-pos':(x.diff<0?'bal-diff-neg':'bal-diff-zero');return '<tr><td><strong>'+x.nome+'</strong><div class="tm">ID: '+x.id+'</div></td><td>'+x.codigo+'</td><td>'+balFmt(x.sistema)+'</td><td>'+balFmt(x.contado)+'</td><td class="'+cls+'">'+(x.diff>0?'+':'')+balFmt(x.diff)+'</td></tr>';}).join('');
  setTimeout(function(){if(card)card.scrollIntoView({behavior:'smooth',block:'start'});},50);
}
function balFinalizarReal(){
  var st=balGet();
  var produtos=balProdutosCategoria();
  var ids=Object.keys(st.contagens||{}).filter(function(id){return !!balProdutoPorId(id);});
  if(!produtos.length){if(typeof toast==='function')toast('Nenhum produto cadastrado nesta categoria.');return;}
  if(!ids.length){if(typeof toast==='function')toast('Nenhum produto lido no balanço.');return;}

  balGerarConferencia();

  pedirSenha(function(){
    var msg='ATENÇÃO: isso vai atualizar o estoque REAL somente da categoria '+balCategoriaSelecionada()+'.\n\n'+
            'Produtos não lidos desta categoria ficarão com estoque 0.\n'+
            'Produtos lidos receberão a quantidade contada.\n'+
            'As outras categorias não serão alteradas.\n\n'+
            'Deseja finalizar e aplicar o balanço agora?';
    if(!confirm(msg))return;

    var agora=new Date().toISOString();
    var contagens=st.contagens||{};
    var totalProdutos=0, totalZerados=0, totalAlterados=0;

    var categoriaAtual=balCategoriaSelecionada();
    produtos=(DB.get('produtos')||[]).map(function(p){
      if(balCategoriaProduto(p)!==categoriaAtual) return p;
      var id=String(p.id||p.cod||'');
      var antigo=balEstoqueProduto(p);
      var contado=Number(contagens[id]||0);
      if(!Number.isFinite(contado)||contado<0)contado=0;
      var novo=Object.assign({}, p);
      novo.estoque=contado;
      novo.estq=contado;
      novo.updatedAt=agora;
      totalProdutos++;
      if(contado===0 && antigo!==0)totalZerados++;
      if(contado!==antigo)totalAlterados++;
      return novo;
    });

    try{
      localStorage.setItem('bm_backup_produtos_antes_balanco_'+Date.now(), JSON.stringify(DB.get('produtos')||[]));
    }catch(e){}

    DB.set('produtos', produtos);
    balInvalidarCache();
    localStorage.removeItem(balKeyAtual());
    balUltimaConferencia=[];

    try{renderProds();}catch(e){}
    try{renderRelEstoque();}catch(e){}
    balRender();

    if(typeof toast==='function')toast('✅ Balanço aplicado: '+totalAlterados+' produtos alterados. Sincronize para salvar na planilha.','ok');
    alert('Balanço aplicado com sucesso!\n\nCategoria: '+categoriaAtual+'\nProdutos analisados: '+totalProdutos+'\nProdutos alterados: '+totalAlterados+'\nProdutos zerados por não leitura: '+totalZerados+'\n\nAs outras categorias não foram alteradas.\n\nAgora clique em Sincronizar agora para enviar o estoque real para a planilha.');
  });
}

function balExportarCsv(){
  if(!balUltimaConferencia||!balUltimaConferencia.length)balGerarConferencia();
  var linhas=[['Categoria','Produto','Codigo','Estoque sistema','Contado','Diferenca']];
  (balUltimaConferencia||[]).forEach(function(x){linhas.push([balCategoriaSelecionada(),x.nome,x.codigo,x.sistema,x.contado,x.diff]);});
  var csv=linhas.map(function(r){return r.map(function(c){return '"'+String(c==null?'':c).replace(/"/g,'""')+'"';}).join(';');}).join('\n');
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}), a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='balanco_conferencia_'+balCategoriaSelecionada().toLowerCase()+'_'+new Date().toISOString().slice(0,10)+'.csv'; document.body.appendChild(a); a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);
}
