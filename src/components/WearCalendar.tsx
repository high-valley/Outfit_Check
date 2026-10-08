import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scoreColor } from '../lib/labels';
import { buildMonthGrid, wornByDate } from '../lib/calendar';
import { dateKey } from '../lib/suggest';
import type { Outfit } from '../types';

const WEEK = ['日', '月', '火', '水', '木', '金', '土'];

type Props = {
  year: number;
  month: number; // 0-11
  outfits: Outfit[];
  selected: string | null;
  onSelect: (key: string) => void;
  onShift: (delta: number) => void;
};

/** 着用日カレンダー：着た日にスコア色のドットが付く */
export function WearCalendar({ year, month, outfits, selected, onSelect, onShift }: Props) {
  const weeks = buildMonthGrid(year, month);
  const worn = wornByDate(outfits);
  const today = dateKey(new Date());
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Pressable onPress={() => onShift(-1)} style={styles.nav} accessibilityRole="button" accessibilityLabel="前の月">
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{year}年{month + 1}月</Text>
        <Pressable onPress={() => onShift(1)} style={styles.nav} accessibilityRole="button" accessibilityLabel="次の月">
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        {WEEK.map((w, i) => (
          <Text key={w} style={[styles.week, i === 0 && { color: '#DC2626' }, i === 6 && { color: '#2563EB' }]}>{w}</Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.row}>
          {week.map((cell, ci) => {
            if (!cell) return <View key={ci} style={styles.cell} />;
            const list = worn.get(cell.key) ?? [];
            const on = selected === cell.key;
            return (
              <Pressable
                key={ci}
                style={[styles.cell, on && styles.cellOn, cell.key === today && styles.cellToday]}
                onPress={() => onSelect(cell.key)}
                accessibilityRole="button"
                accessibilityLabel={`${month + 1}月${cell.date.getDate()}日${list.length ? `（着用${list.length}件）` : ''}`}
              >
                <Text style={[styles.day, ci === 0 && { color: '#DC2626' }, ci === 6 && { color: '#2563EB' }, on && { color: '#FFFFFF' }]}>{cell.date.getDate()}</Text>
                <View style={styles.dots}>
                  {list.slice(0, 3).map((o) => (
                    <View key={o.id} style={[styles.dot, { backgroundColor: scoreColor(o.score) }, on && { borderWidth: 1, borderColor: '#FFFFFF' }]} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 10, paddingBottom: 6 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  nav: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 28, color: '#111827' },
  title: { fontSize: 16, fontWeight: '800', color: '#111827' },
  row: { flexDirection: 'row' },
  week: { flex: 1, textAlign: 'center', fontSize: 11, color: '#6B7280', paddingVertical: 4 },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, margin: 1 },
  cellOn: { backgroundColor: '#12284C' },
  cellToday: { borderWidth: 1.5, borderColor: '#12284C' },
  day: { fontSize: 14, color: '#111827' },
  dots: { flexDirection: 'row', gap: 2, height: 8, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
