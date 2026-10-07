import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../src/components/Chip';
import { useStore } from '../../src/store';

export default function Home() {
  const router = useRouter();
  const count = useStore((s) => s.items.filter((i) => i.isOwned).length);
  const addSample = useStore((s) => s.addSampleItems);
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>手持ちの服だけで、今日のコーデを。</Text>
      <Text style={styles.sub}>登録した服: {count}点</Text>
      <Text style={styles.note}>「今日のコーデ提案」は次のステップで追加します。</Text>
      <View style={{ flex: 1 }} />
      {count === 0 && (
        <View style={styles.btnRow}>
          <PrimaryButton label="サンプルの服を登録して試す" variant="secondary" onPress={addSample} />
        </View>
      )}
      <View style={styles.btnRow}>
        <PrimaryButton label="コーデを作る" onPress={() => router.push('/outfit/new')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 24 },
  sub: { marginTop: 12, fontSize: 15, color: '#374151' },
  note: { marginTop: 8, fontSize: 12, color: '#9CA3AF' },
  btnRow: { flexDirection: 'row', marginBottom: 12 },
});
