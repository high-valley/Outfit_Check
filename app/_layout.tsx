import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useStore } from '../src/store';
import { colors } from '../src/theme';

export default function RootLayout() {
  const load = useStore((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  return (
    // PC / iPad の Web でも iPhone 幅（最大480px）で表示する
    <View style={{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: colors.bg }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '800', color: colors.ink },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: '服の登録', presentation: 'modal' }} />
      </Stack>
    </View>
  );
}
