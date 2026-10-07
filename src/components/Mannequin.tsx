import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ClothingIllustration } from './ClothingIllustration';
import type { ClothingItem } from '../types';

export type MannequinItems = {
  top?: ClothingItem | null;
  bottom?: ClothingItem | null;
  onepiece?: ClothingItem | null;
  outer?: ClothingItem | null;
  shoes?: ClothingItem | null;
  accessory?: ClothingItem[];
};

// 人型キャンバスは 200 x 420 の座標系
const W = 200;
const H = 420;
type Region = { x: number; y: number; w: number; h: number };
const REGION = {
  top: { x: 35, y: 56, w: 130, h: 130 },
  outer: { x: 30, y: 54, w: 140, h: 140 },
  bottom: { x: 50, y: 178, w: 100, h: 190 },
  onepiece: { x: 36, y: 56, w: 128, h: 256 },
  shoeL: { x: 36, y: 368, w: 62, h: 34 },
  shoeR: { x: 102, y: 368, w: 62, h: 34 },
  hat: { x: 62, y: -6, w: 76, h: 48 },
  bag: { x: 0, y: 196, w: 52, h: 60 },
} satisfies Record<string, Region>;

function Layer({ item, region, mirror }: { item: ClothingItem; region: Region; mirror?: boolean }) {
  return (
    <ClothingIllustration
      category={item.category}
      mainColor={item.mainColor}
      subColor={item.subColor}
      pattern={item.pattern}
      width={region.w}
      height={region.h}
      mirror={mirror}
      style={{ position: 'absolute', left: region.x, top: region.y }}
    />
  );
}

/** シンプルな人型の上に 靴 → ボトム → トップ → アウター の順で服を重ねる */
export function Mannequin({ items, width = 200 }: { items: MannequinItems; width?: number }) {
  const scale = width / W;
  const acc = items.accessory ?? [];
  const hat = acc.find((a) => a.category === 'hat');
  const bag = acc.find((a) => a.category === 'bag');
  return (
    <View style={{ width, height: H * scale, overflow: 'visible' }}>
      <View style={{ width: W, height: H, transform: [{ scale }], transformOrigin: 'top left' }}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
          <Circle cx={100} cy={32} r={22} fill="#E5E7EB" />
          <Path d="M92 52 H108 V62 H92 Z" fill="#E5E7EB" />
          <Path d="M62 60 H138 L146 190 H54 Z" fill="#E5E7EB" />
          <Path d="M62 62 L44 150 L56 154 L68 90 Z M138 62 L156 150 L144 154 L132 90 Z" fill="#E5E7EB" />
          <Path d="M54 188 H146 L140 385 H104 L100 230 L96 385 H60 Z" fill="#E5E7EB" />
          <Path d="M58 385 H96 V398 H54 Z M104 385 H142 L146 398 H104 Z" fill="#D1D5DB" />
        </Svg>
        {items.shoes && (
          <>
            <Layer item={items.shoes} region={REGION.shoeL} />
            <Layer item={items.shoes} region={REGION.shoeR} mirror />
          </>
        )}
        {items.bottom && !items.onepiece && <Layer item={items.bottom} region={REGION.bottom} />}
        {items.onepiece && <Layer item={items.onepiece} region={REGION.onepiece} />}
        {items.top && !items.onepiece && <Layer item={items.top} region={REGION.top} />}
        {items.outer && <Layer item={items.outer} region={REGION.outer} />}
        {bag && <Layer item={bag} region={REGION.bag} />}
        {hat && <Layer item={hat} region={REGION.hat} />}
      </View>
    </View>
  );
}
