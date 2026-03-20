/*!
 * Bela Modas Sheets Sync — versão corrigida final
 * - datas locais consistentes
 * - merge por id + updatedAt
 * - exclusão persistente via tombstones
 * - usa upsert no Apps Script
 * - envia/recebe _deleted
 * - sem no-cors
 */
(function () {
  "use strict";

  const API_URL = "https://script.google.com/macros/s/AKfycbzH4m2rIWkzHLf_SPldVWBk6uSbhmwWz_OLZENRr0A-9XOzCtHsU5fbLtJCm-ZKss0k/exec";
  const SYNC_INTERVAL_MS = 25000;
  const TABLES = ["clientes", "produtos", "vendas", "pagamentos", "creditos"];

  function pad2(n) { return String(n).padStart(2, "0"); }

  function isoNow() {
    const n = new Date();
    return (
      n.getFullYear() + "-" +
      pad2(n.getMonth() + 1) + "-" +
      pad2(n.getDate()) + "T" +
      pad2(n.getHours()) + ":" +
      pad2(n.getMinutes()) + ":" +
      pad2(n.getSeconds())
    );
  }

  function parseStamp(v) {
    if (!v) return 0;
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : 0;
  }

  function newestStamp(row) {
    if (!row) return 0;
    return Math.max(
      parseStamp(row.updatedAt),
      parseStamp(row.deletedAt),
      parseStamp(row.createdAt),
      parseStamp(row.data)
    );
  }

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function safeParse(text, fallback) {
    try { return JSON.parse(text); } catch (e) { return fallback; }
  }

  function readLocal(name) {
    return safeParse(localStorage.getItem("bm_" + name) || "[]", []);
  }

  function writeLocal(name, rows) {
    _rawSet("bm_" + name, JSON.stringify(Array.isArray(rows) ? rows : []));
  }

  function readDeleted(name) {
    return safeParse(localStorage.getItem("bm_deleted_" + name) || "[]", []);
  }

  function writeDeleted(name, rows) {
    _rawSet("bm_deleted_" + name, JSON.stringify(Array.isArray(rows) ? rows : []));
  }

  function mergeMaps(rowsA, rowsB) {
    const map = new Map();

    [].concat(rowsA || [], rowsB || []).forEach(row => {
      if (!row || !row.id) return;
      const id = String(row.id);
      const current = map.get(id);

      if (!current) {
        map.set(id, clone(row));
        return;
      }

      const currentStamp = newestStamp(current);
      const nextStamp = newestStamp(row);

      if (nextStamp > currentStamp || (nextStamp === currentStamp && !current.deletedAt && row.deletedAt)) {
        map.set(id, clone(row));
      }
    });

    return map;
  }

  function buildTombstones(prevRows, nextRows) {
    const prevMap = new Map((prevRows || []).filter(x => x && x.id).map(x => [String(x.id), x]));
    const nextIds = new Set((nextRows || []).filter(x => x && x.id).map(x => String(x.id)));
    const out = [];

    prevMap.forEach((row, id) => {
      if (!nextIds.has(id)) {
        const stamp = isoNow();
        out.push({
          id,
          sheet: "",
          updatedAt: stamp,
          deletedAt: stamp,
          createdAt: row.createdAt || row.data || stamp,
          data: row.data || row.createdAt || stamp
        });
      }
    });

    return out;
  }

  function mergeTombstones(existing, added, survivingRows) {
    const surviving = new Set((survivingRows || []).filter(x => x && x.id).map(x => String(x.id)));
    const merged = mergeMaps(existing, added);
    const out = [];

    merged.forEach((row, id) => {
      if (!surviving.has(id)) out.push(row);
    });

    return out;
  }

  async function fetchGet(url) {
    const r = await fetch(url, { method: "GET", cache: "no-store" });
    if (!r.ok) throw new Error("GET falhou: " + r.status);

    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Resposta GET não é JSON válido");
    }

    if (data && data.ok === false) {
      throw new Error(data.error || "Erro retornado no GET");
    }

    return data;
  }

  async function postSheet(body, tentativas) {
    tentativas = tentativas || 3;

    for (let i = 0; i < tentativas; i++) {
      try {
        const params = new URLSearchParams();
        params.append("payload", JSON.stringify(body));

        const r = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
          },
          body: params.toString()
        });

        if (!r.ok) {
          throw new Error("POST falhou: " + r.status);
        }

        const text = await r.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Resposta POST não é JSON válido");
        }

        if (!data || data.ok !== true) {
          throw new Error((data && data.error) || "POST retornou erro");
        }

        return data;
      } catch (err) {
        if (i === tentativas - 1) throw err;
        await new Promise(r => setTimeout(r, 1200 * (i + 1)));
      }
    }
  }

  function normalizeClientLocal(c) {
    const stamp = c.updatedAt || c.createdAt || c.data || isoNow();
    return {
      id: String(c.id || ("cli_" + Math.random().toString(36).slice(2, 10))),
      nome: c.nome || "",
      tel: c.tel || c.telefone || "",
      cpf: c.cpf || "",
      end: c.end || c.endereco || "",
      obs: c.obs || "",
      data: c.data || c.createdAt || stamp,
      createdAt: c.createdAt || c.data || stamp,
      updatedAt: c.updatedAt || stamp,
      deletedAt: c.deletedAt || ""
    };
  }

  function serializeClients(list) {
    return (list || []).map(c => {
      c = normalizeClientLocal(c);
      return {
        id: c.id,
        nome: c.nome,
        telefone: c.tel,
        cpf: c.cpf,
        endereco: c.end,
        obs: c.obs,
        data: c.data,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        deletedAt: c.deletedAt
      };
    });
  }

  function deserializeClients(rows) {
    return (rows || []).map(r => ({
      id: String(r.id || ""),
      nome: r.nome || "",
      tel: r.telefone || "",
      cpf: r.cpf || "",
      end: r.endereco || "",
      obs: r.obs || "",
      data: r.data || r.createdAt || r.updatedAt || isoNow(),
      createdAt: r.createdAt || r.data || r.updatedAt || isoNow(),
      updatedAt: r.updatedAt || r.data || r.createdAt || isoNow(),
      deletedAt: r.deletedAt || ""
    })).filter(x => x.id);
  }

  function normalizeProductLocal(p) {
    const stamp = p.updatedAt || p.createdAt || isoNow();
    return {
      id: String(p.id || ("pro_" + Math.random().toString(36).slice(2, 10))),
      nome: p.nome || "",
      preco: Number(p.preco || 0),
      estq: Number(p.estq != null ? p.estq : (p.estoque != null ? p.estoque : 0)),
      createdAt: p.createdAt || stamp,
      updatedAt: p.updatedAt || stamp,
      deletedAt: p.deletedAt || ""
    };
  }

  function serializeProducts(list) {
    return (list || []).map(p => {
      p = normalizeProductLocal(p);
      return {
        id: p.id,
        nome: p.nome,
        preco: p.preco,
        estoque: p.estq,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        deletedAt: p.deletedAt
      };
    });
  }

  function deserializeProducts(rows) {
    return (rows || []).map(r => ({
      id: String(r.id || ""),
      nome: r.nome || "",
      preco: Number(r.preco || 0),
      estq: Number(r.estoque || 0),
      createdAt: r.createdAt || r.updatedAt || isoNow(),
      updatedAt: r.updatedAt || r.createdAt || isoNow(),
      deletedAt: r.deletedAt || ""
    })).filter(x => x.id);
  }

  function normalizeVendaLocal(v) {
    const stamp = v.updatedAt || v.createdAt || v.data || isoNow();
    return {
      id: String(v.id || ("ven_" + Math.random().toString(36).slice(2, 10))),
      cid: v.cid || "",
      cliNome: v.cliNome || v.cliente || "Balcão",
      forma: v.forma || v.forma_pagamento || "",
      total: Number(v.total || 0),
      itens: Array.isArray(v.itens) ? v.itens : [],
      data: v.data || stamp,
      createdAt: v.createdAt || v.data || stamp,
      updatedAt: v.updatedAt || stamp,
      deletedAt: v.deletedAt || ""
    };
  }

  function serializeVendas(list) {
    return (list || []).map(v => {
      v = normalizeVendaLocal(v);
      return {
        id: v.id,
        cid: v.cid,
        cliente: v.cliNome,
        total: v.total,
        forma_pagamento: v.forma,
        itens_json: JSON.stringify(v.itens || []),
        data: v.data,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        deletedAt: v.deletedAt
      };
    });
  }

  function deserializeVendas(rows) {
    return (rows || []).map(r => ({
      id: String(r.id || ""),
      cid: String(r.cid || ""),
      cliNome: r.cliente || "Balcão",
      total: Number(r.total || 0),
      forma: r.forma_pagamento || "",
      itens: safeParse(r.itens_json || "[]", []),
      data: r.data || r.createdAt || r.updatedAt || isoNow(),
      createdAt: r.createdAt || r.data || r.updatedAt || isoNow(),
      updatedAt: r.updatedAt || r.data || r.createdAt || isoNow(),
      deletedAt: r.deletedAt || ""
    })).filter(x => x.id);
  }

  function normalizePagamentoLocal(p) {
    const stamp = p.updatedAt || p.createdAt || p.data || isoNow();
    return {
      id: String(p.id || ("pag_" + Math.random().toString(36).slice(2, 10))),
      vid: p.vid || "",
      cid: p.cid || "",
      val: Number(p.val || p.valor || 0),
      forma: p.forma || p.forma_pagamento || "",
      obs: p.obs || "",
      data: p.data || stamp,
      createdAt: p.createdAt || p.data || stamp,
      updatedAt: p.updatedAt || stamp,
      deletedAt: p.deletedAt || ""
    };
  }

  function serializePagamentos(list) {
    return (list || []).map(p => {
      p = normalizePagamentoLocal(p);
      const vendaId = p.vid || (p.cid ? ("cid:" + p.cid) : "");
      return {
        id: p.id,
        venda_id: vendaId,
        valor: p.val,
        forma_pagamento: p.forma,
        obs: p.obs,
        data: p.data,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        deletedAt: p.deletedAt
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
        obs: r.obs || "",
        data: r.data || r.createdAt || r.updatedAt || isoNow(),
        createdAt: r.createdAt || r.data || r.updatedAt || isoNow(),
        updatedAt: r.updatedAt || r.data || r.createdAt || isoNow(),
        deletedAt: r.deletedAt || ""
      };
    }).filter(x => x.id);
  }

  function normalizeCreditoLocal(c) {
    const stamp = c.updatedAt || c.createdAt || c.data || isoNow();
    return {
      id: String(c.id || ("cre_" + Math.random().toString(36).slice(2, 10))),
      cid: c.cid || "",
      vid: c.vid || "",
      cliNome: c.cliNome || c.cliente || "",
      desc: c.desc || "",
      val: Number(c.val || c.valor || 0),
      status: c.status || "aberto",
      vencimento: c.vencimento || c.data || stamp,
      data: c.data || c.vencimento || stamp,
      createdAt: c.createdAt || c.data || stamp,
      updatedAt: c.updatedAt || stamp,
      deletedAt: c.deletedAt || ""
    };
  }

  function serializeCreditos(list, clientes) {
    const cliById = new Map((clientes || []).map(c => [String(c.id), c]));
    return (list || []).map(c => {
      c = normalizeCreditoLocal(c);
      const cli = cliById.get(String(c.cid || "")) || {};
      return {
        id: c.id,
        cid: c.cid,
        vid: c.vid,
        cliente: c.cliNome || cli.nome || "",
        descricao: c.desc,
        valor: c.val,
        status: c.status,
        vencimento: c.vencimento,
        data: c.data,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        deletedAt: c.deletedAt
      };
    });
  }

  function deserializeCreditos(rows, clientes) {
    const clientMapByName = new Map((clientes || []).map(c => [String(c.nome || "").toLowerCase(), c]));
    return (rows || []).map(r => {
      const cli = clientMapByName.get(String(r.cliente || "").toLowerCase()) || {};
      return {
        id: String(r.id || ""),
        cid: String(r.cid || cli.id || ""),
        vid: String(r.vid || ""),
        cliNome: r.cliente || "",
        desc: r.descricao || "",
        val: Number(r.valor || 0),
        status: r.status || "aberto",
        vencimento: r.vencimento || "",
        data: r.data || r.vencimento || r.createdAt || r.updatedAt || isoNow(),
        createdAt: r.createdAt || r.data || r.vencimento || isoNow(),
        updatedAt: r.updatedAt || r.data || r.createdAt || isoNow(),
        deletedAt: r.deletedAt || ""
      };
    }).filter(x => x.id);
  }

  function serializeDeletedRows(localName, rows) {
    return (rows || []).filter(x => x && x.id).map(x => ({
      id: String(x.id),
      sheet: localNameToRemoteSheet(localName),
      createdAt: x.createdAt || x.data || x.deletedAt || x.updatedAt || isoNow(),
      data: x.data || x.createdAt || x.deletedAt || x.updatedAt || isoNow(),
      updatedAt: x.updatedAt || x.deletedAt || isoNow(),
      deletedAt: x.deletedAt || x.updatedAt || isoNow()
    }));
  }

  function localNameToRemoteSheet(name) {
    if (name === "pagamentos") return "recebimentos";
    if (name === "creditos") return "cobrancas";
    return name;
  }

  function remoteSheetToLocalName(name) {
    if (name === "recebimentos") return "pagamentos";
    if (name === "cobrancas") return "creditos";
    return name;
  }

  function collectState() {
    return {
      clientes: readLocal("clientes"),
      produtos: readLocal("produtos"),
      vendas: readLocal("vendas"),
      pagamentos: readLocal("pagamentos"),
      creditos: readLocal("creditos")
    };
  }

  function collectDeletedState() {
    return {
      clientes: readDeleted("clientes"),
      produtos: readDeleted("produtos"),
      vendas: readDeleted("vendas"),
      pagamentos: readDeleted("pagamentos"),
      creditos: readDeleted("creditos")
    };
  }

  function normalizeAllLocal(state) {
    return {
      clientes: state.clientes.map(normalizeClientLocal),
      produtos: state.produtos.map(normalizeProductLocal),
      vendas: state.vendas.map(normalizeVendaLocal),
      pagamentos: state.pagamentos.map(normalizePagamentoLocal),
      creditos: state.creditos.map(normalizeCreditoLocal)
    };
  }

  function normalizeDeleted(state) {
    const out = {};
    TABLES.forEach(name => {
      out[name] = (state[name] || [])
        .filter(x => x && x.id)
        .map(x => ({
          id: String(x.id),
          sheet: localNameToRemoteSheet(name),
          createdAt: x.createdAt || x.data || x.deletedAt || x.updatedAt || isoNow(),
          data: x.data || x.createdAt || x.deletedAt || x.updatedAt || isoNow(),
          updatedAt: x.updatedAt || x.deletedAt || isoNow(),
          deletedAt: x.deletedAt || x.updatedAt || isoNow()
        }));
    });
    return out;
  }

  async function pullRemote() {
    const data = await fetchGet(API_URL);

    const clientes = deserializeClients(data.clientes || []);
    const produtos = deserializeProducts(data.produtos || []);
    const vendas = deserializeVendas(data.vendas || []);
    const pagamentos = deserializePagamentos(data.recebimentos || [], vendas, clientes);
    const creditos = deserializeCreditos(data.cobrancas || [], clientes);

    const deletedRowsRaw = Array.isArray(data._deleted) ? data._deleted : [];
    const deletedByLocal = {
      clientes: [],
      produtos: [],
      vendas: [],
      pagamentos: [],
      creditos: []
    };

    deletedRowsRaw.forEach(r => {
      if (!r || !r.id) return;
      const localName = remoteSheetToLocalName(String(r.sheet || ""));
      if (!deletedByLocal[localName]) return;

      deletedByLocal[localName].push({
        id: String(r.id),
        sheet: String(r.sheet || ""),
        createdAt: r.createdAt || r.data || r.deletedAt || r.updatedAt || isoNow(),
        data: r.data || r.createdAt || r.deletedAt || r.updatedAt || isoNow(),
        updatedAt: r.updatedAt || r.deletedAt || isoNow(),
        deletedAt: r.deletedAt || r.updatedAt || isoNow()
      });
    });

    return {
      clientes,
      produtos,
      vendas,
      pagamentos,
      creditos,
      deleted: deletedByLocal
    };
  }

  function mergeTable(localRows, localDeleted, remoteRows, remoteDeleted) {
    const mergedMap = mergeMaps(
      [].concat(localRows || [], localDeleted || []),
      [].concat(remoteRows || [], remoteDeleted || [])
    );

    const active = [];
    const deleted = [];

    mergedMap.forEach(row => {
      if (row.deletedAt) deleted.push(clone(row));
      else active.push(clone(row));
    });

    return { active, deleted, all: active.concat(deleted) };
  }

  function mergeAll(localState, localDeletedState, remoteState) {
    return {
      clientes: mergeTable(localState.clientes, localDeletedState.clientes, remoteState.clientes, remoteState.deleted.clientes),
      produtos: mergeTable(localState.produtos, localDeletedState.produtos, remoteState.produtos, remoteState.deleted.produtos),
      vendas: mergeTable(localState.vendas, localDeletedState.vendas, remoteState.vendas, remoteState.deleted.vendas),
      pagamentos: mergeTable(localState.pagamentos, localDeletedState.pagamentos, remoteState.pagamentos, remoteState.deleted.pagamentos),
      creditos: mergeTable(localState.creditos, localDeletedState.creditos, remoteState.creditos, remoteState.deleted.creditos)
    };
  }

  async function pushMergedState(merged) {
    await postSheet({ action: "upsert", sheet: "clientes", rows: serializeClients(merged.clientes.all) });
    await postSheet({ action: "upsert", sheet: "produtos", rows: serializeProducts(merged.produtos.all) });
    await postSheet({ action: "upsert", sheet: "vendas", rows: serializeVendas(merged.vendas.all) });
    await postSheet({ action: "upsert", sheet: "recebimentos", rows: serializePagamentos(merged.pagamentos.all) });
    await postSheet({ action: "upsert", sheet: "cobrancas", rows: serializeCreditos(merged.creditos.all, merged.clientes.active) });

    const deletedRows = []
      .concat(serializeDeletedRows("clientes", merged.clientes.deleted))
      .concat(serializeDeletedRows("produtos", merged.produtos.deleted))
      .concat(serializeDeletedRows("vendas", merged.vendas.deleted))
      .concat(serializeDeletedRows("pagamentos", merged.pagamentos.deleted))
      .concat(serializeDeletedRows("creditos", merged.creditos.deleted));

    await postSheet({ action: "upsert", sheet: "_deleted", rows: deletedRows });
  }

  function writeMergedLocal(merged) {
    TABLES.forEach(name => {
      writeLocal(name, merged[name].active);
      writeDeleted(name, merged[name].deleted);
    });
    _rawSet("bm_last_sync_at", isoNow());
  }

  function setStatus(text, isError) {
    let el = document.getElementById("belaSheetsSyncStatus");
    if (!el) {
      el = document.createElement("div");
      el.id = "belaSheetsSyncStatus";
      el.style.cssText = [
        "position:fixed",
        "right:12px",
        "bottom:126px",
        "z-index:99999",
        "padding:8px 10px",
        "border-radius:999px",
        "color:#fff",
        "font-size:12px",
        "box-shadow:0 8px 18px rgba(0,0,0,.18)",
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
      "position:fixed",
      "right:12px",
      "bottom:82px",
      "z-index:99999",
      "border:none",
      "border-radius:14px",
      "padding:10px 12px",
      "font-weight:800",
      "cursor:pointer",
      "box-shadow:0 10px 24px rgba(0,0,0,.12)",
      "background:#b14f4f",
      "color:#fff"
    ].join(";");
    btn.onclick = function () { syncNow(); };
    document.body.appendChild(btn);
  }

  let syncTimer = null;
  let debounceTimer = null;
  let syncing = false;
  let patchDone = false;
  let _rawSet = localStorage.setItem.bind(localStorage);

  function scheduleSync() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(syncNow, 1200);
  }

  function patchStorage() {
    if (patchDone) return;
    patchDone = true;

    localStorage.setItem = function (key, value) {
      const strKey = String(key);

      if (/^bm_(clientes|produtos|vendas|pagamentos|creditos)$/.test(strKey)) {
        const name = strKey.replace(/^bm_/, "");
        const prevRows = safeParse(localStorage.getItem(strKey) || "[]", []);
        const nextRows = safeParse(String(value || "[]"), []);
        const prevDeleted = readDeleted(name);
        const addedTombstones = buildTombstones(prevRows, nextRows).map(t => {
          t.sheet = localNameToRemoteSheet(name);
          return t;
        });
        const nextDeleted = mergeTombstones(prevDeleted, addedTombstones, nextRows);
        writeDeleted(name, nextDeleted);
      }

      _rawSet(key, value);

      if (/^bm_(clientes|produtos|vendas|pagamentos|creditos)$/.test(strKey)) {
        scheduleSync();
      }
    };
  }

  async function syncNow() {
    if (syncing) return;
    syncing = true;

    try {
      setStatus("☁ Sincronizando...");

      const localState = normalizeAllLocal(collectState());
      const localDeletedState = normalizeDeleted(collectDeletedState());
      const remoteState = await pullRemote();
      const merged = mergeAll(localState, localDeletedState, remoteState);

      writeMergedLocal(merged);
      await pushMergedState(merged);

      setStatus(
        "✓ Sincronizado " +
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );

      return merged;
    } catch (err) {
      console.error("Erro ao sincronizar:", err);
      setStatus("✗ Erro na sincronização", true);
      throw err;
    } finally {
      syncing = false;
    }
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

  window.BelaSheetsSync = {
    syncNow,
    scheduleSync,
    isoNow
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
