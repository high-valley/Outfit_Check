import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { Icon, type IconName } from './Icon';

export type HeaderAction = { icon: IconName; label: string; onPress: () => void };

/** 画面上部の大きなタイトル（モックの「コーデスコア / 今日のコーデをチェック」の形） */
export function ScreenHeader({ title, subtitle, actions = [] }: { title: string; subtitle?: string; actions?: HeaderAction[] }) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: top + 10 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} accessibilityRole="header">{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        {actions.map((a) => (
          <Pressable key={a.label} onPress={a.onPress} style={styles.action} accessibilityRole="button" accessibilityLabel={a.label}>
            <Icon name={a.icon} size={26} color={colors.ink} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 18, paddingBottom: 12, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: 0.5 },
  sub: { fontSize: 13, color: colors.sub, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 4, marginTop: 2 },
  action: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
