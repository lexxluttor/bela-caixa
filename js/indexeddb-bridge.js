/* Bela Caixa — ponte de persistencia IndexedDB.
 * Preparada para integracao posterior ao boot do app-core e sheets-sync.
 * Nao inicia sozinha, nao altera localStorage e nao envia dados ao Sheets.
 */
(function(global){
"use strict";
const COLECOES=["clientes","produtos","vendas","pagamentos","creditos","fiados","vendedores","comissoes","fechamentos_comissoes"];
let cache=Object.create(null);
let ready=false;
let writeQueue=Promise.resolve();
let lastError=null;
let initPromise=null;
function clone(v){return JSON.parse(JSON.stringify(v));}
function assertReady(){if(!ready)throw new Error("IndexedDB ainda nao foi carregado. Operacao bloqueada para proteger os dados.");}
async function hydrate(){
 if(initPromise)return initPromise;
 initPromise=(async function(){
  if(!global.BelaIndexedDB)throw new Error("Modulo IndexedDB nao carregado.");
  const staged=Object.create(null);
  for(const nome of COLECOES){
   const key="bm_"+nome;
   const value=await global.BelaIndexedDB.get(key);
   if(value===undefined)throw new Error("Colecao ausente no IndexedDB: "+nome+". Nao iniciar com base vazia.");
   if(!Array.isArray(value))throw new Error("Colecao invalida: "+nome);
   staged[nome]=value;
  }
  cache=staged;
  ready=true;
  return COLECOES.map(function(nome){return {nome:nome,registros:cache[nome].length};});
 })().catch(function(e){lastError=e;ready=false;initPromise=null;throw e;});
 return initPromise;
}
function get(nome){assertReady();if(!Object.prototype.hasOwnProperty.call(cache,nome))throw new Error("Colecao nao configurada: "+nome);return clone(cache[nome]);}
function set(nome,value){
 assertReady();
 if(!COLECOES.includes(nome))throw new Error("Colecao nao configurada: "+nome);
 if(!Array.isArray(value))throw new Error("Dados invalidos para "+nome);
 const snapshot=clone(value);
 // Escritas sequenciais evitam inversao de ordem entre operacoes.
 writeQueue=writeQueue.then(async function(){
  await global.BelaIndexedDB.set("bm_"+nome,snapshot);
  cache[nome]=snapshot;
 }).catch(function(e){lastError=e;ready=false;throw e;});
 return writeQueue;
}
function flush(){return writeQueue;}
function status(){return {ready:ready,colecoes:ready?COLECOES.map(function(nome){return {nome:nome,registros:cache[nome].length};}):[],erro:lastError?String(lastError.message||lastError):null};}
global.BelaIDBBridge=Object.freeze({hydrate:hydrate,get:get,set:set,flush:flush,status:status,collections:COLECOES.slice()});
})(window);
