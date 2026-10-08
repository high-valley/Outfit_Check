import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

/** 画面下部に固定する操作バー。タブバーのない画面では inset でホームバー分の余白を足す */
export function BottomBar({ children, inset = false }: { children: React.ReactNode; inset?: boolean }) {
  const { bottom } = useSafeAreaInsets();
  return <View style={[styles.bar, inset && { paddingBottom: 12 + bottom }]}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', gap: 10, padding: 12,
    backgroundColor: '#F6F5F2F2', borderTopWidth: 1, borderTopColor: colors.line,
  },
});
