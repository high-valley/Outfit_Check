import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { CATEGORY_LABEL } from '../lib/labels';
import type { ClothingItem } from '../types';
import { ClothingIllustration } from './ClothingIllustration';

const ITEM_W = 84;

type Props = {
  label: string;
  items: ClothingItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  disabled?: boolean;
};

/** 横スワイプで服を切り替える（先頭は「なし」）。中央にあるものが選択中 */
export function SlotCarousel({ label, items, selectedId, onSelect, disabled }: Props) {
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
                style={[styles.tile, on && styles.tileOn]}
                onPress={() => {
                  ref.current?.scrollTo({ x: i * ITEM_W, animated: true });
                  onSelect(d?.id ?? null);
                }}
                accessibilityRole="button"
                accessibilityLabel={d ? d.name || CATEGORY_LABEL[d.category] : `${label}なし`}
                accessibilityState={{ selected: on }}
              >
                {d ? (
                  <ClothingIllustration category={d.category} mainColor={d.mainColor} subColor={d.subColor} pattern={d.pattern} width={60} height={60} />
                ) : (
                  <Text style={styles.none}>なし</Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
        {width > 0 && <View pointerEvents="none" style={[styles.center, { left: pad }]} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginLeft: 16, marginBottom: 4 },
  tile: { width: ITEM_W, height: 72, alignItems: 'center', justifyContent: 'center', opacity: 0.55 },
  tileOn: { opacity: 1 },
  none: { fontSize: 12, color: '#9CA3AF' },
  center: { position: 'absolute', top: 0, width: ITEM_W, height: 72, borderRadius: 12, borderWidth: 2, borderColor: '#111827' },
});
