import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { CATEGORY_LABEL } from '../lib/labels';
import type { ClothingItem } from '../types';
import { ClothingIllustration } from './ClothingIllustration';


type Props = {
  label: string;
  items: ClothingItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  disabled?: boolean;
  /** 1タイルの幅（狭い画面・横並びレイアウト用に小さくできる） */
  itemW?: number;
};

/** 横スワイプで服を切り替える（先頭は「なし」）。中央にあるものが選択中 */
export function SlotCarousel({ label, items, selectedId, onSelect, disabled, itemW = 84 }: Props) {
  const ITEM_W = itemW;
  const tileH = Math.round(itemW * 0.86);
  const [width, setWidth] = useState(0);
  const ref = useRef<ScrollView>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const data: (ClothingItem | null)[] = [null, ...items];
  const index = Math.max(0, data.findIndex((d) => (d?.id ?? null) === selectedId));

  useEffect(() => {
    if (width > 0) ref.current?.scrollTo({ x: index * ITEM_W, animated: false });
  }, [index, width]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const pad = Math.max(0, (width - ITEM_W) / 2);

  const settle = (x: number) => {
    const i = Math.min(data.length - 1, Math.max(0, Math.round(x / ITEM_W)));
    const id = data[i]?.id ?? null;
    if (id !== selectedId) onSelect(id);
  };

  return (
    <View style={[styles.wrap, disabled && { opacity: 0.35 }]} pointerEvents={disabled ? 'none' : 'auto'}>
      <Text style={styles.label}>{label}</Text>
      <View onLayout={onLayout}>
        <ScrollView
          ref={ref}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_W}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: pad }}
          scrollEventThrottle={32}
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => settle(x), 140);
          }}
        >
          {data.map((d, i) => {
            const on = i === index;
            return (
              <Pressable
                key={d?.id ?? 'none'}
                style={[styles.tile, { width: ITEM_W, height: tileH }, on && styles.tileOn]}
                onPress={() => {
                  ref.current?.scrollTo({ x: i * ITEM_W, animated: true });
                  onSelect(d?.id ?? null);
                }}
                accessibilityRole="button"
                accessibilityLabel={d ? d.name || CATEGORY_LABEL[d.category] : `${label}なし`}
                accessibilityState={{ selected: on }}
              >
                {d ? (
                  <ClothingIllustration category={d.category} mainColor={d.mainColor} subColor={d.subColor} pattern={d.pattern} width={ITEM_W - 24} height={ITEM_W - 24} />
                ) : (
                  <Text style={styles.none}>なし</Text>
                )}
                {d && !d.isOwned && <Text style={styles.badge}>お試し</Text>}
              </Pressable>
            );
          })}
        </ScrollView>
        {width > 0 && <View pointerEvents="none" style={[styles.center, { left: pad, width: ITEM_W, height: tileH }]} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginLeft: 8, marginBottom: 2 },
  tile: { alignItems: 'center', justifyContent: 'center', opacity: 0.55 },
  tileOn: { opacity: 1 },
  badge: { position: 'absolute', top: 0, right: 6, fontSize: 9, fontWeight: '700', color: '#FFFFFF', backgroundColor: '#D97706', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, overflow: 'hidden' },
  none: { fontSize: 12, color: '#9CA3AF' },
  center: { position: 'absolute', top: 0, borderRadius: 12, borderWidth: 2, borderColor: '#111827' },
});
