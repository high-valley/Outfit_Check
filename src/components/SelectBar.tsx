import { PrimaryButton } from './Chip';
import { BottomBar } from './BottomBar';

/** 選択モード時に画面下部へ出す操作バー */
export function SelectBar({ count, total, onToggleAll, onDelete }: { count: number; total: number; onToggleAll: () => void; onDelete: () => void }) {
  return (
    <BottomBar>
      <PrimaryButton label={count === total && total > 0 ? 'すべて解除' : 'すべて選択'} variant="secondary" onPress={onToggleAll} disabled={total === 0} />
      <PrimaryButton label={`削除（${count}）`} variant="danger" onPress={onDelete} disabled={count === 0} />
    </BottomBar>
  );
}

