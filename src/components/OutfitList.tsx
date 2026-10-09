import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { confirmAsync } from '../lib/confirm';
import { useStore } from '../store';
import { colors, radius } from '../theme';
import type { Outfit } from '../types';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { OutfitCard } from './OutfitCard';
import { SelectBar } from './SelectBar';

type Sort = 'new' | 'score' | 'worn';
const SORT_LABEL: Record<Sort, string> = { new: '新しい順', score: 'スコア順', worn: '着用回数順' };

/** 保存したコーデの一覧。タップで開く / 選択モードで複数選択して一括削除 */
export function OutfitList({ onOpen, cardWidth }: { onOpen: (outfit: Outfit) => void; cardWidth: number }) {
  const outfits = useStore((s) => s.outfits);
  const items = useStore((s) => s.items);
  const removeOutfits = useStore((s) => s.removeOutfits);
  const [sort, setSort] = useState<Sort>('new');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    const arr = [...outfits];
    if (sort === 'score') arr.sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt));
    else if (sort === 'worn') arr.sort((a, b) => b.wornDates.length - a.wornDates.length || b.createdAt.localeCompare(a.createdAt));
    else arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return arr;
  }, [outfits, sort]);

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
    <View style={{ flex: 1 }}>
      <View style={styles.head}>
        <Text style={styles.count}>保存したコーデ {outfits.length}件</Text>
        {outfits.length > 0 && (
          <Pressable onPress={selecting ? exit : () => setSelecting(true)} style={[styles.mini, selecting && { backgroundColor: colors.ink }]} accessibilityRole="button">
            <Text style={[styles.miniText, selecting && { color: colors.white }]}>{selecting ? 'キャンセル' : '選択'}</Text>
          </Pressable>
        )}
      </View>
      {outfits.length > 1 && (
        <View style={styles.sortRow}>
          {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
            <Chip key={s} label={SORT_LABEL[s]} selected={sort === s} onPress={() => setSort(s)} />
          ))}
        </View>
      )}
      <FlatList
        data={sorted}
        numColumns={2}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 110 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 32, gap: 12 }}>
            <Icon name="shirt" size={40} color={colors.mute} />
            <Text style={{ color: colors.sub, textAlign: 'center', lineHeight: 21 }}>
              まだコーデがありません。{'\n'}「作成」で組み合わせて保存するか、{'\n'}ホームの「これを着る」で記録されます。
            </Text>
          </View>
        }
        renderItem={({ item: o }) => {
          const on = selected.has(o.id);
          const last = o.wornDates.length ? [...o.wornDates].sort().at(-1)!.replace(/-/g, '/') : null;
          return (
            <Pressable
              style={[styles.cell, on && styles.cellOn]}
              onPress={() => (selecting ? toggle(o.id) : onOpen(o))}
              accessibilityRole="button"
              accessibilityLabel={`スコア${o.score}%のコーデ`}
              accessibilityState={{ selected: on }}
            >
              <OutfitCard itemIds={o.itemIds} items={items} score={o.score} width={cardWidth} subtitle={o.wornDates.length ? `着用${o.wornDates.length}回・${last}` : '未着用'} />
              {selecting && (
                <View style={[styles.check, on && styles.checkOn]}>{on && <Icon name="check" size={14} color={colors.white} strokeWidth={3} />}</View>
              )}
            </Pressable>
          );
        }}
      />
      {selecting && <SelectBar count={selected.size} total={outfits.length} onToggleAll={toggleAll} onDelete={remove} />}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 6 },
  count: { fontSize: 13, color: colors.sub },
  mini: { minHeight: 34, paddingHorizontal: 12, borderRadius: radius.pill, justifyContent: 'center' },
  miniText: { fontSize: 12.5, fontWeight: '700', color: colors.ink },
  sortRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  cell: { flex: 1, borderRadius: radius.card, borderWidth: 2, borderColor: 'transparent' },
  cellOn: { borderColor: colors.ink },
  check: { position: 'absolute', top: 14, left: 14, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.mute, backgroundColor: '#FFFFFFD9', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.ink, borderColor: colors.ink },
});
