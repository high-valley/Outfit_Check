import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip, PrimaryButton } from '../../src/components/Chip';
import { BottomBar } from '../../src/components/BottomBar';
import { SelectBar } from '../../src/components/SelectBar';
import { confirmAsync } from '../../src/lib/confirm';
import { ClothingIllustration } from '../../src/components/ClothingIllustration';
import { CATEGORY_LABEL, SLOT_LABEL } from '../../src/lib/labels';
import { useStore } from '../../src/store';
import { CATEGORY_SLOT, SLOTS, type Slot } from '../../src/types';

export default function Closet() {
  const router = useRouter();
  const items = useStore((s) => s.items);
  const addSample = useStore((s) => s.addSampleItems);
  const removeItems = useStore((s) => s.removeItems);
  const [tab, setTab] = useState<Slot | 'all' | 'trial'>('all');
  const owned = useMemo(() => items.filter((i) => i.isOwned), [items]);
  const trials = useMemo(() => items.filter((i) => !i.isOwned), [items]);
  const [showPhoto, setShowPhoto] = useState(true); // 写真があれば写真を主役に表示
  const hasPhoto = items.some((i) => i.photoUri);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const shown = tab === 'all' ? owned : tab === 'trial' ? trials : owned.filter((i) => CATEGORY_SLOT[i.category] === tab);

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
  // 「すべて選択」は今表示している部位タブの服が対象
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
      <View style={styles.tabs}>
        <Chip label="すべて" selected={tab === 'all'} onPress={() => setTab('all')} />
        {SLOTS.map((s) => (
          <Chip key={s} label={SLOT_LABEL[s]} selected={tab === s} onPress={() => setTab(s)} />
        ))}
        <Chip label={`お試し（${trials.length}）`} selected={tab === 'trial'} onPress={() => setTab('trial')} />
        {hasPhoto && <Chip label={showPhoto ? '📷 写真で表示中' : '🎨 イラストで表示中'} selected={showPhoto} onPress={() => setShowPhoto((v) => !v)} />}
        {shown.length > 0 && (
          <View style={{ marginLeft: 'auto' }}>
            <Chip label={selecting ? 'キャンセル' : '選択'} selected={selecting} onPress={selecting ? exit : () => setSelecting(true)} />
          </View>
        )}
      </View>
      <FlatList
        data={shown}
        numColumns={3}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 8, paddingBottom: 90 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 32, gap: 12 }}>
            <Text style={{ color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
              {tab === 'trial' ? 'お試しデザインはまだありません。\n持っていない服を作って、手持ちの服との相性を試せます。' : 'まだ服がありません'}
            </Text>
            {owned.length === 0 && tab !== 'trial' && <PrimaryButton label="サンプルの服を登録" variant="secondary" onPress={addSample} />}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => (selecting ? toggle(item.id) : router.push(`/item/${item.id}`))} accessibilityRole="button" accessibilityState={{ selected: selected.has(item.id) }}>
            <View style={[styles.illu, selected.has(item.id) && styles.illuOn]}>
              {selecting && (
                <View style={[styles.check, selected.has(item.id) && styles.checkOn]}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>{selected.has(item.id) ? '✓' : ''}</Text>
                </View>
              )}
              {showPhoto && item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} resizeMode="contain" accessibilityLabel={`${item.name || CATEGORY_LABEL[item.category]}の写真`} />
              ) : (
                <ClothingIllustration category={item.category} mainColor={item.mainColor} subColor={item.subColor} pattern={item.pattern} width={84} height={84} />
              )}
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.name || CATEGORY_LABEL[item.category]}</Text>
          </Pressable>
        )}
      />
      {selecting ? (
        <SelectBar count={selected.size} total={shown.length} onToggleAll={toggleAll} onDelete={remove} />
      ) : (
        <BottomBar>
          {tab === 'trial' ? (
            <>
              <PrimaryButton label="＋ お試しデザイン" onPress={() => router.push('/item/new?trial=1')} />
              <PrimaryButton label="手持ちと合わせる" variant="secondary" onPress={() => router.push('/outfit/new?trial=1')} />
            </>
          ) : (
            <>
              <PrimaryButton label="📷 写真から" onPress={() => router.push('/item/new')} />
              <PrimaryButton label="＋ 手入力" variant="secondary" onPress={() => router.push('/item/new')} />
              <PrimaryButton label="コーデ" variant="secondary" onPress={() => router.push('/outfit/new')} />
            </>
          )}
        </BottomBar>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF' },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 10 },
  card: { flex: 1 / 3, maxWidth: '33.33%', padding: 6, alignItems: 'center' },
  illu: { width: '100%', aspectRatio: 1, backgroundColor: '#F9FAFB', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  illuOn: { borderWidth: 3, borderColor: '#2563EB' },
  check: { position: 'absolute', top: 6, right: 6, zIndex: 1, width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#9CA3AF', backgroundColor: '#FFFFFFCC', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  name: { marginTop: 4, fontSize: 12, color: '#374151' },
});
