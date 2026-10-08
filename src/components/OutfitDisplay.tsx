import { FlatLay, hasAnyPhoto } from './FlatLay';
import { Mannequin, type MannequinItems } from './Mannequin';

/**
 * コーデの表示。写真のある服が含まれていれば平置き（写真）、なければ人型（イラスト）。
 * mode='illust' で人型（イラスト）に固定できる。
 */
export function OutfitDisplay({ items, width, mode = 'auto' }: { items: MannequinItems; width: number; mode?: 'auto' | 'illust' }) {
  return mode === 'auto' && hasAnyPhoto(items) ? <FlatLay items={items} width={width} /> : <Mannequin items={items} width={width} />;
}
