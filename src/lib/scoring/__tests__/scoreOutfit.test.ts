import { scoreOutfit } from '..';
import type { Category, ClothingItem, Fit, Season, Taste } from '../../../types';

let n = 0;
function item(category: Category, mainColor: string, o: Partial<ClothingItem> = {}): ClothingItem {
  return {
    id: `i${n++}`,
    category,
    mainColor,
    subColor: null,
    pattern: 'plain',
    fit: 'regular',
    length: 'regular',
    tastes: ['casual'] as Taste[],
    seasons: ['spring', 'summer', 'autumn', 'winter'] as Season[],
    thickness: 'medium',
    photoUri: null,
    isOwned: true,
    name: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...o,
  };
}

const summer = { season: 'summer' as const };

describe('scoreOutfit', () => {
  it('白T × デニム × 白スニーカー → 85%以上', () => {
    const r = scoreOutfit(
      [item('tshirt', '#FFFFFF'), item('denim', '#4A6FA5'), item('sneakers', '#FFFFFF')],
      summer,
    );
    expect(r.total).toBeGreaterThanOrEqual(85);
  });

  it('全身黒のIライン → 80%以上', () => {
    const fit: Fit = 'tight';
    const r = scoreOutfit(
      [
        item('tshirt', '#111111', { fit, tastes: ['mode'] }),
        item('slacks', '#111111', { fit, tastes: ['mode'] }),
        item('leather_shoes', '#111111', { tastes: ['mode'] }),
      ],
      summer,
    );
    expect(r.breakdown.silhouette).toBe(22);
    expect(r.total).toBeGreaterThanOrEqual(80);
  });

  it('赤・青・黄・緑・紫の5色コーデ → 色の相性が 10点以下', () => {
    const r = scoreOutfit(
      [
        item('tshirt', '#D32F2F'),
        item('chino', '#1976D2'),
        item('jacket', '#FBC02D'),
        item('sneakers', '#388E3C'),
        item('blouson', '#7B1FA2'),
      ],
      summer,
    );
    expect(r.breakdown.color).toBeLessThanOrEqual(10);
    expect(r.reasons.some((x) => x.message.includes('色が5色'))).toBe(true);
  });

  it('loose × loose → シルエット 12点', () => {
    const r = scoreOutfit(
      [item('hoodie', '#FFFFFF', { fit: 'loose' }), item('wide_pants', '#111111', { fit: 'loose' })],
      summer,
    );
    expect(r.breakdown.silhouette).toBe(12);
  });

  it('夏に厚手のコート → 季節点が減点される', () => {
    const r = scoreOutfit(
      [
        item('tshirt', '#FFFFFF'),
        item('denim', '#4A6FA5'),
        item('coat', '#C2B280', { seasons: ['autumn', 'winter'], thickness: 'thick' }),
      ],
      summer,
    );
    expect(r.breakdown.season).toBe(6);
  });

  it('reasons は減点の大きい順に並ぶ', () => {
    const r = scoreOutfit(
      [
        item('hoodie', '#D32F2F', { fit: 'loose', tastes: ['sporty'] }),
        item('wide_pants', '#1976D2', { fit: 'loose', tastes: ['feminine'] }),
        item('coat', '#FBC02D', { seasons: ['winter'] }),
      ],
      summer,
    );
    const minus = r.reasons.filter((x) => x.type === 'minus').map((x) => x.points);
    expect(minus).toEqual([...minus].sort((a, b) => a - b));
    const firstPlus = r.reasons.findIndex((x) => x.type === 'plus');
    expect(firstPlus === -1 || firstPlus === minus.length).toBe(true);
  });

  it('スコア計算は 50ms 以内', () => {
    const items = [item('tshirt', '#FFFFFF'), item('denim', '#4A6FA5'), item('sneakers', '#FFFFFF')];
    const t = performance.now();
    for (let i = 0; i < 100; i++) scoreOutfit(items, summer);
    expect((performance.now() - t) / 100).toBeLessThan(50);
  });
});
