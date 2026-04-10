import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Platform, StatusBar, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const ONBOARDING_DATA = [
  {
    id: '1',
    emoji: '👋',
    title: '#Kenalin Tera',
    subtitle: 'AI partner kamu di ITD Summit',
    desc: 'Bantu ubah diskusi jadi insight dan dokumen siap pakai',
  },
  {
    id: '2',
    emoji: '💰',
    title: '#Dari panjang jadi kepake',
    subtitle: 'Insight dalam hitungan detik',
    desc: 'Ringkas sesi dan ambil poin penting tanpa baca ulang',
  },
  {
    id: '3',
    emoji: '🎯',
    title: '#Fokus pada substansi',
    subtitle: 'Biar Tera yang mencatat',
    desc: 'Jangan terlewat detail penting saat rapat',
  },
  {
    id: '4',
    emoji: '🚀',
    title: '#Lebih produktif',
    subtitle: 'Aksi nyata setelah diskusi',
    desc: 'Dapatkan action items secara otomatis',
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  
  // States for Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // States for Slider
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const slideWidth = width - 40; // Subtract paddingHorizontal of the container
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= ONBOARDING_DATA.length) {
        nextIndex = 0;
      }
      scrollViewRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true });
    }, 2500);

    return () => clearInterval(timer);
  }, [currentIndex, slideWidth]);

  useEffect(() => {
    // KONFIGURASI GOOGLE SIGN IN
    // Anda WAJIB mengganti 'webClientId' di bawah dengan yang ada di Google Cloud Console Anda!
    GoogleSignin.configure({
      webClientId: 'MASUKKAN_WEB_CLIENT_ID_ANDA_DISINI.apps.googleusercontent.com', 
      offlineAccess: true, 
      forceCodeForRefreshToken: true,
    });
  }, []);

  const navigateToHome = () => {
    router.replace('/(tabs)/chats');
  };

  // --- Fungsi Login Biasa ---
  const loginApp = async () => {
    if (!email || !password) {
      Alert.alert('Gagal', 'Silakan isi email dan password terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://dev-ows-api.telkom-digital.id/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token || data.access_token || data?.data?.token;

        if (token) {
          await SecureStore.setItemAsync('user_token', token);
          console.log("Login sukses dan token tersimpan!");
          navigateToHome();
        } else {
           Alert.alert('Sukses Login', 'Namun tidak mendapatkan token dari API');
        }
      } else {
        Alert.alert('Login Gagal', data.message || 'Harap periksa kembali kredensial Anda.');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal menyambung ke server.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fungsi Login Menggunakan Google ---
  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      console.log('Memulai proses Google Sign-In...');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleTokenObj = await GoogleSignin.getTokens();
      
      const googleIdToken = googleTokenObj.idToken;

      const response = await fetch('https://dev-ows-api.telkom-digital.id/v1/oauth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_token: googleIdToken
        }), 
      });

      const data = await response.json();

      if (response.ok) {
        const backendToken = data.token || data.access_token || data?.data?.token;
        if (backendToken) {
           await SecureStore.setItemAsync('user_token', backendToken);
           console.log("Login Google sukses!");
           navigateToHome();
        } else {
           Alert.alert('Gagal Validasi', 'Server tidak membalas dengan token login.');
        }
      } else {
        Alert.alert('Gagal Login dengan Google', data.message || 'Verifikasi gagal di server.');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User menekan cancel pada dialog google sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Info', 'Proses Login Google sedang berlangsung');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services tidak tersedia di perangkat ini.');
      } else {
        Alert.alert('Error', 'Gagal menghubungkan dengan Google.');
        console.error('Google Sign In Error:', error);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / slideWidth);
    if (currentIndex !== index) {
      setCurrentIndex(index);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Left Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.exploreBtn} activeOpacity={0.7} onPress={navigateToHome}>
            <Text style={styles.exploreBtnText}>Jelajahi Fitur</Text>
          </TouchableOpacity>
        </View>

        {/* Content Centered */}
        <View style={styles.content}>
          <View style={{ width: '100%' }}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingTop: 10 }}
            >
              {ONBOARDING_DATA.map((item) => (
                <View key={item.id} style={{ width: slideWidth, alignItems: 'center' }}>
                  <View style={styles.illustrationContainer}>
                    <Text style={styles.illustrationEmoji}>{item.emoji}</Text>
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{item.title}</Text>
                    <Text style={styles.subtitleText}>{item.subtitle}</Text>
                    <Text style={styles.descText}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {ONBOARDING_DATA.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  currentIndex === index && styles.progressDotActive
                ]}
              />
            ))}
          </View>

          {/* Inputs & Buttons */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.nextButton, isLoading && styles.buttonDisabled]}
              activeOpacity={0.8}
              onPress={loginApp}
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.nextButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, isGoogleLoading && styles.buttonDisabled]}
              activeOpacity={0.7}
              onPress={loginWithGoogle}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Image
                    source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Image
            source={require('../assets/images/logo.jpg')}
            style={styles.logoImage}
          />
          <Text style={styles.versionText}>v1.4.1</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFD', // Light greyish background as in image
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 15,
  },
  exploreBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  exploreBtnText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 20,
    marginTop: -80, // slightly adjust vertical center as before but with space
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  textContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F9D58', // Green color
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  progressDot: {
    flex: 1,
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#0F9D58',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  nextButton: {
    backgroundColor: '#74C69D', // Light green matches image
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAEAEA',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 24,
    paddingVertical: 14,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});
