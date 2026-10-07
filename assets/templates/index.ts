import type { Category } from '../../src/types';

/**
 * 服のSVGテンプレート（各 category 1種類）。
 * - main:   塗りつぶし領域（mainColor）。外周は線画として描画される
 * - sub:    サブ領域（subColor。未指定時は mainColor の濃い色）
 * - detail: 追加の線画（縫い目・ポケットなど）
 * viewBox は部位ごとに異なる（着せ替え画面で人型に重ねるときに使う）。
 */
export type Template = {
  viewBox: string;
  main: string;
  sub?: string;
  detail?: string;
  /** 左右ペアで表示する（靴） */
  pair?: boolean;
};

const TOP_VB = '0 0 100 100';
const BOTTOM_VB = '0 0 100 190';
const ONEPIECE_VB = '0 0 100 200';
const SHOE_VB = '0 36 100 52';

// 半袖 / 長袖のトップス本体
const SHORT_SLEEVE = 'M38 8 Q50 17 62 8 L80 14 L94 38 L81 44 L77 36 L77 92 L23 92 L23 36 L19 44 L6 38 L20 14 Z';
const LONG_SLEEVE = 'M38 8 Q50 17 62 8 L80 14 L96 80 L84 84 L77 38 L77 92 L23 92 L23 38 L16 84 L4 80 L20 14 Z';
const HEM_BAND = 'M23 83 H77 V92 H23 Z';

// 前が開いたアウター（インナーが見える）。bottom は裾の y
const openOuter = (bottom: number) =>
  `M38 8 Q50 17 62 8 L80 14 L96 ${bottom - 12} L84 ${bottom - 8} L77 38 L77 ${bottom} L56 ${bottom} L52 22 L48 22 L44 ${bottom} L23 ${bottom} L23 38 L16 ${bottom - 8} L4 ${bottom - 12} L20 14 Z`;

export const TEMPLATES: Record<Category, Template> = {
  // ---- top ----
  tshirt: { viewBox: TOP_VB, main: SHORT_SLEEVE, sub: 'M38 8 Q50 17 62 8 L60 6 Q50 13 40 6 Z' },
  shirt: {
    viewBox: TOP_VB,
    main: LONG_SLEEVE,
    sub: 'M38 8 L50 20 L62 8 L58 5 L50 12 L42 5 Z',
    detail: 'M50 20 V92 M16 84 L24 86 M84 84 L76 86',
  },
  knit: { viewBox: TOP_VB, main: LONG_SLEEVE, sub: HEM_BAND, detail: 'M30 40 V82 M40 40 V82 M60 40 V82 M70 40 V82' },
  hoodie: {
    viewBox: TOP_VB,
    main: LONG_SLEEVE,
    sub: 'M32 8 Q50 -4 68 8 Q50 26 32 8 Z',
    detail: 'M40 20 V34 M60 20 V34 M34 70 H66 L70 84 H30 Z',
  },
  sweatshirt: { viewBox: TOP_VB, main: LONG_SLEEVE, sub: HEM_BAND, detail: 'M38 8 Q50 17 62 8' },
  blouse: {
    viewBox: TOP_VB,
    main: 'M38 8 Q50 17 62 8 L80 14 L94 52 L82 56 L77 36 L80 92 L20 92 L23 36 L18 56 L6 52 L20 14 Z',
    sub: 'M40 8 Q50 22 60 8 L56 6 Q50 14 44 6 Z',
    detail: 'M50 20 V92',
  },

  // ---- bottom ----
  denim: {
    viewBox: BOTTOM_VB,
    main: 'M24 6 H76 L82 184 H54 L50 70 L46 184 H18 Z',
    sub: 'M24 6 H76 V22 H24 Z',
    detail: 'M50 22 V70 M30 26 Q36 40 44 36 M70 26 Q64 40 56 36',
  },
  chino: {
    viewBox: BOTTOM_VB,
    main: 'M24 6 H76 L80 184 H54 L50 70 L46 184 H20 Z',
    sub: 'M24 6 H76 V22 H24 Z',
    detail: 'M50 22 V70 M32 24 V44 M68 24 V44',
  },
  slacks: {
    viewBox: BOTTOM_VB,
    main: 'M26 6 H74 L76 184 H54 L50 70 L46 184 H24 Z',
    sub: 'M26 6 H74 V20 H26 Z',
    detail: 'M38 22 V180 M62 22 V180 M50 20 V70',
  },
  wide_pants: {
    viewBox: BOTTOM_VB,
    main: 'M24 6 H76 L94 184 H54 L50 76 L46 184 H6 Z',
    sub: 'M24 6 H76 V22 H24 Z',
    detail: 'M50 22 V76 M34 22 L24 180 M66 22 L76 180',
  },
  shorts: {
    viewBox: BOTTOM_VB,
    main: 'M24 6 H76 L82 100 H54 L50 56 L46 100 H18 Z',
    sub: 'M24 6 H76 V22 H24 Z',
    detail: 'M50 22 V56',
  },
  skirt_short: {
    viewBox: BOTTOM_VB,
    main: 'M26 6 H74 L86 96 H14 Z',
    sub: 'M26 6 H74 V20 H26 Z',
    detail: 'M40 20 L34 96 M60 20 L66 96',
  },
  skirt_long: {
    viewBox: BOTTOM_VB,
    main: 'M26 6 H74 L92 184 H8 Z',
    sub: 'M26 6 H74 V20 H26 Z',
    detail: 'M38 20 L28 184 M50 20 V184 M62 20 L72 184',
  },

  // ---- onepiece ----
  dress: {
    viewBox: ONEPIECE_VB,
    main: 'M38 6 Q50 16 62 6 L72 12 L68 52 L80 92 L94 190 H6 L20 92 L32 52 L28 12 Z',
    sub: 'M32 60 H68 L70 70 H30 Z',
    detail: 'M50 16 V60',
  },

  // ---- outer ----
  jacket: { viewBox: TOP_VB, main: openOuter(92), sub: 'M38 8 L48 22 L44 30 L34 16 Z M62 8 L52 22 L56 30 L66 16 Z', detail: 'M30 70 H40 M60 70 H70' },
  coat: { viewBox: TOP_VB, main: openOuter(100), sub: 'M38 8 L48 22 L42 34 L30 16 Z M62 8 L52 22 L58 34 L70 16 Z', detail: 'M30 66 H40 M60 66 H70' },
  cardigan: { viewBox: TOP_VB, main: openOuter(92), sub: 'M44 22 L48 22 L44 92 L23 92 L23 83 L44 83 Z M56 22 L52 22 L56 92 L77 92 L77 83 L56 83 Z', detail: 'M38 40 V80 M62 40 V80' },
  blouson: { viewBox: TOP_VB, main: openOuter(82), sub: 'M23 74 H44 V82 H23 Z M56 74 H77 V82 H56 Z', detail: 'M34 40 H42 M58 40 H66' },

  // ---- shoes ----
  sneakers: {
    viewBox: SHOE_VB,
    main: 'M6 76 L6 54 Q22 52 30 42 L44 48 Q58 52 74 62 Q94 66 94 76 Z',
    sub: 'M6 76 H94 V84 H6 Z',
    detail: 'M36 46 L42 56 M46 50 L52 60 M26 60 H60',
    pair: true,
  },
  leather_shoes: {
    viewBox: SHOE_VB,
    main: 'M6 76 L6 56 Q20 56 28 50 L40 52 Q60 54 76 64 Q94 66 94 76 Z',
    sub: 'M6 76 H94 V82 H6 Z M6 82 H20 V86 H6 Z',
    detail: 'M40 52 Q44 60 58 62',
    pair: true,
  },
  boots: {
    viewBox: '0 20 100 68',
    main: 'M10 76 L10 28 H34 L36 50 Q58 54 74 62 Q94 66 94 76 Z',
    sub: 'M10 76 H94 V84 H10 Z',
    detail: 'M10 36 H34',
    pair: true,
  },
  sandals: {
    viewBox: SHOE_VB,
    main: 'M8 74 Q8 66 20 66 L80 66 Q94 66 94 74 Z',
    sub: 'M8 74 H94 V80 H8 Z',
    detail: 'M34 66 L44 50 L54 66 M60 66 L66 54 L74 66',
    pair: true,
  },

  // ---- accessory ----
  bag: {
    viewBox: '0 6 100 90',
    main: 'M18 40 H82 L88 92 H12 Z',
    sub: 'M18 40 H82 L83 50 H17 Z',
    detail: 'M34 40 Q34 12 50 12 Q66 12 66 40',
  },
  hat: {
    viewBox: '0 14 100 62',
    main: 'M26 58 Q26 22 50 22 Q74 22 74 58 Z',
    sub: 'M6 58 H94 Q94 72 50 72 Q6 72 6 58 Z',
    detail: 'M26 52 H74',
  },
};
