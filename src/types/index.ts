export const SLOTS = ['top', 'bottom', 'onepiece', 'outer', 'shoes', 'accessory'] as const;
export type Slot = (typeof SLOTS)[number];

export const CATEGORY_SLOT = {
  tshirt: 'top',
  shirt: 'top',
  knit: 'top',
  hoodie: 'top',
  sweatshirt: 'top',
  blouse: 'top',
  denim: 'bottom',
  chino: 'bottom',
  slacks: 'bottom',
  wide_pants: 'bottom',
  shorts: 'bottom',
  skirt_short: 'bottom',
  skirt_long: 'bottom',
  dress: 'onepiece',
  jacket: 'outer',
  coat: 'outer',
  cardigan: 'outer',
  blouson: 'outer',
  sneakers: 'shoes',
  leather_shoes: 'shoes',
  boots: 'shoes',
  sandals: 'shoes',
  bag: 'accessory',
  hat: 'accessory',
} as const satisfies Record<string, Slot>;

export type Category = keyof typeof CATEGORY_SLOT;

export type Pattern = 'plain' | 'stripe' | 'check' | 'dot' | 'floral' | 'logo';
export type Fit = 'tight' | 'regular' | 'loose';
export type Length = 'short' | 'regular' | 'long';
export type Taste =
  | 'casual'
  | 'clean'
  | 'street'
  | 'mode'
  | 'sporty'
  | 'feminine'
  | 'natural';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Thickness = 'thin' | 'medium' | 'thick';

export type ClothingItem = {
  id: string;
  category: Category;
  mainColor: string; // HEX
  subColor: string | null;
  pattern: Pattern;
  fit: Fit;
  length: Length;
  tastes: Taste[]; // 1〜2個
  seasons: Season[];
  thickness: Thickness;
  photoUri: string | null;
  isOwned: boolean;
  name: string;
  createdAt: string; // ISO
};

export type Outfit = {
  id: string;
  itemIds: {
    top?: string;
    bottom?: string;
    onepiece?: string;
    outer?: string;
    shoes?: string;
    accessory?: string[];
  };
  score: number;
  wornDates: string[];
  createdAt: string;
};

export type ScoreReason = { type: 'plus' | 'minus'; message: string; points: number };

export type ScoreResult = {
  total: number; // 0〜100
  breakdown: {
    color: number; // 0〜40
    silhouette: number; // 0〜30
    taste: number; // 0〜20
    season: number; // 0〜10
  };
  /** 減点（points < 0）を大きい順、そのあと加点（points > 0） */
  reasons: ScoreReason[];
};
