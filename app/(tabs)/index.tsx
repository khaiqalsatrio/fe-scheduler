import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Platform, StatusBar, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AuthService from '../../services/authService';

const SLIDE_DATA = [
  {
    id: '1',
    image: require('../../assets/images/thedata.png'),
    title: 'AnalyFYON the Data.',
    desc: 'Olah data jadi insight yang jelas. Bantu ambil keputusan tanpa harus mikir lama.'
  },
  {
    id: '2',
    image: require('../../assets/images/thenoise.jpg'),
    title: 'ClariFYON the Noise.',
    desc: 'Ubah percakapan panjang jadi poin inti. Fokus ke hal yang benar-benar penting tanpa distraksi.'
  },
  {
    id: '3',
    image: require('../../assets/images/theflow.jpg'),
    title: 'SimpliFYON the Flow.',
    desc: 'Rapikan proses jadi lebih ringan dan terarah. Biar kerja jalan tanpa hambatan.'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();

  // States for Slider
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // States for Login Flow
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [step, setStep] = useState(0); // 0: Email, 1: Password
  const [secureText, setSecureText] = useState(true);

  // Tooltip States
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const tooltipFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -30, duration: 350, useNativeDriver: true })
      ]).start(() => {
        setCurrentIndex((prev) => (prev === SLIDE_DATA.length - 1 ? 0 : prev + 1));
        slideAnim.setValue(30); 
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true })
        ]).start();
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const validateEmailFormat = (text: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (showTooltip) {
      hideTooltip();
    }
  };

  const showValidationTooltip = () => {
    let message = "";
    if (email.length === 0) {
      message = "Mohon isi alamat email Anda.";
    } else if (!email.includes('@')) {
      message = `Sertakan '@' pada alamat email. '${email}' tidak memiliki '@'.`;
    } else {
      message = "Harap masukkan format email yang benar (contoh: nama@mail.com).";
    }

    setTooltipMessage(message);
    setShowTooltip(true);
    Animated.timing(tooltipFade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
  };

  const hideTooltip = () => {
    Animated.timing(tooltipFade, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true
    }).start(() => setShowTooltip(false));
  };

  const isButtonActive = email.length > 0;

  const goToPassword = () => {
    if (email.length === 0) {
      showValidationTooltip();
      return;
    }

    // Validasi format email sesungguhnya hanya saat tombol Klik Next
    if (!validateEmailFormat(email)) {
      showValidationTooltip();
      return;
    }

    setStep(1);
  };

  const goBackToEmail = () => {
    setStep(0);
    setPassword('');
  };

  const loginApp = async () => {
    if (!password) {
      Alert.alert('Gagal', 'Silakan isi password Anda');
      return;
    }

    setIsLoading(true);
    try {
      const data = await AuthService.login(email, password);
      
      if (data.token) {
        router.replace('/(tabs)/chats');
      } else {
        Alert.alert('Login Gagal', data.message || 'Harap periksa kembali kredensial Anda.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal menyambung ke server.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.jpg')}
          style={styles.logoImageLarge}
        />
        <TouchableOpacity style={styles.headerExploreBtn} activeOpacity={0.7} onPress={() => router.replace('/(tabs)/chats')}>
          <Text style={styles.headerExploreText}>Jelajahi Fitur</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.imagePlaceholder}>
            <Image source={SLIDE_DATA[currentIndex].image} style={styles.heroImage} resizeMode="contain" />
          </View>
          <View style={styles.textSection}>
            <Text style={styles.heroTitle}>{SLIDE_DATA[currentIndex].title}</Text>
            <Text style={styles.heroDesc}>{SLIDE_DATA[currentIndex].desc}</Text>
          </View>
        </Animated.View>

        <View style={styles.loginCard}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            
            {/* STEP 0: EMAIL INPUT */}
            {step === 0 && (
              <View>
                <View style={styles.inputWrapper}>
                  {showTooltip && (
                    <Animated.View style={[styles.tooltipContainer, { opacity: tooltipFade }]}>
                      <View style={styles.tooltipArrow} />
                      <View style={styles.tooltipContent}>
                        <View style={styles.warningIconContainer}>
                          <FontAwesome5 name="exclamation" size={12} color="#FFF" />
                        </View>
                        <Text style={styles.tooltipText}>{tooltipMessage}</Text>
                      </View>
                    </Animated.View>
                  )}
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.nextButton, !isButtonActive ? styles.buttonDisabled : styles.buttonActive]}
                  onPress={goToPassword}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 1: PASSWORD INPUT */}
            {step === 1 && (
              <View>
                <View style={styles.completedEmailBar}>
                  <TouchableOpacity onPress={goBackToEmail} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#333" />
                  </TouchableOpacity>
                  <View style={styles.emailTextContainer}>
                    <Text style={styles.completedEmailLabel}>Email</Text>
                    <Text style={styles.completedEmailValue}>{email}</Text>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Password"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={secureText}
                    />
                    <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                      <MaterialCommunityIcons name={secureText ? "eye-off" : "eye"} size={22} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.nextButton, styles.buttonActive, isLoading && styles.buttonLoading]}
                  onPress={loginApp}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextButtonText}>Masuk</Text>}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} activeOpacity={0.7} onPress={() => Alert.alert('Info', 'Login Google belum tersedia.')}>
              <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFD' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 25, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12, paddingBottom: 15,
  },
  logoImageLarge: { width: 44, height: 44, borderRadius: 22 },
  headerExploreBtn: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#EAEAEA' },
  headerExploreText: { fontSize: 13, fontWeight: '600', color: '#333' },
  scrollContent: { flexGrow: 1 },
  heroSection: { alignItems: 'center', paddingTop: 15, paddingHorizontal: 30, width: '100%' },
  imagePlaceholder: { width: '100%', height: 250, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  heroImage: { width: '100%', height: '100%' },
  textSection: { width: '100%', marginBottom: 30 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#111', marginBottom: 10 },
  heroDesc: { fontSize: 15, color: '#666', lineHeight: 22, fontWeight: '400' },
  loginCard: {
    backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 30, paddingTop: 40, paddingBottom: 50, flex: 1,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  inputWrapper: { marginBottom: 15, position: 'relative' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 12, height: 54, paddingHorizontal: 20, fontSize: 16, color: '#333' },
  
  // TOOLTIP STYLES
  tooltipContainer: {
    position: 'absolute', top: -50, left: 10, right: 10, zIndex: 99,
  },
  tooltipArrow: {
    width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#333',
    position: 'absolute', bottom: -8, left: 20,
  },
  tooltipContent: {
    backgroundColor: '#333', borderRadius: 4, paddingVertical: 8, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', elevation: 5,
  },
  warningIconContainer: {
    backgroundColor: '#F57C00', width: 18, height: 18, borderRadius: 2, 
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  tooltipText: { color: '#FFF', fontSize: 12, flex: 1, lineHeight: 16 },

  completedEmailBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 15,
  },
  backBtn: { marginRight: 10 },
  emailTextContainer: { flex: 1 },
  completedEmailLabel: { fontSize: 12, color: '#999', fontWeight: '600' },
  completedEmailValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  passwordInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12,
    height: 54, paddingHorizontal: 20,
  },
  passwordInput: { flex: 1, fontSize: 16, color: '#333' },
  eyeIcon: { padding: 5 },
  guideText: { fontSize: 12, color: '#999', marginTop: 10, lineHeight: 18 },
  nextButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#A8E6CF',
  },
  buttonDisabled: { backgroundColor: '#A8E6CF', opacity: 0.6 },
  buttonActive: {
    backgroundColor: '#27AE60',
  },
  buttonLoading: { opacity: 0.8 },
  nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  dividerText: { marginHorizontal: 15, color: '#999', fontSize: 14, fontWeight: '500' },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 54,
    borderRadius: 27, borderWidth: 1.5, borderColor: '#EAEAEA', backgroundColor: '#FFF',
  },
  googleIcon: { width: 22, height: 22, marginRight: 12 },
  googleButtonText: { fontSize: 16, fontWeight: '700', color: '#333' },
});
