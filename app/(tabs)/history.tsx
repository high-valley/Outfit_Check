import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip } from '../../src/components/Chip';
import { OutfitCard } from '../../src/components/OutfitCard';
import { SelectBar } from '../../src/components/SelectBar';
import { confirmAsync } from '../../src/lib/confirm';
import { useStore } from '../../src/store';

export default function History() {
  const outfits = useStore((s) => s.outfits);
  const items = useStore((s) => s.items);
  const removeOutfits = useStore((s) => s.removeOutfits);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
  const toggleAll = () => setSelected(selected.size === outfits.length ? new Set() : new Set(outfits.map((o) => o.id)));
  const remove = async () => {
    const all = selected.size === outfits.length;
    const ok = await confirmAsync(all ? 'コーデをすべて削除' : 'コーデを削除', `${selected.size}件のコーデを削除します。元に戻せません。`);
    if (!ok) return;
    await removeOutfits([...selected]);
    exit();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.count}>保存したコーデ: {outfits.length}件</Text>
        {outfits.length > 0 && <Chip label={selecting ? 'キャンセル' : '選択'} selected={selecting} onPress={selecting ? exit : () => setSelecting(true)} />}
      </View>
      <FlatList
        data={outfits}
        numColumns={2}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
        columnWrapperStyle={{ gap: 10 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<Text style={styles.empty}>まだコーデがありません。「コーデを作る」で保存するか、ホームで「これを着る」を押すとここに残ります。</Text>}
        renderItem={({ item: o }) => {
          const on = selected.has(o.id);
          const last = o.wornDates.length ? [...o.wornDates].sort().at(-1) : null;
          return (
            <Pressable style={{ flex: 1 }} disabled={!selecting} onPress={() => toggle(o.id)} accessibilityRole="button" accessibilityState={{ selected: on }}>
              <View style={[{ flex: 1 }, on && styles.on]}>
                <OutfitCard itemIds={o.itemIds} items={items} score={o.score} width={170} subtitle={o.wornDates.length ? `着用 ${o.wornDates.length}回（最終 ${last}）` : '未着用'} />
                {selecting && (
                  <View style={[styles.check, on && styles.checkOn]}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{on ? '✓' : ''}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />
      {selecting && <SelectBar count={selected.size} total={outfits.length} onToggleAll={toggleAll} onDelete={remove} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  count: { fontSize: 13, color: '#6B7280' },
  empty: { padding: 24, color: '#6B7280', lineHeight: 20, fontSize: 13 },
  on: { borderRadius: 14, borderWidth: 3, borderColor: '#2563EB' },
  check: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#9CA3AF', backgroundColor: '#FFFFFFCC', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
});
