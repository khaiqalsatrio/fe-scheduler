import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Send, CheckCircle2, Circle, User } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

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
      const token = await SecureStore.getItemAsync('user_token');
      const response = await fetch('https://dev-ows-api.telkom-digital.id/v1/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setConversations(Array.isArray(data) ? data : data.data || []);
      }
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
    if (selectedIds.size === 0) return;
    
    setIsSending(true);
    try {
      const token = await SecureStore.getItemAsync('user_token');
      const response = await fetch(`https://dev-ows-api.telkom-digital.id/v1/messages/${messageId}/forward`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationIds: Array.from(selectedIds)
        })
      });

      if (response.ok) {
        Alert.alert('Berhasil', 'Pesan telah diteruskan');
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert('Gagal', errorData.message || 'Gagal meneruskan pesan');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat meneruskan pesan');
    } finally {
      setIsSending(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.has(item.id);
    const displayName = item.title || item.recipient?.name || 'User';
    const avatar = item.photo_url || item.recipient?.avatar;

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
          <Text style={styles.chatType}>{item.type === 'group' ? 'Grup' : 'Personal'}</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 65,
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
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
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
