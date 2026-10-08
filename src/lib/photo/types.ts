import type { Pixels } from './dominantColor';

export type PhotoSource = 'camera' | 'library';

export type PickedPhoto = {
  /** 保存用の縮小画像（data URL の JPEG） */
  thumbUri: string;
  /** 背景を透明にした画像（data URL）。切り抜けなかった場合は null（元の写真を使う） */
  cutoutUri: string | null;
  /** 色の抽出用に縮小したピクセル。読み取れなかった場合は null（色は手動で選んでもらう） */
  pixels: Pixels | null;
};

/** 保存用サムネイルの長辺 / 色抽出用の長辺 */
export const THUMB_EDGE = 320;
export const ANALYZE_EDGE = 128;
