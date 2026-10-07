import type { ClothingItem, ScoreReason, Taste } from '../../types';
import {
  TASTE_CLASH_PAIRS,
  TASTE_CLASH_PENALTY,
  TASTE_HAZUSHI_MIN_RATIO,
  TASTE_POINTS,
  TASTE_UNIFIED_MIN_RATIO,
} from './constants';

export function scoreTaste(items: ClothingItem[]): { score: number; reasons: ScoreReason[] } {
  const counts = new Map<Taste, number>();
  for (const item of items) for (const t of item.tastes) counts.set(t, (counts.get(t) ?? 0) + 1);
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const reasons: ScoreReason[] = [];
  if (total === 0) return { score: TASTE_POINTS.unified, reasons };

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const topRatio = sorted[0][1] / total;
  let score: number;
  if (topRatio >= TASTE_UNIFIED_MIN_RATIO) {
    score = TASTE_POINTS.unified;
    reasons.push({ type: 'plus', message: 'テイストが統一されています', points: score });
  } else if (sorted.length === 2) {
    if (topRatio >= TASTE_HAZUSHI_MIN_RATIO) {
      score = TASTE_POINTS.hazushi;
      reasons.push({ type: 'plus', message: '主テイストに別テイストを混ぜたハズしが効いています', points: score });
    } else {
      score = TASTE_POINTS.half;
      reasons.push({
        type: 'minus',
        message: `2つのテイストが半々で主役が曖昧です（−${TASTE_POINTS.unified - score}）。どちらかのアイテムを増やすと方向性が定まります`,
        points: -(TASTE_POINTS.unified - score),
      });
    }
  } else {
    score = TASTE_POINTS.scattered;
    reasons.push({
      type: 'minus',
      message: `テイストが${sorted.length}種類混在しています（−${TASTE_POINTS.unified - score}）。1〜2種類に絞るとまとまります`,
      points: -(TASTE_POINTS.unified - score),
    });
  }

  for (const [a, b] of TASTE_CLASH_PAIRS) {
    if (counts.has(a) && counts.has(b)) {
      score = Math.max(0, score - TASTE_CLASH_PENALTY);
      reasons.push({
        type: 'minus',
        message: `「${TASTE_LABEL[a]}」と「${TASTE_LABEL[b]}」は相性が良くありません（−${TASTE_CLASH_PENALTY}）。どちらかのアイテムを入れ替えましょう`,
        points: -TASTE_CLASH_PENALTY,
      });
    }
  }
  return { score, reasons };
}

export const TASTE_LABEL: Record<Taste, string> = {
  casual: 'カジュアル',
  clean: 'きれいめ',
  street: 'ストリート',
  mode: 'モード',
  sporty: 'スポーティ',
  feminine: 'フェミニン',
  natural: 'ナチュラル',
};
