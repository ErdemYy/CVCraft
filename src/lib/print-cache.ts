import type { CVData } from "@/lib/cv-types";
import { nanoid } from "@/lib/nanoid";

interface PrintCacheEntry {
  cv: CVData;
  expiresAt: number;
}

const PRINT_CACHE_TTL_MS = 5 * 60 * 1000;

const globalForPrintCache = globalThis as typeof globalThis & {
  __cvCraftPrintCache?: Map<string, PrintCacheEntry>;
};

const printCache = globalForPrintCache.__cvCraftPrintCache ?? new Map<string, PrintCacheEntry>();
globalForPrintCache.__cvCraftPrintCache = printCache;

function cleanupExpiredEntries(now = Date.now()) {
  for (const [token, entry] of printCache.entries()) {
    if (entry.expiresAt <= now) {
      printCache.delete(token);
    }
  }
}

export function createPrintToken(cv: CVData) {
  cleanupExpiredEntries();
  const token = nanoid();
  printCache.set(token, {
    cv,
    expiresAt: Date.now() + PRINT_CACHE_TTL_MS,
  });
  return token;
}

export function consumePrintToken(token: string) {
  cleanupExpiredEntries();
  const entry = printCache.get(token);
  if (!entry) return null;
  printCache.delete(token);
  return entry.cv;
}
