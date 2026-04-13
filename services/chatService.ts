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
    const response = await apiClient.get<Conversation[]>('/conversations');
    const data = response.data;
    
    // Clean Architecture: Map DTO (Data Transfer Object) to UI Domain Model
    return data
      .map((item) => ({
        id: item.id.toString(),
        name: item.title || item.recipient?.name || "User",
        lastMessage: item.last_message?.content || (item.last_message ? `[${item.last_message.type}]` : ""),
        time: item.last_message?.created_at 
          ? new Date(item.last_message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) 
          : "Baru saja",
        unreadCount: parseInt(item.unread_count?.toString() || '0', 10),
        isOnline: item.is_online || false,
        avatar: item.photo_url || item.recipient?.avatar || undefined,
        isGroup: item.type === 'group',
        isPinned: !!item.pinned_at
      }))
      .filter((chat) => chat.lastMessage !== "" || chat.unreadCount > 0 || chat.isPinned);
  },

  /**
   * Delete a single conversation
   */
  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`/conversations/${id}`);
  },

  /**
   * Delete multiple conversations (Bulk)
   */
  async deleteConversations(ids: string[]): Promise<void> {
    // In Clean Architecture, we handle complexity like bulk deletion here, not in the Screen
    await Promise.all(ids.map(id => this.deleteConversation(id)));
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
