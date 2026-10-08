import type { MannequinItems } from '../components/Mannequin';
import type { ClothingItem, Outfit } from '../types';

/** Outfit の itemIds から服を引く（削除済みの服は無視する） */
export function resolveOutfit(outfit: Pick<Outfit, 'itemIds'>, items: ClothingItem[]) {
  const find = (id?: string) => (id ? (items.find((i) => i.id === id) ?? null) : null);
  const { top, bottom, onepiece, outer, shoes, accessory } = outfit.itemIds;
  const mannequin: MannequinItems = {
    top: find(top),
    bottom: find(bottom),
    onepiece: find(onepiece),
    outer: find(outer),
    shoes: find(shoes),
    accessory: (accessory ?? []).map(find).filter((x): x is ClothingItem => !!x),
  };
  const list = [mannequin.onepiece, mannequin.top, mannequin.bottom, mannequin.outer, mannequin.shoes, ...(mannequin.accessory ?? [])].filter(
    (x): x is ClothingItem => !!x,
  );
  return { mannequin, list };
}
