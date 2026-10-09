import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BottomBar } from '../../src/components/BottomBar';
import { Card, SectionTitle } from '../../src/components/Card';
import { Chip, PrimaryButton } from '../../src/components/Chip';
import { hasAnyPhoto, ItemImage } from '../../src/components/FlatLay';
import { Icon } from '../../src/components/Icon';
import { OutfitDisplay } from '../../src/components/OutfitDisplay';
import { OutfitList } from '../../src/components/OutfitList';
import { ScoreBars } from '../../src/components/ScoreBars';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { CATEGORY_LABEL } from '../../src/lib/labels';
import { scoreOutfit } from '../../src/lib/scoring';
import { dateKey, toItemIds } from '../../src/lib/suggest';
import { useStore } from '../../src/store';
import { colors, radius, scoreColor, scoreComment } from '../../src/theme';
import type { Category, ClothingItem, Outfit } from '../../src/types';

type Key = 'top' | 'bottom' | 'onepiece' | 'outer' | 'shoes' | 'bag' | 'hat';
const ROWS: { key: Key; label: string; categories: Category[] }[] = [
  { key: 'top', label: 'トップス', categories: ['tshirt', 'shirt', 'knit', 'hoodie', 'sweatshirt', 'blouse'] },
  { key: 'bottom', label: 'ボトムス', categories: ['denim', 'chino', 'slacks', 'wide_pants', 'shorts', 'skirt_short', 'skirt_long'] },
  { key: 'outer', label: 'アウター', categories: ['jacket', 'coat', 'cardigan', 'blouson'] },
  { key: 'onepiece', label: 'ワンピース', categories: ['dress'] },
  { key: 'shoes', label: 'シューズ', categories: ['sneakers', 'leather_shoes', 'boots', 'sandals'] },
  { key: 'bag', label: 'バッグ', categories: ['bag'] },
  { key: 'hat', label: '帽子', categories: ['hat'] },
];

type Sel = Record<Key, string | null>;
const EMPTY: Sel = { top: null, bottom: null, onepiece: null, outer: null, shoes: null, bag: null, hat: null };

export default function OutfitScreen() {
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();
  const previewW = Math.round(Math.min(screenW, 480) * 0.36);
  const all = useStore((s) => s.items);
  const saveOutfit = useStore((s) => s.saveOutfit);
  const wearOutfit = useStore((s) => s.wearOutfit);
  const outfits = useStore((s) => s.outfits);
  const { trial, sel: selParam, n } = useLocalSearchParams<{ trial?: string; sel?: string; n?: string }>();

  const owned = useMemo(() => all.filter((i) => i.isOwned), [all]);
  const trials = useMemo(() => all.filter((i) => !i.isOwned), [all]);
  const [mode, setMode] = useState<'create' | 'list'>('create');
  const [includeTrial, setIncludeTrial] = useState(false);
  const [illustMode, setIllustMode] = useState(false);
  const [openKey, setOpenKey] = useState<Key>('top');
  const [saved, setSaved] = useState<string | null>(null);
  // 手持ち → お試しの順（初期選択は手持ちが優先される）
  const candidates = useMemo(() => (includeTrial ? [...owned, ...trials] : owned), [owned, trials, includeTrial]);
  const byKey = (k: Key) => candidates.filter((i) => ROWS.find((r) => r.key === k)!.categories.includes(i.category));

  const [sel, setSel] = useState<Sel>(EMPTY);
  // 保存済みの itemIds から選択状態を作る（削除済みの服は無視）
  const selFromIds = (ids: Outfit['itemIds']): Sel => {
    const byId = (id?: string) => all.find((i) => i.id === id);
    const acc = (ids.accessory ?? []).map(byId);
    return {
      top: byId(ids.top)?.id ?? null,
      bottom: byId(ids.bottom)?.id ?? null,
      onepiece: byId(ids.onepiece)?.id ?? null,
      outer: byId(ids.outer)?.id ?? null,
      shoes: byId(ids.shoes)?.id ?? null,
      bag: acc.find((a) => a?.category === 'bag')?.id ?? null,
      hat: acc.find((a) => a?.category === 'hat')?.id ?? null,
    };
  };
  // 一覧のコーデを開いて、作成画面で調整できるようにする
  const openOutfit = (o: Outfit) => {
    const next = selFromIds(o.itemIds);
    const used = Object.values(next).map((id) => all.find((i) => i.id === id));
    if (used.some((i) => i && !i.isOwned)) setIncludeTrial(true);
    setSel(next);
    setSaved(null);
    setMode('create');
  };
  // ホームの「調整する」などから開かれたとき（パラメータが変わったとき）に、選択状態を作り直す
  const appliedKey = useRef<string | null>(null);
  useEffect(() => {
    if (owned.length === 0) return;
    const key = `${selParam ?? ''}|${trial ?? ''}|${n ?? ''}`;
    if (appliedKey.current === key) return;
    const firstTime = appliedKey.current === null;
    appliedKey.current = key;
    if (trial === '1') setIncludeTrial(true);
    if (selParam) {
      try {
        setSel(selFromIds(JSON.parse(selParam) as Outfit['itemIds']));
        setMode('create');
        return;
      } catch {
        /* 不正な値は無視して通常の初期化へ */
      }
    }
    if (firstTime) {
      const first = (k: Key) => owned.find((i) => ROWS.find((r) => r.key === k)!.categories.includes(i.category))?.id ?? null;
      setSel({ ...EMPTY, top: first('top'), bottom: first('bottom'), shoes: first('shoes') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owned, selParam, trial, n]);

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
    top: find(sel.top), bottom: find(sel.bottom), onepiece: find(sel.onepiece), outer: find(sel.outer),
    shoes: find(sel.shoes), bag: find(sel.bag), hat: find(sel.hat),
  };
  const list = Object.values(picked).filter((x): x is ClothingItem => !!x);
  const result = useMemo(() => (list.length ? scoreOutfit(list) : null), [list.map((i) => i.id).join(',')]);
  const display = {
    top: picked.top, bottom: picked.bottom, onepiece: picked.onepiece, outer: picked.outer, shoes: picked.shoes,
    accessory: [picked.bag, picked.hat].filter((x): x is ClothingItem => !!x),
  };
  const hasTrial = list.some((i) => !i.isOwned);

  const save = async () => {
    if (!result) return;
    await saveOutfit({ score: result.total, itemIds: toItemIds(list) });
    setSaved('コーデを保存しました（履歴タブの「一覧」で見られます）');
  };
  const wearToday = async () => {
    if (!result || hasTrial) return;
    await wearOutfit(toItemIds(list), result.total, dateKey(new Date()));
    setSaved('今日のコーデに決めました（ホームと履歴に反映されます）');
  };

  // アドバイス：減点の大きいものを優先、なければ加点の理由
  const advice = result ? result.reasons.filter((r) => r.type === 'minus').slice(0, 2) : [];
  const goods = result ? result.reasons.filter((r) => r.type === 'plus').slice(0, 1) : [];

  const modeTabs = (
    <View style={styles.seg}>
      <Chip label="作成" selected={mode === 'create'} onPress={() => setMode('create')} />
      <Chip label={`一覧（${outfits.length}）`} selected={mode === 'list'} onPress={() => setMode('list')} />
    </View>
  );
  if (mode === 'list') {
    return (
      <View style={styles.wrap}>
        <ScreenHeader title="コーデ" subtitle="保存したコーデを見返そう" />
        {modeTabs}
        <OutfitList onOpen={openOutfit} cardWidth={Math.round((Math.min(screenW, 480) - 24 - 12) / 2) - 4} />
      </View>
    );
  }

  if (owned.length === 0) {
    return (
      <View style={styles.wrap}>
        <ScreenHeader title="コーデ" subtitle="アイテムを組み合わせてコーデを作ろう" />
        {modeTabs}
        <View style={styles.empty}>
          <Text style={{ color: colors.sub, textAlign: 'center', lineHeight: 22 }}>服が登録されていません。{'\n'}クローゼットで服を登録してください。</Text>
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <PrimaryButton label="クローゼットへ" onPress={() => router.push('/closet')} />
          </View>
        </View>
      </View>
    );
  }

  const rowItems = byKey(openKey);
  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="コーデ" subtitle="アイテムを組み合わせてコーデを作ろう" />
        {modeTabs}
        <View style={{ paddingHorizontal: 16, gap: 14 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Chip icon="flask" label={`お試しを含める（${trials.length}）`} selected={includeTrial} onPress={() => setIncludeTrial((v) => !v)} />
            <Chip icon="plus" label="お試し作成" onPress={() => router.push('/item/new?trial=1')} />
            {hasAnyPhoto(display) && <Chip icon={illustMode ? 'palette' : 'camera'} label={illustMode ? 'イラスト表示' : '写真表示'} onPress={() => setIllustMode((v) => !v)} />}
          </ScrollView>

          <Card style={styles.summary}>
            <View style={[styles.preview, { width: previewW }]}>
              <OutfitDisplay width={previewW - 12} mode={illustMode ? 'illust' : 'auto'} items={display} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoreLabel}>予想スコア</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={[styles.score, { color: result ? scoreColor(result.total) : colors.mute }]} testID="score-total">{result ? result.total : '--'}</Text>
                <Text style={[styles.pct, { color: result ? scoreColor(result.total) : colors.mute }]}>%</Text>
              </View>
              <Text style={styles.scoreComment}>{result ? scoreComment(result.total) : '服を選ぶとスコアが出ます'}</Text>
              <View style={{ marginTop: 10 }}>
                <ScoreBars result={result} compact />
              </View>
            </View>
          </Card>

          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
              {ROWS.filter((r) => byKey(r.key).length > 0).map((r) => (
                <Chip key={r.key} label={r.label} selected={openKey === r.key} onPress={() => setOpenKey(r.key)} />
              ))}
            </ScrollView>
            {(openKey === 'top' || openKey === 'bottom') && !!sel.onepiece && (
              <Text style={styles.note}>ワンピースを選択中のため、トップス・ボトムスは使われません。選ぶとワンピースが外れます。</Text>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              <Pressable style={[styles.tileWrap]} onPress={() => set(openKey, null)} accessibilityRole="button" accessibilityLabel={`${ROWS.find((r) => r.key === openKey)!.label}なし`} accessibilityState={{ selected: sel[openKey] === null }}>
                <View style={[styles.tile, sel[openKey] === null && styles.tileOn]}>
                  <Text style={{ color: colors.mute, fontSize: 12 }}>なし</Text>
                </View>
                <Text style={styles.tileName}>なし</Text>
              </Pressable>
              {rowItems.map((it) => {
                const on = sel[openKey] === it.id;
                return (
                  <Pressable key={it.id} style={styles.tileWrap} onPress={() => set(openKey, it.id)} accessibilityRole="button" accessibilityLabel={it.name || CATEGORY_LABEL[it.category]} accessibilityState={{ selected: on }}>
                    <View style={[styles.tile, on && styles.tileOn]}>
                      <ItemImage item={it} width={68} height={68} />
                      {!it.isOwned && <Text style={styles.trialTag}>お試し</Text>}
                    </View>
                    <Text style={[styles.tileName, on && { color: colors.ink, fontWeight: '800' }]} numberOfLines={1}>{it.name || CATEGORY_LABEL[it.category]}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {result && (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon name="bulb" size={20} color={colors.amber} />
                <Text style={styles.adviceTitle}>スタイリングのアドバイス</Text>
              </View>
              {[...advice, ...goods].map((r, i) => (
                <View key={i} style={styles.reasonRow}>
                  <Text style={[styles.badge, r.type === 'minus' ? styles.minus : styles.plus]}>{r.type === 'minus' ? `−${Math.abs(r.points)}` : `+${r.points}`}</Text>
                  <Text style={styles.reasonText}>{r.message}</Text>
                </View>
              ))}
            </Card>
          )}

          {result && (
            <Card>
              <SectionTitle>判定の理由</SectionTitle>
              <View style={{ gap: 8 }}>
                {result.reasons.map((r, i) => (
                  <View key={i} style={styles.reasonRow}>
                    <Text style={[styles.badge, r.type === 'minus' ? styles.minus : styles.plus]}>{r.type === 'minus' ? `−${Math.abs(r.points)}` : `+${r.points}`}</Text>
                    <Text style={styles.reasonText}>{r.message}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}
          {hasTrial && <Text style={styles.trialNote}>お試しの服が入っています。「今日これを着る」は手持ちの服だけのときに使えます。</Text>}
          {saved && <Text style={styles.savedNote}>{saved}</Text>}
        </View>
      </ScrollView>
      <BottomBar>
        <PrimaryButton label="このコーデを保存" onPress={save} disabled={!result} />
        <PrimaryButton label="今日これを着る" variant="secondary" onPress={wearToday} disabled={!result || hasTrial} />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  seg: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  summary: { flexDirection: 'row', gap: 12, padding: 10 },
  preview: { alignItems: 'center', backgroundColor: colors.tile, borderRadius: radius.tile, paddingVertical: 8, alignSelf: 'flex-start' },
  scoreLabel: { fontSize: 12, fontWeight: '700', color: colors.text },
  score: { fontSize: 50, fontWeight: '800', lineHeight: 56 },
  pct: { fontSize: 22, fontWeight: '800', marginLeft: 2 },
  scoreComment: { fontSize: 12, color: colors.sub, lineHeight: 17 },
  adviceTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  reasonRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 4 },
  badge: { minWidth: 40, textAlign: 'center', fontSize: 12, fontWeight: '800', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden' },
  minus: { backgroundColor: colors.redSoft, color: '#B91C1C' },
  plus: { backgroundColor: colors.greenSoft, color: '#15803D' },
  reasonText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 19 },
  note: { fontSize: 11, color: colors.amber, marginBottom: 8 },
  tileWrap: { width: 84, alignItems: 'center', gap: 4 },
  tile: { width: 84, height: 84, borderRadius: radius.tile, backgroundColor: colors.tile, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  tileOn: { borderColor: colors.ink, backgroundColor: colors.card },
  tileName: { fontSize: 11, color: colors.sub, maxWidth: 84 },
  trialTag: { position: 'absolute', top: 3, right: 3, fontSize: 9, fontWeight: '800', color: colors.white, backgroundColor: colors.amber, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, overflow: 'hidden' },
  trialNote: { fontSize: 12, color: colors.amber },
  savedNote: { fontSize: 13, color: '#166534', backgroundColor: colors.greenSoft, padding: 10, borderRadius: 10, overflow: 'hidden' },
});
