import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BottomBar } from '../../src/components/BottomBar';
import { PrimaryButton } from '../../src/components/Chip';
import { OutfitCard } from '../../src/components/OutfitCard';
import { CATEGORY_LABEL } from '../../src/lib/labels';
import { dateKey, suggestOutfits } from '../../src/lib/suggest';
import { useStore } from '../../src/store';

export default function Home() {
  const router = useRouter();
  const items = useStore((s) => s.items);
  const outfits = useStore((s) => s.outfits);
  const addSample = useStore((s) => s.addSampleItems);
  const wearOutfit = useStore((s) => s.wearOutfit);
  const [seed, setSeed] = useState(0);
  const { width: screenW } = useWindowDimensions();
  const cardW = Math.max(150, Math.min(200, Math.round((Math.min(screenW, 480) - 32 - 12) / 1.8)));

  const owned = useMemo(() => items.filter((i) => i.isOwned), [items]);
  const today = dateKey(new Date());
  const wornToday = outfits.find((o) => o.wornDates.includes(today));
  // seed を変えると別の候補（同点の並び）を引き直す
  const suggestions = useMemo(
    () => suggestOutfits(items, outfits, { rng: seededRng(seed) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, outfits, seed],
  );
  const trialCount = items.filter((i) => !i.isOwned).length;
  // お試しデザインを使った提案（手持ちの服と組み合わせたときの相性を見る）
  const trialSuggestions = useMemo(
    () => (trialCount ? suggestOutfits(items, outfits, { rng: seededRng(seed), trial: 'only' }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, outfits, seed],
  );
  const adjust = (itemIds: object, trial = false) =>
    router.push({ pathname: '/outfit/new', params: { sel: JSON.stringify(itemIds), ...(trial ? { trial: '1' } : {}) } });

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {wornToday && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.h}>今日のコーデ ✅</Text>
            <OutfitCard itemIds={wornToday.itemIds} items={items} score={wornToday.score} width={150} />
          </View>
        )}
        <Text style={styles.h}>今日のコーデ提案</Text>
        {owned.length === 0 ? (
          <Text style={styles.note}>服を登録すると、ここに提案が出ます。</Text>
        ) : suggestions.length === 0 ? (
          <Text style={styles.note}>提案できる組み合わせがありません。トップス＋ボトムス（またはワンピース）を登録するか、直近3日以内に着た服が多い可能性があります。</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {suggestions.map((s, i) => (
              <OutfitCard key={s.items.map((x) => x.id).join('-')} itemIds={s.itemIds} items={items} score={s.score} width={cardW} subtitle={`候補 ${i + 1}`}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <PrimaryButton label="これを着る" onPress={() => wearOutfit(s.itemIds, s.score, today)} />
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <PrimaryButton label="調整する" variant="secondary" onPress={() => adjust(s.itemIds)} />
                </View>
              </OutfitCard>
            ))}
          </ScrollView>
        )}
        {(suggestions.length > 0 || trialSuggestions.length > 0) && (
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <PrimaryButton label="別の候補を見る" variant="secondary" onPress={() => setSeed((n) => n + 1)} />
          </View>
        )}

        <View style={{ marginTop: 28 }}>
          <Text style={styles.h}>お試しデザインのコーデ提案 🧪</Text>
          {trialCount === 0 ? (
            <>
              <Text style={styles.note}>持っていない服を「お試しデザイン」で作ると、手持ちの服と合わせたときのおすすめコーデが出ます。買う前の相性チェックに使えます。</Text>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <PrimaryButton label="＋ お試しデザインを作る" variant="secondary" onPress={() => router.push('/item/new?trial=1')} />
              </View>
            </>
          ) : trialSuggestions.length === 0 ? (
            <Text style={styles.note}>お試しの服と合わせられる手持ちの服が足りません（トップス＋ボトムスなどを登録してください）。</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {trialSuggestions.map((s) => (
                <OutfitCard
                  key={s.items.map((x) => x.id).join('-')}
                  itemIds={s.itemIds}
                  items={items}
                  score={s.score}
                  width={cardW}
                  subtitle={`お試し：${s.items.filter((i) => !i.isOwned).map((i) => i.name || CATEGORY_LABEL[i.category]).join('、')}`}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <PrimaryButton label="調整する" variant="secondary" onPress={() => adjust(s.itemIds, true)} />
                  </View>
                </OutfitCard>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
      <BottomBar>
        {owned.length === 0 && <PrimaryButton label="サンプルの服を登録" variant="secondary" onPress={addSample} />}
        <PrimaryButton label="コーデを作る" onPress={() => router.push('/outfit/new')} />
      </BottomBar>
    </View>
  );
}

/** 軽量な再現可能乱数（mulberry32）。seed=0 は Math.random を使う */
function seededRng(seed: number): () => number {
  if (seed === 0) return Math.random;
  let a = seed * 2654435761;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF' },
  h: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 10 },
  note: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
});
