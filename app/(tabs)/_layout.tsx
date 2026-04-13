import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { MessageSquare, Calendar, Users } from 'lucide-react-native';

const TabIcon = ({ Icon, focused, color }: { Icon: any; focused: boolean; color: string }) => {
  return (
    <View style={[
      styles.iconWrapper,
      focused && styles.pillContainer
    ]}>
      <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#065F46', // Dark green for text/icon
        tabBarInactiveTintColor: '#666',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }, // Sembunyikan tab bar di halaman login
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon Icon={MessageSquare} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="channel"
        options={{
          title: 'Channel',
          tabBarLabel: 'Channel',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon Icon={Users} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Kegiatan',
          tabBarLabel: 'Kegiatan',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon Icon={Calendar} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="speakers"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="networking"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="voice-ai"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 10,
    height: 65,
    paddingBottom: 10,
    paddingTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconWrapper: {
    width: 64,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 4,
  },
  pillContainer: {
    backgroundColor: '#D1FAE5', // Light green pill
  },
});
