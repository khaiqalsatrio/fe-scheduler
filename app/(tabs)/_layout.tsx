import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { MessageSquare, Calendar, Users, User } from 'lucide-react-native';
import { OnboardingProvider, useOnboarding } from '../../context/OnboardingContext';
import { OnboardingOverlay } from '../../components/onboarding/OnboardingOverlay';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const GlobalOnboarding = () => {
  const router = useRouter();
  const onboardingState = useOnboarding();
  
  return (
    <OnboardingOverlay
      step={onboardingState.step}
      isRegistering={onboardingState.isRegistering}
      onboardingState={onboardingState}
      onCancel={() => onboardingState.setStep(1)}
      onComplete={() => {
        onboardingState.setStep(0);
        router.replace('/(tabs)/chats');
      }}
    />
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <OnboardingProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#065F46', // Dark green for text/icon
          tabBarInactiveTintColor: '#666',
          tabBarStyle: [
            styles.tabBar,
            {
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            }
          ],
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
          name="profile_tab"
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon Icon={User} focused={focused} color={color} />
            ),
          }}
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              router.push('/profile');
            },
          })}
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
      <GlobalOnboarding />
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 10,
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
