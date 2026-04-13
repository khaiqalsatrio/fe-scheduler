import { StyleSheet, View, FlatList, TouchableOpacity, Text, SafeAreaView, TextInput, Platform, StatusBar, Image, ActivityIndicator, Alert, Modal, Animated, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { MoreVertical, Search, MessageSquarePlus, Trash2, ArrowLeft, X, BellOff, Bell, Archive, Pin } from 'lucide-react-native';
import { ChatItem } from '../../components/ChatItem';
import { ChatListItem } from '../../types/chat';
import { ChatService } from '../../services/chatService';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    conversations: ChatListItem[];
    messages: any[];
  }>({ conversations: [], messages: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isMuteModalVisible, setIsMuteModalVisible] = useState(false);
  const [muteDuration, setMuteDuration] = useState<'8h' | '1w' | 'always'>('always');
  
  const deleteModalAnim = useRef(new Animated.Value(0)).current;
  const muteModalAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchChatsFromBE();
    }, [])
  );

  // --- Effects ---
  useEffect(() => {
    if (isDeleteModalVisible) {
      deleteModalAnim.setValue(0);
      Animated.spring(deleteModalAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 12,
        speed: 10
      }).start();
    } else {
      Animated.spring(deleteModalAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 10
      }).start();
    }
  }, [isDeleteModalVisible]);

  useEffect(() => {
    if (isMuteModalVisible) {
      muteModalAnim.setValue(0);
      Animated.spring(muteModalAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 12,
        speed: 10
      }).start();
    } else {
      Animated.spring(muteModalAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 10
      }).start();
    }
  }, [isMuteModalVisible]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        handleGlobalSearch(searchQuery);
      } else {
        setSearchResults({ conversations: [], messages: [] });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleGlobalSearch = async (query: string) => {
    setIsSearching(true);
    try {
      // 1. Filter Lokal (Instant)
      const localResults = chats.filter(chat => 
        chat.name.toLowerCase().includes(query.toLowerCase())
      );

      // 2. Cari Akun Baru (User Service)
      const userResults = await ChatService.searchUsers(query);
      const mappedUserResults: ChatListItem[] = userResults
        .filter(u => !localResults.some(c => c.id === u.id)) // Hindari duplikat jika user sudah ada di chat list
        .map(u => ({
          id: u.id,
          name: u.name || u.username || 'User',
          lastMessage: '',
          time: '',
          avatar: u.avatar || undefined,
          isGroup: false,
          unreadCount: 0
        }));

      // 3. Cari Riwayat Pesan
      const messageResults = await ChatService.globalSearch(query);

      setSearchResults({
        conversations: [...localResults, ...mappedUserResults],
        messages: messageResults
      });
    } catch (error) {
      console.warn('Unified search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchChatsFromBE = async () => {
    setIsLoading(true);
    try {
      const formattedData = await ChatService.getConversations();
      setChats(formattedData);
    } catch (error) {
      console.warn('Error saat fetch chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = () => {
    setIsDeleteModalVisible(true);
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

  const handleLongPress = (id: string) => {
    toggleSelection(id);
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

  const { archivedCount, mainChats } = React.useMemo(() => {
    const filtered = chats.filter(chat => {
      if (activeFilter === 'unread') return chat.unreadCount > 0;
      if (activeFilter === 'groups') return chat.isGroup;
      return true;
    });

    return {
      archivedCount: chats.filter(c => c.isArchived).length,
      mainChats: filtered
        .filter(c => !c.isArchived)
        .sort((a, b) => {
          // Sort by Pinned First
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0; // Maintain original order (assumed from API as latest first)
        })
    };
  }, [chats, activeFilter]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={[styles.headerSafeArea, selectedChatIds.length > 0 && styles.headerSelected]}>
        {selectedChatIds.length > 0 ? (
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <TouchableOpacity onPress={() => setSelectedChatIds([])} style={styles.backButton}>
                <ArrowLeft color="#FFF" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerTitleSelected}>{selectedChatIds.length}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={async () => {
                  setIsLoading(true);
                  try {
                    const allPinned = chats.filter(c => selectedChatIds.includes(c.id)).every(c => c.isPinned);
                    await ChatService.pinConversations(selectedChatIds, !allPinned);
                    setSelectedChatIds([]);
                    fetchChatsFromBE();
                  } catch (error) {
                    Alert.alert('Error', 'Gagal menyematkan percakapan.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <Pin 
                  color="#FFF" 
                  size={24} 
                  style={{ transform: [{ rotate: '45deg' }] }}
                  fill={chats.filter(c => selectedChatIds.includes(c.id)).every(c => c.isPinned) ? "#FFF" : "transparent"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => {
                  const anyUnmuted = chats.filter(c => selectedChatIds.includes(c.id)).some(c => !c.isMuted);
                  if (anyUnmuted) {
                    setIsMuteModalVisible(true);
                  } else {
                    // All are already muted, so UNMUTE directly
                    (async () => {
                      setIsLoading(true);
                      try {
                        await ChatService.muteConversations(selectedChatIds, false);
                        setSelectedChatIds([]);
                        fetchChatsFromBE();
                      } catch (error) {
                        Alert.alert('Error', 'Terjadi kesalahan saat mengaktifkan suara.');
                      } finally {
                        setIsLoading(false);
                      }
                    })();
                  }
                }}
              >
                {chats.filter(c => selectedChatIds.includes(c.id)).every(c => c.isMuted) ? (
                  <Bell color="#FFF" size={24} />
                ) : (
                  <BellOff color="#FFF" size={24} />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={async () => {
                  setIsLoading(true);
                  try {
                    // Cek jika semua yang dipilih sudah diarsip, maka unarchive. Jika ada yang belum, maka archive.
                    const allArchived = chats.filter(c => selectedChatIds.includes(c.id)).every(c => c.isArchived);
                    await ChatService.archiveConversations(selectedChatIds, !allArchived);
                    setSelectedChatIds([]);
                    fetchChatsFromBE();
                  } catch (error) {
                    Alert.alert('Error', 'Gagal memproses arsip.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <Archive color="#FFF" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleDeleteConversation}>
                <Trash2 color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
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
        )}
      </SafeAreaView>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#999" size={20} />
          <TextInput
            placeholder="Search...."
            style={styles.searchInput}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Sembunyikan filter saat mode seleksi aktif agar fokus pada hapus */}
      {selectedChatIds.length === 0 && (
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
      )}

      {searchQuery.length > 0 ? (
        <FlatList
          data={[
            ...(searchResults.conversations.length > 0 ? [{ type: 'header', title: 'OBROLAN & KONTAK' }] : []),
            ...searchResults.conversations.map(c => ({ ...c, type: 'conversation' })),
            ...(searchResults.messages.length > 0 ? [{ type: 'header', title: 'PESAN' }] : []),
            ...searchResults.messages.map(m => ({ ...m, type: 'message' }))
          ]}
          keyExtractor={(item, index) => item.id + index.toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              {isSearching ? (
                <ActivityIndicator color="#25D366" />
              ) : (
                <Text style={styles.emptyText}>Tidak ditemukan hasil untuk "{searchQuery}"</Text>
              )}
            </View>
          )}
          renderItem={({ item }: { item: any }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.searchCategoryHeader}>
                  <Text style={styles.searchCategoryHeaderText}>{item.title}</Text>
                </View>
              );
            }

            if (item.type === 'conversation') {
              return (
                <ChatItem
                  name={item.name}
                  lastMessage={item.lastMessage}
                  time={item.time}
                  avatar={item.avatar}
                  isGroup={item.isGroup}
                  unreadCount={item.unreadCount}
                  onPress={() => handleChatPress(item.id, item.name)}
                  onLongPress={() => handleLongPress(item.id)}
                  isSelected={selectedChatIds.includes(item.id)}
                  isMuted={item.isMuted}
                  isPinned={item.isPinned}
                />
              );
            }

            // Render Message Result
            const conversationName = item.conversation?.title || item.sender?.name || 'User';
            return (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => handleChatPress(item.conversation_id, conversationName)}
              >
                <View style={styles.searchResultHeader}>
                   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     <Text style={styles.searchResultName}>{conversationName}</Text>
                     {item.conversation?.type === 'group' && (
                       <Text style={styles.groupBadge}>Grup</Text>
                     )}
                   </View>
                   <Text style={styles.searchResultTime}>
                     {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                   </Text>
                </View>
                <Text style={styles.searchResultText} numberOfLines={2}>
                  {item.content}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={mainChats}
          refreshing={isLoading}
          onRefresh={fetchChatsFromBE}
          keyExtractor={(item) => item.id}
          extraData={chats} // Memastikan FlatList update saat dta chats berubah
          ListHeaderComponent={archivedCount > 0 ? (
            <TouchableOpacity 
              style={styles.archivedHeader}
              onPress={() => router.push('/archived')}
              activeOpacity={0.7}
            >
              <Archive color="#868D95" size={20} style={styles.archivedIcon} />
              <Text style={styles.archivedText}>Diarsipkan</Text>
              {chats.filter(c => c.isArchived && c.unreadCount > 0).length > 0 && (
                <Text style={styles.archivedCountText}>
                  {chats.filter(c => c.isArchived && c.unreadCount > 0).reduce((acc, c) => acc + c.unreadCount, 0)}
                </Text>
              )}
            </TouchableOpacity>
          ) : null}
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
              onLongPress={() => handleLongPress(item.id)}
              isSelected={selectedChatIds.includes(item.id)}
              isMuted={item.isMuted}
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
        onPress={() => router.push('/new-chat' as any)}
      >
        <MessageSquarePlus color="#FFF" size={26} />
      </TouchableOpacity>

      {/* Delete Confirmation Modal (Aligned with Detail View) */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDeleteModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[
              styles.modalContent,
              { 
                opacity: deleteModalAnim,
                transform: [{ scale: deleteModalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] 
              }
            ]}>
              <TouchableWithoutFeedback>
                <View>
                  <Text style={styles.modalTitle}>Hapus Percakapan</Text>
                  <Text style={styles.modalMessage}>Hapus percakapan terpilih secara permanen?</Text>
                  
                  <View style={styles.modalActionContainer}>
                    <TouchableOpacity 
                      onPress={() => setIsDeleteModalVisible(false)}
                      style={{ paddingHorizontal: 16, paddingVertical: 10 }}
                    >
                      <Text style={styles.modalActionText}>BATAL</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={async () => {
                        setIsDeleteModalVisible(false);
                        setIsLoading(true);
                        try {
                          await ChatService.deleteConversations(selectedChatIds);
                          setSelectedChatIds([]);
                          fetchChatsFromBE();
                        } catch (error) {
                          Alert.alert('Error', 'Terjadi kesalahan saat menghapus percakapan.');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      style={styles.modalDeleteButton}
                    >
                      <Text style={styles.modalDeleteText}>HAPUS</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Mute Options Modal (WhatsApp Style) */}
      <Modal
        visible={isMuteModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsMuteModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsMuteModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[
              styles.modalContent,
              { 
                opacity: muteModalAnim,
                transform: [{ scale: muteModalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] 
              }
            ]}>
              <TouchableWithoutFeedback>
                <View>
                  <Text style={styles.muteModalTitle}>Bisukan notifikasi untuk {selectedChatIds.length} chat?</Text>
                  
                  <TouchableOpacity style={styles.muteOption} onPress={() => setMuteDuration('8h')}>
                    <View style={[styles.muteRadio, muteDuration === '8h' && styles.muteRadioActive]} />
                    <Text style={styles.muteOptionText}>8 Jam</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.muteOption} onPress={() => setMuteDuration('1w')}>
                    <View style={[styles.muteRadio, muteDuration === '1w' && styles.muteRadioActive]} />
                    <Text style={styles.muteOptionText}>1 Minggu</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.muteOption} onPress={() => setMuteDuration('always')}>
                    <View style={[styles.muteRadio, muteDuration === 'always' && styles.muteRadioActive]} />
                    <Text style={styles.muteOptionText}>Selalu</Text>
                  </TouchableOpacity>

                  <View style={styles.modalActionContainer}>
                    <TouchableOpacity 
                      onPress={() => setIsMuteModalVisible(false)}
                      style={{ paddingHorizontal: 16, paddingVertical: 10 }}
                    >
                      <Text style={styles.modalActionText}>BATAL</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={async () => {
                        setIsMuteModalVisible(false);
                        setIsLoading(true);
                        try {
                          await ChatService.muteConversations(selectedChatIds, true);
                          setSelectedChatIds([]);
                          fetchChatsFromBE();
                        } catch (error) {
                          Alert.alert('Error', 'Terjadi kesalahan saat membisukan percakapan.');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      style={{ paddingHorizontal: 16, paddingVertical: 10, marginLeft: 8 }}
                    >
                      <Text style={styles.modalActionText}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  headerSelected: {
    backgroundColor: '#075E54', // Dark WhatsApp Green
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
  backButton: {
    marginRight: 20,
    padding: 4,
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
  headerTitleSelected: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
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
  searchCategoryHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F7F7F7',
  },
  searchCategoryHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.5
  },
  groupBadge: {
    fontSize: 10,
    backgroundColor: '#E7F5FE',
    color: '#00A884',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    fontWeight: '700'
  },
  archivedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  archivedIcon: {
    marginRight: 20,
    marginLeft: 5,
  },
  archivedText: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
  archivedCountText: {
    fontSize: 12,
    color: '#00A884',
    fontWeight: '600',
    backgroundColor: '#E7F5FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20
  },
  modalActionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  modalActionText: {
    fontSize: 14,
    color: '#00A884',
    fontWeight: '700'
  },
  modalDeleteButton: {
    backgroundColor: '#E91E63', // Red color from mockup
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1
  },
  modalDeleteText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '700'
  },
  muteModalTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22
  },
  muteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  muteRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 15,
  },
  muteRadioActive: {
    borderColor: '#00A884',
    borderWidth: 6,
  },
  muteOptionText: {
    fontSize: 16,
    color: '#000',
  },
});
