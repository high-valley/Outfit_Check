import type { ClothingItem, ScoreReason, Season } from '../../types';
import { MAX, SEASON_MONTHS, SEASON_OUT_PENALTY } from './constants';

export function seasonOf(date: Date): Season {
  const month = date.getMonth() + 1;
  return (Object.keys(SEASON_MONTHS) as Season[]).find((s) => SEASON_MONTHS[s].includes(month))!;
}

const SEASON_LABEL: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
};

export function scoreSeason(
  items: ClothingItem[],
  season: Season,
): { score: number; reasons: ScoreReason[] } {
  const out = items.filter((i) => !i.seasons.includes(season));
  const lost = Math.min(MAX.season, out.length * SEASON_OUT_PENALTY);
  const reasons: ScoreReason[] = [];
  if (out.length === 0) {
    reasons.push({ type: 'plus', message: `すべて${SEASON_LABEL[season]}に合うアイテムです`, points: MAX.season });
  } else {
    reasons.push({
      type: 'minus',
      message: `${SEASON_LABEL[season]}に合わないアイテムが${out.length}点あります（−${lost}）。季節に合う服に替えましょう`,
      points: -lost,
    });
  }
  return { score: MAX.season - lost, reasons };
}
