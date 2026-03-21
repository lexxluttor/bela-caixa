/*!
 * Bela Modas Sheets Sync — modo seguro
 * Desktop escreve / mobile consulta
 * Objetivo: nunca sobrescrever o local com remoto antigo
 */
(function () {
  "use strict";

  const API_URL = "https://script.google.com/macros/s/AKfycbzH4m2rIWkzHLf_SPldVWBk6uSbhmwWz_OLZENRr0A-9XOzCtHsU5fbLtJCm-ZKss0k/exec";
  const SYNC_INTERVAL_MS = 25000;

  function pad2(n){ return String(n).padStart(2, "0"); }

  function isoNow(){
    const d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth()+1) + "-" + pad2(d.getDate()) + "T" +
      pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
  }

  function safeParse(text, fallback){
    try { return JSON.parse(text); } catch(e) { return fallback; }
  }

  function readLocal(name){
    return safeParse(localStorage.getItem("bm_" + name) || "[]", []);
  }

  function backupLocalSnapshot(){
    const snapshot = {
      when: isoNow(),
      clientes: readLocal("clientes"),
      produtos: readLocal("produtos"),
      vendas: readLocal("vendas"),
      pagamentos: readLocal("pagamentos"),
      creditos: readLocal("creditos")
    };
    localStorage.setItem("bm_backup_latest", JSON.stringify(snapshot));
  }

  async function postSheet(body, tentativas){
    tentativas = tentativas || 3;

    for(let i = 0; i < tentativas; i++){
      try{
        const params = new URLSearchParams();
        params.append("payload", JSON.stringify(body));

        const r = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: params.toString(),
          cache: "no-store"
        });

        if(!r.ok) throw new Error("POST falhou: " + r.status);

        const text = await r.text();
        const data = safeParse(text, null);

        if(!data || data.ok !== true){
          throw new Error((data && data.error) || "Resposta inválida do servidor");
        }

        return data;
      }catch(err){
        if(i === tentativas - 1) throw err;
        await new Promise(r => setTimeout(r, 1200 * (i + 1)));
      }
    }
  }

  function normalizeClientLocal(c){
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

  function normalizeProductLocal(p){
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

  function normalizeVendaLocal(v){
    const stamp = v.updatedAt || v.createdAt || v.data || isoNow();
    return {
      id: String(v.id || ("ven_" + Math.random().toString(36).slice(2, 10))),
      cid: v.cid || "",
      cliNome: v.cliNome || v.cliente || "Balcão",
      forma: v.forma || v.forma_pagamento || "",
      subtotal: Number(v.subtotal || 0),
      desconto: Number(v.desconto || 0),
      total: Number(v.total || 0),
      itens: Array.isArray(v.itens) ? v.itens : [],
      data: v.data || stamp,
      createdAt: v.createdAt || v.data || stamp,
      updatedAt: v.updatedAt || stamp,
      deletedAt: v.deletedAt || ""
    };
  }

  function normalizePagamentoLocal(p){
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

  function normalizeCreditoLocal(c){
    const stamp = c.updatedAt || c.createdAt || c.data || isoNow();
    return {
      id: String(c.id || ("cre_" + Math.random().toString(36).slice(2, 10))),
      cid: c.cid || "",
      vid: c.vid || "",
      cliNome: c.cliNome || c.cliente || "",
      desc: c.desc || c.descricao || "",
      val: Number(c.val || c.valor || 0),
      status: c.status || "aberto",
      vencimento: c.vencimento || c.data || stamp,
      data: c.data || c.vencimento || stamp,
      createdAt: c.createdAt || c.data || stamp,
      updatedAt: c.updatedAt || stamp,
      deletedAt: c.deletedAt || ""
    };
  }

  function serializeClients(list){
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

  function serializeProducts(list){
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

  function serializeVendas(list){
    return (list || []).map(v => {
      v = normalizeVendaLocal(v);
      return {
        id: v.id,
        cid: v.cid,
        cliente: v.cliNome,
        total: v.total,
        subtotal: v.subtotal,
        desconto: v.desconto,
        forma_pagamento: v.forma,
        itens_json: JSON.stringify(v.itens || []),
        data: v.data,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        deletedAt: v.deletedAt
      };
    });
  }

  function serializePagamentos(list){
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

  function serializeCreditos(list, clientes){
    const cliById = new Map((clientes || []).map(c => [String(c.id), normalizeClientLocal(c)]));

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

  function setStatus(text, isError){
    let el = document.getElementById("belaSheetsSyncStatus");

    if(!el){
      el = document.createElement("div");
      el.id = "belaSheetsSyncStatus";
      el.style.cssText = [
        "position:fixed",
        "right:16px",
        "top:96px",
        "z-index:99999",
        "padding:7px 10px",
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

  function installButton(){
    if(document.getElementById("belaSheetsSyncButton")) return;

    const btn = document.createElement("button");
    btn.id = "belaSheetsSyncButton";
    btn.textContent = "⟳ Sincronizar";
    btn.style.cssText = [
      "position:fixed",
      "right:16px",
      "top:140px",
      "z-index:99999",
      "border:none",
      "border-radius:14px",
      "padding:8px 11px",
      "font-weight:800",
      "cursor:pointer",
      "box-shadow:0 10px 24px rgba(0,0,0,.12)",
      "background:#b14f4f",
      "color:#fff"
    ].join(";");

    btn.onclick = function(){
      syncNow(true);
    };

    document.body.appendChild(btn);
  }

  let debounceTimer = null;
  let syncing = false;
  let patchDone = false;
  let _rawSet = localStorage.setItem.bind(localStorage);

  async function pushLocalToRemote(){
    backupLocalSnapshot();

    const clientes = readLocal("clientes");
    const produtos = readLocal("produtos");
    const vendas = readLocal("vendas");
    const pagamentos = readLocal("pagamentos");
    const creditos = readLocal("creditos");

    // modo seguro: só empurra local para remoto usando upsert
    await postSheet({ action: "upsert", sheet: "clientes", rows: serializeClients(clientes) });
    await postSheet({ action: "upsert", sheet: "produtos", rows: serializeProducts(produtos) });
    await postSheet({ action: "upsert", sheet: "vendas", rows: serializeVendas(vendas) });
    await postSheet({ action: "upsert", sheet: "recebimentos", rows: serializePagamentos(pagamentos) });
    await postSheet({ action: "upsert", sheet: "cobrancas", rows: serializeCreditos(creditos, clientes) });

    _rawSet("bm_last_sync_at", isoNow());
  }

  async function syncNow(force){
    if(syncing) return;
    syncing = true;

    try{
      setStatus("☁ Sincronizando...");
      await pushLocalToRemote();
      setStatus("✓ Sincronizado " + new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" }));
    }catch(err){
      console.error("Erro ao sincronizar:", err);
      setStatus("✗ Erro na sincronização", true);
      if(force) throw err;
    }finally{
      syncing = false;
    }
  }

  function scheduleSync(){
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(syncNow, 900);
  }

  function patchStorage(){
    if(patchDone) return;
    patchDone = true;

    localStorage.setItem = function(key, value){
      _rawSet(key, value);

      if(/^bm_(clientes|produtos|vendas|pagamentos|creditos)$/.test(String(key))){
        scheduleSync();
      }
    };
  }

  function start(){
    installButton();
    patchStorage();

    // não faz pull remoto ao iniciar
    setStatus("✓ Pronto");

    window.addEventListener("focus", function(){});
    document.addEventListener("visibilitychange", function(){});

    setInterval(syncNow, SYNC_INTERVAL_MS);
  }

  window.BelaSheetsSync = {
    syncNow: syncNow,
    scheduleSync: scheduleSync,
    backupLocalSnapshot: backupLocalSnapshot
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  }else{
    start();
  }
})();
