import { create } from 'zustand';
import { repository } from '../db/repository';
import { SAMPLE_ITEMS } from '../lib/sampleItems';
import { newId } from '../lib/id';
import type { ClothingItem, Outfit } from '../types';

type State = {
  loaded: boolean;
  items: ClothingItem[];
  outfits: Outfit[];
  load: () => Promise<void>;
  saveItem: (item: ClothingItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  removeItems: (ids: string[]) => Promise<void>;
  saveOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt' | 'wornDates'> & Partial<Outfit>) => Promise<Outfit>;
  removeOutfits: (ids: string[]) => Promise<void>;
  /** コーデを着る：同じ組み合わせがあれば着用日を追加、なければ新規保存 */
  wearOutfit: (itemIds: Outfit['itemIds'], score: number, date: string) => Promise<void>;
  addSampleItems: () => Promise<void>;
};

/** 同じ組み合わせか判定するための正規化キー */
const outfitKey = (ids: Outfit['itemIds']) =>
  JSON.stringify([ids.top, ids.bottom, ids.onepiece, ids.outer, ids.shoes, [...(ids.accessory ?? [])].sort()]);

export const useStore = create<State>((set, get) => ({
  loaded: false,
  items: [],
  outfits: [],
  async load() {
    const [items, outfits] = await Promise.all([repository.listItems(), repository.listOutfits()]);
    set({ items, outfits, loaded: true });
  },
  async saveItem(item) {
    await repository.upsertItem(item);
    set({ items: [item, ...get().items.filter((i) => i.id !== item.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  },
  async removeItem(id) {
    await repository.deleteItem(id);
    set({ items: get().items.filter((i) => i.id !== id) });
  },
  async removeItems(ids) {
    await repository.deleteItems(ids);
    const gone = new Set(ids);
    set({ items: get().items.filter((i) => !gone.has(i.id)) });
  },
  async removeOutfits(ids) {
    await repository.deleteOutfits(ids);
    const gone = new Set(ids);
    set({ outfits: get().outfits.filter((o) => !gone.has(o.id)) });
  },
  async wearOutfit(itemIds, score, date) {
    const key = outfitKey(itemIds);
    const same = get().outfits.find((o) => outfitKey(o.itemIds) === key);
    if (same) {
      if (same.wornDates.includes(date)) return;
      const updated = { ...same, score, wornDates: [...same.wornDates, date] };
      await repository.upsertOutfit(updated);
      set({ outfits: get().outfits.map((o) => (o.id === same.id ? updated : o)) });
    } else {
      await get().saveOutfit({ itemIds, score, wornDates: [date] });
    }
  },
  async saveOutfit(partial) {
    const outfit: Outfit = {
      id: newId(),
      wornDates: [],
      createdAt: new Date().toISOString(),
      ...partial,
    };
    await repository.upsertOutfit(outfit);
    set({ outfits: [outfit, ...get().outfits] });
    return outfit;
  },
  async addSampleItems() {
    const now = Date.now();
    for (const [i, s] of SAMPLE_ITEMS.entries()) {
      await get().saveItem({
        ...s,
        id: newId(),
        subColor: s.subColor ?? null,
        photoUri: null,
        isOwned: true,
        createdAt: new Date(now - i).toISOString(),
      });
    }
  },
}));
