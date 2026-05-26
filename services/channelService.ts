import apiClient from './apiClient';

export interface ChannelMeta {
  count: number;
  page: number;
  total_page: number;
}

export interface ChannelData {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  lastMessage?: string;
  time?: string;
  joined?: boolean;
  memberCount?: number;
  unreadCount?: number;
  emoji?: string;
  color?: string;
  [key: string]: any; // Allow any other dynamic properties from backend
}

export interface ChannelApiResponse {
  status: boolean;
  message: string;
  data: ChannelData[];
  meta: ChannelMeta;
}

export const ChannelService = {
  /**
   * Fetches the list of channels from /conversations
   */
  async getChannels(): Promise<ChannelApiResponse> {
    try {
      // Fetch from conversations and filter out only those that might be considered "channels" (e.g. groups)
      const response = await apiClient.get('/conversations');
      const data = response.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.type,
        time: item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
        joined: true,
        memberCount: item.members?.length || 0,
        emoji: '💬',
        color: '#F1F5F9'
      }));
      
      return {
        status: true,
        message: 'Success',
        data: data,
        meta: { count: data.length, page: 1, total_page: 1 }
      };
    } catch (error) {
      console.error('ChannelService (getChannels): Error fetching channels', error);
      throw error;
    }
  },

  /**
   * Fetches the recommended channels (Mocked/Empty since removed in new API)
   */
  async getRecommendedChannels(): Promise<ChannelApiResponse> {
    try {
      // Removed from API docs, return empty
      return {
        status: true,
        message: 'Success',
        data: [],
        meta: { count: 0, page: 1, total_page: 1 }
      };
    } catch (error) {
      console.error('ChannelService (getRecommendedChannels): Error fetching recommended', error);
      throw error;
    }
  }
};
