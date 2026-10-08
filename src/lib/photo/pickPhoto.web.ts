import { ANALYZE_EDGE, THUMB_EDGE, type PhotoSource, type PickedPhoto } from './types';

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('画像を読み込めませんでした'));
    };
    img.src = url; // EXIF の向きはブラウザが自動で補正する
  });
}

function draw(img: HTMLImageElement, edge: number, smooth: boolean) {
  const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#FFFFFF'; // 透過PNGは白地にする
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // 色の分析用は補間しない（縮小で細い柄が周りの色と混ざって濁るのを防ぐ）
  ctx.imageSmoothingEnabled = smooth;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

/** カメラ / アルバムから1枚選ぶ。キャンセルしたら null */
export function pickPhoto(source: PhotoSource): Promise<PickedPhoto | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (source === 'camera') input.setAttribute('capture', 'environment');
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      try {
        const img = await loadImage(file);
        const thumb = draw(img, THUMB_EDGE, true);
        const small = draw(img, ANALYZE_EDGE, false);
        const { width, height } = small.canvas;
        resolve({
          thumbUri: thumb.canvas.toDataURL('image/jpeg', 0.75),
          pixels: { data: small.ctx.getImageData(0, 0, width, height).data, width, height },
        });
      } catch (e) {
        reject(e);
      }
    };
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}
