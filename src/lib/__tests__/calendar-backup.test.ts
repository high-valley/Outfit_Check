import { createBackup, parseBackup } from '../backup';
import { buildMonthGrid, shiftMonth, wornByDate } from '../calendar';
import type { ClothingItem, Outfit } from '../../types';

const item: ClothingItem = {
  id: 'a', category: 'tshirt', mainColor: '#FFFFFF', subColor: null, pattern: 'plain', fit: 'regular', length: 'regular',
  tastes: ['casual'], seasons: ['summer'], thickness: 'thin', photoUri: null, isOwned: true, name: '白T', createdAt: '2026-01-01T00:00:00.000Z',
};
const outfit: Outfit = { id: 'o1', itemIds: { top: 'a' }, score: 90, wornDates: ['2026-10-03', '2026-10-05'], createdAt: '2026-10-01T00:00:00.000Z' };

describe('calendar', () => {
  it('2026年10月は1日が木曜、31日まで、週は5行', () => {
    const weeks = buildMonthGrid(2026, 9);
    expect(weeks).toHaveLength(5);
    expect(weeks[0].findIndex((c) => c)).toBe(4); // 木曜
    expect(weeks.flat().filter(Boolean)).toHaveLength(31);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });
  it('月またぎ', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
  it('着用日ごとにコーデを引ける', () => {
    const m = wornByDate([outfit]);
    expect(m.get('2026-10-03')).toEqual([outfit]);
    expect(m.get('2026-10-04')).toBeUndefined();
  });
});

describe('backup', () => {
  it('作成 → 読み込みで元に戻る', () => {
    const text = JSON.stringify(createBackup([item], [outfit]));
    const r = parseBackup(text);
    expect(r.ok && r.backup.items).toEqual([item]);
    expect(r.ok && r.backup.outfits).toEqual([outfit]);
  });
  it('JSONでない / 別アプリのデータは拒否', () => {
    expect(parseBackup('hello').ok).toBe(false);
    expect(parseBackup('{"items":[],"outfits":[]}').ok).toBe(false);
  });
  it('壊れた行は飛ばして件数を返す', () => {
    const b = createBackup([item, { ...item, id: 'b', mainColor: 'red' }], [outfit]);
    const r = parseBackup(JSON.stringify(b));
    expect(r.ok && r.skipped).toBe(1);
    expect(r.ok && r.backup.items).toHaveLength(1);
  });
  it('新しすぎるバージョンは拒否', () => {
    const r = parseBackup(JSON.stringify({ ...createBackup([], []), version: 99 }));
    expect(r.ok).toBe(false);
  });
});
