/*!
Bela Modas Sheets Sync — restaura na primeira abertura do dia
e sincroniza automaticamente durante o dia
*/

(function () {

"use strict";

const API_URL =
"https://script.google.com/macros/s/AKfycbxvE2DpOpZDW1bZOvatqdN0HjSOXI3gvFdGPSj7qeUb6NF2V-K18-5tpil1KGW4O1lB/exec";

let syncEmAndamento = false;
let restoreEmAndamento = false;
let bloqueioEnvio = true;

let autoSyncTimer = null;
let intervaloSyncAtivo = false;
let ultimoHashEnviado = "";
let ultimoErroSync = "";
let ultimoMotivoSync = "";

const AUTO_SYNC_DELAY_MS = 4000;
const AUTO_SYNC_INTERVAL_MS = 2 * 60 * 1000;

/* DATA */

function agoraISO() {
  const d = new Date();
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0") + "T" +
    String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2, "0") + ":" +
    String(d.getSeconds()).padStart(2, "0");
}

function hojeStr() {
  const d = new Date();
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function numeroSeguro(v) {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function safeParseJson(v, fallback) {
  if (Array.isArray(v)) return v;
  if (v == null || v === "") return fallback;
  try {
    return JSON.parse(v);
  } catch (e) {
    return fallback;
  }
}

function dataOriginal(v) {
  return (v && (v.data || v.createdAt)) ? (v.data || v.createdAt) : "";
}

function createdOriginal(v) {
  return (v && (v.createdAt || v.data)) ? (v.createdAt || v.data) : "";
}

function updatedOriginal(v) {
  return (v && (v.updatedAt || v.createdAt || v.data)) ? (v.updatedAt || v.createdAt || v.data) : "";
}

/* STORAGE */

const originalSetItem = localStorage.setItem.bind(localStorage);

function lerLocal(nome) {
  try {
    return JSON.parse(localStorage.getItem("bm_" + nome) || "[]");
  } catch (e) {
    return [];
  }
}

function lerDeleted(nome) {
  try {
    return JSON.parse(localStorage.getItem("bm_deleted_" + nome) || "[]");
  } catch (e) {
    return [];
  }
}

function salvarDeleted(nome, dados) {
  originalSetItem("bm_deleted_" + nome, JSON.stringify(dados || []));
}

/* BACKUP */

function salvarBackup() {
  originalSetItem("bm_backup", JSON.stringify({
    data: agoraISO(),
    clientes: lerLocal("clientes"),
    produtos: lerLocal("produtos"),
    vendas: lerLocal("vendas"),
    pagamentos: lerLocal("pagamentos"),
    creditos: lerLocal("creditos")
  }));
}

/* HASH */

function gerarHashSync() {
  try {
    return JSON.stringify({
      clientes: lerLocal("clientes"),
      produtos: lerLocal("produtos"),
      vendas: lerLocal("vendas"),
      pagamentos: lerLocal("pagamentos"),
      creditos: lerLocal("creditos"),
      deleted_clientes: lerDeleted("clientes"),
      deleted_produtos: lerDeleted("produtos"),
      deleted_vendas: lerDeleted("vendas"),
      deleted_pagamentos: lerDeleted("pagamentos"),
      deleted_creditos: lerDeleted("creditos")
    });
  } catch (e) {
    return String(Date.now());
  }
}

/* DETECTAR REMOÇÕES */

function detectarRemovidos(nome, antes, depois) {
  const mapaDepois = new Set((depois || []).map(x => String(x.id)));

  const removidos = (antes || [])
    .filter(x => !mapaDepois.has(String(x.id)))
    .map(x => ({
      ...x,
      deletedAt: agoraISO(),
      updatedAt: agoraISO()
    }));

  if (removidos.length) {
    const antigos = lerDeleted(nome);
    const mapaExistentes = new Map((antigos || []).map(x => [String(x.id), x]));
    removidos.forEach(r => mapaExistentes.set(String(r.id), r));
    salvarDeleted(nome, Array.from(mapaExistentes.values()));
  }
}

/* ENVIO */

async function enviar(body) {
  const params = new URLSearchParams();
  params.append("payload", JSON.stringify(body));

  const r = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  const txt = await r.text();
  let json = {};

  try {
    json = JSON.parse(txt);
  } catch (e) {
    throw new Error("Resposta inválida do Apps Script");
  }

  if (!r.ok || json.ok === false) {
    throw new Error(json.error || "Falha ao sincronizar");
  }

  return json;
}

/* BUSCA DO SERVIDOR */

async function buscarTudoServidor() {
  const r = await fetch(API_URL + "?action=getAll");
  const txt = await r.text();

  let json = {};
  try {
    json = JSON.parse(txt);
  } catch (e) {
    throw new Error("Resposta inválida ao restaurar dados");
  }

  if (!r.ok || json.ok === false) {
    throw new Error(json.error || "Falha ao buscar dados do servidor");
  }

  return json;
}

/* NORMALIZAÇÃO DE ENVIO */

function normalizarProduto(p) {
  const eanPrincipal = String(p.ean || "").trim();
  const codigosExtras = String(
    p.codigos_barras != null
      ? p.codigos_barras
      : (p.codigosBarras != null ? p.codigosBarras : "")
  ).trim();

  return {
    id: p.id,
    cod: p.cod || "",
    nome: p.nome || "",
    cat: p.cat || "",
    grupo: p.grupo || "",
    subcategoria: p.subcategoria || "",
    preco: numeroSeguro(p.preco),
    custo: numeroSeguro(p.custo),
    estoque: numeroSeguro(p.estoque),
    ean: eanPrincipal,
    codigos_barras: codigosExtras,
    ncm: p.ncm || "",
    origem: p.origem || "0",
    csosn: p.csosn || "102",
    cfop: p.cfop || "5102",
    createdAt: p.createdAt || agoraISO(),
    updatedAt: p.updatedAt || agoraISO(),
    deletedAt: p.deletedAt || ""
  };
}

function normalizarCliente(c) {
  return {
    id: c.id,
    nome: c.nome || "",
    telefone: c.telefone || c.tel || "",
    cpf: c.cpf || "",
    endereco: c.endereco || c.end || "",
    obs: c.obs || "",
    data: c.data || c.createdAt || agoraISO(),
    createdAt: c.createdAt || c.data || agoraISO(),
    updatedAt: c.updatedAt || c.data || agoraISO(),
    deletedAt: c.deletedAt || ""
  };
}

function normalizarVenda(v) {
  return {
    id: v.id,
    cid: v.cid || "",
    cliente: v.cliente || v.cliNome || "",
    forma_pagamento: v.forma_pagamento || v.forma || "",
    total: numeroSeguro(v.total),
    itens_json: JSON.stringify(safeParseJson(v.itens_json, v.itens || [])),
    data: v.data || v.createdAt || agoraISO(),
    createdAt: v.createdAt || v.data || agoraISO(),
    updatedAt: v.updatedAt || v.data || agoraISO(),
    deletedAt: v.deletedAt || ""
  };
}

function normalizarPagamento(p) {
  return {
    id: p.id,
    cid: p.cid || "",
    venda_id: p.venda_id || p.vid || "",
    valor: numeroSeguro(p.valor ?? p.val),
    forma_pagamento: p.forma_pagamento || p.forma || "",
    obs: p.obs || "",
    data: p.data || p.createdAt || agoraISO(),
    createdAt: p.createdAt || p.data || agoraISO(),
    updatedAt: p.updatedAt || p.data || agoraISO(),
    deletedAt: p.deletedAt || ""
  };
}

function normalizarCredito(c) {
  return {
    id: c.id,
    cid: c.cid || "",
    vid: c.vid || c.venda_id || "",
    cliente: c.cliente || c.cliNome || "",
    descricao: c.descricao || c.desc || "",
    valor: numeroSeguro(c.valor ?? c.val),
    status: c.status || "aberto",
    vencimento: c.vencimento || "",
    data: c.data || c.createdAt || agoraISO(),
    createdAt: c.createdAt || c.data || agoraISO(),
    updatedAt: c.updatedAt || c.data || agoraISO(),
    deletedAt: c.deletedAt || ""
  };
}

/* NORMALIZAÇÃO DE RESTAURAÇÃO */

function normalizarProdutoRestauracao(p) {
  const eanPrincipal = String(p.ean || "").trim();
  const codigosExtras = String(
    p.codigos_barras != null
      ? p.codigos_barras
      : (p.codigosBarras != null ? p.codigosBarras : "")
  ).trim();

  return {
    id: p.id || "",
    cod: p.cod || "",
    nome: p.nome || "",
    cat: p.cat || "",
    grupo: p.grupo || "",
    subcategoria: p.subcategoria || "",
    subcat: p.subcategoria || p.subcat || p.cat || "",
    preco: numeroSeguro(p.preco),
    custo: numeroSeguro(p.custo),
    estoque: numeroSeguro(p.estoque),
    ean: eanPrincipal,
    codigos_barras: codigosExtras,
    ncm: p.ncm || "",
    origem: p.origem || "0",
    csosn: p.csosn || "102",
    cfop: p.cfop || "5102",
    createdAt: createdOriginal(p),
    updatedAt: updatedOriginal(p),
    deletedAt: p.deletedAt || ""
  };
}

function normalizarClienteRestauracao(c) {
  return {
    id: c.id || "",
    nome: c.nome || "",
    telefone: c.telefone || c.tel || "",
    cpf: c.cpf || "",
    endereco: c.endereco || c.end || "",
    obs: c.obs || "",
    data: dataOriginal(c),
    createdAt: createdOriginal(c),
    updatedAt: updatedOriginal(c),
    deletedAt: c.deletedAt || ""
  };
}

function normalizarVendaRestauracao(v) {
  const itens = safeParseJson(v.itens_json, v.itens || []);

  return {
    id: v.id || "",
    cid: v.cid || "",
    cliente: v.cliente || v.cliNome || "",
    cliNome: v.cliente || v.cliNome || "",
    forma_pagamento: v.forma_pagamento || v.forma || "",
    forma: v.forma_pagamento || v.forma || "",
    total: numeroSeguro(v.total),
    itens_json: typeof v.itens_json === "string" ? v.itens_json : JSON.stringify(itens),
    itens: itens,
    data: dataOriginal(v),
    createdAt: createdOriginal(v),
    updatedAt: updatedOriginal(v),
    deletedAt: v.deletedAt || ""
  };
}

function normalizarPagamentoRestauracao(p) {
  return {
    id: p.id || "",
    cid: p.cid || "",
    venda_id: p.venda_id || p.vid || "",
    vid: p.venda_id || p.vid || "",
    valor: numeroSeguro(p.valor ?? p.val),
    val: numeroSeguro(p.valor ?? p.val),
    forma_pagamento: p.forma_pagamento || p.forma || "",
    forma: p.forma_pagamento || p.forma || "",
    obs: p.obs || "",
    data: dataOriginal(p),
    createdAt: createdOriginal(p),
    updatedAt: updatedOriginal(p),
    deletedAt: p.deletedAt || ""
  };
}

function normalizarCreditoRestauracao(c) {
  return {
    id: c.id || "",
    cid: c.cid || "",
    vid: c.vid || c.venda_id || "",
    venda_id: c.vid || c.venda_id || "",
    cliente: c.cliente || c.cliNome || "",
    cliNome: c.cliente || c.cliNome || "",
    descricao: c.descricao || c.desc || "",
    desc: c.descricao || c.desc || "",
    valor: numeroSeguro(c.valor ?? c.val),
    val: numeroSeguro(c.valor ?? c.val),
    status: c.status || "aberto",
    vencimento: c.vencimento || "",
    data: dataOriginal(c),
    createdAt: createdOriginal(c),
    updatedAt: updatedOriginal(c),
    deletedAt: c.deletedAt || ""
  };
}

/* RESTAURAÇÃO */

async function restaurarDoServidor() {
  if (restoreEmAndamento) return false;
  restoreEmAndamento = true;

  try {
    const dados = await buscarTudoServidor();

    const clientes = (dados.clientes || []).map(normalizarClienteRestauracao);
    const produtos = (dados.produtos || []).map(normalizarProdutoRestauracao);
    const vendas = (dados.vendas || []).map(normalizarVendaRestauracao);
    const pagamentos = (dados.recebimentos || []).map(normalizarPagamentoRestauracao);
    const creditos = (dados.cobrancas || []).map(normalizarCreditoRestauracao);

    originalSetItem("bm_clientes", JSON.stringify(clientes));
    originalSetItem("bm_produtos", JSON.stringify(produtos));
    originalSetItem("bm_vendas", JSON.stringify(vendas));
    originalSetItem("bm_pagamentos", JSON.stringify(pagamentos));
    originalSetItem("bm_creditos", JSON.stringify(creditos));

    originalSetItem("bm_deleted_clientes", JSON.stringify([]));
    originalSetItem("bm_deleted_produtos", JSON.stringify([]));
    originalSetItem("bm_deleted_vendas", JSON.stringify([]));
    originalSetItem("bm_deleted_pagamentos", JSON.stringify([]));
    originalSetItem("bm_deleted_creditos", JSON.stringify([]));

    originalSetItem("bm_last_restore", agoraISO());
    ultimoHashEnviado = gerarHashSync();
    ultimoErroSync = "";

    return true;
  } catch (e) {
    console.error("Erro ao restaurar dados do servidor:", e);
    originalSetItem("bm_last_restore_error", String(e && e.message || e));
    ultimoErroSync = String(e && e.message || e);
    return false;
  } finally {
    restoreEmAndamento = false;
  }
}

/* SYNC */

async function enviarTudo(origem) {
  if (bloqueioEnvio) {
    throw new Error("Sync bloqueado até concluir a restauração inicial do dia.");
  }

  if (syncEmAndamento) return false;
  syncEmAndamento = true;

  try {
    salvarBackup();

    const clientes = lerLocal("clientes");
    const produtos = lerLocal("produtos");
    const vendas = lerLocal("vendas");
    const pagamentos = lerLocal("pagamentos");
    const creditos = lerLocal("creditos");

    const clientesDeleted = lerDeleted("clientes");
    const produtosDeleted = lerDeleted("produtos");
    const vendasDeleted = lerDeleted("vendas");
    const pagamentosDeleted = lerDeleted("pagamentos");
    const creditosDeleted = lerDeleted("creditos");

    await enviar({
      action: "upsert",
      sheet: "clientes",
      rows: clientes.map(normalizarCliente).concat(clientesDeleted.map(normalizarCliente))
    });

    await enviar({
      action: "upsert",
      sheet: "produtos",
      rows: produtos.map(normalizarProduto).concat(produtosDeleted.map(normalizarProduto))
    });

    await enviar({
      action: "upsert",
      sheet: "vendas",
      rows: vendas.map(normalizarVenda).concat(vendasDeleted.map(normalizarVenda))
    });

    await enviar({
      action: "upsert",
      sheet: "recebimentos",
      rows: pagamentos.map(normalizarPagamento).concat(pagamentosDeleted.map(normalizarPagamento))
    });

    await enviar({
      action: "upsert",
      sheet: "cobrancas",
      rows: creditos.map(normalizarCredito).concat(creditosDeleted.map(normalizarCredito))
    });

    originalSetItem("bm_last_sync", agoraISO());
    originalSetItem("bm_last_sync_origin", origem || "manual");

    ultimoHashEnviado = gerarHashSync();
    ultimoErroSync = "";
    ultimoMotivoSync = origem || "manual";

    return true;
  } catch (e) {
    console.error("Erro na sincronização Bela Modas:", e);
    originalSetItem("bm_last_sync_error", String(e && e.message || e));
    ultimoErroSync = String(e && e.message || e);
    throw e;
  } finally {
    syncEmAndamento = false;
  }
}

/* AUTO SYNC */

function agendarAutoSync(motivo) {
  if (bloqueioEnvio || restoreEmAndamento) return;

  if (autoSyncTimer) {
    clearTimeout(autoSyncTimer);
  }

  autoSyncTimer = setTimeout(async function () {
    autoSyncTimer = null;

    if (bloqueioEnvio || restoreEmAndamento || syncEmAndamento) return;

    const hashAtual = gerarHashSync();
    if (hashAtual === ultimoHashEnviado) return;

    try {
      await enviarTudo("auto:" + (motivo || "mudanca"));
    } catch (e) {
      console.warn("Auto sync falhou:", e);
    }
  }, AUTO_SYNC_DELAY_MS);
}

function iniciarSyncPeriodico() {
  if (intervaloSyncAtivo) return;
  intervaloSyncAtivo = true;

  setInterval(async function () {
    if (bloqueioEnvio || restoreEmAndamento || syncEmAndamento) return;

    const hashAtual = gerarHashSync();
    if (hashAtual === ultimoHashEnviado) return;

    try {
      await enviarTudo("intervalo_2min");
    } catch (e) {
      console.warn("Sync periódico falhou:", e);
    }
  }, AUTO_SYNC_INTERVAL_MS);
}

/* HOOK DE localStorage COM AUTOENVIO */

localStorage.setItem = function (k, v) {
  const nome = String(k).replace("bm_", "");

  if (["clientes", "produtos", "vendas", "pagamentos", "creditos"].includes(nome)) {
    const antes = lerLocal(nome);
    originalSetItem(k, v);
    const depois = lerLocal(nome);
    detectarRemovidos(nome, antes, depois);
    agendarAutoSync(nome);
    return;
  }

  originalSetItem(k, v);
};

/* INICIALIZAÇÃO DO DIA */

async function initRestauracaoObrigatoria() {
  try {
    const hoje = hojeStr();
    const ultimoDia = localStorage.getItem("bm_sync_dia");

    if (ultimoDia !== hoje) {
      console.log("Bela Modas: primeira abertura do dia, restaurando da planilha...");
      const ok = await restaurarDoServidor();

      if (ok) {
        originalSetItem("bm_sync_dia", hoje);
        bloqueioEnvio = false;
        ultimoHashEnviado = gerarHashSync();
        console.log("Bela Modas: restauração do dia concluída. Sync liberado.");
      } else {
        console.warn("Bela Modas: restauração falhou. Sync continua bloqueado.");
      }
    } else {
      console.log("Bela Modas: sistema já iniciado hoje. Não restaurando novamente.");
      bloqueioEnvio = false;
    }
  } catch (e) {
    console.error(e);
    console.warn("Bela Modas: erro na restauração inicial do dia. Sync continua bloqueado.");
  }
}

/* START */

initRestauracaoObrigatoria();
iniciarSyncPeriodico();

/* API GLOBAL */

window.BelaSheetsSync = {
  syncNow: function () {
    return enviarTudo("manual");
  },
  restoreNow: async function () {
    bloqueioEnvio = true;
    const ok = await restaurarDoServidor();
    if (ok) {
      originalSetItem("bm_sync_dia", hojeStr());
      bloqueioEnvio = false;
      ultimoHashEnviado = gerarHashSync();
      location.reload();
    }
    return ok;
  },
  resetDia: function () {
    localStorage.removeItem("bm_sync_dia");
  },
  status: function () {
    return {
      bloqueioEnvio,
      syncEmAndamento,
      restoreEmAndamento,
      autoSyncPendente: !!autoSyncTimer,
      diaAtual: hojeStr(),
      diaInicializado: localStorage.getItem("bm_sync_dia"),
      ultimoSync: localStorage.getItem("bm_last_sync"),
      origemUltimoSync: localStorage.getItem("bm_last_sync_origin"),
      ultimoErroSync,
      ultimoMotivoSync
    };
  }
};

})();
