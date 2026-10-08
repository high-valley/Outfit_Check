import type { Pixels } from './dominantColor';

export type Cutout = {
  /** 透明を含む RGBA ピクセル（服の外接矩形に切り詰め済み） */
  pixels: { data: Uint8ClampedArray; width: number; height: number };
  /** 元画像に対する服の面積比 */
  foregroundRatio: number;
};

const BORDER_RATIO = 0.04;
const BG_UNIFORM_MIN = 0.7; // 外周のうち背景色に近い割合
const T_LOW = 36; // この距離以下は完全に背景
const T_HIGH = 64; // この距離を超えると完全に服。間は半透明（縁のなじませ）
const MIN_RATIO = 0.04;
const MAX_RATIO = 0.92;
const KEEP_COMPONENT_RATIO = 0.1; // 最大の塊の10%未満の小さな塊は消す
const PAD_RATIO = 0.04;

type RGB = [number, number, number];
const dist = (a: RGB, b: RGB) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

/**
 * 無地の背景に置いた服を切り抜く。
 * 画面の端から背景色でつながっている部分だけを透明にするので、服の内側にある背景に近い色
 * （白い縞、白いボタンなど）は残る。背景が単色でない / 服が背景と同色 / 切り抜きが不自然な場合は null。
 */
export function cutoutByBackground({ data, width, height }: Pixels): Cutout | null {
  const n = width * height;
  const px = (i: number): RGB => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
  const bx = Math.max(1, Math.round(width * BORDER_RATIO));
  const by = Math.max(1, Math.round(height * BORDER_RATIO));

  const ring: RGB[] = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (x < bx || x >= width - bx || y < by || y >= height - by) ring.push(px(y * width + x));
  const bg: RGB = [median(ring.map((c) => c[0])), median(ring.map((c) => c[1])), median(ring.map((c) => c[2]))];
  if (ring.filter((c) => dist(c, bg) <= T_HIGH).length / ring.length < BG_UNIFORM_MIN) return null;

  // 外周から、背景に近い画素だけをたどって背景領域を決める
  const d = new Float32Array(n);
  for (let i = 0; i < n; i++) d[i] = dist(px(i), bg);
  const isBg = new Uint8Array(n);
  const stack: number[] = [];
  const push = (i: number) => {
    if (!isBg[i] && d[i] <= T_HIGH) {
      isBg[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % width;
    if (x > 0) push(i - 1);
    if (x < width - 1) push(i + 1);
    if (i >= width) push(i - width);
    if (i < n - width) push(i + width);
  }

  // アルファ：背景領域は距離に応じて 0〜255（縁をなじませる）、それ以外は 255
  const alpha = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i++)
    alpha[i] = isBg[i] ? Math.round(255 * Math.min(1, Math.max(0, (d[i] - T_LOW) / (T_HIGH - T_LOW)))) : 255;

  // 小さなゴミ（ほこり、影の切れ端）を消す：連結成分のうち大きいものだけ残す
  const label = new Int32Array(n).fill(-1);
  const sizes: number[] = [];
  for (let s = 0; s < n; s++) {
    if (alpha[s] === 0 || label[s] !== -1) continue;
    const id = sizes.length;
    let size = 0;
    const st = [s];
    label[s] = id;
    while (st.length) {
      const i = st.pop()!;
      size++;
      const x = i % width;
      const nb = [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i >= width ? i - width : -1, i < n - width ? i + width : -1];
      for (const j of nb) if (j >= 0 && alpha[j] > 0 && label[j] === -1) {
        label[j] = id;
        st.push(j);
      }
    }
    sizes.push(size);
  }
  const biggest = Math.max(0, ...sizes);
  if (biggest === 0) return null;
  let fg = 0;
  for (let i = 0; i < n; i++) {
    if (label[i] >= 0 && sizes[label[i]] < biggest * KEEP_COMPONENT_RATIO) alpha[i] = 0;
    if (alpha[i] > 0) fg++;
  }
  const ratio = fg / n;
  if (ratio < MIN_RATIO || ratio > MAX_RATIO) return null;

  // 外接矩形に切り詰める
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (alpha[y * width + x] > 0) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  const px_ = Math.round(width * PAD_RATIO);
  const py_ = Math.round(height * PAD_RATIO);
  x0 = Math.max(0, x0 - px_);
  y0 = Math.max(0, y0 - py_);
  x1 = Math.min(width - 1, x1 + px_);
  y1 = Math.min(height - 1, y1 + py_);
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const si = (y + y0) * width + (x + x0);
      const o = (y * w + x) * 4;
      out[o] = data[si * 4];
      out[o + 1] = data[si * 4 + 1];
      out[o + 2] = data[si * 4 + 2];
      out[o + 3] = alpha[si];
    }
  return { pixels: { data: out, width: w, height: h }, foregroundRatio: ratio };
}
