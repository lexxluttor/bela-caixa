/*
 * Módulo de Automação de Cobranças
 *
 * Regras desta versão:
 * 1. A lista de aprovação continua aparecendo antes de qualquer envio.
 * 2. O histórico oficial de cobranças fica no Google Apps Script.
 * 3. Um mesmo cliente não pode entrar em nova cobrança automática antes de 7 dias.
 * 4. O módulo consulta o histórico no servidor antes de montar a lista.
 * 5. Depois que a gravação no servidor é confirmada, o histórico local temporário é removido.
 * 6. Se o servidor estiver indisponível, o módulo mantém apenas um pequeno cache local
 *    temporário para não voltar a encher o navegador.
 *
 * Não contém:
 * - cálculo de saldo;
 * - regras de dias em atraso;
 * - busca de clientes;
 * - envio direto pelo WhatsApp.
 */

const STORAGE_KEY = 'bm_cobrancas_automacao';
const INTERVALO_MINIMO_DIAS = 7;
const LIMITE_CACHE_LOCAL = 50;
const URL_APPS_SCRIPT_COBRANCAS = 'https://script.google.com/macros/s/AKfycbxvE2DpOpZDW1bZOvatqdN0HjSOXI3gvFdGPSj7qeUb6NF2V-K18-5tpil1KGW4O1lB/exec';

function obterAppsScriptCobrancasUrl_() {
  if (typeof window !== 'undefined') {
    return String(
      window.APPS_SCRIPT_URL ||
      window.BELA_SHEETS_API_URL ||
      window.BELA_APPS_SCRIPT_URL ||
      URL_APPS_SCRIPT_COBRANCAS
    ).trim();
  }
  return URL_APPS_SCRIPT_COBRANCAS;
}

function chamarAppsScriptCobrancas_(action, dados) {
  const url = obterAppsScriptCobrancasUrl_();
  if (!url) return Promise.reject(new Error('URL do Apps Script não encontrada.'));

  const payload = JSON.stringify(dados || {});
  const body =
    'action=' + encodeURIComponent(action) +
    '&payload=' + encodeURIComponent(payload);

  let controller = null;
  let timer = null;

  if (typeof AbortController !== 'undefined') {
    controller = new AbortController();
    timer = setTimeout(function(){
      try { controller.abort(); } catch (e) {}
    }, 10000);
  }

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: body,
    cache: 'no-store',
    signal: controller ? controller.signal : undefined
  })
    .then(function(resp){
      return resp.text().then(function(txt){
        let data = null;
        try { data = JSON.parse(txt); } catch (e) {}

        if (!resp.ok) {
          throw new Error((data && data.error) || ('Erro HTTP ' + resp.status));
        }
        if (!data || data.ok === false) {
          throw new Error((data && data.error) || 'O Apps Script recusou a operação.');
        }
        return data;
      });
    })
    .finally(function(){
      if (timer) clearTimeout(timer);
    });
}

function lerHistoricoLocal_() {
  const todos = [];

  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(dados)) todos.push.apply(todos, dados);
  } catch (e) {}

  try {
    const filaSync = JSON.parse(localStorage.getItem('bm_historico_cobrancas') || '[]');
    if (Array.isArray(filaSync)) todos.push.apply(todos, filaSync);
  } catch (e) {}

  return todos;
}

function salvarHistoricoLocal_(historico) {
  const agora = Date.now();
  const janela = INTERVALO_MINIMO_DIAS * 24 * 60 * 60 * 1000;
  const limpo = (Array.isArray(historico) ? historico : [])
    .filter(function(item){
      const t = new Date(item && item.registradoEm || 0).getTime();
      return t && (agora - t) >= 0 && (agora - t) < janela;
    })
    .slice(-LIMITE_CACHE_LOCAL);

  try {
    if (!limpo.length) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(limpo));
  } catch (e) {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e2) {}
  }
}

function limparHistoricoLocal_() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

function localUltimaCobranca_(historico, clienteId) {
  const agora = Date.now();
  const janela = INTERVALO_MINIMO_DIAS * 24 * 60 * 60 * 1000;
  let ultima = 0;

  (historico || []).forEach(function(item){
    if (String(item && item.clienteId || '') !== String(clienteId || '')) return;
    const t = new Date(item && (item.registradoEm || item.dataCobranca) || 0).getTime();
    if (!t) return;
    const idade = agora - t;
    if (idade >= 0 && idade < janela && t > ultima) ultima = t;
  });

  return ultima;
}

function estadoLocal_(listaClientes) {
  const historico = lerHistoricoLocal_();
  const clientes = (Array.isArray(listaClientes) ? listaClientes : []).map(function(cliente){
    const clienteId = String(cliente && (cliente.id ?? cliente.cid) || '');
    const ultima = localUltimaCobranca_(historico, clienteId);
    const idade = ultima ? Math.max(0, Date.now() - ultima) : 0;
    const bloqueado = !!ultima;
    const diasRestantes = bloqueado
      ? Math.max(1, Math.ceil((INTERVALO_MINIMO_DIAS * 24 * 60 * 60 * 1000 - idade) / (24 * 60 * 60 * 1000)))
      : 0;

    return Object.assign({}, cliente, {
      clienteId: clienteId,
      jaFoiCobrado: bloqueado,
      bloqueado7Dias: bloqueado,
      diasRestantes: diasRestantes,
      selecionado: !bloqueado
    });
  });

  return montarEstado_(clientes);
}

function montarEstado_(clientes) {
  const lista = Array.isArray(clientes) ? clientes : [];
  return {
    todos: lista,
    jaCobrados: lista.filter(function(c){ return !!c.jaFoiCobrado; }),
    disponiveis: lista.filter(function(c){ return !c.jaFoiCobrado; }),
    selecionados: lista.filter(function(c){ return !!c.selecionado && !c.jaFoiCobrado; })
  };
}

function aplicarHistoricoServidor_(listaClientes, historicoServidor) {
  const mapa = historicoServidor || {};
  const clientes = (Array.isArray(listaClientes) ? listaClientes : []).map(function(cliente){
    const clienteId = String(cliente && (cliente.clienteId ?? cliente.id ?? cliente.cid) || '');
    const h = mapa[clienteId];
    const bloqueado = !!(h && h.bloqueado);

    return Object.assign({}, cliente, {
      clienteId: clienteId,
      jaFoiCobrado: bloqueado,
      bloqueado7Dias: bloqueado,
      ultimaCobranca: bloqueado ? (h.ultimaCobranca || '') : '',
      diasDecorridos: bloqueado ? Number(h.diasDecorridos || 0) : 0,
      diasRestantes: bloqueado ? Number(h.diasRestantes || 1) : 0,
      selecionado: !bloqueado
    });
  });

  return montarEstado_(clientes);
}

/**
 * Consulta local apenas como fallback. A lista de aprovação tenta primeiro
 * confirmar o histórico no Apps Script.
 */
function consultarLista(listaClientes) {
  return estadoLocal_(listaClientes);
}

async function atualizarEstadoNoServidor_(estado) {
  const lista = Array.isArray(estado && estado.todos) ? estado.todos : [];
  const cids = lista
    .map(function(c){ return String(c && (c.clienteId ?? c.id ?? c.cid) || ''); })
    .filter(Boolean);

  const resposta = await chamarAppsScriptCobrancas_('consultarHistoricoCobrancas', {
    cids: cids
  });

  return aplicarHistoricoServidor_(lista, resposta.historico || {});
}

function fecharAprovacao() {
  const el = document.getElementById('bm-cobrancas-aprovacao');
  if (el) el.remove();
}

function renderAprovacao_(estado, onEnviar) {
  fecharAprovacao();

  const todos = Array.isArray(estado && estado.todos) ? estado.todos : [];
  const selecionados = new Set(
    (estado && Array.isArray(estado.selecionados) ? estado.selecionados : [])
      .map(function(c){ return String(c.clienteId ?? c.id ?? c.cid ?? ''); })
  );

  const esc = valor => String(valor ?? '').replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
  });

  const dinheiro = valor => {
    const n = Number(valor);
    return Number.isFinite(n)
      ? n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
      : 'R$ 0,00';
  };

  const html = `
    <div id="bm-cobrancas-aprovacao" style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;">
      <div style="width:min(900px,100%);max-height:90vh;overflow:hidden;background:#fff;border-radius:14px;box-shadow:0 15px 50px rgba(0,0,0,.25);display:flex;flex-direction:column;font-family:Arial,sans-serif;">
        <div style="padding:18px 20px;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div>
            <div style="font-size:20px;font-weight:800;">📋 Aprovar cobranças</div>
            <div style="font-size:13px;color:#666;margin-top:4px;">Confira a lista antes de enviar qualquer mensagem.</div>
          </div>
          <button type="button" id="bm-cob-fechar" style="border:0;background:transparent;font-size:22px;cursor:pointer;">✕</button>
        </div>

        <div style="padding:12px 20px;border-bottom:1px solid #eee;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <button type="button" id="bm-cob-todos" style="padding:8px 12px;border:1px solid #bbb;border-radius:8px;background:#fff;cursor:pointer;">☑ Selecionar disponíveis</button>
          <button type="button" id="bm-cob-nenhum" style="padding:8px 12px;border:1px solid #bbb;border-radius:8px;background:#fff;cursor:pointer;">☐ Desmarcar todos</button>
          <span id="bm-cob-contador" style="margin-left:auto;font-size:13px;color:#555;"></span>
        </div>

        <div id="bm-cob-lista" style="overflow:auto;padding:12px 20px;">
          ${todos.length ? todos.map(function(cliente){
            const id = String(cliente.clienteId ?? cliente.id ?? cliente.cid ?? '');
            const bloqueado = !!cliente.jaFoiCobrado;
            const marcado = selecionados.has(id);
            let status = '';
            if (cliente.bloqueado7Dias) {
              const dias = Number(cliente.diasRestantes || 1);
              status = '<span style="font-size:12px;font-weight:700;color:#b26b00;white-space:nowrap;">Aguarde '+dias+' dia(s)</span>';
            }

            return `<label data-cliente-id="${esc(id)}" style="display:flex;align-items:center;gap:12px;padding:12px 8px;border-bottom:1px solid #eee;cursor:${bloqueado?'default':'pointer'};opacity:${bloqueado?.7:1};">
              <input type="checkbox" class="bm-cob-check" data-id="${esc(id)}" ${marcado?'checked':''} ${bloqueado?'disabled':''} style="width:18px;height:18px;">
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;">${esc(cliente.nome)}</div>
                <div style="font-size:12px;color:#666;margin-top:3px;">📱 ${esc(cliente.telefone)} · ${esc(cliente.dias)} dias · ${dinheiro(cliente.saldo)}</div>
              </div>
              ${status}
            </label>`;
          }).join('') : '<div style="padding:30px;text-align:center;color:#777;">Nenhum cliente disponível para análise.</div>'}
        </div>

        <div style="padding:14px 20px;border-top:1px solid #ddd;display:flex;justify-content:flex-end;gap:10px;">
          <button type="button" id="bm-cob-cancelar" style="padding:10px 16px;border:1px solid #bbb;border-radius:8px;background:#fff;cursor:pointer;">Cancelar</button>
          <button type="button" id="bm-cob-enviar" style="padding:10px 18px;border:0;border-radius:8px;background:#c0392b;color:#fff;font-weight:800;cursor:pointer;">📱 Enviar selecionados</button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  const modal = document.getElementById('bm-cobrancas-aprovacao');
  if (!modal) return;

  const checks = function(){ return Array.from(modal.querySelectorAll('.bm-cob-check')); };
  const atualizar = function(){
    const n = checks().filter(function(c){ return c.checked; }).length;
    const disponiveis = todos.filter(function(c){ return !c.jaFoiCobrado; }).length;
    const el = document.getElementById('bm-cob-contador');
    if(el) el.textContent = n + ' selecionado(s) de ' + disponiveis + ' disponível(is)';
  };

  checks().forEach(function(ch){ ch.addEventListener('change', atualizar); });

  document.getElementById('bm-cob-todos').onclick = function(){
    checks().forEach(function(ch){ if(!ch.disabled) ch.checked=true; });
    atualizar();
  };

  document.getElementById('bm-cob-nenhum').onclick = function(){
    checks().forEach(function(ch){ ch.checked=false; });
    atualizar();
  };

  document.getElementById('bm-cob-fechar').onclick = fecharAprovacao;
  document.getElementById('bm-cob-cancelar').onclick = fecharAprovacao;

  document.getElementById('bm-cob-enviar').onclick = function(){
    const ids = new Set(checks().filter(function(c){ return c.checked; }).map(function(c){ return String(c.dataset.id); }));
    const escolhidos = todos.filter(function(c){
      return ids.has(String(c.clienteId ?? c.id ?? c.cid ?? '')) && !c.jaFoiCobrado;
    });

    if (!escolhidos.length) {
      if(typeof toast === 'function') toast('Nenhum cliente selecionado para cobrança.','warn');
      return;
    }

    fecharAprovacao();
    if (typeof onEnviar === 'function') onEnviar(escolhidos);
  };

  atualizar();
}

/**
 * Aguarda a consulta ao servidor antes de mostrar a lista.
 * Assim a aprovação já abre com a regra real dos 7 dias aplicada.
 */
async function abrirAprovacao(estado, onEnviar) {
  if (typeof toast === 'function') toast('⏳ Conferindo histórico de cobranças...','info');

  let estadoAtual = estadoLocal_(Array.isArray(estado && estado.todos) ? estado.todos : []);

  try {
    estadoAtual = await atualizarEstadoNoServidor_(estadoAtual);
  } catch (erro) {
    console.warn('Não foi possível consultar o histórico no Apps Script. Usando cache local temporário.', erro);
    if(typeof toast === 'function') toast('⚠️ Histórico online indisponível. Usando registro local temporário.','warn');
  }

  renderAprovacao_(estadoAtual, onEnviar);
}

/**
 * Registra no Apps Script apenas os clientes efetivamente enviados pelo app-core.
 * O cache local é apagado SOMENTE depois da confirmação de gravação no servidor.
 */
function registrarCobrancas(clientes) {
  const listaOriginal = Array.isArray(clientes) ? clientes : [];

  if (typeof window !== 'undefined' &&
      window.BelaSheetsSync &&
      typeof window.BelaSheetsSync.registrarHistoricoCobrancas === 'function') {
    return window.BelaSheetsSync.registrarHistoricoCobrancas(listaOriginal)
      .then(function(resposta){
        if(typeof toast === 'function') {
          if (resposta && resposta.ok) {
            const qtd = Number(resposta.historicoCobrancasProcessadas || 0);
            toast('✅ '+qtd+' cobrança(s) registrada(s) na planilha. Cache local limpo.','ok');
          } else {
            toast('⚠️ Cobranças enviadas, mas o histórico ainda não foi salvo na planilha.','warn');
          }
        }
        return resposta;
      })
      .catch(function(erro){
        console.error('Falha no sync do histórico de cobranças:', erro);
        if(typeof toast === 'function') toast('⚠️ Histórico pendente. O sistema tentará salvar na próxima sincronização.','warn');
        return {ok:false, erro: erro && erro.message || String(erro)};
      });
  }

  const lista = listaOriginal.map(function(cliente){
    const clienteId = String(cliente && (cliente.clienteId ?? cliente.id ?? cliente.cid) || '');
    return {
      registroId: 'COB-' + clienteId + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,7),
      id: clienteId,
      cid: clienteId,
      nome: cliente && (cliente.nome || cliente.cliente) || '',
      telefone: cliente && (cliente.telefone || cliente.fone) || '',
      saldo: cliente && cliente.saldo != null ? cliente.saldo : 0,
      dias: cliente && cliente.dias != null ? cliente.dias : 0,
      dataCobranca: new Date().toISOString()
    };
  }).filter(function(c){ return !!c.id; });

  if(!lista.length) return Promise.resolve({ok:true,totalSalvos:0});

  return chamarAppsScriptCobrancas_('registrarHistoricoCobrancas', {
    clientes: lista
  })
    .then(function(resposta){
      /*
       * LIMPEZA DE NAVEGADOR:
       * o histórico temporário só é removido depois que o Apps Script confirma
       * a gravação na planilha.
       */
      limparHistoricoLocal_();

      if(typeof toast === 'function') {
        const qtd = Number(resposta.totalSalvos || 0);
        toast('✅ '+qtd+' cobrança(s) registrada(s) na planilha. Cache local limpo.','ok');
      }

      return resposta;
    })
    .catch(function(erro){
      /*
       * Se a nuvem não confirmou, não apagamos o cache. Mantemos somente um
       * cache pequeno e limitado à janela de 7 dias para evitar crescimento.
       */
      const atual = lerHistoricoLocal_();
      const agora = new Date().toISOString();
      const acrescentar = lista.map(function(cliente){
        return {
          clienteId: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone,
          saldo: cliente.saldo,
          registradoEm: agora,
          dataCobranca: agora
        };
      });
      salvarHistoricoLocal_(atual.concat(acrescentar));

      console.error('Falha ao salvar histórico de cobranças no Apps Script:', erro);
      if(typeof toast === 'function') toast('⚠️ Cobranças enviadas, mas o histórico não foi salvo online. O cache temporário foi mantido.','warn');
      return {
        ok: false,
        erro: erro.message,
        totalSalvos: 0,
        totalPendentes: lista.length
      };
    });
}

function jaFoiCobrado(clienteId) {
  return !!localUltimaCobranca_(lerHistoricoLocal_(), clienteId);
}

function listarHistorico() {
  return lerHistoricoLocal_();
}

function limparHistorico() {
  limparHistoricoLocal_();
  try { localStorage.removeItem('bm_historico_cobrancas'); } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.cobrancasAutomacao = {
    consultarLista,
    abrirAprovacao,
    fecharAprovacao,
    registrarCobrancas,
    jaFoiCobrado,
    listarHistorico,
    limparHistorico,
    STORAGE_KEY,
    INTERVALO_MINIMO_DIAS
  };
}
