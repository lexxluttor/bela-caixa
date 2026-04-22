/*!
Bela Modas Sheets Sync — restauração conservadora
Sincroniza inclusões, edições e exclusões
Desktop escreve / mobile consulta
+ restauração automática do servidor
+ preservação de datas originais
+ sem recriar cobrancas automaticamente
*/

(function () {

"use strict";

const API_URL =
"https://script.google.com/macros/s/AKfycbxvE2DpOpZDW1bZOvatqdN0HjSOXI3gvFdGPSj7qeUb6NF2V-K18-5tpil1KGW4O1lB/exec";

const SYNC_INTERVAL = 25000;
let syncEmAndamento = false;
let restoreEmAndamento = false;

/* DATA */

function agoraISO(){
  const d = new Date();
  return d.getFullYear()+"-"+
    String(d.getMonth()+1).padStart(2,"0")+"-"+
    String(d.getDate()).padStart(2,"0")+"T"+
    String(d.getHours()).padStart(2,"0")+":"+
    String(d.getMinutes()).padStart(2,"0")+":"+
    String(d.getSeconds()).padStart(2,"0");
}

function numeroSeguro(v){
  const n = Number(String(v ?? "").replace(",","."));
  return Number.isFinite(n) ? n : 0;
}

function safeParseJson(v, fallback){
  if(Array.isArray(v)) return v;
  if(v == null || v === "") return fallback;
  try{
    return JSON.parse(v);
  }catch(e){
    return fallback;
  }
}

function dataOriginal(v){
  return v && (v.data || v.createdAt || "") || "";
}

function createdOriginal(v){
  return v && (v.createdAt || v.data || "") || "";
}

function updatedOriginal(v){
  return v && (v.updatedAt || v.createdAt || v.data || "") || "";
}

/* STORAGE */

function lerLocal(nome){
  try{
    return JSON.parse(localStorage.getItem("bm_"+nome) || "[]");
  }catch(e){
    return [];
  }
}

function lerDeleted(nome){
  try{
    return JSON.parse(localStorage.getItem("bm_deleted_"+nome) || "[]");
  }catch(e){
    return [];
  }
}

function salvarDeleted(nome,dados){
  localStorage.setItem("bm_deleted_"+nome, JSON.stringify(dados||[]));
}

/* DETECTAR REMOÇÕES */

function detectarRemovidos(nome,antes,depois){
  const mapaDepois = new Set((depois || []).map(x=>String(x.id)));

  const removidos = (antes || [])
    .filter(x=>!mapaDepois.has(String(x.id)))
    .map(x=>({
      ...x,
      deletedAt: agoraISO(),
      updatedAt: agoraISO()
    }));

  if(removidos.length){
    const antigos = lerDeleted(nome);
    salvarDeleted(nome, [...antigos, ...removidos]);
  }
}

/* BACKUP */

function salvarBackup(){
  localStorage.setItem(
    "bm_backup",
    JSON.stringify({
      data: agoraISO(),
      clientes: lerLocal("clientes"),
      produtos: lerLocal("produtos"),
      vendas: lerLocal("vendas"),
      pagamentos: lerLocal("pagamentos"),
      creditos: lerLocal("creditos")
    })
  );
}

/* ENVIO */

async function enviar(body){
  const params = new URLSearchParams();
  params.append("payload", JSON.stringify(body));

  const r = await fetch(API_URL, {
    method:"POST",
    headers:{
      "Content-Type":"application/x-www-form-urlencoded"
    },
    body:params.toString()
  });

  const txt = await r.text();
  let json = {};

  try{
    json = JSON.parse(txt);
  }catch(e){
    throw new Error("Resposta inválida do Apps Script");
  }

  if(!r.ok || json.ok === false){
    throw new Error(json.error || "Falha ao sincronizar");
  }

  return json;
}

/* BUSCA DO SERVIDOR */

async function buscarTudoServidor(){
  const r = await fetch(API_URL + "?action=getAll");
  const txt = await r.text();

  let json = {};
  try{
    json = JSON.parse(txt);
  }catch(e){
    throw new Error("Resposta inválida ao restaurar dados");
  }

  if(!r.ok || json.ok === false){
    throw new Error(json.error || "Falha ao buscar dados do servidor");
  }

  return json;
}

/* NORMALIZAÇÃO PARA O FORMATO LOCAL QUE O INDEX JÁ USA */

function normalizarProduto(p){
  const eanPrincipal = String(p && p.ean || "").trim();
  const codigosExtras = String(
    p && p.codigos_barras != null
      ? p.codigos_barras
      : (p && p.codigosBarras != null ? p.codigosBarras : "")
  ).trim();

  return {
    id: p && p.id || "",
    cod: p && p.cod || "",
    nome: p && p.nome || "",
    cat: p && p.cat || "",
    grupo: p && p.grupo || "",
    subcategoria: p && p.subcategoria || "",
    subcat: (p && (p.subcategoria || p.subcat || p.cat)) || "",
    preco: numeroSeguro(p && p.preco),
    custo: numeroSeguro(p && p.custo),
    estoque: numeroSeguro(p && p.estoque),
    ean: eanPrincipal,
    codigos_barras: codigosExtras,
    ncm: p && p.ncm || "",
    origem: p && p.origem || "0",
    csosn: p && p.csosn || "102",
    cfop: p && p.cfop || "5102",
    createdAt: createdOriginal(p),
    updatedAt: updatedOriginal(p),
    deletedAt: p && p.deletedAt || ""
  };
}

function normalizarCliente(c){
  return {
    id: c && c.id || "",
    nome: c && c.nome || "",
    telefone: c && (c.telefone || c.tel) || "",
    cpf: c && c.cpf || "",
    endereco: c && (c.endereco || c.end) || "",
    obs: c && c.obs || "",
    data: dataOriginal(c),
    createdAt: createdOriginal(c),
    updatedAt: updatedOriginal(c),
    deletedAt: c && c.deletedAt || ""
  };
}

function normalizarVenda(v){
  return {
    id: v && v.id || "",
    cid: v && v.cid || "",
    cliente: v && (v.cliente || v.cliNome) || "",
    cliNome: v && (v.cliente || v.cliNome) || "",
    forma_pagamento: v && (v.forma_pagamento || v.forma) || "",
    forma: v && (v.forma_pagamento || v.forma) || "",
    total: numeroSeguro(v && v.total),
    itens_json: typeof (v && v.itens_json) === "string"
      ? v.itens_json
      : JSON.stringify(safeParseJson(v && v.itens_json, (v && v.itens) || [])),
    itens: safeParseJson(v && v.itens_json, (v && v.itens) || []),
    data: dataOriginal(v),
    createdAt: createdOriginal(v),
    updatedAt: updatedOriginal(v),
    deletedAt: v && v.deletedAt || ""
  };
}

function normalizarPagamento(p){
  return {
    id: p && p.id || "",
    cid: p && p.cid || "",
    venda_id: p && (p.venda_id || p.vid) || "",
    vid: p && (p.venda_id || p.vid) || "",
    valor: numeroSeguro(p && (p.valor ?? p.val)),
    val: numeroSeguro(p && (p.valor ?? p.val)),
    forma_pagamento: p && (p.forma_pagamento || p.forma) || "",
    forma: p && (p.forma_pagamento || p.forma) || "",
    obs: p && p.obs || "",
    data: dataOriginal(p),
    createdAt: createdOriginal(p),
    updatedAt: updatedOriginal(p),
    deletedAt: p && p.deletedAt || ""
  };
}

function normalizarCredito(c){
  return {
    id: c && c.id || "",
    cid: c && c.cid || "",
    vid: c && (c.vid || c.venda_id) || "",
    venda_id: c && (c.vid || c.venda_id) || "",
    cliente: c && (c.cliente || c.cliNome) || "",
    cliNome: c && (c.cliente || c.cliNome) || "",
    descricao: c && (c.descricao || c.desc) || "",
    desc: c && (c.descricao || c.desc) || "",
    valor: numeroSeguro(c && (c.valor ?? c.val)),
    val: numeroSeguro(c && (c.valor ?? c.val)),
    status: c && c.status || "aberto",
    vencimento: c && c.vencimento || "",
    data: dataOriginal(c),
    createdAt: createdOriginal(c),
    updatedAt: updatedOriginal(c),
    deletedAt: c && c.deletedAt || ""
  };
}

/* RESTAURAÇÃO */

function localVazio(){
  return (
    lerLocal("clientes").length === 0 &&
    lerLocal("produtos").length === 0 &&
    lerLocal("vendas").length === 0
  );
}

async function restaurarDoServidor(opcoes){
  if(restoreEmAndamento) return false;
  restoreEmAndamento = true;

  try{
    const dados = await buscarTudoServidor();

    const clientes = (dados.clientes || []).map(normalizarCliente);
    const produtos = (dados.produtos || []).map(normalizarProduto);
    const vendas = (dados.vendas || []).map(normalizarVenda);
    const pagamentos = (dados.recebimentos || []).map(normalizarPagamento);

    // conservador: só usa cobrancas se vier do servidor
    const creditos = (dados.cobrancas || []).map(normalizarCredito);

    localStorage.setItem("bm_clientes", JSON.stringify(clientes));
    localStorage.setItem("bm_produtos", JSON.stringify(produtos));
    localStorage.setItem("bm_vendas", JSON.stringify(vendas));
    localStorage.setItem("bm_pagamentos", JSON.stringify(pagamentos));
    localStorage.setItem("bm_creditos", JSON.stringify(creditos));
    localStorage.setItem("bm_last_restore", agoraISO());

    if(opcoes && opcoes.reload){
      location.reload();
    }

    return true;
  }catch(e){
    console.error("Erro ao restaurar dados do servidor:", e);
    localStorage.setItem("bm_last_restore_error", String(e && e.message || e));
    return false;
  }finally{
    restoreEmAndamento = false;
  }
}

/* SYNC */

async function enviarTudo(){
  if(syncEmAndamento) return;
  syncEmAndamento = true;

  try{
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
      action:"upsert",
      sheet:"clientes",
      rows: clientes.map(normalizarCliente).concat(clientesDeleted.map(normalizarCliente))
    });

    await enviar({
      action:"upsert",
      sheet:"produtos",
      rows: produtos.map(normalizarProduto).concat(produtosDeleted.map(normalizarProduto))
    });

    await enviar({
      action:"upsert",
      sheet:"vendas",
      rows: vendas.map(normalizarVenda).concat(vendasDeleted.map(normalizarVenda))
    });

    await enviar({
      action:"upsert",
      sheet:"recebimentos",
      rows: pagamentos.map(normalizarPagamento).concat(pagamentosDeleted.map(normalizarPagamento))
    });

    await enviar({
      action:"upsert",
      sheet:"cobrancas",
      rows: creditos.map(normalizarCredito).concat(creditosDeleted.map(normalizarCredito))
    });

    localStorage.setItem("bm_last_sync", agoraISO());

  }catch(e){
    console.error("Erro na sincronização Bela Modas:", e);
    localStorage.setItem("bm_last_sync_error", String(e && e.message || e));
    throw e;
  }finally{
    syncEmAndamento = false;
  }
}

/* DETECTAR ALTERAÇÃO LOCAL */

const originalSetItem = localStorage.setItem;

localStorage.setItem = function(k,v){
  const nome = String(k).replace("bm_","");

  if(["clientes","produtos","vendas","pagamentos","creditos"].includes(nome)){
    const antes = lerLocal(nome);

    originalSetItem.call(localStorage,k,v);

    const depois = lerLocal(nome);

    detectarRemovidos(nome,antes,depois);

    enviarTudo().catch(function(err){
      console.error(err);
    });

    return;
  }

  originalSetItem.call(localStorage,k,v);
};

/* INICIALIZAÇÃO */

async function initRestauracaoAutomatica(){
  try{
    if(localVazio()){
      const ok = await restaurarDoServidor();
      if(ok){
        console.log("Bela Modas: dados restaurados automaticamente do servidor.");
      }
    }
  }catch(e){
    console.error(e);
  }
}

initRestauracaoAutomatica();

setInterval(function(){
  enviarTudo().catch(function(err){
    console.error(err);
  });
}, SYNC_INTERVAL);

window.BelaSheetsSync = {
  syncNow: enviarTudo,
  restoreNow: function(){
    return restaurarDoServidor({ reload:true });
  }
};

})();
