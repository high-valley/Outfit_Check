import type { ClothingItem, Outfit } from '../types';
import { CATEGORY_SLOT } from '../types';

export const BACKUP_VERSION = 1;

export type Backup = {
  app: 'outfit-check';
  version: number;
  exportedAt: string;
  items: ClothingItem[];
  outfits: Outfit[];
};

export function createBackup(items: ClothingItem[], outfits: Outfit[], now = new Date()): Backup {
  return { app: 'outfit-check', version: BACKUP_VERSION, exportedAt: now.toISOString(), items, outfits };
}

const isStr = (v: unknown): v is string => typeof v === 'string';
const HEX = /^#[0-9a-fA-F]{6}$/;

function validItem(x: any): x is ClothingItem {
  return (
    x && isStr(x.id) && x.category in CATEGORY_SLOT && isStr(x.mainColor) && HEX.test(x.mainColor) &&
    (x.subColor === null || (isStr(x.subColor) && HEX.test(x.subColor))) &&
    Array.isArray(x.tastes) && Array.isArray(x.seasons) && isStr(x.createdAt)
  );
}
function validOutfit(x: any): x is Outfit {
  return x && isStr(x.id) && typeof x.score === 'number' && x.itemIds && typeof x.itemIds === 'object' && Array.isArray(x.wornDates) && isStr(x.createdAt);
}

export type ParseResult = { ok: true; backup: Backup; skipped: number } | { ok: false; error: string };

/** バックアップ文字列を検証して読み込む。壊れた行は飛ばし、件数を skipped で返す */
export function parseBackup(text: string): ParseResult {
  let raw: any;
  try {
    raw = JSON.parse(text.trim());
  } catch {
    return { ok: false, error: 'バックアップの形式が正しくありません（JSON として読めません）' };
  }
  if (!raw || raw.app !== 'outfit-check' || !Array.isArray(raw.items) || !Array.isArray(raw.outfits))
    return { ok: false, error: 'このアプリのバックアップではありません' };
  if (typeof raw.version !== 'number' || raw.version > BACKUP_VERSION)
    return { ok: false, error: '新しいバージョンのバックアップです。アプリを更新してください' };
  const items = raw.items.filter(validItem);
  const outfits = raw.outfits.filter(validOutfit);
  const skipped = raw.items.length - items.length + (raw.outfits.length - outfits.length);
  return { ok: true, backup: { ...raw, items, outfits }, skipped };
}
