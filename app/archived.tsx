import { StyleSheet, View, FlatList, TouchableOpacity, Text, SafeAreaView, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Archive, Trash2 } from 'lucide-react-native';
import { ChatItem } from '../components/ChatItem';
import { ChatListItem } from '../types/chat';
import { ChatService } from '../services/chatService';
import { useFocusEffect } from '@react-navigation/native';

export default function ArchivedChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchArchivedChats();
    }, [])
  );

  const fetchArchivedChats = async () => {
    setIsLoading(true);
    try {
      // Kita fetch semua tapi filter yang diarsipkan saja di UI atau gunakan query param jika didukung
      const data = await ChatService.getConversations();
      // Filter yang isArchived true
      // Note: Karena endpoint /conversations mungkin belum menghandle isArchived di mapper service dengan benar jika tidak ada di BE,
      // kita asumsikan mapper sudah benar sesuai plan.
      setChats(data.filter(c => c.isArchived));
    } catch (error) {
      console.warn('Error fetching archived chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleArchive = async (ids: string[], isArchived: boolean) => {
    setIsLoading(true);
    try {
      await ChatService.archiveConversations(ids, isArchived);
      setSelectedChatIds([]);
      fetchArchivedChats();
    } catch (error) {
      Alert.alert('Error', 'Gagal memproses perubahan arsip.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedChatIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleChatPress = (id: string, name: string) => {
    if (selectedChatIds.length > 0) {
      toggleSelection(id);
    } else {
      router.push({
        pathname: '/chat/[id]',
        params: { id, name },
      });
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={[styles.headerSafeArea, selectedChatIds.length > 0 && styles.headerSelected]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => selectedChatIds.length > 0 ? setSelectedChatIds([]) : router.back()} style={styles.backButton}>
              <ArrowLeft color={selectedChatIds.length > 0 ? "#FFF" : "#000"} size={24} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, selectedChatIds.length > 0 && styles.headerTitleSelected]}>
              {selectedChatIds.length > 0 ? selectedChatIds.length : "Arsip"}
            </Text>
          </View>
          
          {selectedChatIds.length > 0 && (
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleToggleArchive(selectedChatIds, false)}>
                <Archive color="#FFF" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => {
                Alert.alert('Hapus', 'Hapus chat yang dipilih?', [
                  { text: 'BATAL', style: 'cancel' },
                  { text: 'HAPUS', onPress: async () => {
                    setIsLoading(true);
                    try {
                      await ChatService.deleteConversations(selectedChatIds);
                      setSelectedChatIds([]);
                      fetchArchivedChats();
                    } catch (error) {
                      Alert.alert('Error', 'Gagal menghapus chat.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                ]);
              }}>
                <Trash2 color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={fetchArchivedChats}
        renderItem={({ item }) => (
          <ChatItem
            name={item.name}
            lastMessage={item.lastMessage}
            time={item.time}
            avatar={item.avatar}
            isGroup={item.isGroup}
            unreadCount={item.unreadCount}
            isSelected={selectedChatIds.includes(item.id)}
            onPress={() => handleChatPress(item.id, item.name)}
            onLongPress={() => toggleSelection(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {!isLoading && (
              <>
                <Text style={styles.emptyText}>Tidak ada percakapan yang diarsipkan</Text>
                <Text style={styles.emptySubText}>Chat yang diarsipkan akan muncul di sini</Text>
              </>
            )}
            {isLoading && <ActivityIndicator color="#00A884" />}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerSelected: {
    backgroundColor: '#005C4B', // WhatsApp Dark Green for selection
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  headerTitleSelected: {
    color: '#FFF',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 15,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
