import jpeg from 'jpeg-js';
import type { Pixels } from './dominantColor';

/** base64 の JPEG をピクセルに展開する（ネイティブ側で使用。純粋JSなので Jest で検証できる） */
export function decodeJpegBase64(base64: string): Pixels {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const { data, width, height } = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
  return { data, width, height };
}
