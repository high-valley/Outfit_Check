import { CATEGORY_SLOT, type ClothingItem, type Length, type ScoreReason } from '../../types';
import {
  ONEPIECE_POINTS,
  OUTER_SHORTER_PENALTY,
  SILHOUETTE_DEFAULT_POINTS,
  SILHOUETTE_POINTS,
} from './constants';

const LENGTH_ORDER: Record<Length, number> = { short: 0, regular: 1, long: 2 };

export function scoreSilhouette(items: ClothingItem[]): { score: number; reasons: ScoreReason[] } {
  const bySlot = (slot: string) => items.find((i) => CATEGORY_SLOT[i.category] === slot);
  const onepiece = bySlot('onepiece');
  const top = onepiece ?? bySlot('top');
  const bottom = bySlot('bottom');
  const outer = bySlot('outer');
  const reasons: ScoreReason[] = [];
  let score: number;

  if (onepiece) {
    score = ONEPIECE_POINTS;
  } else if (top && bottom) {
    score = SILHOUETTE_POINTS[top.fit][bottom.fit];
    if (top.fit === 'loose' && bottom.fit !== 'loose')
      reasons.push({ type: 'plus', message: '上ゆったり・下すっきりでメリハリがある（Yライン）', points: score });
    else if (bottom.fit === 'loose' && top.fit !== 'loose')
      reasons.push({ type: 'plus', message: '上すっきり・下ゆったりでバランスが良い（Aライン）', points: score });
    else if (top.fit === 'tight' && bottom.fit === 'tight')
      reasons.push({ type: 'plus', message: '細身でまとまっている（Iライン）', points: score });
    else if (top.fit === 'loose' && bottom.fit === 'loose')
      reasons.push({
        type: 'minus',
        message: `全体がゆったりしすぎて重たく見えやすい（−${30 - score}）。トップかボトムのどちらかを細身にするとメリハリが出ます`,
        points: -(30 - score),
      });
    else reasons.push({ type: 'plus', message: '標準的なバランス', points: score });
  } else {
    score = SILHOUETTE_DEFAULT_POINTS;
  }

  if (outer && top && LENGTH_ORDER[outer.length] < LENGTH_ORDER[top.length]) {
    score = Math.max(0, score - OUTER_SHORTER_PENALTY);
    reasons.push({
      type: 'minus',
      message: `アウターがトップより短く、裾が重なって見えます（−${OUTER_SHORTER_PENALTY}）。トップの裾が出ないアウターを選ぶとすっきりします`,
      points: -OUTER_SHORTER_PENALTY,
    });
  }
  return { score, reasons };
}
