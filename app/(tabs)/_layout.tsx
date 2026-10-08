import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../src/components/Icon';
import { colors } from '../../src/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: ColorValue }) => <Icon name={icon} size={25} color={color as string} strokeWidth={1.9} />,
});

export default function TabsLayout() {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // 各画面で大きなタイトル（ScreenHeader）を描く
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.mute,
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '700', marginTop: 2, lineHeight: 14 },
        tabBarItemStyle: { height: 58 },
        // ラベルが切れないよう高さを明示（ホームバー分の余白を足す）
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line, height: 74 + bottom, paddingTop: 6, paddingBottom: 6 + bottom },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={tab('ホーム', 'home')} />
      <Tabs.Screen name="closet" options={tab('クローゼット', 'hanger')} />
      <Tabs.Screen name="outfit" options={tab('コーデ', 'shirt')} />
      <Tabs.Screen name="history" options={tab('履歴', 'clock')} />
      <Tabs.Screen name="settings" options={tab('設定', 'gear')} />
    </Tabs>
  );
}
