import jpeg from 'jpeg-js';
import { decodeJpegBase64 } from '../decode';
import { extractDominantColors, rgbToHex, type Pixels } from '../dominantColor';
import { hexToHsl } from '../../color';

type RGB = [number, number, number];
/** fn(x, y) で色を返す合成画像 */
function image(w: number, h: number, fn: (x: number, y: number) => RGB): Pixels {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [r, g, b] = fn(x, y);
      const i = (y * w + x) * 4;
      data.set([r, g, b, 255], i);
    }
  return { data, width: w, height: h };
}
const inCenter = (x: number, y: number, w = 100, h = 100) => x > w * 0.25 && x < w * 0.75 && y > h * 0.15 && y < h * 0.85;
const near = (hex: string, rgb: RGB, tol = 30) => {
  const v = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
  return Math.hypot(c[0] - rgb[0], c[1] - rgb[1], c[2] - rgb[2]) <= tol;
};

describe('extractDominantColors', () => {
  it('白い床の上の赤い服 → 赤', () => {
    const r = extractDominantColors(image(100, 100, (x, y) => (inCenter(x, y) ? [211, 47, 47] : [245, 245, 245])));
    expect(r && near(r.main, [211, 47, 47])).toBe(true);
    expect(r?.removedBackground).toBe(true);
  });

  it('グレーの机の上のネイビー＋白ストライプ → メインはネイビー、2色目は白', () => {
    const r = extractDominantColors(
      image(100, 100, (x, y) => (inCenter(x, y) ? (Math.floor(x / 5) % 3 === 0 ? [250, 250, 250] : [31, 42, 68]) : [150, 150, 150])),
    );
    expect(r && near(r.main, [31, 42, 68])).toBe(true);
    expect(r?.secondary && near(r.secondary, [250, 250, 250])).toBe(true);
  });

  it('白い壁で撮った白い服（背景と同色）→ 白のまま判定できる', () => {
    const r = extractDominantColors(image(100, 100, (x, y) => (inCenter(x, y) ? [252, 252, 252] : [250, 250, 250])));
    expect(r && near(r.main, [252, 252, 252], 10)).toBe(true);
    expect(r?.removedBackground).toBe(false);
  });

  it('背景が単色でないとき（床の模様など）は中央を優先する', () => {
    const r = extractDominantColors(
      image(100, 100, (x, y) => (inCenter(x, y, 100, 100) && x > 35 && x < 65 && y > 30 && y < 70 ? [74, 111, 165] : (x + y) % 2 ? [200, 120, 40] : [30, 160, 90])),
    );
    expect(r && near(r.main, [74, 111, 165], 40)).toBe(true);
  });

  it('影やグラデーションがあっても同じ色味（色相）を保つ', () => {
    const r = extractDominantColors(
      image(100, 100, (x, y) => (inCenter(x, y) ? [Math.round(50 + x * 0.3), Math.round(90 + x * 0.4), Math.round(160 + x * 0.3)] : [240, 240, 240])),
    );
    const hsl = hexToHsl(r!.main);
    expect(hsl.h).toBeGreaterThan(200);
    expect(hsl.h).toBeLessThan(230);
  });

  it('全面が透明なら null', () => {
    const data = new Uint8ClampedArray(10 * 10 * 4); // alpha = 0
    expect(extractDominantColors({ data, width: 10, height: 10 })).toBeNull();
  });

  it('rgbToHex', () => {
    expect(rgbToHex([255, 0, 128])).toBe('#FF0080');
  });
});

describe('decodeJpegBase64（ネイティブ用）', () => {
  it('JPEG を展開して色を取り出せる', () => {
    const src = image(64, 64, (x, y) => (inCenter(x, y, 64, 64) ? [211, 47, 47] : [245, 245, 245]));
    const encoded = jpeg.encode({ data: new Uint8Array((src.data as Uint8ClampedArray).buffer), width: 64, height: 64 }, 85);
    const px = decodeJpegBase64(btoa(Array.from(encoded.data as Uint8Array, (b: number) => String.fromCharCode(b)).join('')));
    expect(px.width).toBe(64);
    const r = extractDominantColors(px);
    expect(r && near(r.main, [211, 47, 47], 40)).toBe(true);
  });
});
