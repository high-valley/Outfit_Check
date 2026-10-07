import {
  ADJACENT_TONES,
  BASE_COLORS,
  HUE_GROUP_SIZE,
  NEUTRAL_BLACK_MAX_LIGHTNESS,
  NEUTRAL_MAX_SATURATION,
  NEUTRAL_WHITE_MIN_LIGHTNESS,
  TONE,
} from '../scoring/constants';

export type Hsl = { h: number; s: number; l: number }; // h: 0-360, s/l: 0-100
export type Tone = 'pale' | 'light' | 'vivid' | 'dull' | 'dark';
export type ColorKind = 'neutral' | 'base' | 'chromatic';

export type ColorInfo = {
  hsl: Hsl;
  kind: ColorKind;
  /** 色数カウント用のグループキー */
  group: string;
  /** chromatic のみ */
  tone?: Tone;
};

export function hexToHsl(hex: string): Hsl {
  let v = hex.trim().replace(/^#/, '');
  if (v.length === 3) v = v.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return { h: 0, s: 0, l: 0 };
  const r = parseInt(v.slice(0, 2), 16) / 255;
  const g = parseInt(v.slice(2, 4), 16) / 255;
  const b = parseInt(v.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

const inRange = (v: number, [lo, hi]: [number, number]) => v >= lo && v <= hi;

export function classifyTone({ s, l }: Hsl): Tone {
  if (l < TONE.darkMaxLightness) return 'dark';
  if (l >= TONE.paleMinLightness) return 'pale';
  if (l >= TONE.lightMinLightness) return 'light';
  return s >= TONE.vividMinSaturation ? 'vivid' : 'dull';
}

export function areTonesAdjacent(a: Tone, b: Tone): boolean {
  return ADJACENT_TONES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export function classifyColor(hex: string): ColorInfo {
  const hsl = hexToHsl(hex);
  if (hsl.s < NEUTRAL_MAX_SATURATION) {
    const name =
      hsl.l >= NEUTRAL_WHITE_MIN_LIGHTNESS
        ? 'white'
        : hsl.l <= NEUTRAL_BLACK_MAX_LIGHTNESS
          ? 'black'
          : 'gray';
    return { hsl, kind: 'neutral', group: `neutral:${name}` };
  }
  const base = BASE_COLORS.find(
    ({ range }) => inRange(hsl.h, range.h) && inRange(hsl.s, range.s) && inRange(hsl.l, range.l),
  );
  if (base) return { hsl, kind: 'base', group: `base:${base.name}` };
  const groupCount = 360 / HUE_GROUP_SIZE;
  const hueGroup = Math.round(hsl.h / HUE_GROUP_SIZE) % groupCount;
  return { hsl, kind: 'chromatic', group: `hue:${hueGroup}`, tone: classifyTone(hsl) };
}

/** 色相差（0〜180） */
export function hueDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}
