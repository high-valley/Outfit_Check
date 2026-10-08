import { cutoutByBackground } from '../cutout';
import type { Pixels } from '../dominantColor';

type RGB = [number, number, number];
function image(w: number, h: number, fn: (x: number, y: number) => RGB): Pixels {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) data.set([...fn(x, y), 255], (y * w + x) * 4);
  return { data, width: w, height: h };
}
const alphaAt = (c: { pixels: { data: Uint8ClampedArray; width: number } }, x: number, y: number) => c.pixels.data[(y * c.pixels.width + x) * 4 + 3];
const FLOOR: RGB = [226, 220, 208];

describe('cutoutByBackground', () => {
  it('無地の床の上の服 → 背景が透明、服は不透明、外接矩形に切り詰める', () => {
    const src = image(100, 100, (x, y) => (x >= 30 && x < 70 && y >= 20 && y < 80 ? [31, 42, 68] : FLOOR));
    const c = cutoutByBackground(src)!;
    expect(c).not.toBeNull();
    expect(c.pixels.width).toBeLessThan(60);
    expect(c.pixels.height).toBeLessThan(80);
    expect(alphaAt(c, 0, 0)).toBe(0); // 余白の角（背景）
    expect(alphaAt(c, Math.floor(c.pixels.width / 2), Math.floor(c.pixels.height / 2))).toBe(255);
    expect(c.foregroundRatio).toBeCloseTo(0.24, 1);
  });

  it('服の内側にある、床と違う色の縞（白い縞など）は透明にならない', () => {
    // 注意：床と同じような色の縞が服のふちに届いていると、床とつながって消える（元の写真に戻す切り替えで対応）
    const FLOOR_WHITE: RGB = [150, 150, 150];
    const src = image(100, 100, (x, y) => {
      if (!(x >= 24 && x < 84 && y >= 20 && y < 80)) return FLOOR_WHITE;
      return Math.floor(x / 6) % 3 === 0 ? [250, 250, 250] : [31, 42, 68]; // 床と同じ白っぽい縞（服の端は紺）
    });
    const c = cutoutByBackground(src)!;
    expect(c).not.toBeNull();
    // 服の中の横一列は、白縞の位置でも不透明のまま（左右の余白 4px を除く）
    const mid = Math.floor(c.pixels.height / 2);
    for (let x = 6; x < c.pixels.width - 6; x++) expect(alphaAt(c, x, mid)).toBe(255);
  });

  it('背景が単色でない（模様がある）と null', () => {
    const src = image(100, 100, (x, y) => (x >= 30 && x < 70 && y >= 20 && y < 80 ? [31, 42, 68] : (x + y) % 2 ? [200, 120, 40] : [30, 160, 90]));
    expect(cutoutByBackground(src)).toBeNull();
  });

  it('服が背景と同色（全面が同じ色）なら null', () => {
    expect(cutoutByBackground(image(100, 100, () => [250, 250, 250]))).toBeNull();
  });

  it('小さなゴミは消える', () => {
    const src = image(100, 100, (x, y) => {
      if (x >= 30 && x < 70 && y >= 20 && y < 80) return [31, 42, 68];
      if (x >= 6 && x < 9 && y >= 6 && y < 9) return [90, 20, 20]; // 3x3 のゴミ
      return FLOOR;
    });
    const c = cutoutByBackground(src)!;
    expect(c.pixels.width).toBeLessThan(60); // ゴミを含んでいたら左上まで広がる
  });

  it('靴のように離れた2つの塊は両方残る', () => {
    const src = image(120, 60, (x, y) => ((x >= 10 && x < 50) || (x >= 70 && x < 110)) && y >= 15 && y < 45 ? [20, 20, 20] : FLOOR);
    const c = cutoutByBackground(src)!;
    expect(c.pixels.width).toBeGreaterThan(95);
  });
});
