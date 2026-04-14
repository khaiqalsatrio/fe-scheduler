import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, Platform, StatusBar, Animated, TouchableWithoutFeedback, ActivityIndicator, TextInput, ImageBackground, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pin, X, ChevronLeft, User, Users, Search, MoreVertical, Lock, Sparkles, MessageCircle, FileText, Presentation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import { MessageBubble } from '../../components/MessageBubble';
import { ChatInput } from '../../components/ChatInput';
import { MessageActionMenu } from '../../components/MessageActionMenu';
import { ConfirmModal } from '../../components/ConfirmModal';

// Hooks & Services
import { useChatSocket } from '../../hooks/useChatSocket';
import { useChatMessages } from '../../hooks/useChatMessages';
import { MessageService } from '../../services/messageService';
import { ChatService } from '../../services/chatService';
import { Message } from '../../types/chat';

export default function ChatDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  // --- UI States (Menus & Animations) ---
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

  const onLocalSearch = async (query: string) => {
    setIsSearchingLocalLoading(true);
    try {
      const results = await MessageService.searchMessages(id as string, query);
      setLocalSearchResults(results);
    } catch (error) {
      console.warn('Local search error:', error);
    } finally {
      setIsSearchingLocalLoading(false);
    }
  };

  const onSendText = async (text: string) => {
    await handleSend(text, replyingTo);
    setReplyingTo(null);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  const onUpdateText = async (newText: string) => {
    if (!editingMessage) return;
    await handleUpdate(editingMessage.id, newText, editingMessage.text);
    setEditingMessage(null);
  };

  const onFileSend = async (fileAsset: any, type: string) => {
    const clientId = Date.now().toString();
    // Optimistic UI for files
    const newMessage: Message = {
      id: clientId,
      conversation_id: id as string,
      sender_id: myId,
      text: type === 'image' ? '📷 Gambar' : type === 'voice' ? '🎤 Pesan Suara' : `📄 ${fileAsset.name || 'File'}`,
      content: type === 'image' ? '📷 Gambar' : type === 'voice' ? '🎤 Pesan Suara' : `📄 ${fileAsset.name || 'File'}`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isMine: true,
      type: type as any,
      file: {
        url: fileAsset.uri,
        name: fileAsset.name || 'file',
        type: fileAsset.mimeType || (type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
      },
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

    try {
      const formData = new FormData();
      formData.append('conversationId', id as string);
      formData.append('clientMessageId', clientId);
      formData.append('type', type);
      const fileToUpload = {
        uri: Platform.OS === 'android' ? fileAsset.uri : fileAsset.uri.replace('file://', ''),
        type: fileAsset.mimeType || (type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
        name: fileAsset.name || (type === 'image' ? 'photo.jpg' : 'file'),
      };
      formData.append('file', fileToUpload as any);
      await MessageService.sendMessage(formData);
    } catch (e) {
      console.error("Gagal mengirim file:", e);
      Alert.alert('Error', 'Kesalahan jaringan saat mengirim file.');
    }
  };

  const onTeraAIAction = async (actionType: 'summarize' | 'presentation' | 'ask', customText?: string) => {
    setIsAIActionsVisible(false);
    let userPrompt = actionType === 'summarize' ? "/summarize " + (customText || "Tolong ringkas poin-poin diskusi.") 
                  : actionType === 'presentation' ? "/presentation " + (customText || "Buat slide.")
                  : customText || "Tanya AI...";

    handleSend(userPrompt);
    setIsAiThinking(true);

    try {
      const resJson = await MessageService.triggerAiInsight(id as string);
      setIsAiThinking(false);
      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        conversation_id: id as string,
        sender_id: '00000000-0000-0000-0000-000000000000',
        text: resJson.content || resJson.insight || resJson.summary || "Analisis Berhasil",
        content: resJson.content || resJson.insight || resJson.summary || "Analisis Berhasil",
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
        isMine: false,
        type: 'text',
        senderName: 'Tera AI',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
    } catch (e) {
      setIsAiThinking(false);
      console.error("Tera AI error:", e);
    }
  };

  const onActionDelete = () => {
    if (!selectedMessage) return;
    const options: any[] = [
      { text: 'Hapus untuk Saya', onPress: () => { handleDeleteLocal(selectedMessage.id); setIsMenuVisible(false); } },
      { text: 'Batal', style: 'cancel' },
    ];
    if (selectedMessage.isMine) {
      options.unshift({ 
        text: 'Hapus untuk Semua Orang', 
        style: 'destructive', 
        onPress: () => { handleDeleteForEveryone(selectedMessage.id); setIsMenuVisible(false); } 
      });
    }
    Alert.alert('Hapus Pesan?', 'Pesan yang dihapus tidak dapat dikembalikan.', options);
  };
  
  const handleResetChat = () => {
    Alert.alert(
      'Reset Percakapan?',
      'Seluruh riwayat pesan akan dihapus secara permanen bagi semua orang. Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Reset Sekarang', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const newConv = await ChatService.deleteConversation(id as string);
              // Navigasi ke ID chat baru
              router.replace({
                pathname: `/chat/${newConv.id}` as any,
                params: { name: name as string }
              });
            } catch (error) {
              console.error("Reset Error:", error);
              Alert.alert('Gagal Reset', 'Gagal mereset percakapan. Silakan coba lagi.');
            }
          } 
        }
      ]
    );
  };

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {isSearchingInside ? (
          <View style={styles.searchHeaderInside}>
            <TouchableOpacity onPress={() => { setIsSearchingInside(false); setLocalSearchQuery(''); }} style={styles.backButton}>
              <ChevronLeft color="#555" size={24} />
            </TouchableOpacity>
            <TextInput
              autoFocus
              placeholder="Cari dalam chat..."
              style={styles.searchInputInside}
              value={localSearchQuery}
              onChangeText={setLocalSearchQuery}
            />
            {localSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setLocalSearchQuery('')}>
                <X color="#999" size={20} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color="#22C55E" size={28} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerInfo} 
              disabled={chatType !== 'group'} 
              onPress={() => router.push({ pathname: '/group-detail/[id]' as any, params: { id: id as string, title: name as string } })}
            >
              <View style={[styles.headerAvatar, chatType === 'group' && { backgroundColor: '#E0EEFF' }]}>
                {chatType === 'group' ? <Users color="#3B82F6" size={22} /> : <User color="#999" size={22} />}
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>{name as string || 'Chat'}</Text>
                <Text style={styles.headerSubtitle}>{chatType === 'group' ? `${memberCount} Anggota` : 'Last seen recently'}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={() => setIsSearchingInside(true)}>
                <Search color="#555" size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={onHeaderMenuPress}>
                <MoreVertical color="#555" size={22} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <ImageBackground source={require('../../assets/images/wallpaper.jpg')} style={styles.container} resizeMode="repeat">
        {pinnedMessages.length > 0 && (
          <View style={styles.pinnedMessagesBar}>
            <TouchableOpacity style={styles.pinnedContent} onPress={() => {
              const current = pinnedMessages[activePinnedIndex % pinnedMessages.length];
              if (current) jumpToMessage(current.id);
              if (pinnedMessages.length > 1) setActivePinnedIndex(prev => (prev + 1) % pinnedMessages.length);
            }}>
              <Pin size={16} color="#666" style={styles.pinnedIcon} />
              <View style={styles.pinnedTextContainer}>
                <Text style={styles.pinnedCompactText} numberOfLines={1}>
                  <Text style={styles.pinnedSenderName}>{name as string}: </Text>
                  {pinnedMessages[activePinnedIndex % pinnedMessages.length]?.text}
                </Text>
              </View>
              {pinnedMessages.length > 1 && (
                <View style={styles.pinnedBadgeMini}><Text style={styles.pinnedBadgeText}>{pinnedMessages.length}</Text></View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isSearchingInside && localSearchQuery.length > 0 ? (
          <FlatList
            data={localSearchResults}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={() => (
              <View style={styles.searchEmptyContainer}>
                {isSearchingLocalLoading ? <ActivityIndicator color="#25D366" /> : <Text style={styles.searchEmptyText}>Tidak ada pesan ditemukan</Text>}
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.localSearchResultItem} onPress={() => setIsSearchingInside(false)}>
                <Text style={styles.localSearchResultTime}>{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
                <Text style={styles.localSearchResultText}>{item.content}</Text>
              </TouchableOpacity>
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
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
              data={chatItems}
              keyExtractor={(item) => item.id}
              inverted={true}
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
              ListFooterComponent={() => (
                <View>
                  <View style={{ height: 40, justifyContent: 'center' }}>
                    {isLoadingMore && <ActivityIndicator color="#25D366" />}
                  </View>
                  <View style={styles.encryptedBannerWrapper}>
                    <View style={styles.encryptedBanner}>
                      <Lock color="#D4A106" size={14} style={{ marginRight: 6 }} />
                      <Text style={styles.encryptedText}>Messages are end-to-end encrypted</Text>
                    </View>
                  </View>
                </View>
              )}
              renderItem={renderChatItem}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              onEndReached={() => { if (!isLoadingMore && hasMore) fetchMessages(true); }}
              onEndReachedThreshold={0.5}
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

        {/* Floating Components (AI Menu, Sparkle, Thinking) */}
        {isAIActionsVisible && <TouchableWithoutFeedback onPress={() => setIsAIActionsVisible(false)}><View style={styles.aiOverlay} /></TouchableWithoutFeedback>}
        <Animated.View style={[styles.aiMenuContainer, { opacity: aiMenuAnim, transform: [{ translateY: aiMenuAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }, { scale: aiMenuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }]} pointerEvents={isAIActionsVisible ? 'auto' : 'none'}>
          <View style={styles.aiMenuCard}>
            <TouchableOpacity style={styles.aiMenuItem} onPress={() => onTeraAIAction('ask', 'Tanya AI: ')}>
              <View style={[styles.aiIconWrapper, { backgroundColor: '#F3E8FF' }]}><MessageCircle color="#A855F7" size={22} /></View>
              <View style={styles.aiMenuText}><Text style={styles.aiMenuTitle}>Tanya AI</Text><Text style={styles.aiMenuDesc}>Tanyakan apa saja ke AI</Text></View>
            </TouchableOpacity>
            <View style={styles.aiMenuDivider} />
            <TouchableOpacity style={styles.aiMenuItem} onPress={() => onTeraAIAction('summarize')}>
              <View style={[styles.aiIconWrapper, { backgroundColor: '#E0F2FE' }]}><FileText color="#0EA5E9" size={22} /></View>
              <View style={styles.aiMenuText}><Text style={styles.aiMenuTitle}>Ringkas</Text><Text style={styles.aiMenuDesc}>Ubah chat jadi poin penting</Text></View>
            </TouchableOpacity>
            <View style={styles.aiMenuDivider} />
            <TouchableOpacity style={styles.aiMenuItem} onPress={() => onTeraAIAction('presentation')}>
              <View style={[styles.aiIconWrapper, { backgroundColor: '#DCFCE7' }]}><Presentation color="#22C55E" size={22} /></View>
              <View style={styles.aiMenuText}><Text style={styles.aiMenuTitle}>Buat Slide</Text><Text style={styles.aiMenuDesc}>Ubah chat jadi bahan presentasi</Text></View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.sparkleButtonContainer}>
          <Animated.View style={[styles.sparkleGlow, { opacity: pulseAnim.interpolate({ inputRange: [1, 1.1], outputRange: [0, 0.4] }), transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.sparkleButton}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setIsAIActionsVisible(!isAIActionsVisible)} style={{ flex: 1 }}>
              <LinearGradient colors={['#A855F7', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sparkleGradient}>
                <Sparkles color="#FFF" fill="#FFF" size={24} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {isAiThinking && (
          <View style={styles.aiThinkingContainer}>
            <View style={styles.aiThinkingBubble}><Sparkles color="#A855F7" size={14} style={{ marginRight: 6 }} /><Text style={styles.aiThinkingText}>AI sedang menyiapkan balasan...</Text></View>
          </View>
        )}

        {!isSearchingInside && (
          <ChatInput
            replyingTo={replyingTo ? { name: replyingTo.isMine ? 'Anda' : (replyingTo.senderName || (name as string)), text: replyingTo.text } : null}
            onCancelReply={() => setReplyingTo(null)}
            onSend={onSendText}
            isEditing={!!editingMessage}
            editInitialText={editingMessage?.text}
            onUpdate={onUpdateText}
            onCancelEdit={() => setEditingMessage(null)}
            onFileSend={onFileSend}
          />
        )}
      </ImageBackground>

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
        onDelete={onActionDelete}
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

      {/* Options Menu Modal (Mockup Style with Animation) */}
      <Modal
        visible={isMenuModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsMenuModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsMenuModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[
              styles.modalContent,
              { 
                opacity: menuModalAnim,
                transform: [{ scale: menuModalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] 
              }
            ]}>
              <TouchableWithoutFeedback>
                <View>
                  <Text style={styles.modalTitle}>Opsi Percakapan</Text>
                  <Text style={styles.modalMessage}>Pilih tindakan untuk percakapan ini.</Text>
                  
                  <View style={[styles.modalActionContainer, { marginTop: 8 }]}>
                    <TouchableOpacity 
                      onPress={() => {
                        setIsMenuModalVisible(false);
                        setTimeout(() => setIsDeleteModalVisible(true), 300);
                      }}
                      style={{ paddingHorizontal: 16, paddingVertical: 10 }}
                    >
                      <Text style={[styles.modalCancelText, { color: '#00A884', fontSize: 13 }]}>HAPUS CHAT</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => setIsMenuModalVisible(false)}
                      style={{ paddingHorizontal: 16, paddingVertical: 10 }}
                    >
                      <Text style={[styles.modalCancelText, { color: '#00A884', fontSize: 13 }]}>BATAL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: '#FFFFFF', height: 65, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0' },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E1E1E1', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  headerSubtitle: { fontSize: 12, color: '#666' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { padding: 8 },
  backButton: { padding: 4 },
  container: { flex: 1, backgroundColor: '#E5DDD5' },
  encryptedBannerWrapper: { alignItems: 'center', marginVertical: 15 },
  encryptedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCF3C6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  encryptedText: { fontSize: 12, color: '#4B4228', fontWeight: '500' },
  pinnedMessagesBar: { width: '100%', backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0', flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  pinnedContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  pinnedIcon: { marginRight: 10 },
  pinnedTextContainer: { flex: 1 },
  pinnedCompactText: { fontSize: 14, color: '#333' },
  pinnedSenderName: { fontWeight: '700', color: '#00A884' },
  pinnedBadgeMini: { backgroundColor: '#F0F2F5', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  pinnedBadgeText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  dateSeparatorContainer: { alignItems: 'center', marginVertical: 15 },
  dateSeparatorCapsule: { backgroundColor: 'rgba(255, 255, 255, 0.6)', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
  dateSeparatorText: { fontSize: 12, color: '#555', fontWeight: '600' },
  list: { flex: 1 },
  listContent: { paddingVertical: 10, paddingHorizontal: 15 },
  sparkleButtonContainer: { position: 'absolute', bottom: 110, right: 15, width: 56, height: 56, zIndex: 100, justifyContent: 'center', alignItems: 'center' },
  sparkleButton: { width: 56, height: 56, borderRadius: 28, elevation: 2, shadowColor: '#A855F7', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  sparkleGlow: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: '#A855F7' },
  sparkleGradient: { flex: 1, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  aiOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 90 },
  aiMenuContainer: { position: 'absolute', bottom: 145, right: 15, width: 260, zIndex: 101 },
  aiMenuCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  aiMenuItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  aiIconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiMenuText: { flex: 1 },
  aiMenuTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  aiMenuDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  aiMenuDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 12 },
  searchHeaderInside: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
  searchInputInside: { flex: 1, height: 40, fontSize: 16, color: '#333', marginLeft: 5 },
  searchEmptyContainer: { padding: 20, alignItems: 'center' },
  searchEmptyText: { color: '#999', fontSize: 14 },
  localSearchResultItem: { padding: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEE', backgroundColor: '#FFF' },
  localSearchResultTime: { fontSize: 10, color: '#999', marginBottom: 4 },
  localSearchResultText: { fontSize: 14, color: '#333' },
  aiThinkingContainer: { paddingHorizontal: 15, paddingVertical: 10, alignItems: 'flex-start' },
  aiThinkingBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F3E8FF' },
  aiThinkingText: { fontSize: 13, color: '#6B21A8', fontStyle: 'italic', fontWeight: '500' },
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
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
  modalCancelButton: {
    marginRight: 24,
    paddingVertical: 8
  },
  modalCancelText: {
    fontSize: 14,
    color: '#00A884',
    fontWeight: '600'
  },
  modalDeleteButton: {
    backgroundColor: '#E91E63', 
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
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
});
