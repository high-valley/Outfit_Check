import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from './Chip';

/** 選択モード時に画面下部へ出す操作バー */
export function SelectBar({ count, total, onToggleAll, onDelete }: { count: number; total: number; onToggleAll: () => void; onDelete: () => void }) {
  return (
    <View style={styles.bar}>
      <PrimaryButton label={count === total && total > 0 ? 'すべて解除' : 'すべて選択'} variant="secondary" onPress={onToggleAll} disabled={total === 0} />
      <PrimaryButton label={`削除（${count}）`} variant="danger" onPress={onDelete} disabled={count === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#FFFFFFEE', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
});
