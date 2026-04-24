/*!
Bela Modas Sheets Sync — versão limpa
Regra:
1) Local é a base de trabalho
2) A cada sync, envia tudo para a planilha
3) Sync automático a cada 2 minutos
4) Mobile apenas visualiza usando getAll
5) Restore é manual
*/

(function () {

"use strict";

const API_URL =
"https://script.google.com/macros/s/AKfycbxvE2DpOpZDW1bZOvatqdN0HjSOXI3gvFdGPSj7qeUb6NF2V-K18-5tpil1KGW4O1lB/exec";

const AUTO_SYNC_DELAY_MS = 4000;
const AUTO_SYNC_INTERVAL_MS = 2 * 60 * 1000;

let syncEmAndamento = false;
let restoreEmAndamento = false;
let autoSyncTimer = null;
let ultimoHashEnviado = "";
let ultimoErroSync = "";
let ultimoMotivoSync = "";
let intervaloAtivo = false;
let ignorarHook = false;

/* ================= UTIL ================= */

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

function normalizarFormaPagamento_(v) {
  const s = String(v || "").trim().toLowerCase();

  if (s === "fiado" || s === "crediario" || s === "crediário") return "fiado";
  if (s === "crédito") return "credito";
  if (s === "débito") return "debito";
  if (s === "cartão crédito" || s === "cartao credito") return "credito";
  if (s === "cartão débito" || s === "cartao debito") return "debito";

  return s;
}

function normalizarDescricaoCobranca_(v) {
  const s = String(v || "").trim();

  if (!s) return "Venda fiado";

  const lower = s.toLowerCase();

  if (lower.includes("crediario") || lower.includes("crediário")) {
    return "Venda fiado";
  }

  if (lower.startsWith("venda fiado")) {
    return "Venda fiado";
  }

  return s;
}

/* ================= STORAGE ================= */

const originalSetItem = localStorage.setItem.bind(localStorage);

function lerLocal(nome) {
  try {
    return JSON.parse(localStorage.getItem("bm_" + nome) || "[]");
  } catch (e) {
    return [];
  }
}

function salvarLocal(nome, dados) {
  originalSetItem("bm_" + nome, JSON.stringify(dados || []));
}

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

function salvarBackupLocal() {
  originalSetItem("bm_backup", JSON.stringify({
    data: agoraISO(),
    clientes: lerLocal("clientes"),
    produtos: lerLocal("produtos"),
    vendas: lerLocal("vendas"),
    pagamentos: lerLocal("pagamentos"),
    creditos: lerLocal("creditos")
  }));
}

/* ================= HTTP ================= */

async function post(body) {
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

  let json;
  try {
    json = JSON.parse(txt);
  } catch (e) {
    throw new Error("Resposta inválida do Apps Script: " + txt.substring(0, 120));
  }

  if (!r.ok || json.ok === false) {
    throw new Error(json.error || "Falha no Apps Script");
  }

  return json;
}

async function getAll() {
  const r = await fetch(API_URL + "?action=getAll");
  const txt = await r.text();

  let json;
  try {
    json = JSON.parse(txt);
  } catch (e) {
    throw new Error("Resposta inválida ao buscar planilha");
  }

  if (!r.ok || json.ok === false) {
    throw new Error(json.error || "Falha ao buscar planilha");
  }

  return json;
}

/* ================= AJUDAS ================= */

function mapaClientesPorId() {
  const mapa = new Map();

  lerLocal("clientes").forEach(c => {
    if (c && c.id) {
      mapa.set(String(c.id), c);
    }
  });

  return mapa;
}

function nomeClientePorId(cid) {
  if (!cid) return "";
  const mapa = mapaClientesPorId();
  const c = mapa.get(String(cid));
  return c ? (c.nome || "") : "";
}

/* ================= NORMALIZAÇÃO ENVIO ================= */

function normalizarCliente(c) {
  const telefone = c.telefone || c.tel || "";
  const endereco = c.endereco || c.end || "";
  const limite = numeroSeguro(c.limite_credito ?? c.limite);

  return {
    id: c.id,
    nome: c.nome || "",
    telefone,
    cpf: c.cpf || "",
    endereco,
    limite_credito: limite,
    obs: c.obs || "",
    data: c.data || c.createdAt || agoraISO(),
    createdAt: c.createdAt || c.data || agoraISO(),
    updatedAt: c.updatedAt || agoraISO()
  };
}

function normalizarProduto(p) {
  const subcat = String(p.subcat || p.subcategoria || "").trim();
  const estoque = numeroSeguro(p.estoque ?? p.estq);

  return {
    id: p.id,
    cod: p.cod || "",
    nome: p.nome || "",
    cat: p.cat || "",
    grupo: p.grupo || "",
    subcat,
    subcategoria: subcat,
    preco: numeroSeguro(p.preco),
    custo: numeroSeguro(p.custo),
    estoque,
    estq: estoque,
    desc2: p.desc2 || "",
    ean: String(p.ean || "").trim(),
    codigos_barras: String(p.codigos_barras || p.codigosBarras || "").trim(),
    ncm: p.ncm || "",
    origem: p.origem || "0",
    unidade: p.unidade || "",
    csosn: p.csosn || "102",
    cfop: p.cfop || "5102",
    escala: p.escala || "",
    origem_estoque: p.origem_estoque || "",
    createdAt: p.createdAt || agoraISO(),
    updatedAt: p.updatedAt || agoraISO()
  };
}

function normalizarVenda(v) {
  return {
    id: v.id,
    cid: v.cid || "",
    cliente: v.cliente || v.cliNome || nomeClientePorId(v.cid) || "",
    forma_pagamento: normalizarFormaPagamento_(v.forma_pagamento || v.forma || ""),
    total: numeroSeguro(v.total),
    itens_json: JSON.stringify(safeParseJson(v.itens_json, v.itens || [])),
    data: v.data || v.createdAt || agoraISO(),
    createdAt: v.createdAt || v.data || agoraISO(),
    updatedAt: v.updatedAt || agoraISO()
  };
}

function normalizarRecebimento(p) {
  return {
    id: p.id,
    cid: p.cid || "",
    venda_id: p.venda_id || p.vid || "",
    valor: numeroSeguro(p.valor ?? p.val),
    forma_pagamento: normalizarFormaPagamento_(p.forma_pagamento || p.forma || ""),
    obs: p.obs || "",
    data: p.data || p.createdAt || agoraISO(),
    createdAt: p.createdAt || p.data || agoraISO(),
    updatedAt: p.updatedAt || agoraISO()
  };
}

function normalizarCobranca(c) {
  const cid = c.cid || "";
  const cliente = c.cliente || c.cliNome || nomeClientePorId(cid) || "";
  const descricao = normalizarDescricaoCobranca_(c.descricao || c.desc || "");

  return {
    id: c.id,
    cid,
    vid: c.vid || c.venda_id || "",
    cliente,
    descricao,
    valor: numeroSeguro(c.valor ?? c.val),
    status: c.status || "aberto",
    vencimento: c.vencimento || "",
    data: c.data || c.createdAt || agoraISO(),
    createdAt: c.createdAt || c.data || agoraISO(),
    updatedAt: c.updatedAt || agoraISO()
  };
}

/* ================= NORMALIZAÇÃO RESTORE ================= */

function normalizarClienteRestauracao(c) {
  return {
    id: c.id || "",
    nome: c.nome || "",
    telefone: c.telefone || c.tel || "",
    tel: c.telefone || c.tel || "",
    cpf: c.cpf || "",
    endereco: c.endereco || c.end || "",
    end: c.endereco || c.end || "",
    limite_credito: numeroSeguro(c.limite_credito ?? c.limite),
    limite: numeroSeguro(c.limite_credito ?? c.limite),
    obs: c.obs || "",
    data: c.data || c.createdAt || "",
    createdAt: c.createdAt || c.data || "",
    updatedAt: c.updatedAt || c.createdAt || c.data || ""
  };
}

function normalizarProdutoRestauracao(p) {
  const subcat = String(p.subcat || p.subcategoria || "").trim();
  const estoque = numeroSeguro(p.estoque ?? p.estq);

  return {
    id: p.id || "",
    cod: p.cod || "",
    nome: p.nome || "",
    cat: p.cat || "",
    grupo: p.grupo || "",
    subcat,
    subcategoria: subcat,
    preco: numeroSeguro(p.preco),
    custo: numeroSeguro(p.custo),
    estoque,
    estq: estoque,
    desc2: p.desc2 || "",
    ean: p.ean || "",
    codigos_barras: p.codigos_barras || "",
    ncm: p.ncm || "",
    origem: p.origem || "0",
    unidade: p.unidade || "",
    csosn: p.csosn || "102",
    cfop: p.cfop || "5102",
    escala: p.escala || "",
    origem_estoque: p.origem_estoque || "",
    createdAt: p.createdAt || "",
    updatedAt: p.updatedAt || ""
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
    itens,
    data: v.data || v.createdAt || "",
    createdAt: v.createdAt || v.data || "",
    updatedAt: v.updatedAt || v.createdAt || v.data || ""
  };
}

function normalizarRecebimentoRestauracao(p) {
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
    data: p.data || p.createdAt || "",
    createdAt: p.createdAt || p.data || "",
    updatedAt: p.updatedAt || p.createdAt || p.data || ""
  };
}

function normalizarCobrancaRestauracao(c) {
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
    data: c.data || c.createdAt || "",
    createdAt: c.createdAt || c.data || "",
    updatedAt: c.updatedAt || c.createdAt || c.data || ""
  };
}

/* ================= SYNC ================= */

async function syncNow(origem) {
  if (syncEmAndamento || restoreEmAndamento) return false;

  syncEmAndamento = true;

  try {
    salvarBackupLocal();

    const payload = {
      action: "syncAll",
      origem: origem || "manual",
      clientes: lerLocal("clientes").map(normalizarCliente),
      produtos: lerLocal("produtos").map(normalizarProduto),
      vendas: lerLocal("vendas").map(normalizarVenda),
      recebimentos: lerLocal("pagamentos").map(normalizarRecebimento),
      cobrancas: lerLocal("creditos").map(normalizarCobranca)
    };

    const res = await post(payload);

    originalSetItem("bm_last_sync", agoraISO());
    originalSetItem("bm_last_sync_origin", origem || "manual");

    ultimoHashEnviado = gerarHashSync();
    ultimoErroSync = "";
    ultimoMotivoSync = origem || "manual";

    return res;

  } catch (e) {
    console.error("Erro no sync:", e);
    ultimoErroSync = String(e && e.message || e);
    originalSetItem("bm_last_sync_error", ultimoErroSync);
    throw e;

  } finally {
    syncEmAndamento = false;
  }
}

function agendarSync(motivo) {
  if (ignorarHook || restoreEmAndamento) return;

  if (autoSyncTimer) clearTimeout(autoSyncTimer);

  autoSyncTimer = setTimeout(async function () {
    autoSyncTimer = null;

    if (restoreEmAndamento || syncEmAndamento) return;

    const hashAtual = gerarHashSync();
    if (hashAtual === ultimoHashEnviado) return;

    try {
      await syncNow("auto:" + (motivo || "mudanca"));
    } catch (e) {
      console.warn("Auto sync falhou:", e);
    }
  }, AUTO_SYNC_DELAY_MS);
}

function iniciarSyncIntervalo() {
  if (intervaloAtivo) return;
  intervaloAtivo = true;

  setInterval(async function () {
    if (restoreEmAndamento || syncEmAndamento) return;

    const hashAtual = gerarHashSync();
    if (hashAtual === ultimoHashEnviado) return;

    try {
      await syncNow("intervalo_2min");
    } catch (e) {
      console.warn("Sync 2min falhou:", e);
    }
  }, AUTO_SYNC_INTERVAL_MS);
}

/* ================= RESTORE MANUAL ================= */

async function restoreNow() {
  if (restoreEmAndamento || syncEmAndamento) return false;

  restoreEmAndamento = true;

  try {
    const dados = await getAll();

    ignorarHook = true;

    salvarLocal("clientes", (dados.clientes || []).map(normalizarClienteRestauracao));
    salvarLocal("produtos", (dados.produtos || []).map(normalizarProdutoRestauracao));
    salvarLocal("vendas", (dados.vendas || []).map(normalizarVendaRestauracao));
    salvarLocal("pagamentos", (dados.recebimentos || []).map(normalizarRecebimentoRestauracao));
    salvarLocal("creditos", (dados.cobrancas || []).map(normalizarCobrancaRestauracao));

    ignorarHook = false;

    originalSetItem("bm_last_restore", agoraISO());
    ultimoHashEnviado = gerarHashSync();
    ultimoErroSync = "";

    location.reload();
    return true;

  } catch (e) {
    ignorarHook = false;
    console.error("Erro no restore:", e);
    ultimoErroSync = String(e && e.message || e);
    originalSetItem("bm_last_restore_error", ultimoErroSync);
    return false;

  } finally {
    restoreEmAndamento = false;
  }
}

/* ================= HOOK LOCALSTORAGE ================= */

localStorage.setItem = function (k, v) {
  originalSetItem(k, v);

  if (ignorarHook) return;

  const nome = String(k).replace("bm_", "");

  if (["clientes", "produtos", "vendas", "pagamentos", "creditos"].includes(nome)) {
    agendarSync(nome);
  }
};

/* ================= BACKUP SERVIDOR ================= */

async function backupServerNow() {
  const r = await fetch(API_URL + "?action=backupAgora");
  return r.json();
}

/* ================= START ================= */

function init() {
  if (localStorage.getItem("bm_last_sync")) {
    ultimoHashEnviado = gerarHashSync();
  }

  iniciarSyncIntervalo();

  console.log("BelaSheetsSync limpo iniciado.");
}

init();

/* ================= API GLOBAL ================= */

window.BelaSheetsSync = {
  syncNow: function () {
    return syncNow("manual");
  },

  restoreNow: restoreNow,

  backupServerNow: backupServerNow,

  status: function () {
    return {
      syncEmAndamento,
      restoreEmAndamento,
      autoSyncPendente: !!autoSyncTimer,
      ultimoSync: localStorage.getItem("bm_last_sync"),
      origemUltimoSync: localStorage.getItem("bm_last_sync_origin"),
      ultimoRestore: localStorage.getItem("bm_last_restore"),
      ultimoErroSync,
      ultimoMotivoSync
    };
  }
};

})();
