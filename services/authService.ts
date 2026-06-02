import apiClient from './apiClient';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/Config';
import { TokenUtils } from '../utils/tokenUtils';

/**
 * Service to handle Authentication operations
 */
export const AuthService = {
  /**
   * Login with username and password
   */
  async login(email: string, password: string): Promise<any> {
    const response = await apiClient.post('/auth/login', { email, password });
    const data = response.data;
    
    // Check multiple possible paths for the token (matching original logic)
    const token = data.accessToken || data.token || data.access_token || data?.data?.token;
    
    if (token) {
      await SecureStore.setItemAsync(CONFIG.AUTH_TOKEN_KEY, token);
      // Ensure the returned data has the token at the root for index.tsx check
      return { ...data, token };
    }
    
    return data;
  },

  /**
   * Register a new user
   */
  async register(data: { 
    email: string; 
    password: string; 
    name: string; 
    username: string;
  }): Promise<any> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(CONFIG.AUTH_TOKEN_KEY);
  },

  /**
   * Get current user info from stored token
   */
  async getCurrentUser() {
    const token = await SecureStore.getItemAsync(CONFIG.AUTH_TOKEN_KEY);
    if (!token) return null;
    
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      // Fallback to token decode if API fails
      const payload = TokenUtils.decode(token);
      if (!payload) return null;
      
      return {
        id: payload.sub || payload.id,
        name: payload.name || payload.username || 'User',
        username: payload.username,
        email: payload.email,
        position: payload.position || payload.role,
        avatar: payload.avatar || payload.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80',
        nik: payload.nik,
      };
    }
  },

  /**
   * Update current user info
   */
  async updateCurrentUser(data: Partial<{
    email: string;
    name: string;
    username: string;
    company: string;
    phone: string;
    nik: string;
    avatar: string;
    position: string;
  }>) {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },

  /**
   * Update current user avatar
   */
  async updateAvatar(uri: string, mimeType: string = 'image/jpeg', fileName: string = 'avatar.jpeg') {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(CONFIG.AUTH_TOKEN_KEY);
    return !!token;
  }
};

export default AuthService;
