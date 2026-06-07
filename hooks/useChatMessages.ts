import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { Message, ChatListItem } from '../types/chat';
import { MessageService } from '../services/messageService';
import { Socket } from 'socket.io-client';

interface DateSeparator {
  id: string;
  isDateSeparator: true;
  dateLabel: string;
}

type ChatItem = (Message | DateSeparator);

/**
 * Custom Hook to manage Message state, history, and real-time updates
 */
export const useChatMessages = (conversationId: string, socket: Socket | null, myId: string, myIdRef: React.RefObject<string>, conversationName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [oldestCursor, setOldestCursor] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatType, setChatType] = useState<'dm' | 'group' | 'channel'>('dm');
  const [memberCount, setMemberCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // --- Helpers ---
  const getChatDateLabel = useCallback((dateStr: string) => {
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
  }, []);

  const formatMessageTime = useCallback((dateStr?: string) => {
    return dateStr
      ? new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
      : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  }, []);

  // --- Computed Data ---
  const chatItems = useMemo(() => {
    const items: ChatItem[] = [];

    messages.forEach((msg, index) => {
      // Add the message itself first (it will be below when inverted)
      items.push(msg);

      const dateLabel = getChatDateLabel(msg.created_at);

      // Peek at the NEXT message (which is chronologicaly OLDER in the array)
      const nextMsg = messages[index + 1];
      const nextDateLabel = nextMsg ? getChatDateLabel(nextMsg.created_at) : '';

      // If the next message has a different date, or if it's the very last message in the history
      if (dateLabel !== nextDateLabel) {
        items.push({
          id: `date-sep-${msg.id}`,
          isDateSeparator: true,
          dateLabel
        });
      }
    });

    return items;
  }, [messages, getChatDateLabel]);

  // --- Networking ---
  const fetchMessages = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      if (!hasMore || isLoadingMore) return;
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      if (!isLoadMore) {
        try {
          await MessageService.markAsRead(conversationId);
        } catch (e) {
          // Ignore if the endpoint is not implemented (e.g. 404)
        }
      }

      let data;
      try {
        data = await MessageService.getMessages(conversationId, isLoadMore ? (oldestCursor || undefined) : undefined);
      } catch (e: any) {
        if (e.response?.status === 404) {
          data = { messages: [], conversation: null };
        } else {
          throw e;
        }
      }

      const rawMessages = data.messages || [];
      const conversationInfo = data.conversation;

      if (rawMessages.length < 20) {
        setHasMore(false);
      }

      const formattedMessages: Message[] = rawMessages.map((m: any) => ({
        id: m.id?.toString() || m.clientMessageId || m.client_message_id || Math.random().toString(),
        conversation_id: conversationId,
        sender_id: m.senderId || m.sender_id,
        text: m.content || m.text || '', // support both
        content: m.content || m.text || '',
        time: formatMessageTime(m.createdAt || m.created_at),
        isMine: myIdRef.current ? (m.senderId || m.sender_id) === myIdRef.current : !!m.is_mine,
        isPinned: !!(m.isPinned || m.is_pinned),
        isEdited: !!(m.isEdited || m.edited_at),
        isDeleted: !!(m.deletedAt || m.deleted_at),
        status: m.status || (m.readAt || m.read_at ? 'read' : 'sent'),
        reactions: m.reactions || m.meta?.reactions || [],
        created_at: m.createdAt || m.created_at || new Date().toISOString(),
        senderName: (m.senderId || m.sender_id) === '00000000-0000-0000-0000-000000000000' ? 'Tera AI' : (m.sender?.name || m.sender_name),
        type: m.type || 'text',
        replyTo: (m.replyToMessage || m.reply_to_message) ? {
          name: (m.replyToMessage || m.reply_to_message).senderId === myIdRef.current ? 'Anda' : ((m.replyToMessage || m.reply_to_message).sender?.name || conversationName || 'User'),
          text: (m.replyToMessage || m.reply_to_message).content
        } : undefined,
        file: m.meta?.file ? {
          url: m.meta.file.url,
          name: m.meta.file.name || 'file',
          type: m.meta.file.type || (m.type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
        } : undefined
      }));

      if (isLoadMore) {
        // Gabungkan dengan pesan lama, tapi pastikan hanya pesan dengan ID UNIK yang masuk
        setMessages(prev => {
          const newUniqueMessages = formattedMessages.filter(
            newMsg => !prev.some(p => p.id === newMsg.id)
          );
          return [...prev, ...newUniqueMessages];
        });
      } else {
        // Pemuatan awal: cukup gunakan data baru
        setMessages(formattedMessages);
      }

      if (rawMessages.length > 0) {
        // Inverted: load more often works with the oldest message's date
        // API expecting cursor? Let's check original logic
        setOldestCursor(rawMessages[rawMessages.length - 1].created_at);
      }

      // Handle Group Info
      if (conversationInfo) {
        setChatType(conversationInfo.type);
        setIsMuted(!!conversationInfo.is_muted);
        if (conversationInfo.type === 'group' || conversationInfo.type === 'channel') {
          const members = await MessageService.getMembers(conversationId);
          setMemberCount(members.length);
        }
      }
    } catch (error) {
      console.warn('useChatMessages: Failed to fetch messages', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [conversationId, oldestCursor, hasMore, isLoadingMore, conversationName]);

  // --- Real-time Listeners ---
  useEffect(() => {
    if (!socket) return;

    socket.on('message.new', (msg: any) => {
      // Delivered signal logic
      if ((msg.senderId || msg.sender_id) !== myIdRef.current) {
        socket.emit('message.delivered', { messageId: msg.id });
        socket.emit('message.read', { conversationId, lastMessageId: msg.id });
      }

      const fileData = msg.meta?.file ? {
        url: msg.meta.file.url,
        name: msg.meta.file.name || 'file',
        type: msg.meta.file.type || (msg.type === 'image' ? 'image/jpeg' : 'application/octet-stream'),
      } : undefined;

      const newMessage: Message = {
        id: msg.clientMessageId || msg.client_message_id || msg.id,
        conversation_id: conversationId,
        sender_id: msg.senderId || msg.sender_id,
        text: msg.content || '',
        content: msg.content || '',
        time: formatMessageTime(msg.createdAt || msg.created_at),
        isMine: (msg.senderId || msg.sender_id) === myIdRef.current || !!msg.is_mine,
        status: msg.status || 'sent',
        created_at: msg.createdAt || msg.created_at || new Date().toISOString(),
        reactions: msg.reactions || msg.meta?.reactions || [],
        type: msg.type || 'text',
        senderName: (msg.senderId || msg.sender_id) === '00000000-0000-0000-0000-000000000000' ? 'Tera AI' : (msg.sender?.name || msg.sender_name),
        replyTo: (msg.replyToMessage || msg.reply_to_message) ? {
          text: (msg.replyToMessage || msg.reply_to_message).content,
          name: (msg.replyToMessage || msg.reply_to_message).senderId === myIdRef.current ? 'Anda' : ((msg.replyToMessage || msg.reply_to_message).sender?.name || conversationName || 'User')
        } : undefined,
        file: fileData,
      };

      setMessages(prev => {
        // Cek apakah pesan dengan ID yang sama (dari socket atau client_message_id) sudah ada
        const isDuplicate = prev.some(p =>
          p.id === newMessage.id ||
          (msg.client_message_id && p.id === msg.client_message_id)
        );

        if (isDuplicate) return prev;

        // Inverted: Pesan terbaru di INDEKS AWAL
        return [newMessage, ...prev];
      });
    });

    socket.on('message.delivered', (data: any) => {
      setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, status: 'delivered' } : m));
    });

    socket.on('message.read', (data: any) => {
      setMessages(prev => prev.map(m => (m.isMine && m.status !== 'read') ? { ...m, status: 'read' } : m));
    });

    socket.on('message.reaction', (data: any) => {
      setMessages(prev => prev.map(m => {
        if (m.id === data.message_id) {
          const currentReactions = m.reactions || [];
          const existingIndex = currentReactions.findIndex((r: any) => r.user_id === data.user_id);
          let newReactions;
          if (existingIndex > -1) {
            if (currentReactions[existingIndex].emoji === data.emoji) {
              newReactions = currentReactions.filter((r: any) => r.user_id !== data.user_id);
            } else {
              newReactions = [...currentReactions];
              newReactions[existingIndex] = { ...newReactions[existingIndex], emoji: data.emoji };
            }
          } else {
            newReactions = [...currentReactions, { message_id: data.message_id, user_id: data.user_id, emoji: data.emoji }];
          }
          return { ...m, reactions: newReactions };
        }
        return m;
      }));
    });

    socket.on('message.pinned', (data: any) => {
      setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, isPinned: data.isPinned } : m));
    });

    socket.on('message.updated', (msg: any) => {
      setMessages(prev => prev.map(m => (m.id === msg.id || m.id === msg.client_message_id)
        ? { ...m, text: msg.content, content: msg.content, isEdited: !!msg.edited_at } : m));
    });

    socket.on('message.deleted', (data: any) => {
      setMessages(prev => prev.map(m => (m.id === data.messageId || m.id === data.clientMessageId) ? { ...m, isDeleted: true } : m));
    });

    socket.on('conversation.deleted', (data: any) => {
      if (data.conversationId === conversationId) {
        Alert.alert(
          'Chat Dihapus',
          'Percakapan ini telah di-reset oleh admin/sistem.',
          [{ text: 'OK' }]
        );
      }
    });

    socket.on('conversation.muted', (data: any) => {
      if (data.conversationId === conversationId || data.conversation_id === conversationId) {
        setIsMuted(!!data.isMuted || !!data.is_muted);
      }
    });

    socket.on('ai.thinking', (data: any) => {
      if (data.conversationId === conversationId) setIsAiThinking(true);
    });

    socket.on('ai.thinking.stop', (data: any) => {
      if (data.conversationId === conversationId) setIsAiThinking(false);
    });

    return () => {
      socket.off('message.new');
      socket.off('message.delivered');
      socket.off('message.read');
      socket.off('message.reaction');
      socket.off('message.pinned');
      socket.off('message.updated');
      socket.off('message.deleted');
      socket.off('conversation.deleted');
      socket.off('conversation.muted');
      socket.off('ai.thinking');
      socket.off('ai.thinking.stop');
    };
  }, [socket, conversationId, conversationName]);

  // --- Action Handlers ---
  const handleSend = useCallback(async (text: string, replyingTo?: Message | null) => {
    const clientId = Date.now().toString();
    const newMessage: Message = {
      id: clientId,
      conversation_id: conversationId,
      sender_id: myId,
      text,
      content: text,
      time: formatMessageTime(),
      isMine: true,
      type: 'text',
      created_at: new Date().toISOString(),
      replyTo: replyingTo ? { name: replyingTo.isMine ? 'Anda' : (replyingTo.senderName || conversationName || 'User'), text: replyingTo.text } : undefined,
    };

    // Inverted: Newest at the BEGINNING
    setMessages(prev => [newMessage, ...prev]);

    try {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('clientMessageId', clientId);
      formData.append('type', 'text');
      formData.append('content', text);
      if (replyingTo) {
        formData.append('replyToMessageId', replyingTo.id);
      }
      await MessageService.sendMessage(formData);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn('useChatMessages: API not implemented (404), simulating local send');
        // Update status to 'sent' locally to simulate success
        setMessages(prev => prev.map(m => m.id === clientId ? { ...m, status: 'sent' } : m));
      } else {
        console.error('useChatMessages: Failed to send', error?.response?.data || error);
        Alert.alert('Gagal Mengirim', JSON.stringify(error?.response?.data || 'Terjadi kesalahan jaringan.'));
      }
    }
  }, [conversationId, myId, conversationName, formatMessageTime]);

  const handleUpdate = useCallback(async (messageId: string, newText: string, oldText: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText, content: newText, isEdited: true } : m));
    try {
      await MessageService.editMessage(messageId, newText);
    } catch (error: any) {
      console.error('useChatMessages: Failed to edit', error);
      Alert.alert('Gagal Edit', error.message || 'Terjadi kesalahan.');
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: oldText, content: oldText, isEdited: false } : m));
    }
  }, []);

  const handlePin = useCallback(async (messageId: string, currentPinned: boolean) => {
    const newStatus = !currentPinned;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: newStatus } : m));
    try {
      await MessageService.pinMessage(messageId, newStatus);
    } catch (error) {
      console.warn('useChatMessages: Failed to pin', error);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: currentPinned } : m));
    }
  }, []);

  const handleDeleteLocal = useCallback(async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    try {
      await MessageService.deleteMessage(messageId);
    } catch (error) {
      console.error('useChatMessages: Failed to delete local', error);
    }
  }, []);

  const handleDeleteForEveryone = useCallback((messageId: string) => {
    if (socket) {
      socket.emit('message.delete', { messageId, forEveryone: true });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m));
    }
  }, [socket]);

  const handleReact = useCallback(async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
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
          newReactions = [...currentReactions, { message_id: messageId, user_id: myId, emoji }];
        }
        return { ...m, reactions: newReactions };
      }
      return m;
    }));

    try {
      await MessageService.reactToMessage(messageId, emoji);
    } catch (error) {
      console.warn('useChatMessages: Failed to react', error);
    }
  }, [myId]);

  const handleMute = useCallback(async (isMuted: boolean) => {
    const oldStatus = isMuted;
    setIsMuted(isMuted);
    try {
      // Import dynamic or use ChatService from global (handled via types/service)
      // Since ChatService is not in hooks context properly, we'll implement the logic or use socket
      if (socket) {
        socket.emit('conversation.mute', { conversationId, isMuted }, (res: any) => {
          if (!res?.ok) {
            setIsMuted(!isMuted);
            Alert.alert('Gagal', 'Terjadi kesalahan saat membisukan percakapan.');
          }
        });
      }
    } catch (error) {
      console.warn('useChatMessages: Failed to mute', error);
      setIsMuted(!isMuted);
    }
  }, [socket, conversationId]);

  return {
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
    handleMute,
    isMuted,
    myId,
  };
};

export default useChatMessages;
