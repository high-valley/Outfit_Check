import type { Fit, Season, Taste } from '../../types';

/** 配点・閾値はすべてここで調整する */

export const MAX = { color: 40, silhouette: 30, taste: 20, season: 10 } as const;

// ---- 色の分類 ----
export const NEUTRAL_MAX_SATURATION = 15; // % 未満はニュートラル
export const NEUTRAL_WHITE_MIN_LIGHTNESS = 80;
export const NEUTRAL_BLACK_MAX_LIGHTNESS = 25;

type HslRange = { h: [number, number]; s: [number, number]; l: [number, number] };
/** ベースカラー（有彩色だが何にでも合う色）。判定順に評価する */
export const BASE_COLORS: { name: string; range: HslRange }[] = [
  { name: 'navy', range: { h: [200, 250], s: [20, 100], l: [0, 35] } },
  { name: 'beige', range: { h: [25, 55], s: [15, 70], l: [70, 100] } },
  { name: 'brown', range: { h: [10, 40], s: [20, 100], l: [10, 45] } },
  { name: 'khaki', range: { h: [45, 100], s: [15, 50], l: [25, 60] } },
];

/** トーン分類 */
export const TONE = {
  darkMaxLightness: 30,
  paleMinLightness: 80,
  lightMinLightness: 65,
  vividMinSaturation: 60,
} as const;

/** 隣接トーン（順不同） */
export const ADJACENT_TONES: [string, string][] = [
  ['pale', 'light'],
  ['light', 'vivid'],
  ['light', 'dull'],
  ['vivid', 'dull'],
  ['dull', 'dark'],
];

export const HUE_GROUP_SIZE = 30;
export const HUE_SIMILAR_MAX_DIFF = 30;
export const HUE_COMPLEMENT_RANGE: [number, number] = [150, 210];

// ---- 色の相性 (40) ----
export const COLOR_COUNT_POINTS = { max: 15, four: 8, fivePlus: 0 } as const;
export const TONE_POINTS = { same: 10, adjacent: 6, scattered: 0, noChromatic: 10 } as const;
export const HUE_POINTS = {
  similar: 10,
  complementSmallArea: 10,
  complementLargeArea: 3,
  other: 5,
  oneOrLess: 10,
} as const;
export const ACCENT_POINTS = { zeroOrOne: 5, two: 2, threePlus: 0 } as const;
/** 小面積として扱う部位 */
export const SMALL_AREA_SLOTS = ['shoes', 'accessory'] as const;

// ---- シルエット (30) ----
export const SILHOUETTE_POINTS: Record<Fit, Record<Fit, number>> = {
  // [top][bottom]
  tight: { tight: 22, regular: 25, loose: 30 },
  regular: { tight: 25, regular: 25, loose: 30 },
  loose: { tight: 30, regular: 30, loose: 12 },
};
export const ONEPIECE_POINTS = 25;
export const SILHOUETTE_DEFAULT_POINTS = 25; // トップ/ボトムが揃っていない場合
export const OUTER_SHORTER_PENALTY = 5;

// ---- テイスト (20) ----
export const TASTE_POINTS = { unified: 20, hazushi: 18, half: 12, scattered: 5 } as const;
export const TASTE_UNIFIED_MIN_RATIO = 0.8;
export const TASTE_HAZUSHI_MIN_RATIO = 0.65; // 主テイストがこの割合以上なら約7:3
export const TASTE_CLASH_PENALTY = 3;
export const TASTE_CLASH_PAIRS: [Taste, Taste][] = [
  ['sporty', 'feminine'],
  ['mode', 'natural'],
];

// ---- 季節 (10) ----
export const SEASON_OUT_PENALTY = 4;
export const SEASON_MONTHS: Record<Season, number[]> = {
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  autumn: [9, 10, 11],
  winter: [12, 1, 2],
};
