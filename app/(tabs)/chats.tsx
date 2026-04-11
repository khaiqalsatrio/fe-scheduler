import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text, SafeAreaView, TextInput, Platform, StatusBar, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MoreVertical, Search, MessageSquarePlus } from 'lucide-react-native';
import { ChatItem } from '../../components/ChatItem';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

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

export default function ChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchChatsFromBE();
    }, [])
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        handleGlobalSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleGlobalSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const token = await SecureStore.getItemAsync('user_token');
      const response = await fetch(`https://dev-ows-api.telkom-digital.id/v1/messages/search/global?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Global Search Result:', data);
      if (response.ok) {
        setSearchResults(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.warn('Search search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchChatsFromBE = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (!token) {
        console.log('User belum login / tidak ada token');
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://dev-ows-api.telkom-digital.id/v1/conversations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const jsonResp = await response.json();
      console.log('Raw Conversations Result:', jsonResp);

      if (response.ok) {
        // API docs: jsonResp adalah Array langsung [...]
        const data = Array.isArray(jsonResp) ? jsonResp : (jsonResp.data || []);

        const formattedData: ChatData[] = data.map((item: any) => ({
          id: item.id.toString(),
          // Untuk DM gunakan nama Penerima, untuk Grup gunakan Title
          name: item.title || item.recipient?.name || "User",
          lastMessage: item.last_message?.content || "",
          time: item.last_message?.created_at ? new Date(item.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Baru saja",
          unreadCount: parseInt(item.unread_count?.toString() || '0', 10),
          isOnline: item.is_online || false,
          avatar: item.photo_url || item.recipient?.avatar,
          isGroup: item.type === 'group'
        }));
        setChats(formattedData);

      } else {
        console.warn('Gagal memuat list chat:', jsonResp.message);
      }
    } catch (error) {
      console.warn('Error saat fetch chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatPress = (id: string, name: string) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id, name },
    });
  };

  const filteredChats = chats.filter(chat => {
    if (activeFilter === 'unread') return chat.unreadCount > 0;
    if (activeFilter === 'groups') return chat.isGroup;
    return true;
  });

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
            placeholder="Search messages..."
            style={styles.searchInput}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterChip, activeFilter === 'all' && styles.activeFilterChip]} 
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, activeFilter === 'unread' && styles.activeFilterChip]} 
          onPress={() => setActiveFilter('unread')}
        >
          <Text style={[styles.filterText, activeFilter === 'unread' && styles.activeFilterText]}>Unread</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, activeFilter === 'groups' && styles.activeFilterChip]} 
          onPress={() => setActiveFilter('groups')}
        >
          <Text style={[styles.filterText, activeFilter === 'groups' && styles.activeFilterText]}>Groups</Text>
        </TouchableOpacity>
      </View>

      {searchQuery.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              {isSearching ? (
                <ActivityIndicator color="#25D366" />
              ) : (
                <Text style={styles.emptyText}>Tidak ada pesan ditemukan</Text>
              )}
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.searchResultItem} 
              onPress={() => handleChatPress(item.conversation_id, item.conversation?.title || item.sender?.name || 'User')}
            >
              <View style={styles.searchResultHeader}>
                <Text style={styles.searchResultName}>{item.conversation?.title || item.sender?.name || item.conversation?.recipient?.name || 'User'}</Text>
                <Text style={styles.searchResultTime}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.searchResultText} numberOfLines={2}>
                {item.content}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={filteredChats}
          refreshing={isLoading}
          onRefresh={fetchChatsFromBE}
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
      )}

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
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 12,
    backgroundColor: '#FFF',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#D1FAE5',
    borderColor: '#D1FAE5',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#065F46',
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
    borderRadius: 18,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  searchResultItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  searchResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  searchResultTime: {
    fontSize: 12,
    color: '#999',
  },
  searchResultText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
