import type { ClothingItem, Outfit } from '../types';

export interface Repository {
  listItems(): Promise<ClothingItem[]>;
  upsertItem(item: ClothingItem): Promise<void>;
  deleteItem(id: string): Promise<void>;
  deleteItems(ids: string[]): Promise<void>;
  listOutfits(): Promise<Outfit[]>;
  upsertOutfit(outfit: Outfit): Promise<void>;
  deleteOutfit(id: string): Promise<void>;
  deleteOutfits(ids: string[]): Promise<void>;
}
