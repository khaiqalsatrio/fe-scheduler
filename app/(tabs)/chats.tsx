import { StyleSheet, View, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { MessageSquarePlus, Archive } from 'lucide-react-native';
import { ChatItem } from '../../components/ChatItem';
import { useFocusEffect } from '@react-navigation/native';

// Refactored Hooks & Components
import { useChatsList } from '../../hooks/useChatsList';
import { ChatListHeader } from '../../components/chat/ChatListHeader';
import { ChatSearchBar } from '../../components/chat/ChatSearchBar';
import { ChatFilters } from '../../components/chat/ChatFilters';
import { DeleteConversationModal, MuteOptionsModal } from '../../components/chat/ChatModals';

export default function ChatsScreen() {
  const router = useRouter();
  const {
    chats,
    isLoading,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    selectedChatIds,
    setSelectedChatIds,
    isDeleteModalVisible,
    setIsDeleteModalVisible,
    isMuteModalVisible,
    setIsMuteModalVisible,
    muteDuration,
    setMuteDuration,
    archivedCount,
    mainChats,
    fetchChatsFromBE,
    handleChatPress,
    handleLongPress,
    handlePinSelected,
    handleArchiveSelected,
    handleMuteSelected,
    handleUnmuteSelected,
    handleDeleteSelected,
    toggleSelection
  } = useChatsList();

  useFocusEffect(
    useCallback(() => {
      fetchChatsFromBE();
    }, [fetchChatsFromBE])
  );

  const renderSearchItem = ({ item }: { item: any }) => {
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

    const conversationName = item.conversation?.title || item.sender?.name || 'User';
    return (
      <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => handleChatPress(item.conversation_id, conversationName)}
      >
        <View style={styles.searchResultHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.searchResultName}>{conversationName}</Text>
            {item.conversation?.type === 'group' && <Text style={styles.groupBadge}>Grup</Text>}
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
  };

  return (
    <View style={styles.container}>
      <ChatListHeader
        selectedChatIds={selectedChatIds}
        setSelectedChatIds={setSelectedChatIds}
        chats={chats}
        onPin={handlePinSelected}
        onMute={() => {
          const anyUnmuted = chats.filter(c => selectedChatIds.includes(c.id)).some(c => !c.isMuted);
          if (anyUnmuted) setIsMuteModalVisible(true);
          else handleUnmuteSelected();
        }}
        onArchive={handleArchiveSelected}
        onDelete={() => setIsDeleteModalVisible(true)}
      />

      <ChatSearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <ChatFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        isVisible={selectedChatIds.length === 0}
      />

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
              {isSearching ? <ActivityIndicator color="#25D366" /> : <Text style={styles.emptyText}>Tidak ditemukan hasil untuk "{searchQuery}"</Text>}
            </View>
          )}
          renderItem={renderSearchItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={mainChats}
          refreshing={isLoading}
          onRefresh={fetchChatsFromBE}
          keyExtractor={(item) => item.id}
          extraData={chats}
          ListHeaderComponent={archivedCount > 0 ? (
            <TouchableOpacity
              style={styles.archivedHeader}
              onPress={() => router.push('/archived' as any)}
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

      <DeleteConversationModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleDeleteSelected}
      />

      <MuteOptionsModal
        visible={isMuteModalVisible}
        onClose={() => setIsMuteModalVisible(false)}
        selectedCount={selectedChatIds.length}
        muteDuration={muteDuration}
        setMuteDuration={setMuteDuration}
        onConfirm={handleMuteSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  listContent: { paddingBottom: 100 },
  listFooter: { alignItems: 'center', marginTop: 30, marginBottom: 50 },
  footerText: { fontSize: 12, color: '#999' },
  footerTextGreen: { color: '#25D366', fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 18,
    backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
  searchResultItem: { paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  searchResultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  searchResultName: { fontSize: 14, fontWeight: '700', color: '#333' },
  searchResultTime: { fontSize: 12, color: '#999' },
  searchResultText: { fontSize: 14, color: '#666', lineHeight: 20 },
  searchCategoryHeader: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#F7F7F7' },
  searchCategoryHeaderText: { fontSize: 12, fontWeight: '700', color: '#666', letterSpacing: 0.5 },
  groupBadge: { fontSize: 10, backgroundColor: '#E7F5FE', color: '#00A884', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8, fontWeight: '700' },
  archivedHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  archivedIcon: { marginRight: 20, marginLeft: 5 },
  archivedText: { flex: 1, fontSize: 16, color: '#111', fontWeight: '500' },
  archivedCountText: { fontSize: 12, color: '#00A884', fontWeight: '600', backgroundColor: '#E7F5FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
});
