import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { Icon, type IconName } from './Icon';

export function Chip({ label, selected, onPress, disabled, icon }: { label: string; selected?: boolean; onPress: () => void; disabled?: boolean; icon?: IconName }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, selected && styles.chipOn, disabled && { opacity: 0.4 }]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
    >
      {icon && <Icon name={icon} size={16} color={selected ? colors.white : colors.ink} />}
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function PrimaryButton({ label, onPress, variant = 'primary', disabled, icon }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean; icon?: IconName }) {
  const textColor = variant === 'primary' ? colors.white : variant === 'danger' ? colors.red : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, variant === 'secondary' && styles.btnSecondary, variant === 'danger' && styles.btnDanger, disabled && { opacity: 0.4 }]}
      accessibilityRole="button"
    >
      {icon && <Icon name={icon} size={18} color={textColor} />}
      <Text style={[styles.btnText, { color: textColor }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 38, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  text: { fontSize: 14, color: colors.ink },
  textOn: { color: colors.white, fontWeight: '700' },
  btn: { flex: 1, minHeight: 50, borderRadius: radius.btn, backgroundColor: colors.ink, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  btnSecondary: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.ink },
  btnDanger: { backgroundColor: colors.redSoft, borderWidth: 1, borderColor: '#FECACA' },
  btnText: { fontSize: 15, fontWeight: '700' },
});
