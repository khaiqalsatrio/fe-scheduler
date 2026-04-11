import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token) {
        console.log('Expo Push Token:', token);
        // TODO: Send this token to your backend
        // syncTokenWithBackend(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      console.log('Notification Response:', response);
      // Handle notification interaction here
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Push notification tidak didukung di iOS Simulator
  if (Platform.OS === 'ios' && !Device.isDevice) {
    console.log('Sistem: Push Notifications tidak didukung di iOS Simulator.');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Gagal mendapatkan izin untuk Push Notification!');
    return;
  }
  
  try {
    const projectId = 
      Constants?.expoConfig?.extra?.eas?.projectId ?? 
      Constants?.easConfig?.projectId;
      
    if (!projectId) {
      console.warn('Project ID tidak ditemukan di app.json. Push token mungkin tidak bisa didapatkan.');
    }

    token = (await Notifications.getExpoPushTokenAsync({
      projectId,
    })).data;
    
    console.log('Berhasil mendapatkan Push Token:', token);
  } catch (e) {
    console.error('Error saat mengambil push token:', e);
    if (!Device.isDevice) {
      console.log('Catatan: Jika Anda menggunakan emulator, pastikan emulator memiliki Google Play Services.');
    }
  }

  return token;
}
