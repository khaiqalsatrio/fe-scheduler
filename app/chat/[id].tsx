import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, Platform, StatusBar, Animated, TouchableWithoutFeedback, ActivityIndicator, TextInput, ImageBackground, Modal, Keyboard, KeyboardEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pin, X, ChevronLeft, User, Users, Search, MoreVertical, Lock, Sparkles, MessageCircle, FileText, Presentation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import { MessageBubble } from '../../components/MessageBubble';
import { ChatInput } from '../../components/ChatInput';
import { MessageActionMenu } from '../../components/MessageActionMenu';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { PinnedMessages } from '../../components/chat/PinnedMessages';
import { TeraAIMenu } from '../../components/chat/TeraAIMenu';
import { ChatMenuModal } from '../../components/chat/ChatMenuModal';
import { LocalSearchResults } from '../../components/chat/LocalSearchResults';
import { ChatMessagesHeader } from '../../components/chat/ChatMessagesHeader';

// Hooks & Services
import { useChatSocket } from '../../hooks/useChatSocket';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useChatActions } from '../../hooks/useChatActions';
import { MessageService } from '../../services/messageService';
import { ChatService } from '../../services/chatService';
import { Message } from '../../types/chat';
import { useTheme } from '../../context/ThemeContext';

export default function ChatDetailScreen() {

  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { isDarkMode } = useTheme();

  // --- UI States (Menus & Animations) ---
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

  // --- Local Search States ---
  const [isSearchingInside, setIsSearchingInside] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localSearchResults, setLocalSearchResults] = useState<any[]>([]);
  const [isSearchingLocalLoading, setIsSearchingLocalLoading] = useState(false);

  // --- Local Search States ---

  // --- Domain Logic (Hooks) ---
  const { socket, myId, myIdRef } = useChatSocket(id as string);
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
  } = useChatMessages(id as string, socket, myId, myIdRef, name as string);

  const [activePinnedIndex, setActivePinnedIndex] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        Animated.timing(keyboardHeightAnim, {
          toValue: e.endCoordinates.height + 15,
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
  }, [localSearchQuery]);

  // --- Handlers ---

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
    id: id as string,
    name: name as string,
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

  const onHeaderMenuPress = () => {
    setIsMenuModalVisible(true);
  };

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

  const renderChatItem = useCallback(({ item }: { item: any }) => {
    if ('isDateSeparator' in item) {
      return (
        <View style={styles.dateSeparatorContainer}>
          <View style={styles.dateSeparatorCapsule}><Text style={styles.dateSeparatorText}>{item.dateLabel}</Text></View>
        </View>
      );
    }
    return (
      <MessageBubble
        id={item.id}
        message={item.text}
        time={item.time}
        isMine={item.isMine}
        isPinned={item.isPinned}
        isEdited={item.isEdited}
        isDeleted={item.isDeleted}
        replyTo={item.replyTo}
        file={item.file}
        onLongPress={() => { setSelectedMessage(item); setIsMenuVisible(true); }}
        isPlaying={playingVoiceId === item.id}
        onVoiceFinish={handleVoiceFinish}
        onPlayStarted={(id) => setPlayingVoiceId(id)}
        reactions={item.reactions}
        myUserId={myId}
        onReactionPress={(emoji) => handleReact(item.id, emoji)}
        senderName={item.senderName}
        chatType={item.senderName === 'Tera AI' ? 'group' : chatType}
        status={item.status}
      />
    );
  }, [playingVoiceId, myId, chatType, handleVoiceFinish, handleReact]);

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <ChatHeader
          isSearchingInside={isSearchingInside}
          localSearchQuery={localSearchQuery}
          setLocalSearchQuery={setLocalSearchQuery}
          setIsSearchingInside={setIsSearchingInside}
          onBack={() => router.back()}
          onHeaderInfoPress={() => {
            if (chatType === 'dm') {
              router.push({ pathname: '/user-profile/[id]' as any, params: { id: id as string, title: name as string } });
            } else {
              router.push({ pathname: '/group-detail/[id]' as any, params: { id: id as string, title: name as string, type: chatType } });
            }
          }}
          chatType={chatType}
          memberCount={memberCount}
          name={name as string}
          onSearchPress={() => setIsSearchingInside(true)}
          onMenuPress={onHeaderMenuPress}
        />
      </View>

      <ImageBackground source={isDarkMode ? require('../../assets/images/darkmode.png') : require('../../assets/images/wallpaper.jpg')} style={[styles.container, isDarkMode && styles.containerDark]} resizeMode="repeat">
        <PinnedMessages
          pinnedMessages={pinnedMessages}
          activePinnedIndex={activePinnedIndex}
          setActivePinnedIndex={setActivePinnedIndex}
          jumpToMessage={jumpToMessage}
          chatName={name as string}
        />

        {isSearchingInside && localSearchQuery.length > 0 ? (
          <LocalSearchResults
            localSearchResults={localSearchResults}
            isSearchingLocalLoading={isSearchingLocalLoading}
            setIsSearchingInside={setIsSearchingInside}
          />
        ) : (
          <View style={{ flex: 1 }}>
            {isLoading && !isLoadingMore && (
              <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                <ActivityIndicator size="large" color="#25D366" />
              </View>
            )}
            <FlatList
              ref={flatListRef}
              data={[...chatItems].reverse()}
              keyExtractor={(item) => item.id}
              inverted={false}
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
              ListHeaderComponent={() => <ChatMessagesHeader isLoadingMore={isLoadingMore} />}
              renderItem={renderChatItem}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              onScroll={(e) => {
                if (e.nativeEvent.contentOffset.y < 50) {
                  if (!isLoadingMore && hasMore) fetchMessages(true);
                }
              }}
              scrollEventThrottle={400}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              windowSize={3}
              getItemLayout={(_, index) => ({
                length: 70,
                offset: 70 * index,
                index,
              })}
            />
          </View>
        )}

        <TeraAIMenu
          isAIActionsVisible={isAIActionsVisible}
          setIsAIActionsVisible={setIsAIActionsVisible}
          aiMenuAnim={aiMenuAnim}
          pulseAnim={pulseAnim}
          onTeraAIAction={onTeraAIAction}
        />

        {isAiThinking && (
          <View style={styles.aiThinkingContainer}>
            <View style={[styles.aiThinkingBubble, isDarkMode && styles.aiThinkingBubbleDark]}><Sparkles color="#A855F7" size={14} style={{ marginRight: 6 }} /><Text style={[styles.aiThinkingText, isDarkMode && styles.textDark]}>AI sedang menyiapkan balasan...</Text></View>
          </View>
        )}

        {!isSearchingInside && (
          <ChatInput
            replyingTo={replyingTo ? { name: replyingTo.isMine ? 'Anda' : (replyingTo.senderName || (name as string)), text: replyingTo.text } : null}
            onCancelReply={() => setReplyingTo(null)}
            onSend={(text) => onSendText(text, replyingTo)}
            isEditing={!!editingMessage}
            editInitialText={editingMessage?.text}
            onUpdate={(text) => onUpdateText(text, editingMessage)}
            onCancelEdit={() => setEditingMessage(null)}
            onFileSend={onFileSend}
          />
        )}
      </ImageBackground>
      {Platform.OS === 'android' && (
        <Animated.View style={{ height: keyboardHeightAnim, backgroundColor: isDarkMode ? '#121212' : '#E5DDD5' }} />
      )}

      <MessageActionMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        isPinned={selectedMessage?.isPinned}
        canEdit={!!(selectedMessage?.isMine && selectedMessage?.created_at && (new Date().getTime() - new Date(selectedMessage.created_at).getTime() < 15 * 60 * 1000))}
        onPin={() => { if (selectedMessage) handlePin(selectedMessage.id, !!selectedMessage.isPinned); setIsMenuVisible(false); }}
        onReply={() => { setReplyingTo(selectedMessage); setIsMenuVisible(false); }}
        onForward={() => { setIsMenuVisible(false); router.push({ pathname: '/forward-select' as any, params: { messageId: selectedMessage?.id, content: selectedMessage?.text } }); }}
        onEdit={() => { setEditingMessage(selectedMessage); setIsMenuVisible(false); }}
        onCopy={() => { Alert.alert('Teks disalin'); setIsMenuVisible(false); }}
        onDelete={() => onActionDelete(selectedMessage)}
        onReact={(emoji) => { if (selectedMessage) handleReact(selectedMessage.id, emoji); setIsMenuVisible(false); }}
      />

      {/* Delete Confirmation Modal (Native Mockup Design) */}
      <ConfirmModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={async () => {
          setIsDeleteModalVisible(false);
          try {
            const newConv = await ChatService.deleteConversation(id as string);
            router.replace({
              pathname: `/chat/${newConv.id}` as any,
              params: { name: name as string }
            });
          } catch (error) {
            console.error("Reset Error:", error);
            Alert.alert('Gagal Hapus', 'Gagal menghapus percakapan. Silakan coba lagi.');
          }
        }}
        title={`Hapus chat dengan ${name as string}?`}
        message="Pesan akan dihapus dari semua perangkat."
        confirmText="Hapus"
        type="destructive"
      />

      <ChatMenuModal
        isMenuModalVisible={isMenuModalVisible}
        setIsMenuModalVisible={setIsMenuModalVisible}
        menuModalAnim={menuModalAnim}
        onDeleteChatPress={() => setIsDeleteModalVisible(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  safeAreaDark: { backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: '#FFFFFF', height: 65, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0' },
  headerDark: { backgroundColor: '#1E1E1E', borderBottomColor: '#333' },
  container: { flex: 1, backgroundColor: '#E5DDD5' },
  containerDark: { backgroundColor: '#0B141A' },
  dateSeparatorContainer: { alignItems: 'center', marginVertical: 15 },
  dateSeparatorCapsule: { backgroundColor: 'rgba(255, 255, 255, 0.6)', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
  dateSeparatorText: { fontSize: 12, color: '#555', fontWeight: '600' },
  list: { flex: 1 },
  listContent: { paddingVertical: 10, paddingHorizontal: 15 },
  aiThinkingContainer: { paddingHorizontal: 15, paddingVertical: 10, alignItems: 'flex-start' },
  aiThinkingBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F3E8FF' },
  aiThinkingBubbleDark: { backgroundColor: 'rgba(30, 30, 30, 0.8)', borderColor: '#333' },
  aiThinkingText: { fontSize: 13, color: '#6B21A8', fontStyle: 'italic', fontWeight: '500' },
  textDark: { color: '#D8B4FE' },
});
