import type { CVRecord } from "@/lib/cv-record";
import type { CVData } from "@/lib/cv-types";
import { nanoid } from "@/lib/nanoid";

const DATABASE_NAME = "cvcraft-manual-saves";
const DATABASE_VERSION = 1;
const STORE_NAME = "cvs";
const FALLBACK_KEY_PREFIX = "cvcraft:manual-cvs:";
const DEVICE_ID_PREFIX = "device_";

interface StoredCV extends CVRecord {
  storageKey: string;
}

function storageKey(userId: string, cvId: string) {
  return `${userId}:${cvId}`;
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Database could not be opened"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "storageKey" });
      }
    };
  });
}

async function runRequest<T>(
  mode: IDBTransactionMode,
  createRequest: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const database = await openDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = createRequest(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Storage request failed"));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Storage transaction failed"));
    };
  });
}

function readFallback(userId: string): CVRecord[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const value = localStorage.getItem(`${FALLBACK_KEY_PREFIX}${userId}`);
    return value ? JSON.parse(value) as CVRecord[] : [];
  } catch {
    return [];
  }
}

function writeFallback(userId: string, records: CVRecord[]) {
  if (typeof localStorage === "undefined") {
    throw new Error("Browser storage is unavailable");
  }
  localStorage.setItem(`${FALLBACK_KEY_PREFIX}${userId}`, JSON.stringify(records));
}

export function isDeviceCVId(id: string) {
  return id.startsWith(DEVICE_ID_PREFIX);
}

export async function listDeviceCVs(userId: string): Promise<CVRecord[]> {
  try {
    const records = await runRequest<StoredCV[]>("readonly", (store) => store.getAll());
    return records
      .filter((record) => record.userId === userId)
      .map(({ storageKey: _storageKey, ...record }) => record)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return readFallback(userId);
  }
}

export async function saveDeviceCV(userId: string, cv: CVData): Promise<CVRecord> {
  const existing = (await listDeviceCVs(userId)).find((record) => record.id === cv.id);
  const now = new Date().toISOString();
  const id = cv.id || `${DEVICE_ID_PREFIX}${nanoid()}`;
  const record: CVRecord = {
    ...cv,
    id,
    userId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  try {
    await runRequest<IDBValidKey>("readwrite", (store) => store.put({
      ...record,
      storageKey: storageKey(userId, id),
    } satisfies StoredCV));
  } catch {
    const records = readFallback(userId);
    const next = [record, ...records.filter((item) => item.id !== id)];
    writeFallback(userId, next);
  }

  return record;
}

export async function deleteDeviceCV(userId: string, cvId: string) {
  if (!cvId) return;

  try {
    await runRequest<undefined>("readwrite", (store) => store.delete(storageKey(userId, cvId)));
  } catch {
    const records = readFallback(userId).filter((record) => record.id !== cvId);
    writeFallback(userId, records);
  }
}
