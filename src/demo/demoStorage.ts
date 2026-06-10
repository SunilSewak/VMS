/**
 * AVEMS Demo Storage Engine
 *
 * Reads and writes demo data to localStorage under namespaced keys.
 * Behaves like a minimal key-value document store — each "collection"
 * is a JSON array serialised to its own localStorage key.
 */

const NS = 'avems_demo_';

export const DEMO_COLLECTIONS = {
  MEETINGS: 'meetings',
  DIVISIONS: 'divisions',
  CITIES: 'cities',
  MEETING_TYPES: 'meeting_types',
  HOTELS: 'hotels',
  HALLS: 'halls',
  HOTEL_CATEGORIES: 'hotel_categories',
  SHORTLISTS: 'shortlists',
  BOOKINGS: 'bookings',
  ACCOMMODATION_PLANS: 'accommodation_plans',
  ACCOMMODATION_UTILIZATIONS: 'accommodation_utilizations',
  INVOICES: 'invoices',
  INVOICE_DOCUMENTS: 'invoice_documents',
  INVOICE_VARIANCES: 'invoice_variances',
  PAYMENTS: 'payments',
} as const;

export type DemoCollection = typeof DEMO_COLLECTIONS[keyof typeof DEMO_COLLECTIONS];

function key(collection: DemoCollection): string {
  return NS + collection;
}

export function demoGet<T>(collection: DemoCollection): T[] {
  try {
    const raw = localStorage.getItem(key(collection));
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function demoSet<T>(collection: DemoCollection, items: T[]): void {
  localStorage.setItem(key(collection), JSON.stringify(items));
}

export function demoInsert<T extends { id: string }>(collection: DemoCollection, item: T): T {
  const items = demoGet<T>(collection);
  items.push(item);
  demoSet(collection, items);
  return item;
}

export function demoUpdate<T extends { id: string }>(
  collection: DemoCollection,
  id: string,
  patch: Partial<T>
): T | null {
  const items = demoGet<T>(collection);
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  demoSet(collection, items);
  return items[idx];
}

export function demoDelete(collection: DemoCollection, id: string): void {
  const items = demoGet<{ id: string }>(collection);
  demoSet(collection, items.filter((x) => x.id !== id));
}

export function demoFindById<T extends { id: string }>(
  collection: DemoCollection,
  id: string
): T | null {
  return demoGet<T>(collection).find((x) => x.id === id) ?? null;
}

export function demoReset(): void {
  Object.values(DEMO_COLLECTIONS).forEach((col) => {
    localStorage.removeItem(key(col));
  });
}

export function demoExport(): string {
  const snapshot: Record<string, unknown[]> = {};
  Object.entries(DEMO_COLLECTIONS).forEach(([, col]) => {
    snapshot[col] = demoGet(col);
  });
  return JSON.stringify(snapshot, null, 2);
}

export function demoImport(json: string): void {
  const snapshot = JSON.parse(json) as Record<string, unknown[]>;
  Object.entries(snapshot).forEach(([col, data]) => {
    demoSet(col as DemoCollection, data);
  });
}
