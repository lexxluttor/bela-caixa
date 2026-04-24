/*!
Bela Modas Sheets Sync — modo estável
Fluxo:
1) sem restauração automática na abertura
2) restore manual quando necessário
3) exclusão física real para clientes, produtos, recebimentos e cobranças
4) exclusão de venda remove a venda e marca nota/xml como cancelados
5) auto sync após alterações
6) sync de segurança a cada 2 minutos
*/

(function () {

"use strict";

const API_URL =
"https://script.google.com/macros/s/AKfycbxvE2DpOpZDW1bZOvatqdN0HjSOXI3gvFdGPSj7qeUb6NF2V-K18-5tpil1KGW4O1lB/exec";

let syncEmAndamento = false;
let restoreEmAndamento = false;
let autoSyncTimer = null;
let intervaloSyncAtivo = false;
let suprimirHookExclusao = false;

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
  return (v && (v.updatedAt || v.createdAt || v.data))
    ? (v.updatedAt || v.createdAt || v.data)
    : "";
}

function normalizarFormaPagamento_(v) {
  const s = String(v || "").trim().toLowerCase();

  if (s === "fiado" || s === "crediario" || s === "crediário") return "fiado";
  if (s === "crédito") return "credito";
  if (s === "débito") return "debito";

  return s;
}

function normalizarDescricaoCobranca_(v) {
  return String(v || "").replace(/credi[aá]rio/gi, "fiado");
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
      creditos: lerLocal("creditos")
    });
  } catch (e) {
    return String(Date.now());
  }
}

/* HTTP */

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

async function deletarFisico(sheet, id) {
  return enviar({
    action: "delete",
    sheet,
    id
  });
}

async function deletarVendaFisico(id) {
  return enviar({
    action: "deleteVenda",
    id
  });
}

/* NORMALIZAÇÃO ENVIO */

function normalizarProduto(p) {
  const eanPrincipal = String(p.ean || "").trim();
  const codigosExtras = String(
    p.codigos_barras != null
      ? p.codigos_barras
      : (p.codigosBarras != null ? p.codigosBarras : "")
  ).trim();

  const subcat = String(p.subcat || p.subcategoria || "").trim();
  const estoque = numeroSeguro(p.estoque ?? p.estq);

  return {
    id: p.id,
    cod: p.cod || "",
    nome: p.nome || "",
    cat: p.cat || "",
    grupo: p.grupo || "",
    subcat: subcat,
    subcategoria: subcat,
    preco: numeroSeguro(p.preco),
    custo: numeroSeguro(p.custo),
    estoque: estoque,
    estq: estoque,
    desc2: p.desc2 || "",
    ean: eanPrincipal,
    codigos_barras: codigosExtras,
    ncm: p.ncm || "",
    origem: p.origem || "0",
    unidade: p.unidade || "",
    csosn: p.csosn || "102",
    cfop: p.cfop || "5102",
    escala: p.escala || "",
    origem_estoque: p.origem_estoque || "",
    createdAt: p.createdAt || agoraISO(),
    updatedAt: p.updatedAt || agoraISO(),
    deletedAt: ""
  };
}

function normalizarCliente(c) {
  const telefone = c.telefone || c.tel || "";
  const endereco = c.endereco || c.end || "";
  const limite = numeroSeguro(c.limite_credito ?? c.limite);

  return {
    id: c.id,
    nome: c.nome || "",
    telefone: telefone,
    tel: telefone,
    cpf: c.cpf || "",
    endereco: endereco,
    end: endereco,
    limite_credito: limite,
    limite: limite,
    obs: c.obs || "",
    data: c.data || c.createdAt || agoraISO(),
    createdAt: c.createdAt || c.data || agoraISO(),
    updatedAt: c.updatedAt || c.data || agoraISO(),
    deletedAt: ""
  };
}

function normalizarVenda(v) {
  return {
    id: v.id,
    cid: v.cid || "",
    cliente: v.cliente || v.cliNome || "",
    forma_pagamento: normalizarFormaPagamento_(v.forma_pagamento || v.forma || ""),
    total: numeroSeguro(v.total),
    itens_json: JSON.stringify(safeParseJson(v.itens_json, v.itens || [])),
    data: v.data || v.createdAt || agoraISO(),
    createdAt: v.createdAt || v.data || agoraISO(),
    updatedAt: v.updatedAt || v.data || agoraISO(),
    deletedAt: ""
  };
}

function normalizarPagamento(p) {
  return {
    id: p.id,
    cid: p.cid || "",
    venda_id: p.venda_id || p.vid || "",
    valor: numeroSeguro(p.valor ?? p.val),
    forma_pagamento: normalizarFormaPagamento_(p.forma_pagamento || p.forma || ""),
    obs: p.obs || "",
    data: p.data || p.createdAt || agoraISO(),
    createdAt: p.createdAt || p.data || agoraISO(),
    updatedAt: p.updatedAt || p.data || agoraISO(),
    deletedAt: ""
  };
}

function normalizarCredito(c) {
  return {
    id: c.id,
    cid: c.cid || "",
    vid: c.vid || c.venda_id || "",
    cliente: c.cliente || c.cliNome || "",
    descricao: normalizarDescricaoCobranca_(c.descricao || c.desc || ""),
    valor: numeroSeguro(c.valor ?? c.val),
    status: c.status || "aberto",
    vencimento: c.vencimento || "",
    data: c.data || c.createdAt || agoraISO(),
    createdAt: c.createdAt || c.data || agoraISO(),
    updatedAt: c.updatedAt || c.data || agoraISO(),
    deletedAt: ""
  };
}

/* NORMALIZAÇÃO RESTORE */

function normalizarProdutoRestauracao(p) {
  const eanPrincipal = String(p.ean || "").trim();
  const codigosExtras = String(
    p.codigos_barras != null
      ? p.codigos_barras
      : (p.codigosBarras != null ? p.codigosBarras : "")
  ).trim();

  const subcat = String(p.subcat || p.subcategoria || "").trim();
  const estoque = numeroSeguro(p.estoque ?? p.estq);

  return {
    id: p.id || "",
    cod: p.cod || "",
    nome: p.nome || "",
    cat: p.cat || "",
    grupo: p.grupo || "",
    subcat: subcat,
    subcategoria: subcat,
    preco: numeroSeguro(p.preco),
    custo: numeroSeguro(p.custo),
    estoque: estoque,
    estq: estoque,
    desc2: p.desc2 || "",
    ean: eanPrincipal,
    codigos_barras: codigosExtras,
    ncm: p.ncm || "",
    origem: p.origem || "0",
    unidade: p.unidade || "",
    csosn: p.csosn || "102",
    cfop: p.cfop || "5102",
    escala: p.escala || "",
    origem_estoque: p.origem_estoque || "",
    createdAt: createdOriginal(p),
    updatedAt: updatedOriginal(p),
    deletedAt: ""
  };
}

function normalizarClienteRestauracao(c) {
  const telefone = c.telefone || c.tel || "";
  const endereco = c.endereco || c.end || "";
  const limite = numeroSeguro(c.limite_credito ?? c.limite);

  return {
    id: c.id || "",
    nome: c.nome || "",
    telefone: telefone,
    tel: telefone,
    cpf: c.cpf || "",
    endereco: endereco,
    end: endereco,
    limite_credito: limite,
    limite: limite,
    obs: c.obs || "",
    data: dataOriginal(c),
    createdAt: createdOriginal(c),
    updatedAt: updatedOriginal(c),
    deletedAt: ""
  };
}

function normalizarVendaRestauracao(v) {
  const itens = safeParseJson(v.itens_json, v.itens || []);

  return {
    id: v.id || "",
    cid: v.cid || "",
    cliente: v.cliente || v.cliNome || "",
    cliNome: v.cliente || v.cliNome || "",
    forma_pagamento: normalizarFormaPagamento_(v.forma_pagamento || v.forma || ""),
    forma: normalizarFormaPagamento_(v.forma_pagamento || v.forma || ""),
    total: numeroSeguro(v.total),
    itens_json: typeof v.itens_json === "string" ? v.itens_json : JSON.stringify(itens),
    itens: itens,
    data: dataOriginal(v),
    createdAt: createdOriginal(v),
    updatedAt: updatedOriginal(v),
    deletedAt: ""
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
    forma_pagamento: normalizarFormaPagamento_(p.forma_pagamento || p.forma || ""),
    forma: normalizarFormaPagamento_(p.forma_pagamento || p.forma || ""),
    obs: p.obs || "",
    data: dataOriginal(p),
    createdAt: createdOriginal(p),
    updatedAt: updatedOriginal(p),
    deletedAt: ""
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
    descricao: normalizarDescricaoCobranca_(c.descricao || c.desc || ""),
    desc: normalizarDescricaoCobranca_(c.descricao || c.desc || ""),
    valor: numeroSeguro(c.valor ?? c.val),
    val: numeroSeguro(c.valor ?? c.val),
    status: c.status || "aberto",
    vencimento: c.vencimento || "",
    data: dataOriginal(c),
    createdAt: createdOriginal(c),
    updatedAt: updatedOriginal(c),
    deletedAt: ""
  };
}

/* RESTORE MANUAL */

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

    suprimirHookExclusao = true;
    originalSetItem("bm_clientes", JSON.stringify(clientes));
    originalSetItem("bm_produtos", JSON.stringify(produtos));
    originalSetItem("bm_vendas", JSON.stringify(vendas));
    originalSetItem("bm_pagamentos", JSON.stringify(pagamentos));
    originalSetItem("bm_creditos", JSON.stringify(creditos));
    suprimirHookExclusao = false;

    originalSetItem("bm_last_restore", agoraISO());
    ultimoHashEnviado = gerarHashSync();
    ultimoErroSync = "";

    return true;
  } catch (e) {
    suprimirHookExclusao = false;
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
  if (syncEmAndamento) return false;
  syncEmAndamento = true;

  try {
    salvarBackup();

    const clientes = lerLocal("clientes");
    const produtos = lerLocal("produtos");
    const vendas = lerLocal("vendas");
    const pagamentos = lerLocal("pagamentos");
    const creditos = lerLocal("creditos");

    await enviar({
      action: "upsert",
      sheet: "clientes",
      rows: clientes.map(normalizarCliente)
    });

    await enviar({
      action: "upsert",
      sheet: "produtos",
      rows: produtos.map(normalizarProduto)
    });

    await enviar({
      action: "upsert",
      sheet: "vendas",
      rows: vendas.map(normalizarVenda)
    });

    await enviar({
      action: "upsert",
      sheet: "recebimentos",
      rows: pagamentos.map(normalizarPagamento)
    });

    await enviar({
      action: "upsert",
      sheet: "cobrancas",
      rows: creditos.map(normalizarCredito)
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

/* EXCLUSÃO FÍSICA */

function extrairRemovidos(antes, depois) {
  const idsDepois = new Set((depois || []).map(x => String(x.id)));
  return (antes || []).filter(x => !idsDepois.has(String(x.id)));
}

async function processarRemovidos(nome, antes, depois) {
  if (suprimirHookExclusao) return;
  const removidos = extrairRemovidos(antes, depois);
  if (!removidos.length) return;

  for (const item of removidos) {
    try {
      if (nome === "vendas") {
        await deletarVendaFisico(item.id);
      } else if (nome === "clientes") {
        await deletarFisico("clientes", item.id);
      } else if (nome === "produtos") {
        await deletarFisico("produtos", item.id);
      } else if (nome === "pagamentos") {
        await deletarFisico("recebimentos", item.id);
      } else if (nome === "creditos") {
        await deletarFisico("cobrancas", item.id);
      }
    } catch (e) {
      console.warn("Falha ao excluir fisicamente", nome, item.id, e);
    }
  }
}

/* AUTO SYNC */

function agendarAutoSync(motivo) {
  if (restoreEmAndamento) return;

  if (autoSyncTimer) clearTimeout(autoSyncTimer);

  autoSyncTimer = setTimeout(async function () {
    autoSyncTimer = null;

    if (restoreEmAndamento || syncEmAndamento) return;

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
    if (restoreEmAndamento || syncEmAndamento) return;

    const hashAtual = gerarHashSync();
    if (hashAtual === ultimoHashEnviado) return;

    try {
      await enviarTudo("intervalo_2min");
    } catch (e) {
      console.warn("Sync periódico falhou:", e);
    }
  }, AUTO_SYNC_INTERVAL_MS);
}

/* HOOK */

localStorage.setItem = function (k, v) {
  const nome = String(k).replace("bm_", "");

  if (["clientes", "produtos", "vendas", "pagamentos", "creditos"].includes(nome)) {
    const antes = lerLocal(nome);
    originalSetItem(k, v);
    const depois = lerLocal(nome);

    processarRemovidos(nome, antes, depois);
    agendarAutoSync(nome);
    return;
  }

  originalSetItem(k, v);
};

/* START */

function initSync() {
  if (localStorage.getItem("bm_last_sync")) {
    ultimoHashEnviado = gerarHashSync();
  }
  iniciarSyncPeriodico();
}

initSync();

/* API GLOBAL */

window.BelaSheetsSync = {
  syncNow: function () {
    return enviarTudo("manual");
  },
  restoreNow: async function () {
    const ok = await restaurarDoServidor();
    if (ok) location.reload();
    return ok;
  },
  backupServerNow: async function () {
    const r = await fetch(API_URL + "?action=backupAgora");
    return r.json();
  },
  deleteClienteNow: function (id) {
    return deletarFisico("clientes", id);
  },
  deleteProdutoNow: function (id) {
    return deletarFisico("produtos", id);
  },
  deleteRecebimentoNow: function (id) {
    return deletarFisico("recebimentos", id);
  },
  deleteCobrancaNow: function (id) {
    return deletarFisico("cobrancas", id);
  },
  deleteVendaNow: function (id) {
    return deletarVendaFisico(id);
  },
  status: function () {
    return {
      syncEmAndamento,
      restoreEmAndamento,
      autoSyncPendente: !!autoSyncTimer,
      ultimoSync: localStorage.getItem("bm_last_sync"),
      origemUltimoSync: localStorage.getItem("bm_last_sync_origin"),
      ultimoErroSync,
      ultimoMotivoSync
    };
  }
};

})();
