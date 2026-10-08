import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { decodeJpegBase64 } from './decode';
import { ANALYZE_EDGE, THUMB_EDGE, type PhotoSource, type PickedPhoto } from './types';

async function resize(uri: string, width: number, height: number, edge: number, compress: number) {
  const target = width >= height ? { width: edge } : { height: edge };
  return ImageManipulator.manipulateAsync(uri, [{ resize: target }], {
    base64: true,
    compress,
    format: ImageManipulator.SaveFormat.JPEG,
  });
}

/** カメラ / アルバムから1枚選ぶ。キャンセル・権限なしなら null */
export async function pickPhoto(source: PhotoSource): Promise<PickedPhoto | null> {
  const perm =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];

  const thumb = await resize(asset.uri, asset.width, asset.height, THUMB_EDGE, 0.75);
  let pixels = null;
  try {
    const small = await resize(asset.uri, asset.width, asset.height, ANALYZE_EDGE, 0.85);
    pixels = small.base64 ? decodeJpegBase64(small.base64) : null;
  } catch {
    pixels = null; // 色の読み取りに失敗しても、写真の保存と手入力は続けられる
  }
  // ネイティブは背景除去（透過PNGの書き出し）に未対応。元の写真をそのまま使う
  return { thumbUri: `data:image/jpeg;base64,${thumb.base64}`, cutoutUri: null, pixels };
}
