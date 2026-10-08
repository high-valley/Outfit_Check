import { Alert, Platform } from 'react-native';

/** 確認ダイアログ（Web では Alert が使えないため window.confirm を使う） */
export function confirmAsync(title: string, message: string, okLabel = '削除'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.(`${title}\n${message}`) ?? false);
  }
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'キャンセル', style: 'cancel', onPress: () => resolve(false) },
      { text: okLabel, style: 'destructive', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) }),
  );
}
