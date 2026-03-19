
import { getStore } from "@netlify/blobs";

const store = getStore({ name: "bela-caixa-sync" });
const KEY = "snapshot";
const BACKUP_LATEST = "backup-latest";

const emptyDb = {
  clientes: [],
  produtos: [],
  vendas: [],
  creditos: [],
  fiados: [],
  pagamentos: [],
  _deleted: { clientes: [], produtos: [], vendas: [], creditos: [], fiados: [], pagamentos: [] }
};

function isoDay(v = new Date()) {
  return new Date(v).toISOString().slice(0, 10);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function normArr(v){ return Array.isArray(v) ? v : []; }
function normDeleted(v){
  v = v || {};
  return {
    clientes: normArr(v.clientes).map(String),
    produtos: normArr(v.produtos).map(String),
    vendas: normArr(v.vendas).map(String),
    creditos: normArr(v.creditos).map(String),
    fiados: normArr(v.fiados).map(String),
    pagamentos: normArr(v.pagamentos).map(String)
  };
}
function ts(item){
  if(!item || typeof item !== 'object') return 0;
  const raw = item.updatedAt || item.createdAt || item.dataHora || item.timestamp || item.data;
  if(!raw) return 0;
  if(typeof raw === "number") return raw;
  const n = Date.parse(raw);
  return Number.isNaN(n) ? 0 : n;
}
function ensureIds(arr, prefix){
  return normArr(arr).map((item, idx) => {
    if(!item || typeof item !== 'object') return item;
    if(item.id) return item;
    return { ...item, id: `${prefix}_${idx}_${Date.now()}` };
  });
}
function removeDeleted(arr, deletedList){
  const del = new Set(normArr(deletedList).map(String));
  return ensureIds(arr, 'row').filter(item => !del.has(String(item.id)));
}
function mergeArray(remoteArr, localArr, prefix, deletedList){
  const map = new Map();

  removeDeleted(remoteArr, deletedList).forEach((item) => {
    map.set(String(item.id), item);
  });

  removeDeleted(localArr, deletedList).forEach((item) => {
    const key = String(item.id);
    if(!map.has(key)){
      map.set(key, item);
      return;
    }
    const current = map.get(key);
    if(ts(item) >= ts(current)){
      map.set(key, item);
    }
  });

  return Array.from(map.values());
}
function mergeDeleted(remoteDeleted, localDeleted){
  const r = normDeleted(remoteDeleted);
  const l = normDeleted(localDeleted);
  return {
    clientes: Array.from(new Set([...r.clientes, ...l.clientes])),
    produtos: Array.from(new Set([...r.produtos, ...l.produtos])),
    vendas: Array.from(new Set([...r.vendas, ...l.vendas])),
    creditos: Array.from(new Set([...r.creditos, ...l.creditos])),
    fiados: Array.from(new Set([...r.fiados, ...l.fiados])),
    pagamentos: Array.from(new Set([...r.pagamentos, ...l.pagamentos]))
  };
}
function mergeDb(remoteDb, localDb){
  remoteDb = remoteDb || emptyDb;
  localDb = localDb || emptyDb;
  const deleted = mergeDeleted(remoteDb._deleted, localDb._deleted);
  return {
    clientes: mergeArray(remoteDb.clientes, localDb.clientes, 'cli', deleted.clientes),
    produtos: mergeArray(remoteDb.produtos, localDb.produtos, 'pro', deleted.produtos),
    vendas: mergeArray(remoteDb.vendas, localDb.vendas, 'ven', deleted.vendas),
    creditos: mergeArray(remoteDb.creditos, localDb.creditos, 'cre', deleted.creditos),
    fiados: mergeArray(remoteDb.fiados, localDb.fiados, 'fia', deleted.fiados),
    pagamentos: mergeArray(remoteDb.pagamentos, localDb.pagamentos, 'pag', deleted.pagamentos),
    _deleted: deleted
  };
}

async function ensureDailyBackup(snapshot) {
  const dayKey = `backup-${isoDay(snapshot.updatedAt)}`;
  const existing = await store.get(dayKey, { type: "json" });
  if (!existing) await store.setJSON(dayKey, snapshot);
  await store.setJSON(BACKUP_LATEST, { backupAt: snapshot.updatedAt, key: dayKey });
  return snapshot.updatedAt;
}

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "Use POST" }, 405);

  try {
    const body = await req.json();
    const action = body?.action;
    const current = await store.get(KEY, { type: "json" });
    const backupMeta = await store.get(BACKUP_LATEST, { type: "json" });

    if (action === "pull") {
      if (!current) {
        return json({ ok: true, changed: true, updatedAt: "", backupAt: backupMeta?.backupAt || "", db: emptyDb });
      }
      const since = body?.since || "";
      const changed = !since || since !== current.updatedAt;
      return json({
        ok: true,
        changed,
        updatedAt: current.updatedAt,
        backupAt: backupMeta?.backupAt || "",
        db: changed ? current.db : undefined
      });
    }

    if (action === "push") {
      const incoming = body?.db || emptyDb;
      const mergedDb = mergeDb(current?.db || emptyDb, incoming);
      const snapshot = {
        updatedAt: new Date().toISOString(),
        db: mergedDb
      };
      await store.setJSON(KEY, snapshot);
      const backupAt = await ensureDailyBackup(snapshot);
      return json({ ok: true, updatedAt: snapshot.updatedAt, backupAt, mode: "merged-id-updatedAt-deleted" });
    }

    if (action === "backupNow") {
      const snapshot = current || { updatedAt: new Date().toISOString(), db: emptyDb };
      const backupAt = await ensureDailyBackup(snapshot);
      return json({ ok: true, backupAt });
    }

    return json({ ok: false, error: "Ação inválida" }, 400);
  } catch (error) {
    return json({ ok: false, error: error?.message || "Erro interno" }, 500);
  }
};
