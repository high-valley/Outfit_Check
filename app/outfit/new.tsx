import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BottomBar } from '../../src/components/BottomBar';
import { Chip, PrimaryButton } from '../../src/components/Chip';
import { Mannequin } from '../../src/components/Mannequin';
import { ScoreMeter } from '../../src/components/ScoreMeter';
import { SlotCarousel } from '../../src/components/SlotCarousel';
import { scoreOutfit } from '../../src/lib/scoring';
import { dateKey, toItemIds } from '../../src/lib/suggest';
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
  const { width: screenW } = useWindowDimensions();
  const contentW = Math.min(screenW, 480);
  const mannequinW = Math.round(Math.min(170, contentW * 0.4));
  const tileW = 68;
  const all = useStore((s) => s.items);
  const saveOutfit = useStore((s) => s.saveOutfit);
  const wearOutfit = useStore((s) => s.wearOutfit);
  const { trial } = useLocalSearchParams<{ trial?: string }>();
  const [includeTrial, setIncludeTrial] = useState(trial === '1');
  const owned = useMemo(() => all.filter((i) => i.isOwned), [all]);
  const trials = useMemo(() => all.filter((i) => !i.isOwned), [all]);
  // 手持ち → お試しの順に並べる（初期選択は手持ちが優先される）
  const candidates = useMemo(() => (includeTrial ? [...owned, ...trials] : owned), [owned, trials, includeTrial]);
  const byKey = (k: Key) => candidates.filter((i) => ROWS.find((r) => r.key === k)!.categories.includes(i.category));

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

  const find = (id: string | null) => candidates.find((i) => i.id === id) ?? null;
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

  const hasTrial = list.some((i) => !i.isOwned);
  const wearToday = async () => {
    if (!result || hasTrial) return;
    await wearOutfit(toItemIds(list), result.total, dateKey(new Date()));
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
      <View style={styles.trialRow}>
        <Chip label={`お試しを含める（${trials.length}）`} selected={includeTrial} onPress={() => setIncludeTrial((v) => !v)} />
        <Chip label="＋ お試し作成" onPress={() => router.push('/item/new?trial=1')} />
      </View>
      {hasTrial && <Text style={styles.trialNote}>お試しの服が入っています。「今日これを着る」は手持ちの服だけのときに使えます。</Text>}
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.split}>
          <View style={[styles.mannequin, { width: mannequinW + 16 }]}>
            <Mannequin
              width={mannequinW}
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
          <View style={{ flex: 1 }}>
            {ROWS.map((r) => {
              const items = byKey(r.key);
              if (items.length === 0) return null;
              const disabled = (r.key === 'top' || r.key === 'bottom') && !!sel.onepiece;
              return <SlotCarousel key={r.key} label={r.label} items={items} selectedId={sel[r.key]} onSelect={(id) => set(r.key, id)} disabled={disabled} itemW={tileW} />;
            })}
          </View>
        </View>
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
      <BottomBar inset>
        <PrimaryButton label="保存のみ" variant="secondary" onPress={save} disabled={!result} />
        <PrimaryButton label="今日これを着る" onPress={wearToday} disabled={!result || hasTrial} />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF' },
  trialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFFFFF' },
  trialNote: { fontSize: 11, color: '#B45309', paddingHorizontal: 16, paddingBottom: 6, backgroundColor: '#FFFFFF' },
  split: { flexDirection: 'row', gap: 6, paddingRight: 4 },
  mannequin: { alignItems: 'center', paddingVertical: 10, backgroundColor: '#F9FAFB', borderTopRightRadius: 14, borderBottomRightRadius: 14, alignSelf: 'flex-start' },
  reasons: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  reasonsTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  reasonRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  badge: { minWidth: 40, textAlign: 'center', fontSize: 12, fontWeight: '700', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden' },
  minus: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  plus: { backgroundColor: '#DCFCE7', color: '#15803D' },
  reasonText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },
});
