/*
 * Módulo de Automação de Cobranças
 * Versão inicial: consulta + resposta + registro.
 *
 * Responsabilidades:
 * 1. Receber a lista produzida pelo "Cobrar Todos".
 * 2. Informar quais clientes já foram cobrados.
 * 3. Devolver a lista separada para o app-core.
 * 4. Registrar somente as cobranças confirmadas pelo app-core.
 *
 * Não contém:
 * - regras de dias;
 * - envio de WhatsApp;
 * - cálculo de saldo;
 * - busca de clientes.
 */

const STORAGE_KEY = 'bm_cobrancas_automacao';

function lerHistorico() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarHistorico(historico) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
}

/**
 * Recebe a lista do "Cobrar Todos" e informa o estado de cada cliente.
 * O módulo NÃO decide quem será enviado ao WhatsApp.
 */
function consultarLista(listaClientes) {
  const historico = lerHistorico();

  const clientes = (Array.isArray(listaClientes) ? listaClientes : []).map(cliente => {
    const clienteId = String(cliente.id ?? cliente.cid ?? '');
    const jaFoiCobrado = historico.some(item => String(item.clienteId) === clienteId);

    return {
      ...cliente,
      clienteId,
      jaFoiCobrado,
      selecionado: !jaFoiCobrado
    };
  });

  return {
    todos: clientes,
    jaCobrados: clientes.filter(c => c.jaFoiCobrado),
    disponiveis: clientes.filter(c => !c.jaFoiCobrado),
    selecionados: clientes.filter(c => c.selecionado)
  };
}

/**
 * Recebe do app-core os clientes que realmente foram cobrados.
 * Só depois do envio confirmado o registro é gravado.
 */
function registrarCobrancas(clientes) {
  const historico = lerHistorico();
  const agora = new Date().toISOString();

  (Array.isArray(clientes) ? clientes : []).forEach(cliente => {
    const clienteId = String(cliente.id ?? cliente.cid ?? '');
    if (!clienteId) return;

    historico.push({
      clienteId,
      nome: cliente.nome ?? cliente.cliente ?? '',
      telefone: cliente.telefone ?? cliente.fone ?? '',
      saldo: cliente.saldo ?? null,
      registradoEm: agora
    });
  });

  salvarHistorico(historico);
  return historico;
}

function jaFoiCobrado(clienteId) {
  return lerHistorico().some(
    item => String(item.clienteId) === String(clienteId)
  );
}

function listarHistorico() {
  return lerHistorico();
}

function limparHistorico() {
  localStorage.removeItem(STORAGE_KEY);
}


function fecharAprovacao() {
  const el = document.getElementById('bm-cobrancas-aprovacao');
  if (el) el.remove();
}

function abrirAprovacao(estado, onEnviar) {
  fecharAprovacao();

  const todos = Array.isArray(estado && estado.todos) ? estado.todos : [];
  const selecionados = new Set(
    (estado && Array.isArray(estado.selecionados) ? estado.selecionados : [])
      .map(c => String(c.clienteId ?? c.id ?? c.cid ?? ''))
  );

  const esc = valor => String(valor ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const dinheiro = valor => {
    const n = Number(valor);
    return Number.isFinite(n) ? n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) : 'R$ 0,00';
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
          ${todos.map(cliente => {
            const id = String(cliente.clienteId ?? cliente.id ?? cliente.cid ?? '');
            const ja = !!cliente.jaFoiCobrado;
            const marcado = selecionados.has(id);
            return `<label data-cliente-id="${esc(id)}" style="display:flex;align-items:center;gap:12px;padding:12px 8px;border-bottom:1px solid #eee;cursor:${ja?'default':'pointer'};opacity:${ja?.65:1};">
              <input type="checkbox" class="bm-cob-check" data-id="${esc(id)}" ${marcado?'checked':''} ${ja?'disabled':''} style="width:18px;height:18px;">
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;">${esc(cliente.nome)}</div>
                <div style="font-size:12px;color:#666;margin-top:3px;">📱 ${esc(cliente.telefone)} · ${esc(cliente.dias)} dias · ${dinheiro(cliente.saldo)}</div>
              </div>
              ${ja?'<span style="font-size:12px;font-weight:700;color:#777;white-space:nowrap;">Já cobrado</span>':''}
            </label>`;
          }).join('')}
        </div>

        <div style="padding:14px 20px;border-top:1px solid #ddd;display:flex;justify-content:flex-end;gap:10px;">
          <button type="button" id="bm-cob-cancelar" style="padding:10px 16px;border:1px solid #bbb;border-radius:8px;background:#fff;cursor:pointer;">Cancelar</button>
          <button type="button" id="bm-cob-enviar" style="padding:10px 18px;border:0;border-radius:8px;background:#c0392b;color:#fff;font-weight:800;cursor:pointer;">📱 Enviar selecionados</button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  const modal = document.getElementById('bm-cobrancas-aprovacao');
  const checks = () => Array.from(modal.querySelectorAll('.bm-cob-check'));
  const atualizar = () => {
    const n = checks().filter(c => c.checked).length;
    document.getElementById('bm-cob-contador').textContent = n + ' selecionado(s) de ' + todos.filter(c => !c.jaFoiCobrado).length + ' disponível(is)';
  };

  checks().forEach(ch => ch.addEventListener('change', atualizar));
  document.getElementById('bm-cob-todos').onclick = () => { checks().forEach(ch => { if(!ch.disabled) ch.checked=true; }); atualizar(); };
  document.getElementById('bm-cob-nenhum').onclick = () => { checks().forEach(ch => { ch.checked=false; }); atualizar(); };
  document.getElementById('bm-cob-fechar').onclick = fecharAprovacao;
  document.getElementById('bm-cob-cancelar').onclick = fecharAprovacao;
  document.getElementById('bm-cob-enviar').onclick = () => {
    const ids = new Set(checks().filter(c => c.checked).map(c => String(c.dataset.id)));
    const escolhidos = todos.filter(c => ids.has(String(c.clienteId ?? c.id ?? c.cid ?? '')) && !c.jaFoiCobrado);
    if (!escolhidos.length) return;
    fecharAprovacao();
    if (typeof onEnviar === 'function') onEnviar(escolhidos);
  };
  atualizar();
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
    STORAGE_KEY
  };
}
