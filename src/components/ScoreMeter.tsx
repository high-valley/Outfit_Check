import { StyleSheet, Text, View } from 'react-native';
import { scoreColor } from '../lib/labels';
import { MAX } from '../lib/scoring/constants';
import type { ScoreResult } from '../types';

const LABELS = { color: '色', silhouette: 'シルエット', taste: 'テイスト', season: '季節' } as const;

export function ScoreMeter({ result }: { result: ScoreResult | null }) {
  const total = result?.total ?? 0;
  const color = result ? scoreColor(total) : '#9CA3AF';
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.number, { color }]} testID="score-total">
          {result ? total : '--'}
        </Text>
        <Text style={[styles.percent, { color }]}>%</Text>
        <View style={styles.bars}>
          {(Object.keys(LABELS) as (keyof typeof LABELS)[]).map((k) => (
            <View key={k} style={styles.miniRow}>
              <Text style={styles.miniLabel}>{LABELS[k]}</Text>
              <View style={styles.miniTrack}>
                <View
                  style={[
                    styles.miniFill,
                    { width: `${result ? (result.breakdown[k] / MAX[k]) * 100 : 0}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={styles.miniValue}>
                {result ? result.breakdown[k] : '-'}/{MAX[k]}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${total}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  row: { flexDirection: 'row', alignItems: 'center' },
  number: { fontSize: 64, fontWeight: '800', lineHeight: 72, minWidth: 92, textAlign: 'right' },
  percent: { fontSize: 26, fontWeight: '700', marginLeft: 2, marginRight: 14 },
  bars: { flex: 1, gap: 3 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniLabel: { width: 64, fontSize: 11, color: '#6B7280' },
  miniTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  miniFill: { height: 5, borderRadius: 3 },
  miniValue: { width: 36, fontSize: 11, color: '#6B7280', textAlign: 'right' },
  track: { height: 10, borderRadius: 5, backgroundColor: '#E5E7EB', overflow: 'hidden', marginTop: 8 },
  fill: { height: 10, borderRadius: 5 },
});
