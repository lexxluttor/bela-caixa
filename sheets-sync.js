/*!
Bela Modas Sheets Sync — versão estável
Compatível com movimentações por cliente
Mantém dados fiscais dos produtos
Desktop escreve / mobile consulta
*/
(function () {

"use strict";

const API_URL =
"https://script.google.com/macros/s/AKfycbzH4m2rIWkzHLf_SPldVWBk6uSbhmwWz_OLZENRr0A-9XOzCtHsU5fbLtJCm-ZKss0k/exec";

const SYNC_INTERVAL = 25000;

function agoraISO(){
const d = new Date();

return d.getFullYear()+"-"+
String(d.getMonth()+1).padStart(2,"0")+"-"+
String(d.getDate()).padStart(2,"0")+"T"+
String(d.getHours()).padStart(2,"0")+":"+
String(d.getMinutes()).padStart(2,"0")+":"+
String(d.getSeconds()).padStart(2,"0");
}

function lerLocal(nome){
try{
return JSON.parse(
localStorage.getItem("bm_"+nome) || "[]"
);
}catch(e){
return [];
}
}

function salvarBackup(){

const backup = {

data: agoraISO(),

clientes: lerLocal("clientes"),

produtos: lerLocal("produtos"),

vendas: lerLocal("vendas"),

pagamentos: lerLocal("pagamentos"),

creditos: lerLocal("creditos")

};

localStorage.setItem(
"bm_backup",
JSON.stringify(backup)
);

}

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

const txt = await r.text();

try{
return JSON.parse(txt);
}catch(e){

return {
ok:false,
erro:"resposta invalida"
};

}

}

function normalizarCliente(c){

const t =
c.updatedAt ||
c.createdAt ||
c.data ||
agoraISO();

return {

id:
String(
c.id ||
"cli_"+
Math.random()
.toString(36)
.slice(2,9)
),

nome:c.nome||"",

telefone:
c.tel||
c.telefone||
"",

cpf:c.cpf||"",

endereco:
c.end||
c.endereco||
"",

obs:c.obs||"",

data:
c.data||
t,

createdAt:
c.createdAt||
t,

updatedAt:
c.updatedAt||
t,

deletedAt:
c.deletedAt||""

};

}

function normalizarProduto(p){

const t =
p.updatedAt ||
p.createdAt ||
agoraISO();

return {

id:
String(
p.id ||
"pro_"+
Math.random()
.toString(36)
.slice(2,9)
),

cod:p.cod||"",

nome:p.nome||"",

cat:
p.cat||
p.categoria||
"",

preco:
Number(p.preco||0),

custo:
Number(p.custo||0),

estoque:
Number(
p.estq ??
p.estoque ??
0
),

ean:p.ean||"",

ncm:p.ncm||"",

desc2:p.desc2||"",

origem:p.origem||"0",

unidade:
p.unidade||"UN",

csosn:
p.csosn||"102",

cfop:
p.cfop||"5102",

escala:
p.escala||"S",

origem_estoque:
p.origem_estoque||
"manual",

createdAt:
p.createdAt||t,

updatedAt:
p.updatedAt||t,

deletedAt:
p.deletedAt||""

};

}

function normalizarVenda(v){

const t =
v.updatedAt ||
v.createdAt ||
v.data ||
agoraISO();

return {

id:
String(
v.id ||
"ven_"+
Math.random()
.toString(36)
.slice(2,9)
),

cid:v.cid||"",

cliente:
v.cliNome||
v.cliente||
"Balcão",

forma_pagamento:
v.forma||
v.forma_pagamento||
"",

subtotal:
Number(v.subtotal||0),

desconto:
Number(v.desconto||0),

total:
Number(v.total||0),

itens_json:
JSON.stringify(
v.itens||[]
),

data:
v.data||t,

createdAt:
v.createdAt||t,

updatedAt:
v.updatedAt||t,

deletedAt:
v.deletedAt||""

};

}

function normalizarPagamento(p){

const t =
p.updatedAt ||
p.createdAt ||
p.data ||
agoraISO();

return {

id:
String(
p.id ||
"pag_"+
Math.random()
.toString(36)
.slice(2,9)
),

cid:
p.cid||"",   // importante

venda_id:
p.vid||
(
p.cid
? "cid:"+p.cid
: ""
),

valor:
Number(
p.val||
p.valor||
0
),

forma_pagamento:
p.forma||
p.forma_pagamento||
"",

obs:p.obs||"",

data:
p.data||t,

createdAt:
p.createdAt||t,

updatedAt:
p.updatedAt||t,

deletedAt:
p.deletedAt||""

};

}

function normalizarCredito(c){

const t =
c.updatedAt ||
c.createdAt ||
c.data ||
agoraISO();

return {

id:
String(
c.id ||
"cre_"+
Math.random()
.toString(36)
.slice(2,9)
),

cid:c.cid||"",

vid:c.vid||"",

cliente:
c.cliNome||
c.cliente||
"",

descricao:
c.desc||
c.descricao||
"",

valor:
Number(
c.val||
c.valor||
0
),

status:
c.status||
"aberto",

vencimento:
c.vencimento||
c.data||
t,

data:
c.data||
t,

createdAt:
c.createdAt||t,

updatedAt:
c.updatedAt||t,

deletedAt:
c.deletedAt||""

};

}

async function enviarTudo(){

salvarBackup();

await enviar({

action:"upsert",

sheet:"clientes",

rows:
lerLocal("clientes")
.map(normalizarCliente)

});

await enviar({

action:"upsert",

sheet:"produtos",

rows:
lerLocal("produtos")
.map(normalizarProduto)

});

await enviar({

action:"upsert",

sheet:"vendas",

rows:
lerLocal("vendas")
.map(normalizarVenda)

});

await enviar({

action:"upsert",

sheet:"recebimentos",

rows:
lerLocal("pagamentos")
.map(normalizarPagamento)

});

await enviar({

action:"upsert",

sheet:"cobrancas",

rows:
lerLocal("creditos")
.map(normalizarCredito)

});

localStorage.setItem(
"bm_last_sync",
agoraISO()
);

}

let timer;

function agendar(){

clearTimeout(timer);

timer =
setTimeout(
enviarTudo,
800
);

}

const original =
localStorage.setItem;

localStorage.setItem =
function(k,v){

original.call(
localStorage,
k,
v
);

if(
String(k)
.match(
/bm_(clientes|produtos|vendas|pagamentos|creditos)/
)
){

agendar();

}

};

setInterval(
enviarTudo,
SYNC_INTERVAL
);

window.BelaSheetsSync = {

syncNow: enviarTudo

};

})();
