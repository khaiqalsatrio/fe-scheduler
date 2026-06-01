import apiClient from './apiClient';
import { Conversation, ChatListItem } from '../types/chat';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/Config';
import { TokenUtils } from '../utils/tokenUtils';

/**
 * Service to handle Conversation (Chat List) operations
 */
export const ChatService = {
  /**
   * Fetch all conversations for the current user
   */
  async getConversations(): Promise<ChatListItem[]> {
    const response = await apiClient.get<Conversation[]>('/conversations?includeArchived=true');
    const data = response.data;
    
    // Get current user ID to determine if the last message is ours
    let myId = null;
    try {
      const token = await SecureStore.getItemAsync(CONFIG.AUTH_TOKEN_KEY);
      if (token) {
        const payload = TokenUtils.decode(token);
        myId = payload?.sub || payload?.id;
      }
    } catch (e) {
      console.warn("Failed to get token for myId check", e);
    }

    // Clean Architecture: Map DTO (Data Transfer Object) to UI Domain Model
    return data
      .map((item) => {
        // If the last message was sent by us, we don't have unread messages
        const isLastMessageMine = myId && item.last_message?.sender_id === myId;
        const unreadCount = isLastMessageMine ? 0 : parseInt(item.unread_count?.toString() || '0', 10);

        return {
        id: item.id.toString(),
        name: item.title || item.recipient?.name || "User",
        lastMessage: item.last_message?.content || (item.last_message ? (() => {
          switch (item.last_message.type) {
            case 'image': return '📷 Foto';
            case 'video': return '🎥 Video';
            case 'voice': return '🎤 Pesan suara';
            case 'file': return '📄 Dokumen';
            case 'sticker': return 'Stiker';
            case 'location': return '📍 Lokasi';
            default: return `[${item.last_message.type}]`;
          }
        })() : ""),
        time: item.last_message?.created_at 
          ? new Date(item.last_message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) 
          : "Baru saja",
        timestamp: item.last_message?.created_at 
          ? new Date(item.last_message.created_at).getTime() 
          : new Date('2000-01-01').getTime(), // Default low value if no messages
        unreadCount,
        isOnline: item.is_online || false,
        avatar: item.photo_url || item.recipient?.avatar || undefined,
        isGroup: item.type === 'group',
        isPinned: !!item.pinned_at,
        isMuted: !!item.is_muted,
        isArchived: !!item.is_archived
      };
    });
  },

  /**
   * Delete a single conversation (Reset to a new one)
   */
  async deleteConversation(id: string): Promise<Conversation> {
    const response = await apiClient.delete<Conversation>(`/conversations/${id}`);
    return response.data;
  },

  /**
   * Delete multiple conversations (Bulk)
   */
  async deleteConversations(ids: string[]): Promise<void> {
    // In Clean Architecture, we handle complexity like bulk deletion here, not in the Screen
    await Promise.all(ids.map(id => this.deleteConversation(id)));
  },

  /**
   * Mute or unmute a conversation
   */
  async muteConversation(id: string, isMuted: boolean): Promise<any> {
    const response = await apiClient.put(`/conversations/${id}/mute`, { isMuted });
    return response.data;
  },

  /**
   * Mute multiple conversations (Bulk)
   */
  async muteConversations(ids: string[], isMuted: boolean): Promise<void> {
    await Promise.all(ids.map(id => this.muteConversation(id, isMuted)));
  },

  /**
   * Archive or unarchive a conversation
   */
  async archiveConversation(id: string, isArchived: boolean): Promise<any> {
    const response = await apiClient.put(`/conversations/${id}/archive`, { isArchived });
    return response.data;
  },

  /**
   * Archive multiple conversations (Bulk)
   */
  async archiveConversations(ids: string[], isArchived: boolean): Promise<void> {
    await Promise.all(ids.map(id => this.archiveConversation(id, isArchived)));
  },

  /**
   * Pin or unpin a conversation
   */
  async pinConversation(id: string, isPinned: boolean): Promise<any> {
    const response = await apiClient.put(`/conversations/${id}/pin`, { isPinned });
    return response.data;
  },

  /**
   * Pin multiple conversations (Bulk)
   */
  async pinConversations(ids: string[], isPinned: boolean): Promise<void> {
    await Promise.all(ids.map(id => this.pinConversation(id, isPinned)));
  },

  /**
   * Fetch all members of a group/conversation
   */
  async getGroupMembers(id: string): Promise<any[]> {
    const response = await apiClient.get(`/conversations/${id}/members`);
    return response.data;
  },

  /**
   * Update conversation info (title, avatar)
   */
  async updateGroupInfo(id: string, data: { title?: string, avatarUrl?: string }): Promise<any> {
    const response = await apiClient.patch(`/conversations/${id}`, data);
    return response.data;
  },

  /**
   * Add a member to a group
   */
  async addMember(id: string, userId: string): Promise<void> {
    await apiClient.post(`/conversations/${id}/members`, { userId });
  },

  /**
   * Remove a member or leave group
   */
  async removeMember(id: string, userId: string): Promise<void> {
    await apiClient.delete(`/conversations/${id}/members/${userId}`);
  },

  /**
   * Global search for messages
   */
  async globalSearch(query: string): Promise<any[]> {
    const response = await apiClient.get(`/messages/search/global?q=${encodeURIComponent(query)}`);
    const data = response.data;
    return Array.isArray(data) ? data : data.data || [];
  },

  /**
   * Search for users (potential recipients)
   */
  async searchUsers(query?: string): Promise<any[]> {
    // Menggunakan endpoint /users sesuai permintaan
    const response = await apiClient.get<any[]>('/users');
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).data || [];
  },

  /**
   * Create a new conversation (DM or Group)
   */
  async createConversation(type: 'dm' | 'group', title: string | null, participantIds: string): Promise<any> {
    const payload: any = { type };
    if (title) payload.title = title;

    const response = await apiClient.post('/conversations', payload);
    const conversation = response.data;

    if (participantIds && conversation.id) {
      const ids = participantIds.split(',');
      for (const id of ids) {
        if (id.trim()) {
          try {
            await apiClient.post(`/conversations/${conversation.id}/members`, { userId: id.trim(), role: 'member' });
          } catch (e) {
            console.warn(`Failed to add member ${id}:`, e);
          }
        }
      }
    }

    return conversation;
  },

  /**
   * Create or get existing DM with a user
   */
  async createOrGetDm(targetUserId: string): Promise<any> {
    const response = await apiClient.post('/conversations/dm', { targetUserId });
    return response.data;
  },

  /**
   * Forward a message to one or more conversations
   */
  async forwardMessage(messageId: string, conversationIds: string[]): Promise<any> {
    const response = await apiClient.post(`/messages/${messageId}/forward`, {
      conversationIds
    });
    return response.data;
  }
};

export default ChatService;
