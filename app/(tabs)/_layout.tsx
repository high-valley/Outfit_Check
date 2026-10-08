import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const icon = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: '#111827' }}>
      <Tabs.Screen name="index" options={{ title: 'ホーム', tabBarIcon: icon('🏠') }} />
      <Tabs.Screen name="closet" options={{ title: 'クローゼット', tabBarIcon: icon('👕') }} />
      <Tabs.Screen name="history" options={{ title: '履歴', tabBarIcon: icon('📅') }} />
      <Tabs.Screen name="settings" options={{ title: '設定', tabBarIcon: icon('⚙️') }} />
    </Tabs>
  );
}
