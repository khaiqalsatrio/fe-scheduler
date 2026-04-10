// import { Tabs } from 'expo-router';
// import { Hop as Home, Calendar, Users, Network, MessageSquare, Mic } from 'lucide-react-native';

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: '#00BCD4', // Changed to purple to match the chat theme
//         tabBarInactiveTintColor: '#666',
//         tabBarStyle: {
//           borderTopWidth: 1,
//           borderTopColor: '#E0E0E0',
//         },
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           href: null,
//           tabBarIcon: ({ size, color }) => (
//             <Home size={size} color={color} strokeWidth={2} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="agenda"
//         options={{
//           title: 'Agenda',
//           href: null,
//           tabBarIcon: ({ size, color }) => (
//             <Calendar size={size} color={color} strokeWidth={2} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="speakers"
//         options={{
//           title: 'Speakers',
//           href: null,
//           tabBarIcon: ({ size, color }) => (
//             <Users size={size} color={color} strokeWidth={2} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="networking"
//         options={{
//           title: 'Networking',
//           href: null,
//           tabBarIcon: ({ size, color }) => (
//             <Network size={size} color={color} strokeWidth={2} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="chats"
//         options={{
//           title: 'Chat',
//           href: null,
//           tabBarIcon: ({ size, color }) => (
//             <MessageSquare size={size} color={color} strokeWidth={2} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="voice-ai"
//         options={{
//           title: 'AI Smart',
//           href: null,
//           tabBarIcon: ({ size, color }) => (
//             <Mic size={size} color={color} strokeWidth={2} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
