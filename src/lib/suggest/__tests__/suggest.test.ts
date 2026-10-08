import { dateKey, MAX_COMBINATIONS, recentlyWornItemIds, suggestOutfits } from '..';
import type { Category, ClothingItem, Outfit } from '../../../types';

let n = 0;
const item = (category: Category, mainColor = '#FFFFFF', o: Partial<ClothingItem> = {}): ClothingItem => ({
  id: `i${n++}`,
  category,
  mainColor,
  subColor: null,
  pattern: 'plain',
  fit: 'regular',
  length: 'regular',
  tastes: ['casual'],
  seasons: ['spring', 'summer', 'autumn', 'winter'],
  thickness: 'medium',
  photoUri: null,
  isOwned: true,
  name: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...o,
});
const today = new Date(2026, 5, 15); // 6/15（夏）
const wornOutfit = (ids: Outfit['itemIds'], date: string): Outfit => ({
  id: 'o', itemIds: ids, score: 80, wornDates: [date], createdAt: '2026-01-01T00:00:00.000Z',
});

describe('suggestOutfits', () => {
  const t1 = item('tshirt');
  const t2 = item('shirt', '#BFD7F2');
  const b1 = item('denim', '#4A6FA5');
  const s1 = item('sneakers');
  const coat = item('coat', '#C9B79C');

  it('上位3件をスコア降順で返す', () => {
    const r = suggestOutfits([t1, t2, b1, s1, item('chino', '#C9B79C')], [], { today, season: 'summer' });
    expect(r).toHaveLength(3);
    expect(r[0].score).toBeGreaterThanOrEqual(r[1].score);
    expect(r[1].score).toBeGreaterThanOrEqual(r[2].score);
    expect(r[0].itemIds.shoes).toBe(s1.id);
  });

  it('直近3日以内に着たアイテムを含む組み合わせを除外する', () => {
    const outfits = [wornOutfit({ top: t1.id }, dateKey(new Date(2026, 5, 13)))];
    const r = suggestOutfits([t1, t2, b1, s1], outfits, { today, season: 'summer' });
    expect(r.every((s) => !s.items.some((i) => i.id === t1.id))).toBe(true);
    expect(r.length).toBeGreaterThan(0);
  });

  it('4日以上前に着たものは除外しない', () => {
    const outfits = [wornOutfit({ top: t1.id }, dateKey(new Date(2026, 5, 11)))];
    expect(recentlyWornItemIds(outfits, today).size).toBe(0);
  });

  it('アウターは秋冬のときだけ組み合わせに入る', () => {
    const all = [t1, b1, s1, coat];
    expect(suggestOutfits(all, [], { today, season: 'summer' })[0].itemIds.outer).toBeUndefined();
    expect(suggestOutfits(all, [], { today, season: 'winter' })[0].itemIds.outer).toBe(coat.id);
  });

  it('ワンピースも提案される', () => {
    const r = suggestOutfits([item('dress'), s1], [], { today, season: 'summer' });
    expect(r[0].itemIds.onepiece).toBeDefined();
    expect(r[0].itemIds.top).toBeUndefined();
  });

  it('お試しデザイン(isOwned=false)は提案に使わない', () => {
    const r = suggestOutfits([t1, b1, item('sneakers', '#111111', { isOwned: false })], [], { today, season: 'summer' });
    expect(r.every((s) => s.items.every((i) => i.isOwned))).toBe(true);
  });

  it('服が足りなければ空配列', () => {
    expect(suggestOutfits([t1], [], { today })).toEqual([]);
  });

  it('組み合わせが5000を超えても絞り込んで採点できる', () => {
    const many = [
      ...Array.from({ length: 30 }, () => item('tshirt')),
      ...Array.from({ length: 30 }, () => item('denim', '#4A6FA5')),
      ...Array.from({ length: 10 }, () => item('sneakers')),
      ...Array.from({ length: 5 }, () => item('coat')),
    ];
    const start = performance.now();
    const r = suggestOutfits(many, [], { today, season: 'winter' });
    expect(r).toHaveLength(3);
    expect(performance.now() - start).toBeLessThan(5000);
    expect(30 * 30 * 10 * 5).toBeGreaterThan(MAX_COMBINATIONS);
  });
});
