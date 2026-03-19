
(function(){
  const API_URL = window.BELA_SHEETS_API_URL || "";
  const SYNC_INTERVAL_MS = Number(window.BELA_SHEETS_SYNC_INTERVAL_MS || 120000);
  if(!API_URL){ console.warn("BELA_SHEETS_API_URL não configurada."); return; }

  function safeParse(v, fb){ try{ return JSON.parse(v); }catch(e){ return fb; } }
  function readLocal(name){ return safeParse(localStorage.getItem("bm_" + name) || "[]", []); }
  function writeLocal(name, rows){ localStorage.setItem("bm_" + name, JSON.stringify(Array.isArray(rows) ? rows : [])); }
  function isoNow(){ return new Date().toISOString(); }

  function fetchJson(url, opts){ return fetch(url, opts).then(r => r.json()); }
  function post(body){
    return fetchJson(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    });
  }

  function normalizeClientLocal(c){
    const stamp = c.updatedAt || c.createdAt || c.data || isoNow();
    return {
      id: c.id || ("cli_" + Math.random().toString(36).slice(2,10)),
      nome: c.nome || "",
      tel: c.tel || c.telefone || "",
      end: c.end || c.endereco || "",
      createdAt: c.createdAt || c.data || stamp,
      updatedAt: stamp
    };
  }
  function serializeClients(list){
    return (list || []).map(c => {
      c = normalizeClientLocal(c);
      return { id: c.id, nome: c.nome, telefone: c.tel, endereco: c.end, data: c.updatedAt };
    });
  }
  function deserializeClients(rows){
    return (rows || []).map(r => ({
      id: String(r.id || ""),
      nome: r.nome || "",
      tel: r.telefone || "",
      end: r.endereco || "",
      createdAt: r.data || isoNow(),
      updatedAt: r.data || isoNow()
    })).filter(x => x.id || x.nome);
  }

  function normalizeProductLocal(p){
    const stamp = p.updatedAt || p.createdAt || isoNow();
    return {
      id: p.id || ("pro_" + Math.random().toString(36).slice(2,10)),
      nome: p.nome || "",
      preco: Number(p.preco || 0),
      estq: Number(p.estq != null ? p.estq : (p.estoque != null ? p.estoque : 0)),
      updatedAt: stamp
    };
  }
  function serializeProducts(list){
    return (list || []).map(p => {
      p = normalizeProductLocal(p);
      return { id: p.id, nome: p.nome, preco: p.preco, estoque: p.estq };
    });
  }
  function deserializeProducts(rows){
    return (rows || []).map(r => ({
      id: String(r.id || ""),
      nome: r.nome || "",
      preco: Number(r.preco || 0),
      estq: Number(r.estoque || 0),
      createdAt: isoNow(),
      updatedAt: isoNow()
    })).filter(x => x.id || x.nome);
  }

  function normalizeVendaLocal(v){
    const stamp = v.updatedAt || v.createdAt || v.data || isoNow();
    return {
      id: v.id || ("ven_" + Math.random().toString(36).slice(2,10)),
      cliNome: v.cliNome || v.cliente || "Balcão",
      forma: v.forma || v.forma_pagamento || "",
      total: Number(v.total || 0),
      data: v.data || stamp,
      updatedAt: stamp
    };
  }
  function serializeVendas(list){
    return (list || []).map(v => {
      v = normalizeVendaLocal(v);
      return { id: v.id, cliente: v.cliNome, total: v.total, forma_pagamento: v.forma, data: v.data };
    });
  }
  function deserializeVendas(rows){
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

  function serializePagamentos(list){
    return (list || []).map(p => {
      const stamp = p.updatedAt || p.createdAt || p.data || isoNow();
      const vendaId = p.vid || (p.cid ? ("cid:" + p.cid) : "");
      return {
        id: p.id || ("pag_" + Math.random().toString(36).slice(2,10)),
        venda_id: vendaId,
        valor: Number(p.val || p.valor || 0),
        forma_pagamento: p.forma || p.forma_pagamento || "",
        data: p.data || stamp
      };
    });
  }
  function deserializePagamentos(rows, vendas, clientes){
    const vendaMap = new Map((vendas || []).map(v => [String(v.id), v]));
    const clientMapByName = new Map((clientes || []).map(c => [String(c.nome || "").toLowerCase(), c]));
    return (rows || []).map(r => {
      const vendaId = String(r.venda_id || "");
      let cid = "";
      if(vendaId.startsWith("cid:")) cid = vendaId.slice(4);
      if(!cid && vendaMap.has(vendaId)){
        const venda = vendaMap.get(vendaId);
        const cli = clientMapByName.get(String(venda.cliNome || "").toLowerCase());
        if(cli) cid = cli.id;
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

  function serializeCreditos(list, clientes){
    const cliById = new Map((clientes || []).map(c => [String(c.id), c]));
    return (list || []).map(c => {
      const stamp = c.updatedAt || c.createdAt || c.data || isoNow();
      const cli = cliById.get(String(c.cid || "")) || {};
      return {
        id: c.id || ("cre_" + Math.random().toString(36).slice(2,10)),
        cliente: c.cliNome || cli.nome || "",
        valor: Number(c.val || c.valor || 0),
        status: c.status || "aberto",
        vencimento: c.vencimento || c.data || stamp
      };
    });
  }
  function deserializeCreditos(rows, clientes){
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

  function setStatus(text){
    let el = document.getElementById("belaSheetsSyncStatus");
    if(!el){
      el = document.createElement("div");
      el.id = "belaSheetsSyncStatus";
      el.style.position = "fixed";
      el.style.right = "12px";
      el.style.bottom = "126px";
      el.style.zIndex = "99999";
      el.style.padding = "8px 10px";
      el.style.borderRadius = "999px";
      el.style.background = "rgba(17,24,39,.88)";
      el.style.color = "#fff";
      el.style.fontSize = "12px";
      el.style.boxShadow = "0 8px 18px rgba(0,0,0,.18)";
      document.body.appendChild(el);
    }
    el.textContent = text;
  }

  function installButton(){
    if(document.getElementById("belaSheetsSyncButton")) return;
    const btn = document.createElement("button");
    btn.id = "belaSheetsSyncButton";
    btn.textContent = "⟳ Sincronizar";
    btn.style.position = "fixed";
    btn.style.right = "12px";
    btn.style.bottom = "82px";
    btn.style.zIndex = "99999";
    btn.style.border = "none";
    btn.style.borderRadius = "14px";
    btn.style.padding = "10px 12px";
    btn.style.fontWeight = "800";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 10px 24px rgba(0,0,0,.12)";
    btn.style.background = "#b14f4f";
    btn.style.color = "#fff";
    btn.onclick = function(){ syncNow(); };
    document.body.appendChild(btn);
  }

  let syncTimer = null;
  let debounceTimer = null;
  let syncing = false;
  let patchDone = false;

  async function pullRemote(){
    const data = await fetchJson(API_URL);
    const clientes = deserializeClients(data.clientes || []);
    const produtos = deserializeProducts(data.produtos || []);
    const vendas = deserializeVendas(data.vendas || []);
    const pagamentos = deserializePagamentos(data.recebimentos || [], vendas, clientes);
    const creditos = deserializeCreditos(data.cobrancas || [], clientes);

    writeLocal("clientes", clientes);
    writeLocal("produtos", produtos);
    writeLocal("vendas", vendas);
    writeLocal("pagamentos", pagamentos);
    writeLocal("creditos", creditos);
  }

  async function pushLocal(){
    const clientes = readLocal("clientes");
    const produtos = readLocal("produtos");
    const vendas = readLocal("vendas");
    const pagamentos = readLocal("pagamentos");
    const creditos = readLocal("creditos");

    await post({ action:"replaceAll", sheet:"clientes", rows: serializeClients(clientes) });
    await post({ action:"replaceAll", sheet:"produtos", rows: serializeProducts(produtos) });
    await post({ action:"replaceAll", sheet:"vendas", rows: serializeVendas(vendas) });
    await post({ action:"replaceAll", sheet:"recebimentos", rows: serializePagamentos(pagamentos) });
    await post({ action:"replaceAll", sheet:"cobrancas", rows: serializeCreditos(creditos, clientes) });
  }

  async function syncNow(){
    if(syncing) return;
    syncing = true;
    try{
      setStatus("Sincronizando...");
      await pullRemote();
      await pushLocal();
      setStatus("Sincronizado");
      localStorage.setItem("bm_last_sync_at", isoNow());
    }catch(err){
      console.error("Erro ao sincronizar com planilha:", err);
      setStatus("Erro na sincronização");
    }finally{
      syncing = false;
    }
  }

  function scheduleSync(){
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(syncNow, 1200);
  }

  function patchStorage(){
    if(patchDone) return;
    patchDone = true;
    const raw = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(key, value){
      raw(key, value);
      if(/^bm_(clientes|produtos|vendas|pagamentos|creditos)$/.test(String(key))){
        scheduleSync();
      }
    };
  }

  function start(){
    installButton();
    patchStorage();
    syncNow();
    window.addEventListener("focus", syncNow);
    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState === "visible") syncNow();
    });
    clearInterval(syncTimer);
    syncTimer = setInterval(syncNow, SYNC_INTERVAL_MS);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  }else{
    start();
  }
})();
