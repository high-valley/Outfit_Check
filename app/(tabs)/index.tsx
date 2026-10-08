import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Card, SectionTitle } from '../../src/components/Card';
import { PrimaryButton } from '../../src/components/Chip';
import { ItemImage } from '../../src/components/FlatLay';
import { Icon } from '../../src/components/Icon';
import { OutfitCard } from '../../src/components/OutfitCard';
import { OutfitDisplay } from '../../src/components/OutfitDisplay';
import { ScoreBars } from '../../src/components/ScoreBars';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { CATEGORY_LABEL } from '../../src/lib/labels';
import { resolveOutfit } from '../../src/lib/outfit';
import { scoreOutfit } from '../../src/lib/scoring';
import { dateKey, suggestOutfits } from '../../src/lib/suggest';
import { useStore } from '../../src/store';
import { colors, radius, scoreColor, scoreComment } from '../../src/theme';
import type { Outfit } from '../../src/types';

export default function Home() {
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();
  const contentW = Math.min(screenW, 480);
  const items = useStore((s) => s.items);
  const outfits = useStore((s) => s.outfits);
  const addSample = useStore((s) => s.addSampleItems);
  const wearOutfit = useStore((s) => s.wearOutfit);
  const [seed, setSeed] = useState(0);
  const [pick, setPick] = useState(0);

  const owned = useMemo(() => items.filter((i) => i.isOwned), [items]);
  const today = dateKey(new Date());
  const wornToday = outfits.find((o) => o.wornDates.includes(today));
  const suggestions = useMemo(
    () => suggestOutfits(items, outfits, { rng: seededRng(seed) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, outfits, seed],
  );
  const trialCount = items.filter((i) => !i.isOwned).length;
  const trialSuggestions = useMemo(
    () => (trialCount ? suggestOutfits(items, outfits, { rng: seededRng(seed), trial: 'only' }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, outfits, seed],
  );
  const adjust = (itemIds: Outfit['itemIds'], trial = false) =>
    router.push({ pathname: '/outfit', params: { sel: JSON.stringify(itemIds), n: String(Date.now()), ...(trial ? { trial: '1' } : {}) } });

  // ヒーロー：今日着ると決めたコーデ → なければ提案の1番目（タップで切り替え）
  const heroIdx = Math.min(pick, Math.max(0, suggestions.length - 1));
  const hero = wornToday
    ? { itemIds: wornToday.itemIds, worn: true as const }
    : suggestions[heroIdx]
      ? { itemIds: suggestions[heroIdx].itemIds, worn: false as const }
      : null;
  const heroResolved = hero ? resolveOutfit(hero, items) : null;
  const heroResult = heroResolved && heroResolved.list.length ? scoreOutfit(heroResolved.list) : null;
  const heroNotes = heroResult ? [...heroResult.reasons.filter((r) => r.type === 'plus').slice(0, 1), ...heroResult.reasons.filter((r) => r.type === 'minus').slice(0, 1)] : [];
  const improvements = heroResult ? heroResult.reasons.filter((r) => r.type === 'minus').slice(0, 2) : [];
  const dateLabel = new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
  const previewW = Math.round(contentW * 0.4);

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="コーデスコア"
          subtitle={`今日のコーデをチェック・${dateLabel}`}
          actions={[
            { icon: 'plusCircle', label: '服を追加', onPress: () => router.push('/item/new') },
          ]}
        />
        <View style={{ paddingHorizontal: 16, gap: 14 }}>
          {owned.length === 0 && (
            <Card>
              <SectionTitle>はじめましょう</SectionTitle>
              <Text style={styles.note}>手持ちの服を登録すると、今日のコーデを提案します。写真から登録するか、サンプルで試せます。</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <PrimaryButton label="写真から登録" icon="camera" onPress={() => router.push('/item/new')} />
                <PrimaryButton label="サンプルで試す" variant="secondary" onPress={addSample} />
              </View>
            </Card>
          )}

          {hero && heroResult && (
            <>
              <Card style={styles.hero}>
                <View style={[styles.heroTile, { width: previewW }]}>
                  <OutfitDisplay items={heroResolved!.mannequin} width={previewW - 14} />
                </View>
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                  <View>
                    <Text style={styles.heroLabel}>{hero.worn ? '今日のコーデ ✅' : '今日のおすすめ'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={[styles.heroScore, { color: scoreColor(heroResult.total) }]}>{heroResult.total}</Text>
                      <Text style={[styles.heroPct, { color: scoreColor(heroResult.total) }]}>%</Text>
                    </View>
                    <Text style={styles.heroComment}>{scoreComment(heroResult.total)}</Text>
                    <View style={{ gap: 6, marginTop: 10 }}>
                      {heroNotes.map((r, i) => (
                        <View key={i} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                          <View style={[styles.dot, { backgroundColor: r.type === 'minus' ? colors.red : colors.green }]} />
                          <Text style={styles.heroNote} numberOfLines={3}>{r.message.replace(/（[−+]?\d+）/, '').split('。')[0]}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={{ gap: 8, marginTop: 10 }}>
                    {!hero.worn && (
                      <View style={{ flexDirection: 'row' }}>
                        <PrimaryButton label="これを着る" onPress={() => wearOutfit(hero.itemIds, heroResult.total, today)} />
                      </View>
                    )}
                    <View style={{ flexDirection: 'row' }}>
                      <PrimaryButton label="詳しく見る" variant={hero.worn ? 'primary' : 'secondary'} onPress={() => adjust(hero.itemIds)} />
                    </View>
                  </View>
                </View>
              </Card>

              <Card>
                <SectionTitle>スコアの内訳</SectionTitle>
                <ScoreBars result={heroResult} />
              </Card>

              <Card>
                <SectionTitle right={<Text style={styles.link}>{heroResolved!.list.length}点</Text>}>使用アイテム</SectionTitle>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {heroResolved!.list.map((it) => (
                    <View key={it.id} style={{ alignItems: 'center', width: 72 }}>
                      <View style={styles.thumb}>
                        <ItemImage item={it} width={58} height={58} />
                      </View>
                      <Text style={styles.thumbName} numberOfLines={1}>{it.name || CATEGORY_LABEL[it.category]}</Text>
                    </View>
                  ))}
                </ScrollView>
              </Card>

              {improvements.length > 0 && (
                <Card>
                  <SectionTitle>改善ポイント</SectionTitle>
                  <View style={{ gap: 10 }}>
                    {improvements.map((r, i) => (
                      <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                        <View style={styles.num}><Text style={styles.numText}>{i + 1}</Text></View>
                        <Text style={styles.improve}>{r.message}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              )}
            </>
          )}

          {owned.length > 0 && suggestions.length === 0 && !wornToday && (
            <Card>
              <Text style={styles.note}>提案できる組み合わせがありません。トップス＋ボトムス（またはワンピース）を登録するか、直近3日以内に着た服が多い可能性があります。</Text>
            </Card>
          )}

          {suggestions.length > 0 && (
            <View>
              <SectionTitle
                right={
                  <Pressable onPress={() => { setSeed((n) => n + 1); setPick(0); }} style={styles.reroll} accessibilityRole="button" accessibilityLabel="別の候補を見る">
                    <Icon name="refresh" size={16} color={colors.ink} />
                    <Text style={styles.rerollText}>別の候補</Text>
                  </Pressable>
                }
              >
                {wornToday ? '他のコーデ候補' : 'コーデ候補'}
              </SectionTitle>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 6, paddingHorizontal: 2 }}>
                {suggestions.map((s, i) => (
                  <Pressable key={s.items.map((x) => x.id).join('-')} onPress={() => setPick(i)} accessibilityRole="button" accessibilityLabel={`候補${i + 1}を見る`}>
                    <OutfitCard
                      itemIds={s.itemIds}
                      items={items}
                      score={s.score}
                      width={Math.round(contentW * 0.42)}
                      subtitle={!wornToday && i === heroIdx ? '表示中' : `候補 ${i + 1}`}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View>
            <SectionTitle>お試しデザインのコーデ提案</SectionTitle>
            {trialCount === 0 ? (
              <Card>
                <Text style={styles.note}>持っていない服を「お試しデザイン」で作ると、手持ちの服と合わせたおすすめコーデが出ます。買う前の相性チェックに使えます。</Text>
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <PrimaryButton label="お試しデザインを作る" icon="flask" variant="secondary" onPress={() => router.push('/item/new?trial=1')} />
                </View>
              </Card>
            ) : trialSuggestions.length === 0 ? (
              <Card><Text style={styles.note}>お試しの服と合わせられる手持ちの服が足りません（トップス＋ボトムスなどを登録してください）。</Text></Card>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 6, paddingHorizontal: 2 }}>
                {trialSuggestions.map((s) => (
                  <Pressable key={s.items.map((x) => x.id).join('-')} onPress={() => adjust(s.itemIds, true)} accessibilityRole="button" accessibilityLabel="お試しコーデを調整する">
                    <OutfitCard
                      itemIds={s.itemIds}
                      items={items}
                      score={s.score}
                      width={Math.round(contentW * 0.42)}
                      tag="お試し"
                      subtitle={s.items.filter((i) => !i.isOwned).map((i) => i.name || CATEGORY_LABEL[i.category]).join('、')}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>
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
  wrap: { flex: 1, backgroundColor: colors.bg },
  note: { fontSize: 13, color: colors.sub, lineHeight: 20 },
  hero: { flexDirection: 'row', gap: 12, padding: 10 },
  heroTile: { alignItems: 'center', backgroundColor: colors.tile, borderRadius: radius.tile, paddingVertical: 8, alignSelf: 'flex-start' },
  heroLabel: { fontSize: 13, fontWeight: '800', color: colors.text },
  heroScore: { fontSize: 56, fontWeight: '800', lineHeight: 62 },
  heroPct: { fontSize: 24, fontWeight: '800', marginLeft: 2 },
  heroComment: { fontSize: 12.5, color: colors.sub, lineHeight: 18 },
  heroNote: { flex: 1, fontSize: 11.5, color: colors.text, lineHeight: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  link: { fontSize: 12, color: colors.sub },
  thumb: { width: 68, height: 68, borderRadius: radius.tile, backgroundColor: colors.tile, alignItems: 'center', justifyContent: 'center' },
  thumbName: { fontSize: 11, color: colors.sub, marginTop: 4, maxWidth: 72 },
  num: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  numText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  improve: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 20 },
  reroll: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36, paddingHorizontal: 8 },
  rerollText: { fontSize: 13, fontWeight: '700', color: colors.ink },
});
