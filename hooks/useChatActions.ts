import { Alert, Platform } from 'react-native';
import { Message } from '../types/chat';
import { MessageService } from '../services/messageService';
import { ChatService } from '../services/chatService';
import { useRouter } from 'expo-router';

interface UseChatActionsProps {
  id: string;
  name: string;
  myId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  handleSend: (text: string, replyTo?: Message | null) => Promise<void>;
  handleUpdate: (messageId: string, newText: string, oldText: string) => Promise<void>;
  handleDeleteLocal: (messageId: string) => void;
  handleDeleteForEveryone: (messageId: string) => void;
  setIsAiThinking: (val: boolean) => void;
  setIsAIActionsVisible: (val: boolean) => void;
  setIsSearchingLocalLoading: (val: boolean) => void;
  setLocalSearchResults: (results: any[]) => void;
  setReplyingTo: (msg: Message | null) => void;
  setEditingMessage: (msg: Message | null) => void;
  setIsMenuVisible: (val: boolean) => void;
  scrollToBottom: () => void;
}

export function useChatActions({
  id,
  name,
  myId,
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
}: UseChatActionsProps) {
  const router = useRouter();

  const onLocalSearch = async (query: string) => {
    setIsSearchingLocalLoading(true);
    try {
      const results = await MessageService.searchMessages(id, query);
      setLocalSearchResults(results);
    } catch (error) {
      console.warn('Local search error:', error);
    } finally {
      setIsSearchingLocalLoading(false);
    }
  };

  const onSendText = async (text: string, replyingTo: Message | null) => {
    await handleSend(text, replyingTo);
    setReplyingTo(null);
    scrollToBottom();
  };

  const onUpdateText = async (newText: string, editingMessage: Message | null) => {
    if (!editingMessage) return;
    await handleUpdate(editingMessage.id, newText, editingMessage.text);
    setEditingMessage(null);
  };

  const onFileSend = async (fileAsset: any, type: string) => {
    const clientId = Date.now().toString();
    const newMessage: Message = {
      id: clientId,
      conversation_id: id,
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
    scrollToBottom();

    try {
      const formData = new FormData();
      formData.append('conversationId', id);
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
      const resJson = await MessageService.triggerAiInsight(id);
      setIsAiThinking(false);
      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        conversation_id: id,
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
      setTimeout(scrollToBottom, 200);
    } catch (e) {
      setIsAiThinking(false);
      console.error("Tera AI error:", e);
    }
  };

  const onActionDelete = (selectedMessage: Message | null) => {
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
              const newConv = await ChatService.deleteConversation(id);
              router.replace({
                pathname: `/chat/${newConv.id}` as any,
                params: { name }
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

  return {
    onLocalSearch,
    onSendText,
    onUpdateText,
    onFileSend,
    onTeraAIAction,
    onActionDelete,
    handleResetChat
  };
}
