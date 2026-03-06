import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { PromapDB, ZipDataPoint } from '~/types/promap';
import {
  PROMAP_DB_NAME,
  PROMAP_DB_VERSION,
  PROMAP_CACHE_KEY,
  PROMAP_CACHE_TTL_MS,
} from '~/types/promap';

let dbPromise: Promise<IDBPDatabase<PromapDB>> | null = null;

function getDb(): Promise<IDBPDatabase<PromapDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PromapDB>(PROMAP_DB_NAME, PROMAP_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('promap-data')) {
          db.createObjectStore('promap-data');
        }
      },
    });
  }
  return dbPromise;
}

/** Read cached promap data from IndexedDB if it exists and is fresh */
export async function getCachedPromapData(
  version: string,
): Promise<ZipDataPoint[] | null> {
  try {
    const db = await getDb();
    const entry = await db.get('promap-data', PROMAP_CACHE_KEY);

    if (!entry) return null;

    // Check version match
    if (entry.version !== version) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > PROMAP_CACHE_TTL_MS) return null;

    return entry.points;
  } catch {
    // IndexedDB may be unavailable (private browsing, storage full, etc.)
    return null;
  }
}

/** Store promap data in IndexedDB */
export async function setCachedPromapData(
  version: string,
  points: ZipDataPoint[],
): Promise<void> {
  try {
    const db = await getDb();
    await db.put(
      'promap-data',
      { version, points, timestamp: Date.now() },
      PROMAP_CACHE_KEY,
    );
  } catch {
    // Silently fail — cache is a nice-to-have, not critical
  }
}
