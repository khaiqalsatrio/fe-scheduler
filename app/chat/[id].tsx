import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, Platform, StatusBar, Animated, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pin, X, ChevronLeft, User, Video, Phone, MoreVertical, Lock, Sparkles, MessageCircle, FileText, Presentation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { io, Socket } from 'socket.io-client';
import { Buffer } from 'buffer';
import { MessageBubble } from '../../components/MessageBubble';
import { ChatInput } from '../../components/ChatInput';
import { MessageActionMenu } from '../../components/MessageActionMenu';
import * as SecureStore from 'expo-secure-store';

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
  status?: 'sent' | 'delivered' | 'read';
  file?: {
    url: string;
    name: string;
    type: string;
  };
}

const INITIAL_MESSAGES: Message[] = [];

export default function ChatDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [myId, setMyId] = useState<string>('');
  const myIdRef = useRef<string>('');

  // AI Menu State
  const [isAIActionsVisible, setIsAIActionsVisible] = useState(false);
  const aiMenuAnim = useRef(new Animated.Value(0)).current;

  // 1. Inisialisasi Socket.IO
  useEffect(() => {
    let newSocket: Socket;
    const connectSocket = async () => {
      const token = await SecureStore.getItemAsync('user_token');
      if (!token) return;

      // Ambil My ID dari token sekalian
      try {
        const payloadStr = token.split('.')[1];
        // FIX: atob is not available natively in React Native Hermes securely
        const payloadObj = JSON.parse(Buffer.from(payloadStr, 'base64').toString('utf8'));
        const userId = payloadObj.id || payloadObj.sub || '';
        setMyId(userId);
        myIdRef.current = userId;
      } catch (e) {
        console.error('Failed to parse token for myId:', e);
      }

      newSocket = io('https://dev-ows-api.telkom-digital.id', {
        transports: ['websocket'],
        auth: { token: `Bearer ${token}` }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('conversation.join', { conversationId: id });
        setSocket(newSocket);
      });

      newSocket.on('message.new', (msg: any) => {
        // Segera kirim sinyal delivered jika pesan dari orang lain
        if (msg.sender_id !== myIdRef.current) {
          newSocket.emit('message.delivered', { messageId: msg.id });
          newSocket.emit('message.read', { conversationId: id, lastMessageId: msg.id });
        }

        // Terjemahkan message data ke Frontend format
        const newMessage: Message = {
          id: msg.client_message_id || msg.id,
          text: msg.content || '',
          time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: msg.sender_id === myIdRef.current || msg.is_mine === true,
          status: msg.status || 'sent',
          file: msg.meta?.file ? {
            url: msg.meta.file.url,
            name: msg.meta.file.name || 'file',
            type: msg.meta.file.type || (msg.type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
          } : undefined
        };

        setMessages(prev => {
          // Abaikan jika sudah ada (optimistic UI dari pengirim sendiri)
          if (prev.some(p => p.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      });

      newSocket.on('message.delivered', (data: any) => {
        setMessages(prev => prev.map(m => 
          m.id === data.messageId ? { ...m, status: 'delivered' } : m
        ));
      });

      newSocket.on('message.read', (data: any) => {
        // Jika lastMessageId tersedia, tandai semua pesan sebelumnya sebagai read
        setMessages(prev => prev.map(m => {
           // Sederhananya, jika pengirimnya bukan saya, dan statusnya belum read, perbarui
           // Namun biasanya kita hanya peduli centang biru untuk pesan KITA sendiri
           if (m.isMine && m.status !== 'read') {
             return { ...m, status: 'read' };
           }
           return m;
        }));
      });

      newSocket.on('error', (err) => console.error('Socket error event:', err));
    };

    connectSocket();

    return () => {
      if (newSocket) {
        newSocket.emit('conversation.leave', { conversationId: id });
        newSocket.disconnect();
      }
    };
  }, [id]);

  // 2. Fetch Riwayat Pesan Awal (REST Endpoint yang benar)
  useEffect(() => {
    fetchMessages();
  }, [id]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (!token) return;

      let userId = '';
      try {
        const payloadStr = token.split('.')[1];
        const payloadObj = JSON.parse(Buffer.from(payloadStr, 'base64').toString('utf8'));
        userId = payloadObj.id || payloadObj.sub || '';
        setMyId(userId);
        myIdRef.current = userId;
      } catch(e) {}

      const response = await fetch(`https://dev-ows-api.telkom-digital.id/v1/messages/${id}?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const jsonResp = await response.json();
      
      if (response.ok) {
        // API docs: jsonResp = { conversation: {}, messages: [] }
        const data = jsonResp.messages || jsonResp.data || [];
        if (Array.isArray(data)) {
           const formattedMessages = data.map((m: any) => ({
             id: m.client_message_id || m.id?.toString() || Math.random().toString(),
              text: m.content || m.text || '',
              time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMine: userId ? m.sender_id === userId : (m.is_mine === true),
              status: m.status || (m.read_at ? 'read' : 'sent'),
              file: m.meta?.file ? {
                url: m.meta.file.url,
                name: m.meta.file.name || 'file',
                type: m.meta.file.type || (m.type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
              } : undefined
            }));
           // Reverse order if descending
           setMessages(formattedMessages.reverse());
        }
      } else {
        console.log('Gagal ambil histori pesan:', jsonResp.message);
      }
    } catch (e) {
      console.error('Fetch msgs err:', e);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSend = async (text: string) => {
    const clientId = Date.now().toString();
    const newMessage: Message = {
      id: clientId,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      replyTo: replyingTo ? { name: replyingTo.isMine ? 'Anda' : (name as string || 'Teman'), text: replyingTo.text } : undefined,
    };
    
    // UI Optimistik Update
    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

    // Proses ke Backend API
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (!token) return;

      const formData = new FormData();
      // Menggunakan POST biasa karena ini didalam existing conversation
      formData.append('conversationId', id as string);
      formData.append('clientMessageId', clientId);
      formData.append('type', 'text');
      formData.append('content', text);
      if (replyingTo) {
        formData.append('replyToMessageId', replyingTo.id);
      }

      const response = await fetch('https://dev-ows-api.telkom-digital.id/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const resJson = await response.json();
      if (!response.ok) {
        Alert.alert('Gagal Mengirim', resJson.message || 'Gagal mengirim pesan ke server.');
      }
    } catch (e) {
      console.error("Gagal mengirim:", e);
      Alert.alert('Error', 'Kesalahan jaringan saat mengirim pesan.');
    }
  };

  const handleFileSend = async (fileAsset: any, type: string) => {
    const clientId = Date.now().toString();
    
    // UI Optimistik
    const newMessage: Message = {
      id: clientId,
      text: type === 'image' ? '📷 Gambar' : type === 'voice' ? '🎤 Pesan Suara' : `📄 ${fileAsset.name || 'File'}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      file: {
        url: fileAsset.uri,
        name: fileAsset.name || 'file',
        type: fileAsset.mimeType || (type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
      }
    };
    
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (!token) return;

      const formData = new FormData();
      formData.append('conversationId', id as string);
      formData.append('clientMessageId', clientId);
      formData.append('type', type); // 'image' or 'file'
      
      // Di React Native, FormData memerlukan format khusus ini
      const fileToUpload = {
        uri: Platform.OS === 'android' ? fileAsset.uri : fileAsset.uri.replace('file://', ''),
        type: fileAsset.mimeType || (type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
        name: fileAsset.name || (type === 'image' ? 'photo.jpg' : 'file'),
      };
      
      formData.append('file', fileToUpload as any);

      const response = await fetch('https://dev-ows-api.telkom-digital.id/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      });

      const resJson = await response.json();
      if (!response.ok) {
        Alert.alert('Gagal Mengirim File', resJson.message || 'Gagal mengirim file ke server.');
      } else {
        console.log('File sent successfully:', resJson);
      }
    } catch (e) {
      console.error("Gagal mengirim file:", e);
      Alert.alert('Error', 'Kesalahan jaringan saat mengirim file.');
    }
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

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#25D366" />
          </View>
        ) : (
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
                file={item.file}
                onLongPress={() => handleLongPress(item)}
              />
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
        )}

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
          onFileSend={handleFileSend}
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
