import apiClient from './apiClient';
import { Message } from '../types/chat';

/**
 * Service to handle Message operations (HTTP)
 */
export const MessageService = {
  /**
   * Fetch message history for a conversation
   */
  async getMessages(conversationId: string, cursor?: string, limit = 20): Promise<{ messages: any[], conversation: any }> {
    let url = `/messages/${conversationId}?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Send a new message (text or media)
   */
  async sendMessage(formData: FormData): Promise<any> {
    const response = await apiClient.post('/messages', formData);
    return response.data;
  },

  /**
   * Update message content (Edit)
   */
  async editMessage(messageId: string, content: string): Promise<any> {
    const response = await apiClient.put(`/messages/${messageId}`, { content });
    return response.data;
  },

  /**
   * Pin or unpin a message
   */
  async pinMessage(messageId: string, isPinned: boolean): Promise<any> {
    const response = await apiClient.put(`/messages/${messageId}/pin`, { isPinned });
    return response.data;
  },

  /**
   * Delete message locally for the user
   */
  async deleteMessage(messageId: string): Promise<any> {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  },

  /**
   * Add or toggle reaction to a message
   */
  async reactToMessage(messageId: string, emoji: string): Promise<any> {
    const response = await apiClient.post(`/messages/${messageId}/reactions`, { reaction: emoji });
    return response.data;
  },

  /**
   * Mark all messages in a conversation as read
   */
  async markAsRead(conversationId: string): Promise<any> {
    const response = await apiClient.put('/messages/read', { conversationId });
    return response.data;
  },

  /**
   * Local search messages within a conversation
   */
  async searchMessages(conversationId: string, query: string): Promise<any[]> {
    const response = await apiClient.get(`/messages/search/${conversationId}?q=${encodeURIComponent(query)}`);
    const data = response.data;
    return Array.isArray(data) ? data : data.data || [];
  },

  /**
   * Global search messages across all conversations
   */
  async searchGlobalMessages(query: string): Promise<any[]> {
    const response = await apiClient.get(`/messages/search/global?q=${encodeURIComponent(query)}`);
    const data = response.data;
    return Array.isArray(data) ? data : data.data || [];
  },

  /**
   * Trigger AI Action (Tera AI)
   */
  async triggerAiInsight(conversationId: string): Promise<any> {
    const response = await apiClient.post(`/ai-insight/document/${conversationId}`);
    return response.data;
  },

  /**
   * Fetch group members
   */
  async getMembers(conversationId: string): Promise<any[]> {
    const response = await apiClient.get(`/conversations/${conversationId}/members`);
    return response.data;
  }
};

export default MessageService;
