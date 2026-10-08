/** 画像のピクセル（RGBA、1ピクセル4要素） */
export type Pixels = { data: ArrayLike<number>; width: number; height: number };

export type DominantColors = {
  /** 服のメインカラー候補（#RRGGBB） */
  main: string;
  /** 2番目に目立つ色（柄・配色の2色目の候補）。目立つ色がなければ null */
  secondary: string | null;
  /** 背景を除去して判定したか */
  removedBackground: boolean;
};

type RGB = [number, number, number];

const BORDER_RATIO = 0.08; // 外周この割合を背景のサンプルとみなす
const BG_DISTANCE = 45; // 背景色とみなす距離
const BG_UNIFORM_MIN = 0.6; // 外周のうち背景色に近い割合がこれ以上なら「単色の背景」
const MIN_FOREGROUND = 0.08; // 背景除去後に残る割合がこれ未満なら、服が背景と同色とみなして除去しない
const CENTER_RATIO = 0.45; // 背景が単色でないとき、画像中央のこの割合だけを見る
const K = 4;
const SECOND_MIN_SHARE = 0.15;
const SECOND_MIN_DISTANCE = 60;
const MAX_SAMPLES = 4000;

const dist = (a: RGB, b: RGB) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
export const rgbToHex = ([r, g, b]: RGB) =>
  `#${[r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

function kmeans(points: RGB[]): { center: RGB; count: number }[] {
  // 初期値：最初の点から、いちばん遠い点を順に選ぶ（結果が毎回同じになる）
  const centers: RGB[] = [points[0]];
  while (centers.length < Math.min(K, points.length)) {
    let best = points[0];
    let bestD = -1;
    for (const p of points) {
      const d = Math.min(...centers.map((c) => dist(p, c)));
      if (d > bestD) {
        bestD = d;
        best = p;
      }
    }
    if (bestD < 1) break;
    centers.push(best);
  }
  let counts = new Array(centers.length).fill(0);
  for (let iter = 0; iter < 8; iter++) {
    const sums = centers.map(() => [0, 0, 0]);
    counts = new Array(centers.length).fill(0);
    for (const p of points) {
      let bi = 0;
      let bd = Infinity;
      centers.forEach((c, i) => {
        const d = dist(p, c);
        if (d < bd) {
          bd = d;
          bi = i;
        }
      });
      sums[bi][0] += p[0];
      sums[bi][1] += p[1];
      sums[bi][2] += p[2];
      counts[bi]++;
    }
    sums.forEach((s, i) => {
      if (counts[i]) centers[i] = [s[0] / counts[i], s[1] / counts[i], s[2] / counts[i]];
    });
  }
  return centers.map((center, i) => ({ center, count: counts[i] })).filter((c) => c.count > 0);
}

/**
 * 服の写真から、メインカラーと2番目の色を取り出す。
 * - 外周が単色なら背景とみなして除く（床・机・壁など）
 * - 背景が単色でなければ、画像中央だけを見る
 * - 服が背景と同じ色（白い服を白い壁で撮った等）なら、除かずに全体を見る
 */
export function extractDominantColors({ data, width, height }: Pixels): DominantColors | null {
  const px = (x: number, y: number): RGB & { 3?: number } => {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const alpha = (x: number, y: number) => data[(y * width + x) * 4 + 3];
  const bx = Math.max(1, Math.round(width * BORDER_RATIO));
  const by = Math.max(1, Math.round(height * BORDER_RATIO));

  // 背景色の推定（外周の中央値）
  const ring: RGB[] = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (x < bx || x >= width - bx || y < by || y >= height - by) ring.push(px(x, y));
  if (ring.length === 0) return null;
  const bg: RGB = [median(ring.map((c) => c[0])), median(ring.map((c) => c[1])), median(ring.map((c) => c[2]))];
  const uniformBg = ring.filter((c) => dist(c, bg) <= BG_DISTANCE).length / ring.length >= BG_UNIFORM_MIN;

  // useBg=false のときは背景を除去せず全体（単色背景）または中央（それ以外）を見る
  const collect = (useBg: boolean): RGB[] => {
    const out: RGB[] = [];
    const x0 = Math.round((width * (1 - CENTER_RATIO)) / 2);
    const x1 = width - x0;
    const y0 = Math.round((height * (1 - CENTER_RATIO)) / 2);
    const y1 = height - y0;
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        if (alpha(x, y) < 128) continue;
        if (!uniformBg && (x < x0 || x >= x1 || y < y0 || y >= y1)) continue;
        const c = px(x, y);
        if (useBg && uniformBg && dist(c, bg) <= BG_DISTANCE) continue;
        out.push(c);
      }
    return out;
  };

  let removedBackground = uniformBg;
  let pts = collect(true);
  if (uniformBg && pts.length < width * height * MIN_FOREGROUND) {
    removedBackground = false;
    pts = collect(false);
  }
  if (pts.length === 0) return null;

  // 間引いてクラスタリング
  const step = Math.max(1, Math.floor(pts.length / MAX_SAMPLES));
  const sample = pts.filter((_, i) => i % step === 0);
  const clusters = kmeans(sample).sort((a, b) => b.count - a.count);
  const total = sample.length;
  const main = clusters[0];
  const second = clusters
    .slice(1)
    .find((c) => c.count / total >= SECOND_MIN_SHARE && dist(c.center, main.center) >= SECOND_MIN_DISTANCE);
  return { main: rgbToHex(main.center), secondary: second ? rgbToHex(second.center) : null, removedBackground };
}
