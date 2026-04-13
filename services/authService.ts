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
  async login(username: string, password: string): Promise<any> {
    const response = await apiClient.post('/login', { username, password });
    const data = response.data;
    
    // Check multiple possible paths for the token (matching original logic)
    const token = data.token || data.access_token || data?.data?.token;
    
    if (token) {
      await SecureStore.setItemAsync(CONFIG.AUTH_TOKEN_KEY, token);
      // Ensure the returned data has the token at the root for index.tsx check
      return { ...data, token };
    }
    
    return data;
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
    
    const payload = TokenUtils.decode(token);
    if (!payload) return null;
    
    return {
      id: payload.id,
      name: payload.name || payload.username || 'User',
      username: payload.username,
      email: payload.email,
      position: payload.position || payload.role,
      avatar: payload.avatar || payload.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80',
      nik: payload.nik,
    };
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
