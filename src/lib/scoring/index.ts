import type { ClothingItem, ScoreResult, Season } from '../../types';
import { scoreColor } from './color';
import { MAX } from './constants';
import { scoreSeason, seasonOf } from './season';
import { scoreSilhouette } from './silhouette';
import { scoreTaste } from './taste';

export { seasonOf } from './season';

export function scoreOutfit(items: ClothingItem[], context?: { season: Season }): ScoreResult {
  const season = context?.season ?? seasonOf(new Date());
  const color = scoreColor(items);
  const silhouette = scoreSilhouette(items);
  const taste = scoreTaste(items);
  const seasonResult = scoreSeason(items, season);

  const breakdown = {
    color: Math.min(MAX.color, color.score),
    silhouette: Math.min(MAX.silhouette, silhouette.score),
    taste: Math.min(MAX.taste, taste.score),
    season: Math.min(MAX.season, seasonResult.score),
  };
  const total = Math.round(
    Math.max(0, Math.min(100, breakdown.color + breakdown.silhouette + breakdown.taste + breakdown.season)),
  );

  const all = [...color.reasons, ...silhouette.reasons, ...taste.reasons, ...seasonResult.reasons];
  const reasons = [
    ...all.filter((r) => r.type === 'minus').sort((a, b) => a.points - b.points),
    ...all.filter((r) => r.type === 'plus').sort((a, b) => b.points - a.points),
  ];
  return { total, breakdown, reasons };
}
