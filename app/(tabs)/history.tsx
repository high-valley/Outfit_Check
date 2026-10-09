import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { OutfitCard } from '../../src/components/OutfitCard';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { WearCalendar } from '../../src/components/WearCalendar';
import { shiftMonth, wornByDate } from '../../src/lib/calendar';
import { dateKey } from '../../src/lib/suggest';
import { useStore } from '../../src/store';
import { colors } from '../../src/theme';

/** 履歴：着た日のカレンダー（保存したコーデの一覧は「コーデ」タブ） */
export default function History() {
  const outfits = useStore((s) => s.outfits);
  const items = useStore((s) => s.items);
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [day, setDay] = useState<string | null>(dateKey(now));
  const dayOutfits = day ? (wornByDate(outfits).get(day) ?? []) : [];

  return (
    <View style={styles.wrap}>
      <ScreenHeader title="履歴" subtitle="着たコーデを振り返ろう" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <WearCalendar
          year={cursor.year}
          month={cursor.month}
          outfits={outfits}
          selected={day}
          onSelect={setDay}
          onShift={(d) => setCursor((c) => shiftMonth(c.year, c.month, d))}
        />
        <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 10 }}>
          <Text style={styles.dayTitle}>{day ? `${day.replace(/-/g, '/')} に着たコーデ` : '日付を選んでください'}</Text>
          {day && dayOutfits.length === 0 && <Text style={styles.empty}>この日の着用記録はありません。ホームの「これを着る」で記録されます。</Text>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {dayOutfits.map((o) => (
              <OutfitCard key={o.id} itemIds={o.itemIds} items={items} score={o.score} width={168} subtitle={`着用 ${o.wornDates.length}回`} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  dayTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  empty: { fontSize: 13, color: colors.sub, lineHeight: 20 },
});
