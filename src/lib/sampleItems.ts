import type { ClothingItem } from '../types';

type Sample = Omit<ClothingItem, 'id' | 'photoUri' | 'isOwned' | 'createdAt' | 'subColor'> & {
  subColor?: string | null;
};

const ALL = ['spring', 'summer', 'autumn', 'winter'] as const;

const base = { pattern: 'plain', fit: 'regular', length: 'regular', thickness: 'medium' } as const;

/** 動作確認用のサンプル（設定 / ホームから登録できる） */
export const SAMPLE_ITEMS: Sample[] = [
  { ...base, name: '白T', category: 'tshirt', mainColor: '#FFFFFF', tastes: ['casual'], seasons: ['spring', 'summer', 'autumn'], thickness: 'thin' },
  { ...base, name: 'ボーダーT', category: 'tshirt', mainColor: '#FFFFFF', subColor: '#1F2A44', pattern: 'stripe', tastes: ['casual', 'natural'], seasons: ['spring', 'summer', 'autumn'], thickness: 'thin' },
  { ...base, name: 'オーバーパーカー', category: 'hoodie', mainColor: '#9CA3AF', fit: 'loose', tastes: ['street', 'casual'], seasons: ['spring', 'autumn', 'winter'], thickness: 'thick' },
  { ...base, name: 'きれいめシャツ', category: 'shirt', mainColor: '#BFD7F2', tastes: ['clean'], seasons: ['spring', 'summer', 'autumn'] },
  { ...base, name: 'ベージュニット', category: 'knit', mainColor: '#C9B79C', tastes: ['natural', 'clean'], seasons: ['autumn', 'winter'], thickness: 'thick' },
  { ...base, name: 'デニム', category: 'denim', mainColor: '#4A6FA5', tastes: ['casual'], seasons: [...ALL] },
  { ...base, name: 'ワイドパンツ', category: 'wide_pants', mainColor: '#111111', fit: 'loose', tastes: ['mode', 'street'], seasons: [...ALL] },
  { ...base, name: 'チノ', category: 'chino', mainColor: '#C9B79C', tastes: ['clean', 'casual'], seasons: ['spring', 'summer', 'autumn'] },
  { ...base, name: 'フレアスカート', category: 'skirt_long', mainColor: '#F28CA8', tastes: ['feminine'], seasons: ['spring', 'summer', 'autumn'], thickness: 'thin' },
  { ...base, name: '花柄ワンピ', category: 'dress', mainColor: '#FFFFFF', subColor: '#D32F2F', pattern: 'floral', tastes: ['feminine'], seasons: ['spring', 'summer'], thickness: 'thin' },
  { ...base, name: 'デニムジャケット', category: 'jacket', mainColor: '#4A6FA5', length: 'short', tastes: ['casual'], seasons: ['spring', 'autumn'] },
  { ...base, name: 'ロングコート', category: 'coat', mainColor: '#C9B79C', length: 'long', tastes: ['clean'], seasons: ['autumn', 'winter'], thickness: 'thick' },
  { ...base, name: 'カーディガン', category: 'cardigan', mainColor: '#6B7048', tastes: ['natural'], seasons: ['spring', 'autumn'] },
  { ...base, name: '白スニーカー', category: 'sneakers', mainColor: '#FFFFFF', tastes: ['casual', 'clean'], seasons: [...ALL] },
  { ...base, name: '黒スニーカー', category: 'sneakers', mainColor: '#111111', tastes: ['street', 'casual'], seasons: [...ALL] },
  { ...base, name: 'ブーツ', category: 'boots', mainColor: '#6B4A32', tastes: ['natural'], seasons: ['autumn', 'winter'] },
  { ...base, name: 'トートバッグ', category: 'bag', mainColor: '#C9B79C', tastes: ['natural', 'casual'], seasons: [...ALL] },
  { ...base, name: 'キャップ', category: 'hat', mainColor: '#1F2A44', tastes: ['casual', 'street'], seasons: ['spring', 'summer', 'autumn'] },
];
