import { StyleSheet, Text, View } from 'react-native';
import { MAX } from '../lib/scoring/constants';
import { colors, scoreColor } from '../theme';
import type { ScoreResult } from '../types';
import { Icon, type IconName } from './Icon';

const ROWS: { key: keyof ScoreResult['breakdown']; label: string; icon: IconName }[] = [
  { key: 'color', label: '配色', icon: 'palette' },
  { key: 'silhouette', label: 'シルエット', icon: 'ruler' },
  { key: 'taste', label: 'テイスト', icon: 'sparkle' },
  { key: 'season', label: '季節感', icon: 'sun' },
];

/** 配色・シルエット・テイスト・季節感の内訳（各項目を % で表示） */
export function ScoreBars({ result, compact }: { result: ScoreResult | null; compact?: boolean }) {
  return (
    <View style={{ gap: compact ? 8 : 12 }}>
      {ROWS.map(({ key, label, icon }) => {
        const pct = result ? Math.round((result.breakdown[key] / MAX[key]) * 100) : 0;
        const c = result ? scoreColor(pct) : colors.mute;
        return (
          <View key={key} style={styles.row}>
            <Icon name={icon} size={compact ? 15 : 18} color={colors.sub} />
            <Text style={[styles.label, compact && { width: 68, fontSize: 11.5, marginLeft: -2 }]} numberOfLines={1}>{label}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%`, backgroundColor: c }]} />
            </View>
            <Text style={[styles.pct, { color: c }, compact && { fontSize: 12, width: 34 }]}>{result ? `${pct}%` : '-'}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { width: 78, fontSize: 13, color: colors.text },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#ECEAE5', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  pct: { width: 44, fontSize: 13, fontWeight: '800', textAlign: 'right' },
});
