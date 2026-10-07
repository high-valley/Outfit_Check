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
  saveOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt' | 'wornDates'> & Partial<Outfit>) => Promise<Outfit>;
  addSampleItems: () => Promise<void>;
};

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
