import { StyleSheet, Text, View } from 'react-native';
import { scoreColor } from '../lib/labels';
import { resolveOutfit } from '../lib/outfit';
import type { ClothingItem, Outfit } from '../types';
import { OutfitDisplay } from './OutfitDisplay';

type Props = {
  itemIds: Outfit['itemIds'];
  items: ClothingItem[];
  score: number;
  width?: number;
  subtitle?: string;
  children?: React.ReactNode;
};

export function OutfitCard({ itemIds, items, score, width = 130, subtitle, children }: Props) {
  const { mannequin, list } = resolveOutfit({ itemIds }, items);
  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.score}>
        <Text style={[styles.scoreNum, { color: scoreColor(score) }]}>{score}</Text>
        <Text style={[styles.scorePct, { color: scoreColor(score) }]}>%</Text>
      </View>
      <View style={{ alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, paddingVertical: 6 }}>
        {list.length ? <OutfitDisplay items={mannequin} width={width - 28} /> : <Text style={styles.gone}>服が削除されています</Text>}
      </View>
      {subtitle ? <Text style={styles.sub} numberOfLines={2}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 8, backgroundColor: '#FFFFFF', gap: 6 },
  score: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  scoreNum: { fontSize: 30, fontWeight: '800' },
  scorePct: { fontSize: 14, fontWeight: '700', marginLeft: 1 },
  sub: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  gone: { fontSize: 11, color: '#9CA3AF', paddingVertical: 60 },
});
