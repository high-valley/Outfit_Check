import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomBar } from '../../src/components/BottomBar';
import { Chip, PrimaryButton } from '../../src/components/Chip';
import { ItemImage } from '../../src/components/FlatLay';
import { Icon } from '../../src/components/Icon';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SelectBar } from '../../src/components/SelectBar';
import { confirmAsync } from '../../src/lib/confirm';
import { CATEGORY_LABEL, SLOT_LABEL } from '../../src/lib/labels';
import { useStore } from '../../src/store';
import { colors, radius, shadow } from '../../src/theme';
import { CATEGORY_SLOT, SLOTS, type ClothingItem, type Slot } from '../../src/types';

type Sort = 'new' | 'old' | 'name';
const SORT_LABEL: Record<Sort, string> = { new: '新しい順', old: '古い順', name: '名前順' };
const NEXT_SORT: Record<Sort, Sort> = { new: 'old', old: 'name', name: 'new' };

export default function Closet() {
  const router = useRouter();
  const items = useStore((s) => s.items);
  const outfits = useStore((s) => s.outfits);
  const addSample = useStore((s) => s.addSampleItems);
  const removeItems = useStore((s) => s.removeItems);
  const [tab, setTab] = useState<Slot | 'all' | 'trial'>('all');
  const [sort, setSort] = useState<Sort>('new');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [showPhoto, setShowPhoto] = useState(true); // 写真があれば写真を主役に表示
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const owned = useMemo(() => items.filter((i) => i.isOwned), [items]);
  const trials = useMemo(() => items.filter((i) => !i.isOwned), [items]);
  const hasPhoto = items.some((i) => i.photoUri);
  const nameOf = (i: ClothingItem) => i.name || CATEGORY_LABEL[i.category];

  // 各アイテムが入っている保存済みコーデの数
  const outfitCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of outfits) {
      const { top, bottom, onepiece, outer, shoes, accessory } = o.itemIds;
      for (const id of [top, bottom, onepiece, outer, shoes, ...(accessory ?? [])]) if (id) m.set(id, (m.get(id) ?? 0) + 1);
    }
    return m;
  }, [outfits]);

  const base = tab === 'all' ? owned : tab === 'trial' ? trials : owned.filter((i) => CATEGORY_SLOT[i.category] === tab);
  const shown = useMemo(() => {
    const q = query.trim();
    const filtered = q ? base.filter((i) => nameOf(i).includes(q) || CATEGORY_LABEL[i.category].includes(q)) : base;
    const arr = [...filtered];
    if (sort === 'name') arr.sort((a, b) => nameOf(a).localeCompare(nameOf(b), 'ja'));
    else arr.sort((a, b) => (sort === 'new' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, query, sort]);

  const toggle = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const exit = () => {
    setSelecting(false);
    setSelected(new Set());
  };
  // 「すべて選択」は今表示している服が対象
  const allShownSelected = shown.length > 0 && shown.every((i) => selected.has(i.id));
  const toggleAll = () => setSelected(allShownSelected ? new Set() : new Set(shown.map((i) => i.id)));
  const remove = async () => {
    const ok = await confirmAsync('服を削除', `${selected.size}点の服を削除します。元に戻せません。`);
    if (!ok) return;
    await removeItems([...selected]);
    exit();
  };

  return (
    <View style={styles.wrap}>
      <ScreenHeader
        title="クローゼット"
        subtitle="持っている服を管理しよう"
        actions={[
          { icon: 'search', label: '検索', onPress: () => { setSearching((v) => !v); if (searching) setQuery(''); } },
          { icon: 'sliders', label: '並べ替え', onPress: () => setSort(NEXT_SORT[sort]) },
        ]}
      />
      {searching && (
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={colors.mute} />
          <TextInput value={query} onChangeText={setQuery} placeholder="名前・種類で検索" style={styles.searchInput} autoFocus />
        </View>
      )}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="すべて" selected={tab === 'all'} onPress={() => setTab('all')} />
          {SLOTS.map((s) => (
            <Chip key={s} label={SLOT_LABEL[s]} selected={tab === s} onPress={() => setTab(s)} />
          ))}
          <Chip icon="flask" label={`お試し（${trials.length}）`} selected={tab === 'trial'} onPress={() => setTab('trial')} />
        </ScrollView>
      </View>
      <View style={styles.countRow}>
        <Text style={styles.count}>{tab === 'trial' ? 'お試し' : '全'} {shown.length} アイテム</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {hasPhoto && (
            <Pressable onPress={() => setShowPhoto((v) => !v)} style={styles.mini} accessibilityRole="button" accessibilityLabel={showPhoto ? 'イラスト表示にする' : '写真表示にする'}>
              <Icon name={showPhoto ? 'camera' : 'palette'} size={16} color={colors.ink} />
              <Text style={styles.miniText}>{showPhoto ? '写真' : 'イラスト'}</Text>
            </Pressable>
          )}
          <Pressable onPress={() => setSort(NEXT_SORT[sort])} style={styles.mini} accessibilityRole="button" accessibilityLabel="並べ替え">
            <Icon name="sort" size={16} color={colors.ink} />
            <Text style={styles.miniText}>{SORT_LABEL[sort]}</Text>
          </Pressable>
          {shown.length > 0 && (
            <Pressable onPress={selecting ? exit : () => setSelecting(true)} style={[styles.mini, selecting && { backgroundColor: colors.ink }]} accessibilityRole="button">
              <Text style={[styles.miniText, selecting && { color: colors.white }]}>{selecting ? 'キャンセル' : '選択'}</Text>
            </Pressable>
          )}
        </View>
      </View>
      <FlatList
        data={shown}
        numColumns={2}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 32, gap: 12 }}>
            <Icon name="hanger" size={40} color={colors.mute} />
            <Text style={{ color: colors.sub, textAlign: 'center', lineHeight: 20 }}>
              {tab === 'trial' ? 'お試しデザインはまだありません。\n持っていない服を作って、手持ちの服との相性を試せます。' : query ? '見つかりませんでした' : 'まだ服がありません'}
            </Text>
            {owned.length === 0 && tab !== 'trial' && <PrimaryButton label="サンプルの服を登録" variant="secondary" onPress={addSample} />}
          </View>
        }
        renderItem={({ item }) => {
          const on = selected.has(item.id);
          const cnt = outfitCount.get(item.id) ?? 0;
          return (
            <Pressable
              style={[styles.card, on && styles.cardOn]}
              onPress={() => (selecting ? toggle(item.id) : router.push(`/item/${item.id}`))}
              accessibilityRole="button"
              accessibilityLabel={nameOf(item)}
              accessibilityState={{ selected: on }}
            >
              <View style={styles.tile}>
                {showPhoto || !item.photoUri ? (
                  <ItemImage item={item} width={140} height={140} />
                ) : (
                  <ItemImage item={{ ...item, photoUri: null }} width={140} height={140} />
                )}
                {selecting && (
                  <View style={[styles.check, on && styles.checkOn]}>
                    {on && <Icon name="check" size={14} color={colors.white} strokeWidth={3} />}
                  </View>
                )}
                {!item.isOwned && <Text style={styles.trialTag}>お試し</Text>}
              </View>
              <View style={styles.meta}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={2}>{nameOf(item)}</Text>
                  <Text style={styles.sub}>{cnt}コーデ</Text>
                </View>
                {!selecting && <Icon name="more" size={20} color={colors.mute} />}
              </View>
            </Pressable>
          );
        }}
      />
      {selecting ? (
        <SelectBar count={selected.size} total={shown.length} onToggleAll={toggleAll} onDelete={remove} />
      ) : (
        <BottomBar>
          {tab === 'trial' ? (
            <>
              <PrimaryButton label="お試しデザイン" icon="plus" onPress={() => router.push('/item/new?trial=1')} />
              <PrimaryButton label="手持ちと合わせる" variant="secondary" onPress={() => router.push({ pathname: '/outfit', params: { trial: '1', n: String(Date.now()) } })} />
            </>
          ) : (
            <>
              <PrimaryButton label="写真から追加" icon="camera" onPress={() => router.push('/item/new')} />
              <PrimaryButton label="手入力" icon="plus" variant="secondary" onPress={() => router.push('/item/new')} />
            </>
          )}
        </BottomBar>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 12, minHeight: 44, borderRadius: radius.btn, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  searchInput: { flex: 1, fontSize: 16, color: colors.text },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 8 },
  count: { fontSize: 13, color: colors.sub },
  mini: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 34, paddingHorizontal: 8, borderRadius: radius.pill },
  miniText: { fontSize: 12.5, fontWeight: '700', color: colors.ink },
  card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.card, padding: 8, ...shadow, borderWidth: 2, borderColor: 'transparent' },
  cardOn: { borderColor: colors.ink },
  tile: { aspectRatio: 1, borderRadius: radius.tile, backgroundColor: colors.tile, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  meta: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingHorizontal: 2, minHeight: 50 },
  name: { fontSize: 13.5, fontWeight: '700', color: colors.text },
  sub: { fontSize: 11, color: colors.mute, marginTop: 2 },
  check: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.mute, backgroundColor: '#FFFFFFD9', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  trialTag: { position: 'absolute', top: 6, left: 6, fontSize: 10, fontWeight: '800', color: colors.white, backgroundColor: colors.amber, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, overflow: 'hidden' },
});
