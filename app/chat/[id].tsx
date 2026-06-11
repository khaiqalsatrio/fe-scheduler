import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Alert, SafeAreaView, Platform, StatusBar, Animated, ActivityIndicator, ImageBackground, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';

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
import { useChatDetail } from '../../hooks/useChatDetail';
import { ChatService } from '../../services/chatService';
import { useTheme } from '../../context/ThemeContext';

export default function ChatDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const {
    flatListRef, keyboardHeightAnim,
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
    jumpToMessage, handleVoiceFinish, pinnedMessages, messages
  } = useChatDetail(id as string, name as string);

  useEffect(() => {
    const backAction = () => {
      router.replace('/(tabs)/chats' as any);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [router]);

  const onHeaderMenuPress = () => setIsMenuModalVisible(true);

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
  }, [playingVoiceId, myId, chatType, handleVoiceFinish, handleReact, setSelectedMessage, setIsMenuVisible]);

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <ChatHeader
          isSearchingInside={isSearchingInside}
          localSearchQuery={localSearchQuery}
          setLocalSearchQuery={setLocalSearchQuery}
          setIsSearchingInside={setIsSearchingInside}
          onBack={() => router.replace('/(tabs)/chats' as any)}
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
          onUnpin={(messageId) => handlePin(messageId, true)}
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
        {Platform.OS === 'android' && (
          <Animated.View style={{ height: keyboardHeightAnim }} />
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
        onDelete={() => onActionDelete(selectedMessage)}
        onReact={(emoji) => { if (selectedMessage) handleReact(selectedMessage.id, emoji); setIsMenuVisible(false); }}
      />

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
