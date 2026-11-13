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
// Preparacao explicita e segura: copia dados locais para o IndexedDB sem mudar o modo ativo.
// Nunca substitui colecoes ja existentes e nao aceita origem vazia ou incompleta.
async function prepararDoLocal(){
 if(ready || initPromise)throw new Error("Ponte ja inicializada; preparacao bloqueada.");
 if(!global.BelaIndexedDB)throw new Error("Modulo IndexedDB nao carregado.");
 if(global.BELA_CAIXA_STORAGE_MODE === "indexeddb")throw new Error("Preparacao exige modo localStorage.");
 const staged=Object.create(null);
 for(const nome of COLECOES){
  const raw=global.localStorage.getItem("bm_"+nome);
  if(raw === null){
   if(["clientes","produtos","vendas","pagamentos","creditos"].includes(nome))
    throw new Error("Colecao obrigatoria ausente no localStorage: "+nome);
   staged[nome]=[];
  }else{
   const parsed=JSON.parse(raw);
   if(!Array.isArray(parsed))throw new Error("Colecao local invalida: "+nome);
   staged[nome]=parsed;
  }
 }
 if(!staged.clientes.length || !staged.produtos.length || !staged.vendas.length)
  throw new Error("Origem incompleta; preparacao cancelada.");
 const existentes=await global.BelaIndexedDB.keys();
 if(existentes.some(function(k){return String(k).startsWith("bm_");}))
  throw new Error("IndexedDB ja possui colecoes. Nenhum dado foi sobrescrito.");
 for(const nome of COLECOES){
  await global.BelaIndexedDB.set("bm_"+nome,clone(staged[nome]));
 }
 for(const nome of COLECOES){
  const verificado=await global.BelaIndexedDB.get("bm_"+nome);
  if(!Array.isArray(verificado) || JSON.stringify(verificado)!==JSON.stringify(staged[nome]))
   throw new Error("Falha na verificacao de "+nome+"; nao ativar IndexedDB.");
 }
 return COLECOES.map(function(nome){return {nome:nome,registros:staged[nome].length};});
}
function get(nome){assertReady();if(!Object.prototype.hasOwnProperty.call(cache,nome))throw new Error("Colecao nao configurada: "+nome);return clone(cache[nome]);}
function set(nome,value){
 assertReady();
 if(!COLECOES.includes(nome))throw new Error("Colecao nao configurada: "+nome);
 if(!Array.isArray(value))throw new Error("Dados invalidos para "+nome);
 const snapshot=clone(value);
 // Escritas sequenciais evitam inversao de ordem entre operacoes.
 cache[nome]=snapshot;
 const operation=writeQueue.then(function(){return global.BelaIndexedDB.set("bm_"+nome,snapshot);});
 writeQueue=operation.catch(function(e){lastError=e;ready=false;});
 return operation;
}
function flush(){return writeQueue.then(function(){if(lastError)throw lastError;});}
function status(){return {ready:ready,colecoes:ready?COLECOES.map(function(nome){return {nome:nome,registros:cache[nome].length};}):[],erro:lastError?String(lastError.message||lastError):null};}
global.BelaIDBBridge=Object.freeze({hydrate:hydrate,prepararDoLocal:prepararDoLocal,get:get,set:set,flush:flush,status:status,collections:COLECOES.slice()});
})(window);
