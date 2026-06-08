import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, Keyboard, KeyboardEvent, Platform, FlatList } from 'react-native';
import { useChatSocket } from './useChatSocket';
import { useChatMessages } from './useChatMessages';
import { useChatActions } from './useChatActions';
import { Message } from '../types/chat';

export function useChatDetail(id: string, name: string) {
  const flatListRef = useRef<FlatList>(null);

  // UI states
  const keyboardHeightAnim = useRef(new Animated.Value(0)).current;
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isAIActionsVisible, setIsAIActionsVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const menuModalAnim = useRef(new Animated.Value(0)).current;
  const aiMenuAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Search states
  const [isSearchingInside, setIsSearchingInside] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localSearchResults, setLocalSearchResults] = useState<any[]>([]);
  const [isSearchingLocalLoading, setIsSearchingLocalLoading] = useState(false);

  const [activePinnedIndex, setActivePinnedIndex] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Core chat logic
  const { socket, myId, myIdRef } = useChatSocket(id);
  const {
    messages,
    setMessages,
    chatItems,
    isLoading,
    isLoadingMore,
    hasMore,
    isAiThinking,
    setIsAiThinking,
    chatType,
    memberCount,
    fetchMessages,
    handleSend,
    handleUpdate,
    handlePin,
    handleDeleteLocal,
    handleDeleteForEveryone,
    handleReact,
  } = useChatMessages(id, socket, myId, myIdRef, name);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const {
    onLocalSearch,
    onSendText,
    onUpdateText,
    onFileSend,
    onTeraAIAction,
    onActionDelete,
  } = useChatActions({
    id,
    name,
    myId,
    messages,
    setMessages,
    handleSend,
    handleUpdate,
    handleDeleteLocal,
    handleDeleteForEveryone,
    setIsAiThinking,
    setIsAIActionsVisible,
    setIsSearchingLocalLoading,
    setLocalSearchResults,
    setReplyingTo,
    setEditingMessage,
    setIsMenuVisible,
    scrollToBottom
  });

  // Effects
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        Animated.timing(keyboardHeightAnim, {
          toValue: e.endCoordinates.height + 20, // Menambahkan jarak yang lebih besar (40px)
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeightAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [id, fetchMessages]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (isMenuModalVisible) {
      menuModalAnim.setValue(0);
      Animated.spring(menuModalAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 12,
        speed: 10
      }).start();
    } else {
      Animated.spring(menuModalAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 10
      }).start();
    }
  }, [isMenuModalVisible]);

  useEffect(() => {
    Animated.timing(aiMenuAnim, {
      toValue: isAIActionsVisible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isAIActionsVisible, aiMenuAnim]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (localSearchQuery.trim().length > 0) {
        onLocalSearch(localSearchQuery);
      } else {
        setLocalSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [localSearchQuery, onLocalSearch]);

  const jumpToMessage = (messageId: string) => {
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleVoiceFinish = (finishedId: string) => {
    const currentIndex = messages.findIndex(m => m.id === finishedId);
    if (currentIndex === -1) return;
    for (let i = currentIndex + 1; i < messages.length; i++) {
      const nextMsg = messages[i];
      if (nextMsg.file?.type?.startsWith('audio/') || nextMsg.file?.url?.toLowerCase().endsWith('.m4a')) {
        setPlayingVoiceId(nextMsg.id);
        break;
      }
    }
  };

  const pinnedMessages = messages.filter(m => m.isPinned);

  return {
    flatListRef,
    keyboardHeightAnim,
    replyingTo, setReplyingTo,
    editingMessage, setEditingMessage,
    selectedMessage, setSelectedMessage,
    isMenuVisible, setIsMenuVisible,
    isAIActionsVisible, setIsAIActionsVisible,
    isDeleteModalVisible, setIsDeleteModalVisible,
    isMenuModalVisible, setIsMenuModalVisible,
    menuModalAnim, aiMenuAnim, pulseAnim,
    isSearchingInside, setIsSearchingInside,
    localSearchQuery, setLocalSearchQuery,
    localSearchResults, setLocalSearchResults,
    isSearchingLocalLoading,
    activePinnedIndex, setActivePinnedIndex,
    playingVoiceId, setPlayingVoiceId,
    myId, chatItems, isLoading, isLoadingMore, hasMore, isAiThinking, chatType, memberCount,
    fetchMessages, handlePin, handleReact,
    onSendText, onUpdateText, onFileSend, onTeraAIAction, onActionDelete,
    jumpToMessage, handleVoiceFinish, pinnedMessages,
    messages
  };
}
