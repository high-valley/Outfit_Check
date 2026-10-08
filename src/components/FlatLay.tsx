import { Image, View } from 'react-native';
import { ClothingIllustration } from './ClothingIllustration';
import type { MannequinItems } from './Mannequin';
import type { ClothingItem } from '../types';

const W = 200;
const H = 420;
type Region = { x: number; y: number; w: number; h: number };
const REGION = {
  outer: { x: 0, y: 0, w: 118, h: 150 },
  top: { x: 56, y: 14, w: 132, h: 140 },
  onepiece: { x: 44, y: 14, w: 112, h: 250 },
  bottom: { x: 50, y: 150, w: 100, h: 190 },
  shoes: { x: 30, y: 350, w: 140, h: 62 },
  hat: { x: 0, y: 170, w: 62, h: 50 },
  bag: { x: 140, y: 180, w: 60, h: 70 },
} satisfies Record<string, Region>;

/** 写真があれば写真（背景除去済みなら透過）、なければイラストを、枠に収めて表示する */
export function ItemImage({ item, width, height }: { item: ClothingItem; width: number; height: number }) {
  if (item.photoUri)
    return <Image source={{ uri: item.photoUri }} style={{ width, height }} resizeMode="contain" accessibilityLabel={item.name || item.category} />;
  return <ClothingIllustration category={item.category} mainColor={item.mainColor} subColor={item.subColor} pattern={item.pattern} width={width} height={height} />;
}

function Layer({ item, region }: { item: ClothingItem; region: Region }) {
  return (
    <View style={{ position: 'absolute', left: region.x, top: region.y, width: region.w, height: region.h }}>
      <ItemImage item={item} width={region.w} height={region.h} />
    </View>
  );
}

/** 平置きコーデ：服の写真を、トップス・ボトムス・靴の順に上から並べる */
export function FlatLay({ items, width = 200 }: { items: MannequinItems; width?: number }) {
  const scale = width / W;
  const acc = items.accessory ?? [];
  const hat = acc.find((a) => a.category === 'hat');
  const bag = acc.find((a) => a.category === 'bag');
  return (
    <View style={{ width, height: H * scale }}>
      <View style={{ width: W, height: H, transform: [{ scale }], transformOrigin: 'top left' }}>
        {items.bottom && !items.onepiece && <Layer item={items.bottom} region={REGION.bottom} />}
        {items.onepiece && <Layer item={items.onepiece} region={REGION.onepiece} />}
        {items.outer && <Layer item={items.outer} region={REGION.outer} />}
        {items.top && !items.onepiece && <Layer item={items.top} region={REGION.top} />}
        {items.shoes && <Layer item={items.shoes} region={REGION.shoes} />}
        {hat && <Layer item={hat} region={REGION.hat} />}
        {bag && <Layer item={bag} region={REGION.bag} />}
      </View>
    </View>
  );
}

export const hasAnyPhoto = (items: MannequinItems) =>
  [items.top, items.bottom, items.onepiece, items.outer, items.shoes, ...(items.accessory ?? [])].some((i) => !!i?.photoUri);
