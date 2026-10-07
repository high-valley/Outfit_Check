import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useStore } from '../src/store';

export default function RootLayout() {
  const load = useStore((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: '服の登録', presentation: 'modal' }} />
        <Stack.Screen name="outfit/new" options={{ title: 'コーデを作る' }} />
      </Stack>
    </>
  );
}
