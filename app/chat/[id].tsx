import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, Platform, StatusBar, Animated, TouchableWithoutFeedback, ActivityIndicator, TextInput, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pin, X, ChevronLeft, User, Users, Video, Phone, MoreVertical, Lock, Sparkles, MessageCircle, FileText, Presentation, Search } from 'lucide-react-native';
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
  replies_count?: number;
  reactions?: {
    emoji: string;
    user_id: string;
    user?: { name: string };
  }[];
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
  created_at: string;
  isDeleted?: boolean;
  senderName?: string;
}

interface DateSeparator {
  id: string;
  isDateSeparator: true;
  dateLabel: string;
}

type ChatItem = (Message | DateSeparator);

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

  // Local Search States
  const [isSearchingInside, setIsSearchingInside] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localSearchResults, setLocalSearchResults] = useState<any[]>([]);
  const [isSearchingLocalLoading, setIsSearchingLocalLoading] = useState(false);

  // Pagination States
  const [oldestCursor, setOldestCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Pin States
  const [activePinnedIndex, setActivePinnedIndex] = useState(0);

  // AI & Member States
  const [chatType, setChatType] = useState<'dm' | 'group'>('dm');
  const [memberCount, setMemberCount] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Pulse Animation for AI Button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 1. Helpers
  const getChatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getUTCDate() - date.getUTCDate();
    const isSameYear = now.getUTCFullYear() === date.getUTCFullYear();
    const isSameMonth = now.getUTCMonth() === date.getUTCMonth();

    if (isSameYear && isSameMonth && diff === 0) return 'Hari Ini';
    if (isSameYear && isSameMonth && diff === 1) return 'Kemarin';
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const chatItems = React.useMemo(() => {
    const items: ChatItem[] = [];
    let lastDate = '';

    messages.forEach((msg) => {
      const dateLabel = getChatDateLabel(msg.created_at);
      if (dateLabel !== lastDate) {
        items.push({
          id: `date-${msg.created_at}`,
          isDateSeparator: true,
          dateLabel
        });
        lastDate = dateLabel;
      }
      items.push(msg);
    });

    return items;
  }, [messages]);

  // 1. Inisialisasi Socket.IO
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (localSearchQuery.trim().length > 0) {
        handleLocalSearch(localSearchQuery);
      } else {
        setLocalSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearchQuery]);

  const handleLocalSearch = async (query: string) => {
    setIsSearchingLocalLoading(true);
    try {
      const token = await SecureStore.getItemAsync('user_token');
      const response = await fetch(`https://dev-ows-api.telkom-digital.id/v1/messages/search/${id}?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setLocalSearchResults(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.warn('Local search error:', error);
    } finally {
      setIsSearchingLocalLoading(false);
    }
  };

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
          time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
          isMine: msg.sender_id === myIdRef.current || msg.is_mine === true,
          status: msg.status || 'sent',
          file: msg.meta?.file ? {
            url: msg.meta.file.url,
            name: msg.meta.file.name || 'file',
            type: msg.meta.file.type || (msg.type === 'image' ? 'image/jpeg' : msg.type === 'voice' ? 'audio/mp3' : 'application/octet-stream'),
          } : undefined,
          created_at: msg.created_at || new Date().toISOString(),
          reactions: msg.reactions || [],
          senderName: msg.sender_id === '00000000-0000-0000-0000-000000000000' 
            ? 'Tera AI' 
            : (msg.sender?.name || msg.sender_name),
          replyTo: msg.reply_to_message ? {
            text: msg.reply_to_message.content,
            name: msg.reply_to_message.sender_id === myIdRef.current 
              ? 'Anda' 
              : (msg.reply_to_message.sender_name || (name as string) || 'User')
          } : undefined,
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

      newSocket.on('message.reaction', (data: any) => {
        // data structure: { message_id, user_id, emoji, conversation_id }
        setMessages(prev => prev.map(m => {
          if (m.id === data.message_id) {
            const currentReactions = m.reactions || [];
            // Toggle logic: if user already has this exact emoji, remove it. 
            // Otherwise, remove any existing emoji from this user and add the new one.
            const existingReactionIndex = currentReactions.findIndex((r: any) => r.user_id === data.user_id);
            
            let newReactions;
            if (existingReactionIndex > -1) {
              const oldEmoji = currentReactions[existingReactionIndex].emoji;
              if (oldEmoji === data.emoji) {
                // Remove (Toggle off)
                newReactions = currentReactions.filter((r: any) => r.user_id !== data.user_id);
              } else {
                // Update (Replace emoji)
                newReactions = [...currentReactions];
                newReactions[existingReactionIndex] = { ...newReactions[existingReactionIndex], emoji: data.emoji };
              }
            } else {
              // Add new
              newReactions = [...currentReactions, { user_id: data.user_id, emoji: data.emoji }];
            }
            return { ...m, reactions: newReactions };
          }
          return m;
        }));
      });

      newSocket.on('message.pinned', (data: any) => {
        // data: { messageId, isPinned, conversationId }
        setMessages(prev => prev.map(m => 
          m.id === data.messageId ? { ...m, isPinned: data.isPinned } : m
        ));
      });

      newSocket.on('message.updated', (msg: any) => {
        setMessages(prev => prev.map(m => 
          (m.id === msg.id || m.id === msg.client_message_id) 
          ? { ...m, text: msg.content, isEdited: !!msg.edited_at } 
          : m
        ));
      });

      newSocket.on('message.deleted', (data: any) => {
        // data structure: { messageId, conversationId }
        setMessages(prev => prev.map(m => 
          (m.id === data.messageId || m.id === data.clientMessageId) 
          ? { ...m, isDeleted: true } 
          : m
        ));
      });

      newSocket.on('ai.thinking', (data: any) => {
        if (data.conversationId === id) {
          setIsAiThinking(true);
          setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
        }
      });

      newSocket.on('ai.thinking.stop', (data: any) => {
        if (data.conversationId === id) {
          setIsAiThinking(false);
        }
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

  const markAsRead = async (token: string) => {
    try {
      await fetch('https://dev-ows-api.telkom-digital.id/v1/messages/read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId: id })
      });
      console.log('Marked as read for conversation:', id);
    } catch (error) {
      console.warn('Gagal menandai pesan sebagai terbaca:', error);
    }
  };

  const fetchMessages = async (isLoadMore = false) => {
    if (isLoadMore) {
      if (!hasMore || isLoadingMore) return;
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

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

      if (!isLoadMore) {
        // Tandai pesan sebagai dibaca (REST)
        markAsRead(token);
      }

      const limit = 20;
      let url = `https://dev-ows-api.telkom-digital.id/v1/messages/${id}?limit=${limit}`;
      if (isLoadMore && oldestCursor) {
        url += `&cursor=${encodeURIComponent(oldestCursor)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const jsonResp = await response.json();
      
      if (response.ok) {
        const data = jsonResp.messages || jsonResp.data || [];
        if (Array.isArray(data)) {
           if (data.length < limit) {
             setHasMore(false);
           }

           const formattedMessages = data.map((m: any) => ({ 
             created_at: m.created_at || new Date().toISOString(),
             id: m.id?.toString() || m.client_message_id || Math.random().toString(),
             text: m.content || m.text || '',
             time: m.created_at ? new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
             isMine: userId ? m.sender_id === userId : (m.is_mine === true),
             isPinned: m.is_pinned || false,
             status: m.status || (m.read_at ? 'read' : 'sent'), 
             isEdited: !!m.edited_at, 
             isDeleted: !!m.deleted_at,
             reactions: m.reactions || [],
             senderName: m.sender_id === '00000000-0000-0000-0000-000000000000' 
               ? 'Tera AI' 
               : (m.sender?.name || m.sender_name),
             replyTo: m.reply_to_message ? {
                id: m.reply_to_message.id,
                text: m.reply_to_message.content,
                name: m.reply_to_message.sender_id === userId ? 'Anda' : (m.reply_to_message.sender_name || (name as string) || 'User')
             } : undefined,
             file: m.meta?.file ? {
               url: m.meta.file.url,
               name: m.meta.file.name || 'file',
               type: m.meta.file.type || (m.type === 'image' ? 'image/jpeg' : m.type === 'voice' ? 'audio/mp3' : 'application/octet-stream'),
             } : undefined
           }));

           if (isLoadMore) {
             setMessages(prev => [...formattedMessages.reverse(), ...prev]);
           } else {
             setMessages(formattedMessages.reverse());
             setIsInitialLoad(true);
           }

            if (data.length > 0) {
              setOldestCursor(data[data.length - 1].created_at);
            }

            // Ambil Info Percakapan (Type & Member Count)
            if (jsonResp.conversation) {
              setChatType(jsonResp.conversation.type);
              
              if (jsonResp.conversation.type === 'group') {
                try {
                  const memberResp = await fetch(`https://dev-ows-api.telkom-digital.id/v1/conversations/${id}/members`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  const memberData = await memberResp.json();
                  if (memberResp.ok) {
                    setMemberCount(Array.isArray(memberData) ? memberData.length : 0);
                  }
                } catch (err) {
                  console.warn('Gagal ambil jumlah anggota grup:', err);
                }
              }
            }
        }
      } else {
        console.log('Gagal ambil histori pesan:', jsonResp.message);
      }
    } catch (e) {
      console.error('Fetch msgs err:', e);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

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
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isMine: true,
      replyTo: replyingTo ? { name: replyingTo.isMine ? 'Anda' : (name as string || 'User'), text: replyingTo.text } : undefined,
      created_at: new Date().toISOString(),
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

  const handleTeraAction = async (actionType: 'summarize' | 'presentation' | 'ask', customText?: string) => {
    setIsAIActionsVisible(false);
    let userPrompt = "";

    if (actionType === 'summarize') {
      userPrompt = "/summarize " + (customText || "Tolong ringkas poin-poin diskusi penting dalam percakapan ini.");
    } else if (actionType === 'presentation') {
      userPrompt = "/presentation " + (customText || "Buat draf slide presentasi dari chat ini.");
    } else {
      userPrompt = customText || "Tanya AI...";
    }

    // 1. Kirim pesan ke socket agar riwayat chat mencatat permintaan user
    handleSend(userPrompt);

    // 2. Aktifkan indikator thinking
    setIsAiThinking(true);

    try {
      const token = await SecureStore.getItemAsync('user_token');
      const apiUrl = `https://dev-ows-api.telkom-digital.id/v1/ai-insight/document/${id}`;
      
      console.log("Triggering AI Insight:", apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const resJson = await response.json();
      setIsAiThinking(false);

      if (response.ok) {
        // Tampilkan jawaban riil dari server
        const aiMsg: Message = {
          id: 'ai-' + Date.now(),
          text: resJson.content || resJson.insight || resJson.summary || "Analisis Berhasil (Data Kosong)",
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
          isMine: false,
          senderName: 'Tera AI',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // Tampilkan alasan kegagalan dari server mentor Anda
        const errorInfo = resJson.message || `Server Error ${response.status}`;
        const fallbackMsg: Message = {
          id: 'ai-fb-' + Date.now(),
          text: `[Backend Feedback]: ${errorInfo}. ID Percakapan: ${id}`,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
          isMine: false,
          senderName: 'Tera AI',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }
      setTimeout(() => flatListRef.current?.scrollToEnd(), 200);

    } catch (e) {
      console.error("Tera AI Network Error:", e);
      setIsAiThinking(false);
    }
  };

  const handleFileSend = async (fileAsset: any, type: string) => {
    const clientId = Date.now().toString();
    
    // UI Optimistik
    const newMessage: Message = {
      id: clientId,
      text: type === 'image' ? '📷 Gambar' : type === 'voice' ? '🎤 Pesan Suara' : `📄 ${fileAsset.name || 'File'}`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isMine: true,
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

  const handleUpdate = async (newText: string) => {
    if (!editingMessage) return;
    const targetId = editingMessage.id;
    const oldText = editingMessage.text;

    // Optimistik Update
    setMessages(prev => prev.map(m =>
      m.id === targetId ? { ...m, text: newText, isEdited: true } : m
    ));
    setEditingMessage(null);

    try {
      const token = await SecureStore.getItemAsync('user_token');
      const response = await fetch(`https://dev-ows-api.telkom-digital.id/v1/messages/${targetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newText })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui pesan');
      }
    } catch (error: any) {
      console.error('Gagal update pesan:', error);
      Alert.alert('Gagal Edit', error.message || 'Terjadi kesalahan saat memperbarui pesan.');
      // Revert jika gagal
      setMessages(prev => prev.map(m =>
        m.id === targetId ? { ...m, text: oldText } : m
      ));
    }
  };

  const handleLongPress = (message: Message) => {
    setSelectedMessage(message);
    setIsMenuVisible(true);
  };

  const handlePin = async () => {
    if (!selectedMessage) return;
    const newPinStatus = !selectedMessage.isPinned;
    const targetId = selectedMessage.id;

    // Optimistik Update
    setMessages(prev => prev.map(m =>
      m.id === targetId ? { ...m, isPinned: newPinStatus } : m
    ));
    setIsMenuVisible(false);

    try {
      const token = await SecureStore.getItemAsync('user_token');
      const response = await fetch(`https://dev-ows-api.telkom-digital.id/v1/messages/${targetId}/pin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPinned: newPinStatus })
      });
      
      if (response.ok) {
        // No alert per user request
      }
    } catch (error) {
      console.warn('Gagal mengubah status sematan:', error);
      // Revert jika gagal
      setMessages(prev => prev.map(m =>
        m.id === targetId ? { ...m, isPinned: !newPinStatus } : m
      ));
    }
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

    const options: any[] = [
      {
        text: 'Hapus untuk Saya',
        onPress: () => onDeleteLocal(selectedMessage.id),
      },
      {
        text: 'Batal',
        style: 'cancel',
      },
    ];

    if (selectedMessage.isMine) {
      options.unshift({
        text: 'Hapus untuk Semua Orang',
        style: 'destructive',
        onPress: () => onDeleteForEveryone(selectedMessage.id),
      });
    }

    Alert.alert(
      'Hapus Pesan?',
      'Pesan yang dihapus tidak dapat dikembalikan.',
      options,
      { cancelable: true }
    );
  };

  const onDeleteLocal = async (messageId: string) => {
    console.log('Menghapus pesan lokal:', messageId);
    // Optimistic UI - filter out immediately
    setMessages(prev => prev.filter(m => m.id !== messageId));
    
    try {
      const token = await SecureStore.getItemAsync('user_token');
      const response = await fetch(`https://dev-ows-api.telkom-digital.id/v1/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Respon hapus lokal:', response.status);
    } catch (error) {
      console.error('Gagal hapus pesan lokal:', error);
    }
  };

  const onDeleteForEveryone = (messageId: string) => {
    console.log('Menghapus pesan untuk semua:', messageId);
    if (socket) {
      socket.emit('message.delete', { messageId, forEveryone: true });
      // Optimistic UI - mark as deleted
      setMessages(prev => prev.map(m => 
        (m.id === messageId) ? { ...m, isDeleted: true } : m
      ));
    }
  };

  const handleReact = async (emoji: string, messageId?: string) => {
    const targetId = messageId || selectedMessage?.id;
    if (!targetId) return;

    // Optimistic Update
    setMessages(prev => prev.map(m => {
      if (m.id === targetId) {
        const currentReactions = m.reactions || [];
        const existingIndex = currentReactions.findIndex((r: any) => r.user_id === myId);
        
        let newReactions;
        if (existingIndex > -1) {
          if (currentReactions[existingIndex].emoji === emoji) {
            newReactions = currentReactions.filter((r: any) => r.user_id !== myId);
          } else {
            newReactions = [...currentReactions];
            newReactions[existingIndex] = { ...newReactions[existingIndex], emoji };
          }
        } else {
          newReactions = [...currentReactions, { user_id: myId, emoji }];
        }
        return { ...m, reactions: newReactions };
      }
      return m;
    }));

    try {
      const token = await SecureStore.getItemAsync('user_token');
      await fetch(`https://dev-ows-api.telkom-digital.id/v1/messages/${targetId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });
    } catch (error) {
      console.warn('Gagal bereaksi:', error);
    }
  };

  const jumpToMessage = (messageId: string) => {
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  };

  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const handleVoiceFinish = (finishedId: string) => {
    // Cari index pesan yang baru selesai
    const currentIndex = messages.findIndex(m => m.id === finishedId);
    if (currentIndex === -1) return;

    // Cari pesan suara berikutnya (di bawahnya)
    // Karena list diurutkan dari atas ke bawah, pesan berikutnya ada di index + 1
    for (let i = currentIndex + 1; i < messages.length; i++) {
      const nextMsg = messages[i];
      const isVoice = nextMsg.file?.type?.startsWith('audio/') || 
                      nextMsg.file?.type === 'voice' ||
                      nextMsg.file?.url?.toLowerCase().endsWith('.m4a') ||
                      nextMsg.file?.url?.toLowerCase().endsWith('.mp3');
      
      if (isVoice) {
        setPlayingVoiceId(nextMsg.id);
        break;
      }
    }
  };

  const handlePlayStarted = (id: string) => {
    setPlayingVoiceId(id);
  };

  const handleForward = () => {
    if (!selectedMessage) return;
    setIsMenuVisible(false);
    router.push({
      pathname: '/forward-select' as any,
      params: { 
        messageId: selectedMessage.id,
        content: selectedMessage.text 
      }
    });
  };

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
            <View style={styles.headerInfo}>
              <View style={[
                styles.headerAvatar,
                chatType === 'group' && { backgroundColor: '#E0EEFF' }
              ]}>
                {chatType === 'group' ? (
                  <Users color="#3B82F6" size={22} />
                ) : (
                  <User color="#999" size={22} />
                )}
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>{name as string || 'Sarah Nur'}</Text>
                <Text style={styles.headerSubtitle}>
                  {chatType === 'group' ? `${memberCount} Member` : 'Last seen recently'}
                </Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={() => setIsSearchingInside(true)}>
                <Search color="#555" size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <MoreVertical color="#555" size={22} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <ImageBackground 
        source={require('../../assets/images/wallpaper.jpg')} 
        style={styles.container}
        resizeMode="repeat" // Changed to repeat for pattern style, or cover if preferred
      >
        {pinnedMessages.length > 0 && (
          <View style={styles.pinnedMessagesBar}>
            <TouchableOpacity
              style={styles.pinnedContent}
              onPress={() => {
                const current = pinnedMessages[activePinnedIndex % pinnedMessages.length];
                if (current) jumpToMessage(current.id);
                if (pinnedMessages.length > 1) {
                  setActivePinnedIndex(prev => (prev + 1) % pinnedMessages.length);
                }
              }}
            >
              <Pin size={16} color="#666" style={styles.pinnedIcon} />
              <View style={styles.pinnedTextContainer}>
                <Text style={styles.pinnedCompactText} numberOfLines={1}>
                  <Text style={styles.pinnedSenderName}>{name as string || 'Ahmad Zaki'}: </Text>
                  {pinnedMessages[activePinnedIndex % pinnedMessages.length]?.text}
                </Text>
              </View>
              {pinnedMessages.length > 1 && (
                <View style={styles.pinnedBadgeMini}>
                  <Text style={styles.pinnedBadgeText}>{pinnedMessages.length}</Text>
                </View>
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
                {isSearchingLocalLoading ? (
                  <ActivityIndicator color="#25D366" />
                ) : (
                  <Text style={styles.searchEmptyText}>Tidak ada pesan ditemukan</Text>
                )}
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.localSearchResultItem}
                onPress={() => setIsSearchingInside(false)}
              >
                <Text style={styles.localSearchResultTime}>
                  {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
                <Text style={styles.localSearchResultText}>{item.content}</Text>
              </TouchableOpacity>
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <>
            {isLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#25D366" />
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={chatItems}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={() => (
                  <View>
                    {isLoadingMore && (
                      <View style={{ paddingVertical: 10 }}>
                        <ActivityIndicator color="#25D366" />
                      </View>
                    )}
                    <View style={styles.encryptedBannerWrapper}>
                      <View style={styles.encryptedBanner}>
                        <Lock color="#D4A106" size={14} style={{ marginRight: 6 }} />
                        <Text style={styles.encryptedText}>Messages are end-to-end encrypted</Text>
                      </View>
                    </View>
                  </View>
                )}
                renderItem={({ item }) => {
                  if ('isDateSeparator' in item) {
                    return (
                      <View style={styles.dateSeparatorContainer}>
                        <View style={styles.dateSeparatorCapsule}>
                          <Text style={styles.dateSeparatorText}>{item.dateLabel}</Text>
                        </View>
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
                      onLongPress={() => handleLongPress(item)}
                      isPlaying={playingVoiceId === item.id}
                      onVoiceFinish={handleVoiceFinish}
                      onPlayStarted={handlePlayStarted}
                      reactions={item.reactions}
                      myUserId={myId}
                      onReactionPress={(emoji) => handleReact(emoji, item.id)}
                      senderName={item.senderName}
                      chatType={item.senderName === 'Tera AI' ? 'group' : chatType as any}
                    />
                  );
                }}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => {
                  if (isInitialLoad) {
                    flatListRef.current?.scrollToEnd({ animated: false });
                    setIsInitialLoad(false);
                  }
                }}
                onScroll={(e) => {
                  const { y } = e.nativeEvent.contentOffset;
                  if (y < 20 && !isLoadingMore && hasMore && messages.length > 0) {
                    fetchMessages(true);
                  }
                }}
              />
            )}
          </>
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
            <TouchableOpacity 
              style={styles.aiMenuItem} 
              onPress={() => handleTeraAction('ask', 'Tanya AI: ')}
            >
              <View style={[styles.aiIconWrapper, { backgroundColor: '#F3E8FF' }]}>
                <MessageCircle color="#A855F7" size={22} />
              </View>
              <View style={styles.aiMenuText}>
                <Text style={styles.aiMenuTitle}>Tanya AI</Text>
                <Text style={styles.aiMenuDesc}>Tanyakan apa saja ke AI</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.aiMenuDivider} />

            <TouchableOpacity 
              style={styles.aiMenuItem} 
              onPress={() => handleTeraAction('summarize')}
            >
              <View style={[styles.aiIconWrapper, { backgroundColor: '#E0F2FE' }]}>
                <FileText color="#0EA5E9" size={22} />
              </View>
              <View style={styles.aiMenuText}>
                <Text style={styles.aiMenuTitle}>Ringkas</Text>
                <Text style={styles.aiMenuDesc}>Ubah chat jadi poin penting</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.aiMenuDivider} />

            <TouchableOpacity 
              style={styles.aiMenuItem} 
              onPress={() => handleTeraAction('presentation')}
            >
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

        {/* AI Sparkle Button with Glow Effect */}
        <View style={styles.sparkleButtonContainer}>
          <Animated.View 
            style={[
              styles.sparkleGlow,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [0, 0.4]
                }),
                transform: [{ scale: pulseAnim.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [1, 1.1]
                })}]
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.sparkleButton, 
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleAIMenu}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={['#A855F7', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sparkleGradient}
              >
                <Sparkles color="#FFF" fill="#FFF" size={24} style={{ position: 'absolute' }} />
                <Animated.View style={{ opacity: pulseAnim.interpolate({ inputRange: [1, 1.1], outputRange: [0, 1] }) }}>
                  <Sparkles color="#C3B1E1" fill="#C3B1E1" size={24} />
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {isAiThinking && (
          <Animated.View 
            style={styles.aiThinkingContainer}
          >
            <View style={styles.aiThinkingBubble}>
              <Sparkles color="#A855F7" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.aiThinkingText}>AI sedang menyiapkan balasan...</Text>
            </View>
          </Animated.View>
        )}

        {!isSearchingInside && (
          <ChatInput
            replyingTo={replyingTo ? { 
              name: replyingTo.isMine ? 'Anda' : (replyingTo.senderName || (name as string) || 'User'), 
              text: replyingTo.text 
            } : null}
            onCancelReply={() => setReplyingTo(null)}
            onSend={handleSend}
            isEditing={!!editingMessage}
            editInitialText={editingMessage?.text}
            onUpdate={handleUpdate}
            onCancelEdit={() => setEditingMessage(null)}
            onFileSend={handleFileSend}
          />
        )}
      </ImageBackground>

      <MessageActionMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        isPinned={selectedMessage?.isPinned}
        canEdit={
          !!(selectedMessage?.isMine && 
          selectedMessage?.created_at && 
          (new Date().getTime() - new Date(selectedMessage.created_at).getTime() < 15 * 60 * 1000))
        }
        onPin={handlePin}
        onReply={handleReply}
        onForward={handleForward}
        onEdit={handleEdit}
        onCopy={() => Alert.alert('Teks disalin')}
        onDelete={handleDelete}
        onReact={handleReact}
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
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    height: 65,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  backButton: {
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#E5DDD5',
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
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
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
  pinnedCompactText: {
    fontSize: 14,
    color: '#333',
  },
  pinnedSenderName: {
    fontWeight: '700',
    color: '#00A884',
  },
  pinnedBadgeMini: {
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  pinnedBadgeText: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  pinnedStackIndicator: {
    width: 3,
    height: '80%',
    marginRight: 12,
    justifyContent: 'center',
  },
  stackLine: {
    width: 2,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
    marginVertical: 1,
  },
  activeStackLine: {
    backgroundColor: '#00A884',
    height: 12,
  },
  badgeCount: {
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '700',
  },
  dateSeparatorContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  dateSeparatorCapsule: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 15,
  },
  sparkleButtonContainer: {
    position: 'absolute',
    bottom: 110,
    right: 15,
    width: 56,
    height: 56,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 2,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sparkleGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A855F7',
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
  searchHeaderInside: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  searchInputInside: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  searchEmptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  searchEmptyText: {
    color: '#999',
    fontSize: 14,
  },
  localSearchResultItem: {
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
    backgroundColor: '#FFF',
  },
  localSearchResultTime: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  localSearchResultText: {
    fontSize: 14,
    color: '#333',
  },
  aiThinkingContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  aiThinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  aiThinkingText: {
    fontSize: 13,
    color: '#6B21A8',
    fontStyle: 'italic',
    fontWeight: '500',
  },
});
