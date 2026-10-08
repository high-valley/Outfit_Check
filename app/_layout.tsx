import { Stack } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useStore } from '../src/store';

export default function RootLayout() {
  const load = useStore((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  return (
    // PC / iPad の Web でも iPhone 幅（最大480px）で表示する
    <View style={{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: '服の登録', presentation: 'modal' }} />
        <Stack.Screen name="outfit/new" options={{ title: 'コーデを作る' }} />
      </Stack>
    </View>
  );
}
