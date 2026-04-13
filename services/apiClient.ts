import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/Config';

/**
 * Central API Client using Axios
 * Automatically handles:
 * 1. Base URL prefixing
 * 2. Bearer Token injection from SecureStore
 * 3. Consistent Error Handling
 */
const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject token before request is sent
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync(CONFIG.AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('API Client: Error fetching token from SecureStore', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle global errors (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with non-2xx status
      console.warn(`API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.warn('Network Error: No response received from server');
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
