/* Bela Caixa — motor IndexedDB v2 (preparação segura, não ativado no caixa).
 * Preserva localStorage. Nenhum código deste arquivo é executado até ser
 * explicitamente importado pelo aplicativo.
 */
(function(global){
"use strict";
const DB_NAME=global.BELA_INDEXEDDB_TEST_NAME || "bela-caixa-v2", STORE="datasets";
function open(){
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:"name"});};
  req.onerror=()=>reject(req.error);
  req.onsuccess=()=>resolve(req.result);
 });
}
function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function read(name){
 const db=await open();
 try{const tx=db.transaction(STORE,"readonly");const record=await request(tx.objectStore(STORE).get(name));return record?JSON.parse(record.raw):null;}
 finally{db.close();}
}
function validateRows(name,rows){if(!Array.isArray(rows))throw new Error("Conjunto inválido: "+name);}
async function writeBatch(changes){
 const keys=Object.keys(changes);
 keys.forEach(k=>validateRows(k,changes[k]));
 const db=await open();
 try{
  await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,"readwrite");
   tx.oncomplete=resolve;
   tx.onerror=()=>reject(tx.error||new Error("Falha ao gravar"));
   tx.onabort=()=>reject(tx.error||new Error("Gravação cancelada"));
   const store=tx.objectStore(STORE);
   keys.forEach(name=>store.put({name,raw:JSON.stringify(changes[name]),count:changes[name].length,updatedAt:new Date().toISOString()}));
  });
 }finally{db.close();}
}
function stockAfter(items,products,mode){
 const next=products.map(p=>({...p}));
 for(const item of items||[]){
  if(!item)continue;
  const pid=item.pid||item.produto_id||item.idProduto||item.id;
  const qty=Number(item.qtd ?? item.qty ?? item.quantidade ?? 0);
  if(!pid||!Number.isFinite(qty)||qty<=0)continue;
  const p=next.find(x=>String(x.id)===String(pid));
  if(!p)throw new Error("Produto da venda não encontrado: "+pid);
  const previous=Number(p.estq!=null?p.estq:(p.estoque!=null?p.estoque:0))||0;
  p.estq=mode==="somar"?previous+qty:Math.max(0,previous-qty);
 }
 return next;
}
// One transaction writes sales, products and credit together.
// The caller must wait for this promise before showing sale success.
async function commitSale(venda,credito,expected){
 if(!venda||!venda.id||!Array.isArray(venda.itens))throw new Error("Venda inválida");
 const db=await open();
 try{
  await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE);
   let records={},failed=false;
   const names=credito?["vendas","produtos","creditos"]:["vendas","produtos"];
   tx.oncomplete=resolve;
   tx.onerror=()=>reject(tx.error||new Error("Falha na transação da venda"));
   tx.onabort=()=>reject(tx.error||new Error("Venda não gravada"));
   names.forEach(name=>{
    const req=store.get(name);
    req.onsuccess=()=>{
     if(failed)return;
     try{
      if(!req.result)throw new Error("Base não migrada: "+name);
      const arr=JSON.parse(req.result.raw);
      validateRows(name,arr);
      records[name]=arr;
      if(Object.keys(records).length!==names.length)return;
      if(records.vendas.some(v=>String(v.id)===String(venda.id)))throw new Error("Venda duplicada");
      if(expected){
        for(const n of names){
          if(JSON.stringify(records[n])!==JSON.stringify(expected[n]))throw new Error("Cópia IndexedDB desatualizada: "+n);
        }
      }
      records.vendas.push(venda);
      records.produtos=stockAfter(venda.itens,records.produtos,"subtrair");
      if(credito){
        if(records.creditos.some(c=>String(c.id)===String(credito.id)))throw new Error("Crédito duplicado");
        records.creditos.push(credito);
      }
      names.forEach(n=>store.put({name:n,raw:JSON.stringify(records[n]),count:records[n].length,updatedAt:new Date().toISOString()}));
     }catch(e){failed=true;try{tx.abort();}catch(_){} reject(e);}
    };
   });
  });
 }finally{db.close();}
}
// Verifica se a cópia do IndexedDB ainda corresponde ao localStorage.
// Não ativar commitSale enquanto outras rotinas continuarem gravando só no localStorage.
async function verificarConsistencia(names){
 const keys=names||["produtos","vendas","clientes","pagamentos","creditos","comissoes","entradas","vendedores","fechamentos_comissoes","fiados"];
 const result=[];
 for(const name of keys){
  const raw=localStorage.getItem("bm_"+name);
  const idb=await read(name);
  const local=raw===null?null:JSON.parse(raw);
  const igual=JSON.stringify(local)===JSON.stringify(idb);
  result.push({name,igual,local:local&&local.length,idb:idb&&idb.length});
 }
 return {seguro:result.every(r=>r.igual),conjuntos:result};
}
global.BelaIndexedDB={open,read,writeBatch,commitSale,verificarConsistencia};
})(window);
