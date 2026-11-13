/* Bela Caixa — IndexedDB, etapa 1.
 * Modulo independente: nao altera DB, localStorage ou sincronizacao.
 * So ativar a migracao apos testes e adaptacao do app-core e sheets-sync.
 */
(function (global) {
  "use strict";
  const NAME = "bela-caixa-db";
  const VERSION = 1;
  const STORE = "colecoes";
  let opening = null;

  function open() {
    if (opening) return opening;
    if (!global.indexedDB) return Promise.reject(new Error("IndexedDB indisponivel neste navegador."));
    opening = new Promise(function (resolve, reject) {
      const request = global.indexedDB.open(NAME, VERSION);
      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      request.onsuccess = function () {
        const db = request.result;
        db.onversionchange = function () { db.close(); opening = null; };
        resolve(db);
      };
      request.onerror = function () { reject(request.error || new Error("Falha ao abrir IndexedDB.")); };
      request.onblocked = function () { reject(new Error("Banco bloqueado por outra aba.")); };
    }).catch(function (error) { opening = null; throw error; });
    return opening;
  }

  async function transaction(mode, fn) {
    const db = await open();
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      let value;
      let failed = false;
      tx.oncomplete = function () { resolve(value); };
      tx.onerror = function () { failed = true; reject(tx.error || new Error("Transacao IndexedDB falhou.")); };
      tx.onabort = function () { if (!failed) reject(tx.error || new Error("Transacao IndexedDB cancelada.")); };
      try {
        const req = fn(store);
        if (req) {
          req.onsuccess = function () { value = req.result; };
          req.onerror = function () { /* A transacao reporta o erro. */ };
        }
      } catch (e) {
        try { tx.abort(); } catch (_) {}
        reject(e);
      }
    });
  }

  const api = Object.freeze({
    open: open,
    get: function (key) { return transaction("readonly", function (store) { return store.get(key); }); },
    set: function (key, value) { return transaction("readwrite", function (store) { return store.put(value, key); }); },
    remove: function (key) { return transaction("readwrite", function (store) { return store.delete(key); }); },
    keys: function () { return transaction("readonly", function (store) { return store.getAllKeys(); }); }
  });
  global.BelaIndexedDB = api;
})(window);
