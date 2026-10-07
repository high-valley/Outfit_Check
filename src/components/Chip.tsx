import { Pressable, StyleSheet, Text, View } from 'react-native';

export function Chip({ label, selected, onPress, disabled }: { label: string; selected?: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, selected && styles.chipOn, disabled && { opacity: 0.4 }]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
    >
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function PrimaryButton({ label, onPress, variant = 'primary', disabled }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, variant === 'secondary' && styles.btnSecondary, variant === 'danger' && styles.btnDanger, disabled && { opacity: 0.4 }]}
      accessibilityRole="button"
    >
      <Text style={[styles.btnText, variant === 'secondary' && { color: '#111827' }, variant === 'danger' && { color: '#DC2626' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  chipOn: { backgroundColor: '#111827', borderColor: '#111827' },
  text: { fontSize: 13, color: '#374151' },
  textOn: { color: '#FFFFFF', fontWeight: '600' },
  btn: { flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  btnSecondary: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  btnDanger: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
