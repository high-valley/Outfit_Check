import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../src/components/Chip';
import { Mannequin } from '../../src/components/Mannequin';
import { ScoreMeter } from '../../src/components/ScoreMeter';
import { SlotCarousel } from '../../src/components/SlotCarousel';
import { scoreOutfit } from '../../src/lib/scoring';
import { useStore } from '../../src/store';
import type { Category, ClothingItem } from '../../src/types';

type Key = 'top' | 'bottom' | 'onepiece' | 'outer' | 'shoes' | 'bag' | 'hat';
const ROWS: { key: Key; label: string; categories: Category[] }[] = [
  { key: 'outer', label: 'アウター', categories: ['jacket', 'coat', 'cardigan', 'blouson'] },
  { key: 'top', label: 'トップス', categories: ['tshirt', 'shirt', 'knit', 'hoodie', 'sweatshirt', 'blouse'] },
  { key: 'onepiece', label: 'ワンピース', categories: ['dress'] },
  { key: 'bottom', label: 'ボトムス', categories: ['denim', 'chino', 'slacks', 'wide_pants', 'shorts', 'skirt_short', 'skirt_long'] },
  { key: 'shoes', label: '靴', categories: ['sneakers', 'leather_shoes', 'boots', 'sandals'] },
  { key: 'bag', label: 'バッグ', categories: ['bag'] },
  { key: 'hat', label: '帽子', categories: ['hat'] },
];

type Sel = Record<Key, string | null>;
const EMPTY: Sel = { top: null, bottom: null, onepiece: null, outer: null, shoes: null, bag: null, hat: null };

export default function NewOutfit() {
  const router = useRouter();
  const all = useStore((s) => s.items);
  const saveOutfit = useStore((s) => s.saveOutfit);
  const owned = useMemo(() => all.filter((i) => i.isOwned), [all]);
  const byKey = (k: Key) => owned.filter((i) => ROWS.find((r) => r.key === k)!.categories.includes(i.category));

  const [sel, setSel] = useState<Sel>(EMPTY);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || owned.length === 0) return;
    initialized.current = true;
    const first = (k: Key) => byKey(k)[0]?.id ?? null;
    setSel({ ...EMPTY, top: first('top'), bottom: first('bottom'), shoes: first('shoes') });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owned]);

  const set = (k: Key, id: string | null) =>
    setSel((cur) => {
      const next = { ...cur, [k]: id };
      if (id && (k === 'top' || k === 'bottom')) next.onepiece = null;
      if (id && k === 'onepiece') {
        next.top = null;
        next.bottom = null;
      }
      return next;
    });

  const find = (id: string | null) => owned.find((i) => i.id === id) ?? null;
  const picked = {
    top: find(sel.top),
    bottom: find(sel.bottom),
    onepiece: find(sel.onepiece),
    outer: find(sel.outer),
    shoes: find(sel.shoes),
    bag: find(sel.bag),
    hat: find(sel.hat),
  };
  const list = Object.values(picked).filter((x): x is ClothingItem => !!x);
  const result = useMemo(() => (list.length ? scoreOutfit(list) : null), [list.map((i) => i.id).join(',')]);

  const save = async () => {
    if (!result) return;
    await saveOutfit({
      score: result.total,
      itemIds: {
        top: sel.top ?? undefined,
        bottom: sel.bottom ?? undefined,
        onepiece: sel.onepiece ?? undefined,
        outer: sel.outer ?? undefined,
        shoes: sel.shoes ?? undefined,
        accessory: [sel.bag, sel.hat].filter((x): x is string => !!x),
      },
    });
    router.back();
  };

  if (owned.length === 0) {
    return (
      <View style={[styles.wrap, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Text style={{ color: '#6B7280', textAlign: 'center' }}>服が登録されていません。{'\n'}クローゼットで服を登録してください。</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ScoreMeter result={result} />
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={styles.mannequin}>
          <Mannequin
            width={190}
            items={{
              top: picked.top,
              bottom: picked.bottom,
              onepiece: picked.onepiece,
              outer: picked.outer,
              shoes: picked.shoes,
              accessory: [picked.bag, picked.hat].filter((x): x is ClothingItem => !!x),
            }}
          />
        </View>
        {ROWS.map((r) => {
          const items = byKey(r.key);
          if (items.length === 0) return null;
          const disabled = (r.key === 'top' || r.key === 'bottom') && !!sel.onepiece;
          return <SlotCarousel key={r.key} label={r.label} items={items} selectedId={sel[r.key]} onSelect={(id) => set(r.key, id)} disabled={disabled} />;
        })}
        <View style={styles.reasons}>
          <Text style={styles.reasonsTitle}>判定の理由</Text>
          {result?.reasons.map((r, i) => (
            <View key={i} style={styles.reasonRow}>
              <Text style={[styles.badge, r.type === 'minus' ? styles.minus : styles.plus]}>{r.type === 'minus' ? `−${Math.abs(r.points)}` : `+${r.points}`}</Text>
              <Text style={styles.reasonText}>{r.message}</Text>
            </View>
          ))}
          {!result && <Text style={{ color: '#9CA3AF' }}>服を選ぶと理由が表示されます</Text>}
        </View>
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton label="このコーデを保存" onPress={save} disabled={!result} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF' },
  mannequin: { alignItems: 'center', paddingVertical: 12, backgroundColor: '#F9FAFB', marginBottom: 12 },
  reasons: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  reasonsTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  reasonRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  badge: { minWidth: 40, textAlign: 'center', fontSize: 12, fontWeight: '700', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden' },
  minus: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  plus: { backgroundColor: '#DCFCE7', color: '#15803D' },
  reasonText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', padding: 12, backgroundColor: '#FFFFFFEE', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
});
