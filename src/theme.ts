/** デザイントークン（UIモックの配色・角丸・影に合わせる） */
export const colors = {
  bg: '#F6F5F2', // 画面背景（あたたかいオフホワイト）
  card: '#FFFFFF',
  tile: '#F1F0EC', // 服写真のタイル背景
  ink: '#12284C', // メイン（ネイビー）
  text: '#1F2937',
  sub: '#6B7280',
  mute: '#9CA3AF',
  line: '#E9E7E2',
  green: '#16A34A',
  greenSoft: '#DCFCE7',
  amber: '#D97706',
  amberSoft: '#FEF3C7',
  red: '#DC2626',
  redSoft: '#FEE2E2',
  white: '#FFFFFF',
} as const;

export const radius = { card: 18, tile: 12, btn: 14, pill: 999 } as const;

export const shadow = {
  shadowColor: '#1F2937',
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

export const font = { title: 28, h2: 17, body: 14, small: 12, tiny: 10 } as const;

export const scoreColor = (total: number) => (total >= 80 ? colors.green : total >= 60 ? colors.amber : colors.red);

export const scoreComment = (total: number) =>
  total >= 80 ? 'バランスの取れたおすすめのコーデです' : total >= 60 ? 'あと少し整えると、もっと良くなります' : '見直しポイントがあります';
