/*!
Bela Modas Sheets Sync — versão estável corrigida
Sincroniza inclusões, edições e exclusões
Desktop escreve / mobile consulta
*/

(function () {

"use strict";

const API_URL =
"https://script.google.com/macros/s/AKfycbzH4m2rIWkzHLf_SPldVWBk6uSbhmwWz_OLZENRr0A-9XOzCtHsU5fbLtJCm-ZKss0k/exec";

const SYNC_INTERVAL = 25000;


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


/* STORAGE */

function lerLocal(nome){

try{

return JSON.parse(

localStorage.getItem("bm_"+nome) || "[]"

);

}catch(e){

return [];

}

}


function lerDeleted(nome){

try{

return JSON.parse(

localStorage.getItem("bm_deleted_"+nome) || "[]"

);

}catch(e){

return [];

}

}


function salvarDeleted(nome,dados){

localStorage.setItem(

"bm_deleted_"+nome,

JSON.stringify(dados||[])

);

}


/* DETECTAR REMOÇÕES */

function detectarRemovidos(nome,antes,depois){

const mapaDepois = new Set(

depois.map(x=>String(x.id))

);


const removidos = antes

.filter(x=>!mapaDepois.has(String(x.id)))

.map(x=>({

...x,

deletedAt: agoraISO(),

updatedAt: agoraISO()

}));


if(removidos.length){

const antigos = lerDeleted(nome);


salvarDeleted(

nome,

[...antigos,...removidos]

);

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

params.append(

"payload",

JSON.stringify(body)

);


const r = await fetch(

API_URL,

{

method:"POST",

headers:{

"Content-Type":

"application/x-www-form-urlencoded"

},

body:params.toString()

}

);


return JSON.parse(await r.text());

}


/* NORMALIZAÇÃO */

function normalizarProduto(p){

return {

id:p.id,

cod:p.cod||"",

nome:p.nome||"",

cat:p.cat||"",

preco:Number(p.preco||0),

custo:Number(p.custo||0),

estoque:Number(p.estoque||0),

ean:p.ean||"",

ncm:p.ncm||"",

origem:p.origem||"0",

csosn:p.csosn||"102",

cfop:p.cfop||"5102",

createdAt:p.createdAt||agoraISO(),

updatedAt:p.updatedAt||agoraISO(),

deletedAt:p.deletedAt||""

};

}


function normalizarCliente(c){

return {

id:c.id,

nome:c.nome||"",

telefone:c.telefone||c.tel||"",

cpf:c.cpf||"",

endereco:c.endereco||c.end||"",

obs:c.obs||"",

createdAt:c.createdAt||agoraISO(),

updatedAt:c.updatedAt||agoraISO(),

deletedAt:c.deletedAt||""

};

}


function normalizarVenda(v){

return {

id:v.id,

cid:v.cid||"",

cliente:v.cliente||"",

forma_pagamento:v.forma_pagamento||"",

total:Number(v.total||0),

itens_json:JSON.stringify(v.itens||[]),

data:v.data||agoraISO(),

createdAt:v.createdAt||agoraISO(),

updatedAt:v.updatedAt||agoraISO(),

deletedAt:v.deletedAt||""

};

}


function normalizarPagamento(p){

return {

id:p.id,

cid:p.cid||"",

venda_id:p.venda_id||"",

valor:Number(p.valor||0),

forma_pagamento:p.forma_pagamento||"",

createdAt:p.createdAt||agoraISO(),

updatedAt:p.updatedAt||agoraISO(),

deletedAt:p.deletedAt||""

};

}


function normalizarCredito(c){

return {

id:c.id,

cid:c.cid||"",

vid:c.vid||"",

valor:Number(c.valor||0),

status:c.status||"aberto",

vencimento:c.vencimento||agoraISO(),

createdAt:c.createdAt||agoraISO(),

updatedAt:c.updatedAt||agoraISO(),

deletedAt:c.deletedAt||""

};

}


/* SYNC */

async function enviarTudo(){

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

rows:

clientes

.map(normalizarCliente)

.concat(

clientesDeleted.map(normalizarCliente)

)

});


await enviar({

action:"upsert",

sheet:"produtos",

rows:

produtos

.map(normalizarProduto)

.concat(

produtosDeleted.map(normalizarProduto)

)

});


await enviar({

action:"upsert",

sheet:"vendas",

rows:

vendas

.map(normalizarVenda)

.concat(

vendasDeleted.map(normalizarVenda)

)

});


await enviar({

action:"upsert",

sheet:"recebimentos",

rows:

pagamentos

.map(normalizarPagamento)

.concat(

pagamentosDeleted.map(normalizarPagamento)

)

});


await enviar({

action:"upsert",

sheet:"cobrancas",

rows:

creditos

.map(normalizarCredito)

.concat(

creditosDeleted.map(normalizarCredito)

)

});


localStorage.setItem(

"bm_last_sync",

agoraISO()

);

}


/* DETECTAR ALTERAÇÃO LOCAL */

const originalSetItem = localStorage.setItem;


localStorage.setItem = function(k,v){

const nome = String(k).replace("bm_","");


if(

["clientes","produtos","vendas","pagamentos","creditos"]

.includes(nome)

){

const antes = lerLocal(nome);


originalSetItem.call(localStorage,k,v);


const depois = lerLocal(nome);


detectarRemovidos(

nome,

antes,

depois

);


enviarTudo();


return;

}


originalSetItem.call(localStorage,k,v);

};


setInterval(

enviarTudo,

SYNC_INTERVAL

);


window.BelaSheetsSync = {

syncNow: enviarTudo

};

})();
