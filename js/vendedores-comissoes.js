/* ============================================================
   BELA MODAS CAIXA — Módulo Vendedores e Comissões
   Arquivo: js/vendedores-comissoes.js
   Deve ser carregado depois de js/app-core.js
   ============================================================ */
(function(){
  'use strict';

  var MOD = {};
  var STORE_VENDEDORES = 'vendedores';
  var STORE_COMISSOES = 'comissoes';
  var STORE_FECHAMENTOS = 'fechamentos_comissoes';
  var REGRA_COMISSAO = 'BM_COMISSAO_V1_NAO_RETROATIVA';
  var _dbSetOriginal = null;
  var _marcandoVendaAtual = false;
  var _idsAntesFinalizar = null;
  var _irOriginal = null;
  var _hooksAplicados = false;

  function temDB(){ return window.DB && typeof DB.get === 'function' && typeof DB.set === 'function'; }
  function uid(){ return temDB() && typeof DB.uid === 'function' ? DB.uid() : Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
  function agora(){ return typeof window.nowLocalISO === 'function' ? nowLocalISO() : new Date().toISOString(); }
  function hoje(){ return typeof window.todayLocalISO === 'function' ? todayLocalISO() : agora().slice(0,10); }
  function dinheiro(v){ return typeof window.dinheiroNum === 'function' ? dinheiroNum(v) : num(v); }
  function moeda(v){ return typeof window.R === 'function' ? R(v) : 'R$ '+Number(v||0).toFixed(2).replace('.',','); }
  function dataBR(v){ return typeof window.FD === 'function' ? FD(v) : String(v||'').slice(0,10).split('-').reverse().join('/'); }
  function toastBM(msg,tipo){ if(typeof window.toast === 'function') toast(msg,tipo); else alert(msg); }
  function el(id){ return document.getElementById(id); }
  function val(id){ var e=el(id); return e ? e.value : ''; }
  function setVal(id,v){ var e=el(id); if(e) e.value = v == null ? '' : v; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function num(v){
    if(v == null || v === '') return 0;
    if(typeof v === 'number') return isFinite(v) ? v : 0;
    var s = String(v).trim().replace(/\s+/g,'');
    if(s.indexOf(',') >= 0) s = s.replace(/\./g,'').replace(',', '.');
    var n = parseFloat(s.replace(/[^0-9.-]/g,''));
    return isFinite(n) ? n : 0;
  }
  function fmtPct(v){ return Number(v||0).toFixed(2).replace('.',',')+'%'; }
  function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }

  function getVendedores(){ return temDB() ? (DB.get(STORE_VENDEDORES)||[]).filter(function(v){ return v && !v.deletedAt; }) : []; }
  function setVendedores(lista){ if(temDB()) DB.set(STORE_VENDEDORES, lista||[]); }
  function getVendedor(id){ return getVendedores().find(function(v){ return String(v.id) === String(id); }) || null; }
  function getAtivos(){
    return getVendedores().filter(function(v){ return v.ativo !== false; })
      .sort(function(a,b){ return String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR'); });
  }

  function comissoesVendedor(v){
    v = v || {};
    var c = v.comissoes || {};
    return {
      pix: dinheiro(c.pix != null ? c.pix : (v.comissao_pix != null ? v.comissao_pix : v.percentual)),
      dinheiro: dinheiro(c.dinheiro != null ? c.dinheiro : (v.comissao_dinheiro != null ? v.comissao_dinheiro : v.percentual)),
      cartao: dinheiro(c.cartao != null ? c.cartao : (v.comissao_cartao != null ? v.comissao_cartao : v.percentual)),
      crediario: dinheiro(c.crediario != null ? c.crediario : (v.comissao_crediario != null ? v.comissao_crediario : v.percentual))
    };
  }

  function formaComissao(forma){
    var f = norm(forma);
    if(f === 'pix') return 'pix';
    if(f === 'dinheiro') return 'dinheiro';
    if(f === 'credito' || f === 'crédito' || f === 'debito' || f === 'débito' || f === 'cartao' || f === 'cartão') return 'cartao';
    if(f === 'fiado' || f === 'crediario' || f === 'crediário') return 'crediario';
    return f || 'dinheiro';
  }

  function rotuloFormaComissao(forma){
    var f = formaComissao(forma);
    if(f === 'pix') return 'PIX';
    if(f === 'dinheiro') return 'Dinheiro';
    if(f === 'cartao') return 'Cartão';
    if(f === 'crediario') return 'Crediário';
    return forma ? String(forma) : '—';
  }

  function textoFormasComissao(detalhes){
    detalhes = Array.isArray(detalhes) ? detalhes : [];
    var mapa = {};
    detalhes.forEach(function(d){
      var f = formaComissao(d && d.forma);
      if(f) mapa[f] = true;
    });
    var lista = Object.keys(mapa);
    if(!lista.length) return '—';
    return lista.map(rotuloFormaComissao).join(' + ');
  }

  function pagamentosDaVenda(venda){
    venda = venda || {};
    if(Array.isArray(venda.pagamentos) && venda.pagamentos.length){
      return venda.pagamentos.map(function(p){
        return { forma: formaComissao(p.forma || p.tipo), valor: dinheiro(p.valor != null ? p.valor : p.val) };
      }).filter(function(p){ return p.forma && p.valor > 0; });
    }
    return [{ forma: formaComissao(venda.forma || venda.forma_pagamento), valor: dinheiro(venda.total) }];
  }

  function calcularComissaoVenda(venda, vendedor){
    vendedor = vendedor || getVendedor(venda && (venda.vendedor_id || venda.vendedorId));
    if(!venda || !vendedor) return {valor:0, percentual_medio:0, detalhes:[]};
    var conf = comissoesVendedor(vendedor);
    var totalBase = 0;
    var totalComissao = 0;
    var detalhes = pagamentosDaVenda(venda).map(function(p){
      var pct = conf[p.forma] != null ? Number(conf[p.forma]||0) : 0;
      var valor = dinheiro(p.valor);
      var com = valor * pct / 100;
      totalBase += valor;
      totalComissao += com;
      return {forma:p.forma, valor:valor, percentual:pct, comissao:com};
    });
    var percentualMedio = totalBase > 0 ? (totalComissao / totalBase * 100) : 0;
    return {valor:totalComissao, percentual_medio:percentualMedio, detalhes:detalhes};
  }



  /*
   * REGRA 001 — Comissão não retroativa
   * Vendas antigas, criadas antes da implantação deste módulo, não recebem
   * vendedor automaticamente e não entram no relatório de comissão.
   * A comissão só é registrada durante a finalização da venda, quando o
   * usuário seleciona um vendedor ativo no campo obrigatório da venda.
   * O percentual e o valor ficam gravados no histórico da própria venda,
   * preservando o fechamento caso a comissão do vendedor mude no futuro.
   */

  function vendedorSelecionadoVenda(){ return val('v-vendedor'); }

  function vendaPrecisaVendedor(){
    var select = el('v-vendedor');
    if(!select) return false;
    var cartEl = el('cart');
    if(cartEl && /adicione itens/i.test(cartEl.textContent||'')) return false;
    return true;
  }

  function validarVendedorVenda(){
    if(!vendaPrecisaVendedor()) return true;
    var id = vendedorSelecionadoVenda();
    if(id && getVendedor(id)) return true;
    toastBM('⚠️ Selecione o vendedor antes de finalizar a venda.');
    var s = el('v-vendedor');
    if(s){ s.focus(); s.style.borderColor='var(--red2)'; setTimeout(function(){ s.style.borderColor=''; },1800); }
    return false;
  }

  function vendaPodeReceberComissaoAgora(venda){
    if(!_marcandoVendaAtual || !_idsAntesFinalizar) return false;
    if(!venda || !venda.id) return false;
    return !_idsAntesFinalizar[String(venda.id)];
  }

  function vendaMarcadaPeloModulo(venda){
    return !!(venda && (venda.comissao_regra === REGRA_COMISSAO || venda.comissaoRegra === REGRA_COMISSAO || (venda.comissao && venda.comissao.regra === REGRA_COMISSAO)));
  }

  function enriquecerVenda(venda){
    if(!venda || venda.deletedAt) return venda;
    if(venda.vendedor_id || venda.vendedorId || vendaMarcadaPeloModulo(venda)) return venda;
    if(!vendaPodeReceberComissaoAgora(venda)) return venda;
    var id = vendedorSelecionadoVenda();
    var vendedor = getVendedor(id);
    if(!vendedor) return venda;
    var calc = calcularComissaoVenda(venda, vendedor);
    venda.vendedor_id = vendedor.id;
    venda.vendedorId = vendedor.id;
    venda.vendedor_nome = vendedor.nome;
    venda.vendedorNome = vendedor.nome;
    venda.comissao_regra = REGRA_COMISSAO;
    venda.comissaoRegra = REGRA_COMISSAO;
    venda.comissao_gerada_em = agora();
    venda.comissaoGeradaEm = venda.comissao_gerada_em;
    venda.comissao_percentual = Number(calc.percentual_medio || 0);
    venda.comissao_valor = Number(calc.valor || 0);
    venda.comissao = {
      vendedor_id: vendedor.id,
      vendedor_nome: vendedor.nome,
      regra: REGRA_COMISSAO,
      gerada_em: venda.comissao_gerada_em,
      percentual_medio: Number(calc.percentual_medio || 0),
      valor: Number(calc.valor || 0),
      detalhes: calc.detalhes,
      forma_pagamento: textoFormasComissao(calc.detalhes),
      status: 'pendente',
      createdAt: agora()
    };
    return venda;
  }

  function registrarComissaoDaVenda(venda){
    if(!temDB() || !venda || !venda.id || !venda.vendedor_id) return;
    if(!vendaMarcadaPeloModulo(venda)) return;
    var lista = DB.get(STORE_COMISSOES) || [];
    var idx = lista.findIndex(function(c){ return String(c.venda_id) === String(venda.id); });
    var reg = {
      id: idx >= 0 ? lista[idx].id : uid(),
      venda_id: venda.id,
      data: venda.data || venda.createdAt || agora(),
      cliente: venda.cliNome || venda.cliente || 'Balcão',
      vendedor_id: venda.vendedor_id,
      vendedor_nome: venda.vendedor_nome || venda.vendedorNome || '',
      regra: REGRA_COMISSAO,
      total_venda: dinheiro(venda.total),
      percentual_medio: dinheiro(venda.comissao_percentual || (venda.comissao && venda.comissao.percentual_medio)),
      valor: dinheiro(venda.comissao_valor || (venda.comissao && venda.comissao.valor)),
      detalhes: venda.comissao && venda.comissao.detalhes || [],
      forma_pagamento: textoFormasComissao(venda.comissao && venda.comissao.detalhes || []),
      status: venda.comissao_status || 'pendente',
      updatedAt: agora()
    };
    if(idx >= 0) lista[idx] = Object.assign({}, lista[idx], reg);
    else lista.push(Object.assign({createdAt:agora()}, reg));
    if(_dbSetOriginal) _dbSetOriginal.call(DB, STORE_COMISSOES, lista);
    else DB.set(STORE_COMISSOES, lista);
  }

  function aplicarHookDB(){
    if(!temDB() || DB._bmVendedoresHook) return;
    _dbSetOriginal = DB.set;
    DB.set = function(k,v){
      if(k === 'vendas' && Array.isArray(v) && _marcandoVendaAtual){
        var alterou = false;
        v = v.map(function(venda){
          var antes = venda && (venda.vendedor_id || venda.vendedorId);
          var nova = enriquecerVenda(venda);
          var depois = nova && (nova.vendedor_id || nova.vendedorId);
          if(!antes && depois) alterou = true;
          return nova;
        });
        var ret = _dbSetOriginal.call(DB,k,v);
        if(alterou){
          try{
            v.forEach(function(venda){
              if(venda && venda.vendedor_id) registrarComissaoDaVenda(venda);
            });
          }catch(e){}
        }
        return ret;
      }
      return _dbSetOriginal.call(DB,k,v);
    };
    DB._bmVendedoresHook = true;
  }

  function aplicarHooksVenda(){
    if(_hooksAplicados) return;

    if(typeof window.abrirModalPagamento === 'function' && !window.abrirModalPagamento._bmVendHook){
      var oldAbrir = window.abrirModalPagamento;
      window.abrirModalPagamento = function(){
        if(!validarVendedorVenda()) return;
        return oldAbrir.apply(this, arguments);
      };
      window.abrirModalPagamento._bmVendHook = true;
    }

    if(typeof window.confirmarPagamento === 'function' && !window.confirmarPagamento._bmVendHook){
      var oldConf = window.confirmarPagamento;
      window.confirmarPagamento = function(){
        if(!validarVendedorVenda()) return;

        // Em algumas versões do app-core, confirmarPagamento() chama a função
        // finalizarVenda() original por referência interna. Por isso armamos a
        // marcação aqui também, antes da venda ser salva em DB.set('vendas').
        _idsAntesFinalizar = {};
        try{
          (temDB() ? (DB.get('vendas')||[]) : []).forEach(function(v){
            if(v && v.id) _idsAntesFinalizar[String(v.id)] = true;
          });
        }catch(e){}
        _marcandoVendaAtual = true;

        try{
          return oldConf.apply(this, arguments);
        }finally{
          setTimeout(function(){
            _marcandoVendaAtual = false;
            _idsAntesFinalizar = null;
            setVal('v-vendedor','');
            atualizarSelectVenda();
          }, 350);
        }
      };
      window.confirmarPagamento._bmVendHook = true;
    }

    if(typeof window.finalizarVenda === 'function' && !window.finalizarVenda._bmVendHook){
      var oldFin = window.finalizarVenda;
      window.finalizarVenda = function(){
        if(!validarVendedorVenda()) return;
        _idsAntesFinalizar = {};
        try{ (temDB() ? (DB.get('vendas')||[]) : []).forEach(function(v){ if(v && v.id) _idsAntesFinalizar[String(v.id)] = true; }); }catch(e){}
        _marcandoVendaAtual = true;
        try{
          return oldFin.apply(this, arguments);
        }finally{
          setTimeout(function(){
            _marcandoVendaAtual = false;
            _idsAntesFinalizar = null;
            setVal('v-vendedor','');
            atualizarSelectVenda();
          }, 180);
        }
      };
      window.finalizarVenda._bmVendHook = true;
    }

    if(typeof window.limparVenda === 'function' && !window.limparVenda._bmVendHook){
      var oldLimpar = window.limparVenda;
      window.limparVenda = function(){
        var ret = oldLimpar.apply(this, arguments);
        setTimeout(function(){ setVal('v-vendedor',''); atualizarSelectVenda(); },20);
        return ret;
      };
      window.limparVenda._bmVendHook = true;
    }

    _hooksAplicados = true;
  }

  function aplicarHookIr(){
    if(typeof window.ir !== 'function' || window.ir._bmVendHook) return;
    _irOriginal = window.ir;
    window.ir = function(pg){
      var ret = _irOriginal.apply(this, arguments);
      if(pg === 'vendedores'){
        setTimeout(function(){ MOD.renderTudo(); },30);
      }
      if(pg === 'venda'){
        setTimeout(function(){ atualizarSelectVenda(); },30);
      }
      return ret;
    };
    window.ir._bmVendHook = true;
  }

  function atualizarSelectVenda(){
    var s = el('v-vendedor');
    if(!s) return;
    var atual = s.value;
    var opts = ['<option value="">Selecione o vendedor...</option>'];
    getAtivos().forEach(function(v){ opts.push('<option value="'+esc(v.id)+'">'+esc(v.nome)+'</option>'); });
    s.innerHTML = opts.join('');
    if(atual && getVendedor(atual) && getVendedor(atual).ativo !== false) s.value = atual;
  }

  function atualizarFiltroVendedor(){
    var s = el('com-vendedor');
    if(!s) return;
    var atual = s.value;
    var opts = ['<option value="">Todos os vendedores</option>'];
    getVendedores().forEach(function(v){ opts.push('<option value="'+esc(v.id)+'">'+esc(v.nome)+'</option>'); });
    s.innerHTML = opts.join('');
    if(atual) s.value = atual;
  }

  function vendasValidas(){ return temDB() ? (DB.get('vendas')||[]).filter(function(v){ return v && !v.deletedAt; }) : []; }
  function comissoesGravadas(){ return temDB() ? (DB.get(STORE_COMISSOES)||[]).filter(function(c){ return c && !c.deletedAt; }) : []; }

  function vendaTemComissao(venda){ return vendaMarcadaPeloModulo(venda) && (venda.comissao || venda.comissao_valor != null || venda.vendedor_id || venda.vendedorId); }

  function normalizarComissaoVenda(venda){
    if(!venda || !vendaMarcadaPeloModulo(venda)) return null;
    var vid = venda.vendedor_id || venda.vendedorId;
    var vendedor = getVendedor(vid);
    if(!vendedor && venda.vendedor_nome){ vendedor = {id:vid||'', nome:venda.vendedor_nome, comissoes:{}}; }
    if(!vendedor) return null;
    var calc = vendaTemComissao(venda) ? {
      valor: dinheiro(venda.comissao_valor || (venda.comissao && venda.comissao.valor)),
      percentual_medio: dinheiro(venda.comissao_percentual || (venda.comissao && venda.comissao.percentual_medio)),
      detalhes: venda.comissao && venda.comissao.detalhes || []
    } : calcularComissaoVenda(venda, vendedor);
    if(!calc.valor && calc.percentual_medio === 0){ calc = calcularComissaoVenda(venda, vendedor); }
    return {
      id: 'venda:'+venda.id,
      venda_id: venda.id,
      data: venda.data || venda.createdAt || '',
      cliente: venda.cliNome || 'Balcão',
      vendedor_id: vendedor.id,
      vendedor_nome: vendedor.nome || venda.vendedor_nome || '',
      total_venda: dinheiro(venda.total),
      percentual_medio: calc.percentual_medio,
      valor: calc.valor,
      detalhes: calc.detalhes,
      forma_pagamento: textoFormasComissao(calc.detalhes),
      status: venda.comissao_status || (venda.comissao && venda.comissao.status) || 'pendente'
    };
  }

  function registrosComissao(){
    var porVenda = {};
    vendasValidas().forEach(function(v){
      var r = normalizarComissaoVenda(v);
      if(r) porVenda[String(r.venda_id)] = r;
    });
    comissoesGravadas().forEach(function(c){
      if(c.regra !== REGRA_COMISSAO) return;
      if(!porVenda[String(c.venda_id)]) porVenda[String(c.venda_id)] = c;
    });
    return Object.keys(porVenda).map(function(k){ return porVenda[k]; });
  }

  MOD.trocarAba = function(aba){
    var cad = aba === 'cadastro';
    var tc = el('vend-tab-cadastro'), tm = el('vend-tab-comissoes');
    var pc = el('vend-panel-cadastro'), pm = el('vend-panel-comissoes');
    if(tc) tc.classList.toggle('on', cad);
    if(tm) tm.classList.toggle('on', !cad);
    if(pc){ pc.classList.toggle('on', cad); pc.style.display = cad ? 'block' : 'none'; }
    if(pm){ pm.classList.toggle('on', !cad); pm.style.display = cad ? 'none' : 'block'; }
    if(!cad) MOD.renderComissoes();
  };

  MOD.limparFormVendedor = function(){
    ['vend-id','vend-nome','vend-comissao','vend-comissao-pix','vend-comissao-dinheiro','vend-comissao-cartao','vend-comissao-crediario','vend-meta'].forEach(function(id){ setVal(id,''); });
    setVal('vend-ativo','1');
    var n = el('vend-nome'); if(n) n.focus();
  };

  MOD.novoVendedor = function(){ MOD.trocarAba('cadastro'); MOD.limparFormVendedor(); };

  MOD.salvarVendedor = function(){
    if(!temDB()){ toastBM('⚠️ Banco local não carregado.'); return; }
    var id = val('vend-id');
    var nome = val('vend-nome').trim();
    var comissoes = {
      pix: dinheiro(val('vend-comissao-pix')),
      dinheiro: dinheiro(val('vend-comissao-dinheiro')),
      cartao: dinheiro(val('vend-comissao-cartao')),
      crediario: dinheiro(val('vend-comissao-crediario'))
    };
    var meta = dinheiro(val('vend-meta'));
    var ativo = val('vend-ativo') !== '0';
    if(!nome){ toastBM('⚠️ Informe o nome do vendedor.'); return; }
    if(comissoes.pix < 0 || comissoes.dinheiro < 0 || comissoes.cartao < 0 || comissoes.crediario < 0){ toastBM('⚠️ Comissão não pode ser negativa.'); return; }
    var lista = getVendedores();
    if(id){
      var idx = lista.findIndex(function(v){ return String(v.id) === String(id); });
      if(idx < 0){ toastBM('⚠️ Vendedor não encontrado.'); return; }
      lista[idx] = Object.assign({}, lista[idx], {
        nome:nome,
        percentual:comissoes.dinheiro,
        comissoes:comissoes,
        comissao_pix:comissoes.pix,
        comissao_dinheiro:comissoes.dinheiro,
        comissao_cartao:comissoes.cartao,
        comissao_crediario:comissoes.crediario,
        meta:meta,
        ativo:ativo,
        updatedAt:agora()
      });
    }else{
      lista.push({
        id:uid(), nome:nome,
        percentual:comissoes.dinheiro,
        comissoes:comissoes,
        comissao_pix:comissoes.pix,
        comissao_dinheiro:comissoes.dinheiro,
        comissao_cartao:comissoes.cartao,
        comissao_crediario:comissoes.crediario,
        meta:meta, ativo:ativo,
        createdAt:agora(), updatedAt:agora()
      });
    }
    setVendedores(lista);
    MOD.limparFormVendedor();
    MOD.renderVendedores();
    atualizarSelectVenda();
    atualizarFiltroVendedor();
    toastBM('✅ Vendedor salvo!','ok');
  };

  MOD.editarVendedor = function(id){
    var v = getVendedor(id); if(!v) return;
    var c = comissoesVendedor(v);
    setVal('vend-id', v.id);
    setVal('vend-nome', v.nome || '');
    setVal('vend-comissao-pix', c.pix || '');
    setVal('vend-comissao-dinheiro', c.dinheiro || '');
    setVal('vend-comissao-cartao', c.cartao || '');
    setVal('vend-comissao-crediario', c.crediario || '');
    setVal('vend-comissao', c.dinheiro || '');
    setVal('vend-meta', v.meta || '');
    setVal('vend-ativo', v.ativo === false ? '0' : '1');
    MOD.trocarAba('cadastro');
    var n = el('vend-nome'); if(n) n.focus();
  };

  MOD.inativarVendedor = function(id){
    var lista = getVendedores();
    var idx = lista.findIndex(function(v){ return String(v.id) === String(id); });
    if(idx < 0) return;
    lista[idx].ativo = lista[idx].ativo === false ? true : false;
    lista[idx].updatedAt = agora();
    setVendedores(lista);
    MOD.renderVendedores();
    atualizarSelectVenda();
    atualizarFiltroVendedor();
  };

  MOD.excluirVendedor = function(id){
    var v = getVendedor(id); if(!v) return;
    var temVenda = vendasValidas().some(function(x){ return String(x.vendedor_id || x.vendedorId || '') === String(id); });
    if(temVenda){ toastBM('⚠️ Este vendedor já tem vendas. Vou inativar para preservar o histórico.'); MOD.inativarVendedor(id); return; }
    if(!confirm('Excluir o vendedor '+(v.nome||'')+'?')) return;
    var lista = getVendedores().filter(function(x){ return String(x.id) !== String(id); });
    setVendedores(lista);
    MOD.renderVendedores();
    atualizarSelectVenda();
    atualizarFiltroVendedor();
  };

  MOD.renderVendedores = function(){
    var busca = norm(val('vend-busca'));
    var lista = getVendedores().filter(function(v){ return !busca || norm(v.nome).indexOf(busca) >= 0; });
    var tb = el('vend-tb');
    if(tb){
      tb.innerHTML = lista.map(function(v){
        var c = comissoesVendedor(v);
        return '<tr>'+
          '<td><b>'+esc(v.nome)+'</b><div class="tm">ID: '+esc(v.id)+'</div></td>'+
          '<td><div class="tm">PIX: <b>'+fmtPct(c.pix)+'</b> • Dinheiro: <b>'+fmtPct(c.dinheiro)+'</b></div><div class="tm">Cartão: <b>'+fmtPct(c.cartao)+'</b> • Crediário: <b>'+fmtPct(c.crediario)+'</b></div></td>'+
          '<td>'+(v.meta ? moeda(v.meta) : '<span class="tm">Sem meta</span>')+'</td>'+
          '<td>'+(v.ativo===false?'<span class="txt-o">Inativo</span>':'<span class="txt-g">Ativo</span>')+'</td>'+
          '<td><div class="fr"><button class="btn bb xs" type="button" onclick="BMVendedoresComissoes.editarVendedor(\''+esc(v.id)+'\')">Editar</button><button class="btn bo xs" type="button" onclick="BMVendedoresComissoes.inativarVendedor(\''+esc(v.id)+'\')">'+(v.ativo===false?'Ativar':'Inativar')+'</button><button class="btn bd2 xs" type="button" onclick="BMVendedoresComissoes.excluirVendedor(\''+esc(v.id)+'\')">Excluir</button></div></td>'+
        '</tr>';
      }).join('') || '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--txt2);">Nenhum vendedor cadastrado.</td></tr>';
    }
    var st = el('vend-stats');
    if(st){
      var todos = getVendedores();
      var ativos = todos.filter(function(v){ return v.ativo !== false; }).length;
      st.innerHTML = '<div class="st stg"><div class="sl">Ativos</div><div class="sv">'+ativos+'</div></div>'+
        '<div class="st stb"><div class="sl">Total</div><div class="sv">'+todos.length+'</div></div>';
    }
    atualizarSelectVenda();
    atualizarFiltroVendedor();
  };

  MOD.limparFiltroComissao = function(){
    setVal('com-ini',''); setVal('com-fim',''); setVal('com-vendedor','');
    MOD.renderComissoes();
  };

  function garantirBotaoFecharComissao(){
    if(el('com-fechar-btn')) return;
    var ref = el('com-vendedor');
    if(!ref) return;
    var linha = ref.closest ? ref.closest('.fr') : ref.parentNode;
    if(!linha) return;
    var btn = document.createElement('button');
    btn.id = 'com-fechar-btn';
    btn.className = 'btn bg2';
    btn.type = 'button';
    btn.innerHTML = '✅ Fechar comissão';
    btn.onclick = function(){ MOD.fecharComissao(); };
    linha.appendChild(btn);
  }

  function ajustarCabecalhoRelatorioComissao(){
    var tb = el('com-tb');
    if(!tb) return;
    var table = tb.closest ? tb.closest('table') : null;
    var ths = table ? table.querySelectorAll('thead th') : [];
    if(ths && ths.length >= 8){
      ths[4].textContent = 'Forma';
      ths[5].textContent = 'Total venda';
      ths[6].textContent = '%';
      ths[7].textContent = 'Comissão';
    }
  }

  function listaComissaoFiltrada(){
    var ini = val('com-ini');
    var fim = val('com-fim');
    var vendedorId = val('com-vendedor');
    return registrosComissao().filter(function(c){
      var d = String(c.data || '').slice(0,10);
      if(ini && d < ini) return false;
      if(fim && d > fim) return false;
      if(vendedorId && String(c.vendedor_id) !== String(vendedorId)) return false;
      return true;
    }).sort(function(a,b){ return String(b.data||'').localeCompare(String(a.data||'')); });
  }

  MOD.fecharComissao = function(){
    if(!temDB()){ toastBM('⚠️ Banco local não carregado.'); return; }
    var lista = listaComissaoFiltrada();
    if(!lista.length){ toastBM('⚠️ Nenhuma comissão encontrada para fechar.'); return; }
    var ini = val('com-ini') || 'início';
    var fim = val('com-fim') || 'hoje';
    var vendedorId = val('com-vendedor');
    var vend = vendedorId ? getVendedor(vendedorId) : null;
    var totalVendido = lista.reduce(function(s,c){ return s + dinheiro(c.total_venda); },0);
    var totalComissao = lista.reduce(function(s,c){ return s + dinheiro(c.valor); },0);
    var msg = 'Fechar comissão do período '+ini+' até '+fim+'?\n\n'+
      'Vendedor: '+(vend ? vend.nome : 'Todos os vendedores')+'\n'+
      'Vendas: '+lista.length+'\n'+
      'Total vendido: '+moeda(totalVendido)+'\n'+
      'Comissão: '+moeda(totalComissao)+'\n\n'+
      'Esse fechamento ficará salvo no histórico.';
    if(!confirm(msg)) return;

    var fechamentos = DB.get(STORE_FECHAMENTOS) || [];
    var fechamento = {
      id: uid(),
      regra: REGRA_COMISSAO,
      data_inicial: val('com-ini') || '',
      data_final: val('com-fim') || '',
      vendedor_id: vendedorId || '',
      vendedor_nome: vend ? vend.nome : 'Todos os vendedores',
      vendas: lista.length,
      total_vendido: totalVendido,
      total_comissao: totalComissao,
      comissoes_ids: lista.map(function(c){ return c.id || c.venda_id; }),
      vendas_ids: lista.map(function(c){ return c.venda_id; }),
      fechado_em: agora(),
      createdAt: agora()
    };
    fechamentos.push(fechamento);
    DB.set(STORE_FECHAMENTOS, fechamentos);
    toastBM('✅ Comissão fechada: '+moeda(totalComissao),'ok');
    MOD.renderComissoes();
  };

  MOD.renderComissoes = function(){
    atualizarFiltroVendedor();
    garantirBotaoFecharComissao();
    ajustarCabecalhoRelatorioComissao();
    var lista = listaComissaoFiltrada();

    var totalVendido = lista.reduce(function(s,c){ return s + dinheiro(c.total_venda); },0);
    var totalComissao = lista.reduce(function(s,c){ return s + dinheiro(c.valor); },0);
    var vendedoresUnicos = {};
    lista.forEach(function(c){ vendedoresUnicos[String(c.vendedor_id||c.vendedor_nome)] = true; });

    var stats = el('com-stats');
    if(stats){
      stats.innerHTML = '<div class="st stb"><div class="sl">Vendas</div><div class="sv">'+lista.length+'</div></div>'+
        '<div class="st stg"><div class="sl">Total vendido</div><div class="sv">'+moeda(totalVendido)+'</div></div>'+
        '<div class="st stgo"><div class="sl">Comissão</div><div class="sv">'+moeda(totalComissao)+'</div></div>'+
        '<div class="st sto"><div class="sl">Vendedores</div><div class="sv">'+Object.keys(vendedoresUnicos).length+'</div></div>';
    }

    var tb = el('com-tb');
    if(tb){
      tb.innerHTML = lista.map(function(c){
        return '<tr>'+
          '<td>'+esc(dataBR(c.data))+'</td>'+
          '<td><span class="tm">'+esc(c.venda_id || '')+'</span></td>'+
          '<td>'+esc(c.cliente || 'Balcão')+'</td>'+
          '<td><b>'+esc(c.vendedor_nome || '')+'</b></td>'+
          '<td>'+esc(c.forma_pagamento || textoFormasComissao(c.detalhes))+'</td>'+
          '<td>'+moeda(c.total_venda)+'</td>'+
          '<td>'+fmtPct(c.percentual_medio)+'</td>'+
          '<td><b class="txt-g">'+moeda(c.valor)+'</b></td>'+
        '</tr>';
      }).join('') || '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--txt2);">Nenhuma comissão encontrada no período.</td></tr>';
    }
  };

  MOD.renderTudo = function(){
    MOD.renderVendedores();
    MOD.renderComissoes();
  };

  MOD.registrarComissaoVenda = function(venda){
    var v = enriquecerVenda(venda);
    registrarComissaoDaVenda(v);
    return v;
  };

  MOD.validarVenda = validarVendedorVenda;
  MOD.atualizarSelectVenda = atualizarSelectVenda;
  MOD.calcularComissaoVenda = calcularComissaoVenda;

  function init(){
    aplicarHookDB();
    aplicarHooksVenda();
    aplicarHookIr();
    atualizarSelectVenda();
    atualizarFiltroVendedor();
    garantirBotaoFecharComissao();
    MOD.renderVendedores();
    if(!val('com-ini')) setVal('com-ini', hoje().slice(0,8)+'01');
    if(!val('com-fim')) setVal('com-fim', hoje());
  }

  window.BMVendedoresComissoes = MOD;
  window.BMVC = MOD;

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  setTimeout(init, 300);
})();
