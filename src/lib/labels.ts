import type { Category, Fit, Length, Pattern, Season, Slot, Taste, Thickness } from '../types';

export const SLOT_LABEL: Record<Slot, string> = {
  top: 'トップス',
  bottom: 'ボトムス',
  onepiece: 'ワンピース',
  outer: 'アウター',
  shoes: '靴',
  accessory: '小物',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  tshirt: 'Tシャツ',
  shirt: 'シャツ',
  knit: 'ニット',
  hoodie: 'パーカー',
  sweatshirt: 'スウェット',
  blouse: 'ブラウス',
  denim: 'デニム',
  chino: 'チノパン',
  slacks: 'スラックス',
  wide_pants: 'ワイドパンツ',
  shorts: 'ショーツ',
  skirt_short: 'ミニスカート',
  skirt_long: 'ロングスカート',
  dress: 'ワンピース',
  jacket: 'ジャケット',
  coat: 'コート',
  cardigan: 'カーディガン',
  blouson: 'ブルゾン',
  sneakers: 'スニーカー',
  leather_shoes: '革靴',
  boots: 'ブーツ',
  sandals: 'サンダル',
  bag: 'バッグ',
  hat: '帽子',
};

export const PATTERN_LABEL: Record<Pattern, string> = {
  plain: '無地',
  stripe: 'ストライプ',
  check: 'チェック',
  dot: 'ドット',
  floral: '花柄',
  logo: 'ロゴ',
};
export const FIT_LABEL: Record<Fit, string> = { tight: 'タイト', regular: 'レギュラー', loose: 'ゆったり' };
export const LENGTH_LABEL: Record<Length, string> = { short: '短め', regular: '標準', long: '長め' };
export const TASTE_LABEL: Record<Taste, string> = {
  casual: 'カジュアル',
  clean: 'きれいめ',
  street: 'ストリート',
  mode: 'モード',
  sporty: 'スポーティ',
  feminine: 'フェミニン',
  natural: 'ナチュラル',
};
export const SEASON_LABEL: Record<Season, string> = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
export const THICKNESS_LABEL: Record<Thickness, string> = { thin: '薄手', medium: '普通', thick: '厚手' };

export const COLOR_PRESETS = [
  '#FFFFFF', '#E5E7EB', '#9CA3AF', '#111111',
  '#1F2A44', '#4A6FA5', '#C9B79C', '#6B4A32',
  '#6B7048', '#D32F2F', '#F28CA8', '#FBC02D',
  '#388E3C', '#1976D2', '#7B1FA2', '#F57C00',
];

export { scoreColor } from '../theme';
