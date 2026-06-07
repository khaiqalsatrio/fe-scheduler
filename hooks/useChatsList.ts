import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChatListItem } from '../types/chat';
import { ChatService } from '../services/chatService';

export type FilterType = 'all' | 'unread' | 'groups';

export const useChatsList = () => {
  const router = useRouter();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
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

  const fetchChatsFromBE = useCallback(async () => {
    setIsLoading(true);
    try {
      const formattedData = await ChatService.getConversations();
      setChats(formattedData);
    } catch (error) {
      console.warn('Error saat fetch chat:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGlobalSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      // 1. Filter Lokal (Instant)
      const localResults = chats.filter(chat =>
        chat.name.toLowerCase().includes(query.toLowerCase())
      );

      // 2. Cari Akun Baru (User Service)
      const userResults = await ChatService.searchUsers(query);
      const mappedUserResults: ChatListItem[] = userResults
        .filter(u => !localResults.some(c => c.id === u.id))
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
  }, [chats]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        handleGlobalSearch(searchQuery.trim());
      } else {
        setSearchResults({ conversations: [], messages: [] });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleGlobalSearch]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedChatIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleChatPress = useCallback((id: string, name: string) => {
    if (selectedChatIds.length > 0) {
      toggleSelection(id);
    } else {
      router.push({
        pathname: '/chat/[id]',
        params: { id, name },
      });
    }
  }, [selectedChatIds, toggleSelection, router]);

  const handleLongPress = useCallback((id: string) => {
    toggleSelection(id);
  }, [toggleSelection]);

  // --- Bulk Actions ---
  const handlePinSelected = useCallback(async () => {
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
  }, [chats, selectedChatIds, fetchChatsFromBE]);

  const handleArchiveSelected = useCallback(async () => {
    setIsLoading(true);
    try {
      const allArchived = chats.filter(c => selectedChatIds.includes(c.id)).every(c => c.isArchived);
      await ChatService.archiveConversations(selectedChatIds, !allArchived);
      setSelectedChatIds([]);
      fetchChatsFromBE();
    } catch (error) {
      Alert.alert('Error', 'Gagal memproses arsip.');
    } finally {
      setIsLoading(false);
    }
  }, [chats, selectedChatIds, fetchChatsFromBE]);

  const handleSwipeArchive = useCallback(async (id: string, isArchived: boolean) => {
    setIsLoading(true);
    try {
      await ChatService.archiveConversations([id], !isArchived);
      fetchChatsFromBE();
    } catch (error) {
      Alert.alert('Error', 'Gagal memproses arsip.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchChatsFromBE]);

  const handleMuteSelected = useCallback(async (duration?: string) => {
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
  }, [selectedChatIds, fetchChatsFromBE]);

  const handleUnmuteSelected = useCallback(async () => {
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
  }, [selectedChatIds, fetchChatsFromBE]);

  const handleDeleteSelected = useCallback(async () => {
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
  }, [selectedChatIds, fetchChatsFromBE]);

  // --- Computed Views ---
  const filteredData = useMemo(() => {
    const filtered = chats.filter(chat => {
      if (activeFilter === 'unread') return (chat.unreadCount ?? 0) > 0;
      if (activeFilter === 'groups') return chat.isGroup;
      return true;
    });

    return {
      archivedCount: chats.filter(c => c.isArchived).length,
      mainChats: filtered
        .filter(c => !c.isArchived)
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (b.timestamp || 0) - (a.timestamp || 0);
        })
    };
  }, [chats, activeFilter]);

  return {
    // States
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

    // Derived
    archivedCount: filteredData.archivedCount,
    mainChats: filteredData.mainChats,

    // Handlers
    fetchChatsFromBE,
    handleChatPress,
    handleLongPress,
    handlePinSelected,
    handleArchiveSelected,
    handleMuteSelected,
    handleUnmuteSelected,
    handleDeleteSelected,
    toggleSelection,
    handleSwipeArchive
  };
};
