import * as SQLite from 'expo-sqlite';
import type { ClothingItem, Outfit } from '../types';
import type { Repository } from './types';

// 検索に使わない属性は JSON として保持する（スキーマ変更に強くするため）
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  dbPromise ??= (async () => {
    const db = await SQLite.openDatabaseAsync('outfit_check.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY NOT NULL,
        category TEXT NOT NULL,
        is_owned INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS outfits (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        data TEXT NOT NULL
      );
    `);
    return db;
  })();
  return dbPromise;
}

export const repository: Repository = {
  async listItems() {
    const db = await getDb();
    const rows = await db.getAllAsync<{ data: string }>('SELECT data FROM items ORDER BY created_at DESC');
    return rows.map((r) => JSON.parse(r.data) as ClothingItem);
  },
  async upsertItem(item) {
    const db = await getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO items (id, category, is_owned, created_at, data) VALUES (?, ?, ?, ?, ?)',
      item.id,
      item.category,
      item.isOwned ? 1 : 0,
      item.createdAt,
      JSON.stringify(item),
    );
  },
  async deleteItem(id) {
    const db = await getDb();
    await db.runAsync('DELETE FROM items WHERE id = ?', id);
  },
  async listOutfits() {
    const db = await getDb();
    const rows = await db.getAllAsync<{ data: string }>('SELECT data FROM outfits ORDER BY created_at DESC');
    return rows.map((r) => JSON.parse(r.data) as Outfit);
  },
  async upsertOutfit(outfit: Outfit) {
    const db = await getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO outfits (id, created_at, data) VALUES (?, ?, ?)',
      outfit.id,
      outfit.createdAt,
      JSON.stringify(outfit),
    );
  },
  async deleteOutfit(id) {
    const db = await getDb();
    await db.runAsync('DELETE FROM outfits WHERE id = ?', id);
  },
};
