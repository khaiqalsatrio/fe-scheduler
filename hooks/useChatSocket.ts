import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/Config';
import { TokenUtils } from '../utils/tokenUtils';

/**
 * Custom Hook to manage Socket.IO lifecycle for a specific conversation
 */
export const useChatSocket = (conversationId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [myId, setMyId] = useState<string>('');
  const myIdRef = useRef<string>('');

  useEffect(() => {
    let newSocket: Socket;

    const initSocket = async () => {
      const token = await SecureStore.getItemAsync(CONFIG.AUTH_TOKEN_KEY);
      if (!token) return;

      const userId = TokenUtils.getUserId(token);
      if (userId) {
        setMyId(userId);
        myIdRef.current = userId;
      }

      newSocket = io(CONFIG.SOCKET_URL, {
        transports: ['websocket'],
        auth: { token: `Bearer ${token}` }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        // Bergabung ke room percakapan khusus
        newSocket.emit('conversation.join', { conversationId });
        setSocket(newSocket);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err.message);
      });
    };

    initSocket();

    return () => {
      if (newSocket) {
        console.log('Cleaning up socket for conversation:', conversationId);
        newSocket.emit('conversation.leave', { conversationId });
        newSocket.disconnect();
      }
    };
  }, [conversationId]);

  return { socket, isConnected, myId, myIdRef };
};

export default useChatSocket;
