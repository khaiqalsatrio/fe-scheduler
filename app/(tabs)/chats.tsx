import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text, SafeAreaView, TextInput, Platform, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, MoreVertical, Search, MessageSquarePlus } from 'lucide-react-native';
import { ChatItem } from '../../components/ChatItem';

type ChatData = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline?: boolean;
  isGroup?: boolean;
  avatar?: string;
};

const DUMMY_CHATS: ChatData[] = [
  {
    id: '1',
    name: 'Ahmad Zaki',
    lastMessage: 'Oke, nanti aku coba deh. Thanks ya!',
    time: '10:05',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Sarah Nur',
    lastMessage: 'Hahaha iya bener banget 😂',
    time: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Dev Team 🚀',
    lastMessage: 'Ahmad: Gimana progress sprint ini?',
    time: '09:30',
    unreadCount: 5,
    isGroup: true,
  },
  {
    id: '4',
    name: 'Budi Santoso',
    lastMessage: 'Besok meeting jam berapa?',
    time: 'Monday',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '5',
    name: 'Project Alpha',
    lastMessage: "Sarah: @Al what's the best way to optin",
    time: 'Friday',
    unreadCount: 0,
    isGroup: true,
  },
];

export default function ChatsScreen() {
  const router = useRouter();

  const handleChatPress = (id: string, name: string) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id, name },
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.jpg')}
              style={styles.logoImage}
            />
            <Text style={styles.headerTitle}>ChatAja!</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Camera color="#333" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
              <MoreVertical color="#333" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#999" size={20} />
          <TextInput
            placeholder="Search..."
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <FlatList
        data={DUMMY_CHATS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatItem
            name={item.name}
            lastMessage={item.lastMessage}
            time={item.time}
            avatar={item.avatar}
            isGroup={item.isGroup}
            isOnline={item.isOnline}
            unreadCount={item.unreadCount}
            onPress={() => handleChatPress(item.id, item.name)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() => (
          <View style={styles.listFooter}>
            <Text style={styles.footerText}>
              Your personal messages are <Text style={styles.footerTextGreen}>end-to-end encrypted</Text>
            </Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/new-connection' as any)}
      >
        <MessageSquarePlus color="#FFF" size={26} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerSafeArea: {
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 24,
    paddingHorizontal: 15,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingBottom: 100,
  },
  listFooter: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  footerTextGreen: {
    color: '#25D366',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 18, // Squircle shape
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
