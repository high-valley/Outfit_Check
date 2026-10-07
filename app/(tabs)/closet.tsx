import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip, PrimaryButton } from '../../src/components/Chip';
import { ClothingIllustration } from '../../src/components/ClothingIllustration';
import { CATEGORY_LABEL, SLOT_LABEL } from '../../src/lib/labels';
import { useStore } from '../../src/store';
import { CATEGORY_SLOT, SLOTS, type Slot } from '../../src/types';

export default function Closet() {
  const router = useRouter();
  const items = useStore((s) => s.items);
  const addSample = useStore((s) => s.addSampleItems);
  const [tab, setTab] = useState<Slot | 'all'>('all');
  const owned = useMemo(() => items.filter((i) => i.isOwned), [items]);
  const shown = tab === 'all' ? owned : owned.filter((i) => CATEGORY_SLOT[i.category] === tab);

  return (
    <View style={styles.wrap}>
      <View style={styles.tabs}>
        <Chip label="すべて" selected={tab === 'all'} onPress={() => setTab('all')} />
        {SLOTS.map((s) => (
          <Chip key={s} label={SLOT_LABEL[s]} selected={tab === s} onPress={() => setTab(s)} />
        ))}
      </View>
      <FlatList
        data={shown}
        numColumns={3}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 8, paddingBottom: 90 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 32, gap: 12 }}>
            <Text style={{ color: '#6B7280' }}>まだ服がありません</Text>
            {owned.length === 0 && <PrimaryButton label="サンプルの服を登録" variant="secondary" onPress={addSample} />}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/item/${item.id}`)} accessibilityRole="button">
            <View style={styles.illu}>
              <ClothingIllustration category={item.category} mainColor={item.mainColor} subColor={item.subColor} pattern={item.pattern} width={84} height={84} />
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.name || CATEGORY_LABEL[item.category]}</Text>
          </Pressable>
        )}
      />
      <View style={styles.bottom}>
        <PrimaryButton label="＋ 服を登録" onPress={() => router.push('/item/new')} />
        <PrimaryButton label="コーデを作る" variant="secondary" onPress={() => router.push('/outfit/new')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF' },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 10 },
  card: { flex: 1 / 3, maxWidth: '33.33%', padding: 6, alignItems: 'center' },
  illu: { width: '100%', aspectRatio: 1, backgroundColor: '#F9FAFB', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  name: { marginTop: 4, fontSize: 12, color: '#374151' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#FFFFFFEE', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
});
