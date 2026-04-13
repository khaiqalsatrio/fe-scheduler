import apiClient from './apiClient';
import { Conversation, ChatListItem } from '../types/chat';

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
    
    // Clean Architecture: Map DTO (Data Transfer Object) to UI Domain Model
    return data
      .map((item) => ({
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
        unreadCount: parseInt(item.unread_count?.toString() || '0', 10),
        isOnline: item.is_online || false,
        avatar: item.photo_url || item.recipient?.avatar || undefined,
        isGroup: item.type === 'group',
        isPinned: !!item.pinned_at,
        isMuted: !!item.is_muted,
        isArchived: !!item.is_archived
      }))
      .filter((chat) => chat.lastMessage !== "" || chat.unreadCount > 0 || chat.isPinned || chat.isArchived);
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
    const url = query ? `/users/recipients?q=${encodeURIComponent(query)}` : '/users/recipients?limit=100&page=1';
    const response = await apiClient.get<any[]>(url);
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).data || [];
  },

  /**
   * Create a new conversation (DM or Group)
   */
  async createConversation(type: 'dm' | 'group', title: string | null, participantIds: string): Promise<any> {
    const formData = new FormData();
    formData.append('type', type);
    if (title) formData.append('title', title);
    formData.append('participantIds', participantIds);

    const response = await apiClient.post('/conversations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
