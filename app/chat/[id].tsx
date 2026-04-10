import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, Platform, StatusBar, Animated, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pin, X, ChevronLeft, User, Video, Phone, MoreVertical, Lock, Sparkles, MessageCircle, FileText, Presentation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageBubble } from '../../components/MessageBubble';
import { ChatInput } from '../../components/ChatInput';
import { MessageActionMenu } from '../../components/MessageActionMenu';

interface Message {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
  replyTo?: {
    name: string;
    text: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'Halo! Gimana kabarnya?', time: '10:15', isMine: false },
  { id: '2', text: 'Baik! Lagi kerja nih. Kamu gimana?', time: '10:17', isMine: true },
  { id: '3', text: 'Sama, lagi ada project deadlinenya malem ini \ud83d\ude05', time: '10:18', isMine: false },
];

export default function ChatDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // AI Menu State
  const [isAIActionsVisible, setIsAIActionsVisible] = useState(false);
  const aiMenuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(aiMenuAnim, {
      toValue: isAIActionsVisible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isAIActionsVisible]);

  const toggleAIMenu = () => {
    setIsAIActionsVisible(!isAIActionsVisible);
  };

  const pinnedMessages = messages.filter(m => m.isPinned);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      replyTo: replyingTo ? { name: replyingTo.isMine ? 'Anda' : (name as string || 'Teman'), text: replyingTo.text } : undefined,
    };
    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  const handleUpdate = (newText: string) => {
    if (!editingMessage) return;
    setMessages(prev => prev.map(m => 
      m.id === editingMessage.id ? { ...m, text: newText, isEdited: true } : m
    ));
    setEditingMessage(null);
  };

  const handleLongPress = (message: Message) => {
    setSelectedMessage(message);
    setIsMenuVisible(true);
  };

  const handlePin = () => {
    if (!selectedMessage) return;
    setMessages(prev => prev.map(m => 
      m.id === selectedMessage.id ? { ...m, isPinned: !m.isPinned } : m
    ));
    Alert.alert(selectedMessage.isPinned ? 'Sematkan dilepas' : 'Pesan disematkan');
  };

  const handleReply = () => {
    if (!selectedMessage) return;
    setReplyingTo(selectedMessage);
  };

  const handleEdit = () => {
    if (!selectedMessage) return;
    setEditingMessage(selectedMessage);
  };

  const handleDelete = () => {
    if (!selectedMessage) return;
    setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
  };

  const jumpToMessage = (messageId: string) => {
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#25D366" size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.userInfo} activeOpacity={0.7}>
            <View style={styles.avatarPlaceholder}>
              <User color="#999" size={20} />
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.headerName} numberOfLines={1}>{name as string || 'Ahmad Zaki'}</Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Video color="#666" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Phone color="#666" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MoreVertical color="#666" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        {pinnedMessages.length > 0 && (
          <View style={styles.pinnedMessagesBar}>
            <TouchableOpacity 
              style={styles.pinnedContent} 
              onPress={() => jumpToMessage(pinnedMessages[0].id)}
            >
              <Pin size={16} color="#00BCD4" style={styles.pinnedIcon} />
              <View style={styles.pinnedTextContainer}>
                <Text style={styles.pinnedLabel}>Pesan disematkan</Text>
                <Text style={styles.pinnedText} numberOfLines={1}>{pinnedMessages[0].text}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsMenuVisible(false)}>
              <X size={16} color="#999" />
            </TouchableOpacity>
          </View>
        )}
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View style={styles.encryptedBannerWrapper}>
              <View style={styles.encryptedBanner}>
                <Lock color="#D4A106" size={14} style={{ marginRight: 6 }} />
                <Text style={styles.encryptedText}>Messages are end-to-end encrypted</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <MessageBubble
              message={item.text}
              time={item.time}
              isMine={item.isMine}
              isPinned={item.isPinned}
              replyTo={item.replyTo}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {/* AI Action Menu */}
        {isAIActionsVisible && (
          <TouchableWithoutFeedback onPress={() => setIsAIActionsVisible(false)}>
            <View style={styles.aiOverlay} />
          </TouchableWithoutFeedback>
        )}
        
        <Animated.View 
          style={[
            styles.aiMenuContainer,
            {
              opacity: aiMenuAnim,
              transform: [
                { translateY: aiMenuAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                { scale: aiMenuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }
              ]
            }
          ]}
          pointerEvents={isAIActionsVisible ? 'auto' : 'none'}
        >
          <View style={styles.aiMenuCard}>
            <TouchableOpacity style={styles.aiMenuItem} onPress={() => setIsAIActionsVisible(false)}>
              <View style={[styles.aiIconWrapper, { backgroundColor: '#F3E8FF' }]}>
                <MessageCircle color="#A855F7" size={22} />
              </View>
              <View style={styles.aiMenuText}>
                <Text style={styles.aiMenuTitle}>Tanya AI</Text>
                <Text style={styles.aiMenuDesc}>Tanyakan apa saja ke AI</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.aiMenuDivider} />
            
            <TouchableOpacity style={styles.aiMenuItem} onPress={() => setIsAIActionsVisible(false)}>
              <View style={[styles.aiIconWrapper, { backgroundColor: '#E0F2FE' }]}>
                <FileText color="#0EA5E9" size={22} />
              </View>
              <View style={styles.aiMenuText}>
                <Text style={styles.aiMenuTitle}>Ringkas</Text>
                <Text style={styles.aiMenuDesc}>Ubah chat jadi poin penting</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.aiMenuDivider} />
            
            <TouchableOpacity style={styles.aiMenuItem} onPress={() => setIsAIActionsVisible(false)}>
              <View style={[styles.aiIconWrapper, { backgroundColor: '#DCFCE7' }]}>
                <Presentation color="#22C55E" size={22} />
              </View>
              <View style={styles.aiMenuText}>
                <Text style={styles.aiMenuTitle}>Buat Slide</Text>
                <Text style={styles.aiMenuDesc}>Ubah chat jadi bahan presentasi</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* AI Sparkle Button */}
        <TouchableOpacity 
          style={styles.sparkleButton} 
          activeOpacity={0.8}
          onPress={toggleAIMenu}
        >
          <LinearGradient
            colors={['#A855F7', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sparkleGradient}
          >
            <Sparkles color="#FFF" size={24} />
          </LinearGradient>
        </TouchableOpacity>

        <ChatInput 
          replyingTo={replyingTo ? { name: replyingTo.isMine ? 'Anda' : (name as string || 'Teman'), text: replyingTo.text } : null}
          onCancelReply={() => setReplyingTo(null)}
          onSend={handleSend}
          isEditing={!!editingMessage}
          editInitialText={editingMessage?.text}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </View>

      <MessageActionMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        isPinned={selectedMessage?.isPinned}
        onPin={handlePin}
        onReply={handleReply}
        onEdit={handleEdit}
        onCopy={() => Alert.alert('Teks disalin')}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    height: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#EBE5DF',
  },
  encryptedBannerWrapper: {
    alignItems: 'center',
    marginVertical: 15,
  },
  encryptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCF3C6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  encryptedText: {
    fontSize: 12,
    color: '#4B4228',
    fontWeight: '500',
  },
  pinnedMessagesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  pinnedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinnedIcon: {
    marginRight: 10,
  },
  pinnedTextContainer: {
    flex: 1,
  },
  pinnedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00BCD4',
  },
  pinnedText: {
    fontSize: 12,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 15,
  },
  sparkleButton: {
    position: 'absolute',
    bottom: 80, // right above chat input
    right: 15,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 100,
  },
  sparkleGradient: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 90,
  },
  aiMenuContainer: {
    position: 'absolute',
    bottom: 145, // above sparkle button
    right: 15,
    width: 260,
    zIndex: 101,
  },
  aiMenuCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  aiMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  aiIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiMenuText: {
    flex: 1,
  },
  aiMenuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  aiMenuDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  aiMenuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 12,
  },
});
