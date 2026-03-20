/**
 * sheets-sync.js — v2 corrigido
 *
 * CORREÇÕES APLICADAS:
 * 1. sheets-config.js: URL trocada de /echo para /exec
 * 2. POST: body enviado como URLSearchParams (form-urlencoded real),
 *    com o payload JSON dentro do campo "payload" — único formato
 *    que o Apps Script lê via e.parameter.payload sem preflight CORS.
 * 3. GET: mantém fetchJson normal (retorna JSON legível).
 * 4. POST: usa mode:"no-cors" para evitar bloqueio de preflight.
 *    Como no-cors retorna resposta opaque, a confirmação do POST
 *    é feita por pull subsequente, não pela resposta do POST.
 * 5. pushLocal: cada aba é enviada em série com await para não
 *    sobrecarregar o Apps Script.
 */

(function () {
  const API_URL = window.BELA_SHEETS_API_URL || "";
  const SYNC_INTERVAL_MS = Number(window.BELA_SHEETS_SYNC_INTERVAL_MS || 120000);
  if (!API_URL) { console.warn("BELA_SHEETS_API_URL não configurada."); return; }

  /* ── utilitários ─────────────────────────────────────────── */
  function safeParse(v, fb) { try { return JSON.parse(v); } catch (e) { return fb; } }
  function readLocal(name) { return safeParse(localStorage.getItem("bm_" + name) || "[]", []); }
  function writeLocal(name, rows) { localStorage.setItem("bm_" + name, JSON.stringify(Array.isArray(rows) ? rows : [])); }
  function isoNow() {
    var n = new Date();
    return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString();
  }

  /* ── GET — retorna JSON normalmente ─────────────────────── */
  function fetchGet(url) {
    return fetch(url, { method: "GET" }).then(r => {
      if (!r.ok) throw new Error("GET falhou: " + r.status);
      return r.json();
    });
  }

  /**
   * POST — usa URLSearchParams + mode:no-cors
   *
   * O Apps Script lê via:  e.parameter.payload  →  JSON.parse(e.parameter.payload)
   *
   * Por usar no-cors, a resposta é opaque (não podemos ler).
   * Isso é intencional — o Apps Script vai gravar os dados
   * e o próximo pullRemote vai confirmar a escrita.
   */
  async function postSheet(body, tentativas) {
    tentativas = tentativas || 3;
    const params = new URLSearchParams();
    params.append("payload", JSON.stringify(body));
    for (let i = 0; i < tentativas; i++) {
      try {
        await fetch(API_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString()
        });
        return;
      } catch (err) {
        if (i === tentativas - 1) throw err;
        await new Promise(r => setTimeout(r, 1500 * (i + 1)));
      }
    }
  }

  /* ── serialização / deserialização ──────────────────────── */
  function normalizeClientLocal(c) {
    const stamp = c.updatedAt || c.createdAt || c.data || isoNow();
    return {
      id: c.id || ("cli_" + Math.random().toString(36).slice(2, 10)),
      nome: c.nome || "",
      tel: c.tel || c.telefone || "",
      end: c.end || c.endereco || "",
      createdAt: c.createdAt || c.data || stamp,
      updatedAt: stamp
    };
  }
  function serializeClients(list) {
    return (list || []).map(c => {
      c = normalizeClientLocal(c);
      return { id: c.id, nome: c.nome, telefone: c.tel, endereco: c.end, data: c.updatedAt };
    });
  }
  function deserializeClients(rows) {
    return (rows || []).map(r => ({
      id: String(r.id || ""),
      nome: r.nome || "",
      tel: r.telefone || "",
      end: r.endereco || "",
      createdAt: r.data || isoNow(),
      updatedAt: r.data || isoNow()
    })).filter(x => x.id || x.nome);
  }

  function normalizeProductLocal(p) {
    const stamp = p.updatedAt || p.createdAt || isoNow();
    return {
      id: p.id || ("pro_" + Math.random().toString(36).slice(2, 10)),
      nome: p.nome || "",
      preco: Number(p.preco || 0),
      estq: Number(p.estq != null ? p.estq : (p.estoque != null ? p.estoque : 0)),
      updatedAt: stamp
    };
  }
  function serializeProducts(list) {
    return (list || []).map(p => {
      p = normalizeProductLocal(p);
      return { id: p.id, nome: p.nome, preco: p.preco, estoque: p.estq };
    });
  }
  function deserializeProducts(rows) {
    return (rows || []).map(r => ({
      id: String(r.id || ""),
      nome: r.nome || "",
      preco: Number(r.preco || 0),
      estq: Number(r.estoque || 0),
      createdAt: isoNow(),
      updatedAt: isoNow()
    })).filter(x => x.id || x.nome);
  }

  function normalizeVendaLocal(v) {
    const stamp = v.updatedAt || v.createdAt || v.data || isoNow();
    return {
      id: v.id || ("ven_" + Math.random().toString(36).slice(2, 10)),
      cliNome: v.cliNome || v.cliente || "Balcão",
      forma: v.forma || v.forma_pagamento || "",
      total: Number(v.total || 0),
      data: v.data || stamp,
      updatedAt: stamp
    };
  }
  function serializeVendas(list) {
    return (list || []).map(v => {
      v = normalizeVendaLocal(v);
      return { id: v.id, cliente: v.cliNome, total: v.total, forma_pagamento: v.forma, data: v.data };
    });
  }
  function deserializeVendas(rows) {
    return (rows || []).map(r => ({
      id: String(r.id || ""),
      cliNome: r.cliente || "Balcão",
      total: Number(r.total || 0),
      forma: r.forma_pagamento || "",
      data: r.data || isoNow(),
      createdAt: r.data || isoNow(),
      updatedAt: r.data || isoNow()
    })).filter(x => x.id || x.cliNome);
  }

  function serializePagamentos(list) {
    return (list || []).map(p => {
      const stamp = p.updatedAt || p.createdAt || p.data || isoNow();
      const vendaId = p.vid || (p.cid ? ("cid:" + p.cid) : "");
      return {
        id: p.id || ("pag_" + Math.random().toString(36).slice(2, 10)),
        venda_id: vendaId,
        valor: Number(p.val || p.valor || 0),
        forma_pagamento: p.forma || p.forma_pagamento || "",
        data: p.data || stamp
      };
    });
  }
  function deserializePagamentos(rows, vendas, clientes) {
    const vendaMap = new Map((vendas || []).map(v => [String(v.id), v]));
    const clientMapByName = new Map((clientes || []).map(c => [String(c.nome || "").toLowerCase(), c]));
    return (rows || []).map(r => {
      const vendaId = String(r.venda_id || "");
      let cid = "";
      if (vendaId.startsWith("cid:")) cid = vendaId.slice(4);
      if (!cid && vendaMap.has(vendaId)) {
        const venda = vendaMap.get(vendaId);
        const cli = clientMapByName.get(String(venda.cliNome || "").toLowerCase());
        if (cli) cid = cli.id;
      }
      return {
        id: String(r.id || ""),
        vid: vendaId && !vendaId.startsWith("cid:") ? vendaId : "",
        cid: cid || "",
        val: Number(r.valor || 0),
        forma: r.forma_pagamento || "",
        data: r.data || isoNow(),
        createdAt: r.data || isoNow(),
        updatedAt: r.data || isoNow()
      };
    }).filter(x => x.id || x.val);
  }

  function serializeCreditos(list, clientes) {
    const cliById = new Map((clientes || []).map(c => [String(c.id), c]));
    return (list || []).map(c => {
      const stamp = c.updatedAt || c.createdAt || c.data || isoNow();
      const cli = cliById.get(String(c.cid || "")) || {};
      return {
        id: c.id || ("cre_" + Math.random().toString(36).slice(2, 10)),
        cliente: c.cliNome || cli.nome || "",
        valor: Number(c.val || c.valor || 0),
        status: c.status || "aberto",
        vencimento: c.vencimento || c.data || stamp
      };
    });
  }
  function deserializeCreditos(rows, clientes) {
    const clientMapByName = new Map((clientes || []).map(c => [String(c.nome || "").toLowerCase(), c]));
    return (rows || []).map(r => {
      const cli = clientMapByName.get(String(r.cliente || "").toLowerCase()) || {};
      return {
        id: String(r.id || ""),
        cid: cli.id || "",
        cliNome: r.cliente || "",
        val: Number(r.valor || 0),
        status: r.status || "aberto",
        vencimento: r.vencimento || "",
        data: r.vencimento || isoNow(),
        createdAt: r.vencimento || isoNow(),
        updatedAt: r.vencimento || isoNow()
      };
    }).filter(x => x.id || x.cliNome);
  }

  /* ── UI ──────────────────────────────────────────────────── */
  function setStatus(text, isError) {
    let el = document.getElementById("belaSheetsSyncStatus");
    if (!el) {
      el = document.createElement("div");
      el.id = "belaSheetsSyncStatus";
      el.style.cssText = [
        "position:fixed", "right:12px", "bottom:126px", "z-index:99999",
        "padding:8px 10px", "border-radius:999px",
        "color:#fff", "font-size:12px", "box-shadow:0 8px 18px rgba(0,0,0,.18)",
        "transition:background .3s"
      ].join(";");
      document.body.appendChild(el);
    }
    el.style.background = isError ? "rgba(180,30,30,.92)" : "rgba(17,24,39,.88)";
    el.textContent = text;
  }

  function installButton() {
    if (document.getElementById("belaSheetsSyncButton")) return;
    const btn = document.createElement("button");
    btn.id = "belaSheetsSyncButton";
    btn.textContent = "⟳ Sincronizar";
    btn.style.cssText = [
      "position:fixed", "right:12px", "bottom:82px", "z-index:99999",
      "border:none", "border-radius:14px", "padding:10px 12px",
      "font-weight:800", "cursor:pointer",
      "box-shadow:0 10px 24px rgba(0,0,0,.12)",
      "background:#b14f4f", "color:#fff"
    ].join(";");
    btn.onclick = function () { syncNow(); };
    document.body.appendChild(btn);
  }

  /* ── sync ────────────────────────────────────────────────── */
  let syncTimer = null;
  let debounceTimer = null;
  let syncing = false;
  let patchDone = false;

  async function pullRemote() {
    const data = await fetchGet(API_URL);
    const clientes = deserializeClients(data.clientes || []);
    const produtos = deserializeProducts(data.produtos || []);
    const vendas = deserializeVendas(data.vendas || []);
    const pagamentos = deserializePagamentos(data.recebimentos || [], vendas, clientes);
    const creditos = deserializeCreditos(data.cobrancas || [], clientes);

    // usa raw para não disparar scheduleSync em cascata
    _rawSet("bm_clientes", JSON.stringify(clientes));
    _rawSet("bm_produtos", JSON.stringify(produtos));
    _rawSet("bm_vendas", JSON.stringify(vendas));
    _rawSet("bm_pagamentos", JSON.stringify(pagamentos));
    _rawSet("bm_creditos", JSON.stringify(creditos));
  }

  async function pushLocal() {
    const clientes = readLocal("clientes");
    const produtos = readLocal("produtos");
    const vendas = readLocal("vendas");
    const pagamentos = readLocal("pagamentos");
    const creditos = readLocal("creditos");

    // série (await cada um) para não sobrecarregar o Apps Script
    await postSheet({ action: "replaceAll", sheet: "clientes",     rows: serializeClients(clientes) });
    await postSheet({ action: "replaceAll", sheet: "produtos",     rows: serializeProducts(produtos) });
    await postSheet({ action: "replaceAll", sheet: "vendas",       rows: serializeVendas(vendas) });
    await postSheet({ action: "replaceAll", sheet: "recebimentos", rows: serializePagamentos(pagamentos) });
    await postSheet({ action: "replaceAll", sheet: "cobrancas",    rows: serializeCreditos(creditos, clientes) });
  }

  async function syncNow() {
    if (syncing) return;
    syncing = true;
    try {
      setStatus("☁ Sincronizando...");
      await pullRemote();
      await pushLocal();
      setStatus("✓ Sincronizado " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      _rawSet("bm_last_sync_at", isoNow());
    } catch (err) {
      console.error("Erro ao sincronizar:", err);
      setStatus("✗ Erro na sincronização", true);
    } finally {
      syncing = false;
    }
  }

  function scheduleSync() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(syncNow, 1200);
  }

  /* guarda referência ao setItem original ANTES do patch */
  let _rawSet = localStorage.setItem.bind(localStorage);

  function patchStorage() {
    if (patchDone) return;
    patchDone = true;
    localStorage.setItem = function (key, value) {
      _rawSet(key, value);
      if (/^bm_(clientes|produtos|vendas|pagamentos|creditos)$/.test(String(key))) {
        scheduleSync();
      }
    };
  }

  function start() {
    installButton();
    patchStorage();
    syncNow();
    window.addEventListener("focus", syncNow);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") syncNow();
    });
    clearInterval(syncTimer);
    syncTimer = setInterval(syncNow, SYNC_INTERVAL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
