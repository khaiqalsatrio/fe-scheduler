import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Image, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Send, CheckCircle2, Circle, User } from 'lucide-react-native';
import ChatService from '../services/chatService';

export default function ForwardSelectScreen() {
  const router = useRouter();
  const { messageId, content } = useLocalSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const data = await ChatService.getConversations();
      // UI expects raw DTO for forward, but we can reuse mapped data or raw
      // Let's use getConversations but make sure it has what we need
      setConversations(data);
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleForward = async () => {
    if (selectedIds.size === 0 || !messageId) return;
    
    setIsSending(true);
    try {
      await ChatService.forwardMessage(messageId as string, Array.from(selectedIds));
      router.back();
    } catch (error: any) {
      console.error('Forward error:', error);
      const msg = error.response?.data?.message || 'Gagal meneruskan pesan';
      Alert.alert('Gagal', msg);
    } finally {
      setIsSending(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.has(item.id);
    const displayName = item.name;
    const avatar = item.avatar;

    return (
      <TouchableOpacity 
        style={styles.chatItem} 
        onPress={() => toggleSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User color="#999" size={24} />
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{displayName}</Text>
          <Text style={styles.chatType}>{item.isGroup ? 'Grup' : 'Personal'}</Text>
        </View>
        <View style={styles.checkIcon}>
          {isSelected ? (
            <CheckCircle2 color="#25D366" size={24} />
          ) : (
            <Circle color="#DDD" size={24} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#333" size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Teruskan ke...</Text>
          <Text style={styles.headerSubtitle}>{selectedIds.size} terpilih</Text>
        </View>
        <TouchableOpacity 
          style={[styles.sendButton, selectedIds.size === 0 && styles.sendButtonDisabled]} 
          onPress={handleForward}
          disabled={selectedIds.size === 0 || isSending}
        >
          {isSending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Send color="#FFF" size={20} />
          )}
        </TouchableOpacity>
      </View>

      {content && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Pesan:</Text>
          <Text style={styles.previewText} numberOfLines={2}>{content}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#25D366" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    paddingHorizontal: 12,
    height: 72,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  previewContainer: {
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  previewLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  previewText: {
    fontSize: 14,
    color: '#444',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatType: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 10,
  },
});
