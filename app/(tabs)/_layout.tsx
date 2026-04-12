import { Tabs } from 'expo-router';
import { MessageSquare, Calendar } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32', // Darker green for text
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 70,
          paddingBottom: 8,
        },
      }}>
      {/* Hidden tabs */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          href: null,
          tabBarStyle: { display: 'none' }
        }} 
      />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="speakers" options={{ href: null }} />
      <Tabs.Screen name="networking" options={{ href: null }} />
      <Tabs.Screen name="voice-ai" options={{ href: null }} />

      {/* Visible tabs */}
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Itinerary',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
