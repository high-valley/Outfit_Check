import { StyleSheet, Text, View } from 'react-native';
import { resolveOutfit } from '../lib/outfit';
import { colors, radius, scoreColor, shadow } from '../theme';
import type { ClothingItem, Outfit } from '../types';
import { OutfitDisplay } from './OutfitDisplay';

type Props = {
  itemIds: Outfit['itemIds'];
  items: ClothingItem[];
  score: number;
  width?: number;
  subtitle?: string;
  tag?: string;
  children?: React.ReactNode;
};

export function OutfitCard({ itemIds, items, score, width = 150, subtitle, tag, children }: Props) {
  const { mannequin, list } = resolveOutfit({ itemIds }, items);
  const c = scoreColor(score);
  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.tile}>
        {list.length ? <OutfitDisplay items={mannequin} width={width - 36} /> : <Text style={styles.gone}>服が削除されています</Text>}
        <View style={[styles.badge, { backgroundColor: c }]}>
          <Text style={styles.badgeText}>{score}%</Text>
        </View>
        {tag ? <Text style={styles.tag}>{tag}</Text> : null}
      </View>
      {subtitle ? <Text style={styles.sub} numberOfLines={2}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.card, padding: 8, gap: 8, ...shadow },
  tile: { alignItems: 'center', backgroundColor: colors.tile, borderRadius: radius.tile, paddingVertical: 8, overflow: 'hidden' },
  badge: { position: 'absolute', top: 8, right: 8, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  tag: { position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: '700', color: colors.white, backgroundColor: colors.amber, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, overflow: 'hidden' },
  sub: { fontSize: 11, color: colors.sub, textAlign: 'center' },
  gone: { fontSize: 11, color: colors.mute, paddingVertical: 60 },
});
