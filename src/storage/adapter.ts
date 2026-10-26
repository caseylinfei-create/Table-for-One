import type { AppData, ChefId } from '../domain/types';
import { CHEFS } from '../data/chefs';
import { DEFAULT_OWNED, SEASONINGS } from '../data/seasonings';

/**
 * Persistence boundary. The UI only talks to a StorageAdapter, so the
 * localStorage implementation can later be swapped for Supabase or a native store.
 */
export interface StorageAdapter {
  load(): AppData | null;
  save(data: AppData): void;
  clear(): void;
}

const KEY = 'tfo:v1:data';

export function defaultData(): AppData {
  return {
    version: 1,
    profile: null,
    inventory: [],
    seasonings: Object.fromEntries(SEASONINGS.map((s) => [s.id, DEFAULT_OWNED.includes(s.id)])),
    servings: 1,
    shopping: [],
    filters: { cuisine: 'all', flavor: 'any' },
    cook: null,
    saved: [],
    history: [],
    palette: 'auto',
  };
}

const CHEF_IDS = new Set<string>(CHEFS.map((c) => c.id));
const LEGACY_CHEF: Record<string, ChefId> = { wren: 'simmer', poppy: 'piper', milo: 'wok', otto: 'market' };

/** Upgrades older saved shapes. Add cases here when AppData.version changes. */
function migrate(raw: unknown): AppData | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Partial<AppData>;
  if (d.version !== 1) return null;
  const base = defaultData();
  let profile = d.profile ?? null;
  if (profile && !CHEF_IDS.has(profile.chefId)) {
    // First prototype had four chefs; move those users to the closest new one.
    profile = { ...profile, chefId: LEGACY_CHEF[profile.chefId as string] ?? 'wok' };
  }
  return {
    ...base,
    ...d,
    profile,
    seasonings: { ...base.seasonings, ...(d.seasonings ?? {}) },
    inventory: Array.isArray(d.inventory) ? d.inventory : [],
    shopping: Array.isArray(d.shopping) ? d.shopping : [],
    filters: { ...base.filters, ...(d.filters ?? {}) },
    cook: d.cook && typeof d.cook === 'object' ? d.cook : null,
    saved: Array.isArray(d.saved) ? d.saved : [],
    history: Array.isArray(d.history) ? d.history : [],
    palette: ['auto', 'diner', 'night'].includes(d.palette as string) ? d.palette : 'auto',
  } as AppData;
}

export class LocalStorageAdapter implements StorageAdapter {
  load(): AppData | null {
    try {
      const s = window.localStorage.getItem(KEY);
      return s ? migrate(JSON.parse(s)) : null;
    } catch {
      return null;
    }
  }
  save(data: AppData) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable (private mode); app keeps working in memory */
    }
  }
  clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();
