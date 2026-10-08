import type { ClothingItem, Outfit } from '../types';
import type { Repository } from './types';

// Web プレビュー用（expo-sqlite の代わりに localStorage を使う）
function read<T>(key: string): T[] {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}
function write<T>(key: string, value: T[]) {
  globalThis.localStorage?.setItem(key, JSON.stringify(value));
}
function upsert<T extends { id: string; createdAt: string }>(key: string, row: T) {
  const rows = read<T>(key).filter((r) => r.id !== row.id);
  rows.push(row);
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  write(key, rows);
}

export const repository: Repository = {
  listItems: async () => read<ClothingItem>('items'),
  upsertItem: async (item) => upsert('items', item),
  deleteItem: async (id) =>
    write('items', read<ClothingItem>('items').filter((r) => r.id !== id)),
  deleteItems: async (ids) =>
    write('items', read<ClothingItem>('items').filter((r) => !ids.includes(r.id))),
  listOutfits: async () => read<Outfit>('outfits'),
  upsertOutfit: async (o) => upsert('outfits', o),
  deleteOutfit: async (id) =>
    write('outfits', read<Outfit>('outfits').filter((r) => r.id !== id)),
  deleteOutfits: async (ids) =>
    write('outfits', read<Outfit>('outfits').filter((r) => !ids.includes(r.id))),
};
