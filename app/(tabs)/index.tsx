import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, Platform, StatusBar, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Animated, Keyboard, KeyboardEvent } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AuthService from '../../services/authService';
import OnboardingService from '../../services/onboardingService';

// Modular Components
import { OnboardingHero } from '../../components/onboarding/OnboardingHero';
import { OnboardingOverlay } from '../../components/onboarding/OnboardingOverlay';

// Custom Hooks
import { useOnboarding } from '../../context/OnboardingContext';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: Email, 1: Password, (Steps 2+ handled by OnboardingOverlay)
  const [secureText, setSecureText] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Tooltip States
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const tooltipFade = useRef(new Animated.Value(0)).current;
  const keyboardHeightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        Animated.timing(keyboardHeightAnim, {
          toValue: e.endCoordinates.height + 15,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeightAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Onboarding Logic
  const onboardingState = useOnboarding();

  const validateEmailFormat = (text: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text);
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
        setIsRegistering(false);
        // Cek apakah user sudah mengisi onboarding
        const onboardingData = await OnboardingService.getOnboarding();
        if (onboardingData && onboardingData.id) {
          router.replace('/(tabs)/chats');
        } else {
          // Lanjut onboarding jika belum
          onboardingState.prepareOnboarding(email, password);
          onboardingState.setIsRegistering(false);
          onboardingState.setStep(2);
        }
      } else {
        const msg = String(data.message || '').toLowerCase();
        if (
          msg.includes('not found') || 
          msg.includes('tidak terdaftar') || 
          msg.includes('kredensial tidak valid') ||
          msg.includes('invalid credentials') ||
          msg.includes('unauthorized') ||
          msg.includes('incorrect') ||
          msg.includes('invalid')
        ) {
          setIsRegistering(true);
        } else {
          Alert.alert('Login Gagal', data.message || 'Harap periksa kembali kredensial Anda.');
        }
      }
    } catch (error: any) {
      const rawMessage = error.response?.data?.message || '';
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage);
      const lowerMessage = errorMessage.toLowerCase();
      if (
        lowerMessage.includes('not found') || 
        lowerMessage.includes('tidak terdaftar') || 
        lowerMessage.includes('kredensial tidak valid') ||
        lowerMessage.includes('invalid credentials') ||
        lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('incorrect') ||
        lowerMessage.includes('invalid')
      ) {
        setIsRegistering(true);
      } else {
        Alert.alert('Error', errorMessage || 'Gagal menyambung ke server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showValidationTooltip = () => {
    let message = email.length === 0 ? "Mohon isi alamat email Anda." : (!email.includes('@') ? `Sertakan '@' pada alamat email. '${email}' tidak memiliki '@'.` : "Harap masukkan format email yang benar.");
    setTooltipMessage(message);
    setShowTooltip(true);
    Animated.timing(tooltipFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const hideTooltip = () => {
    Animated.timing(tooltipFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowTooltip(false));
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (showTooltip) hideTooltip();
    setIsRegistering(false); // Reset status when typing a new email
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logoImageLarge} />
          <TouchableOpacity style={styles.headerExploreBtn} activeOpacity={0.7} onPress={() => router.replace('/(tabs)/chats')}>
            <Text style={styles.headerExploreText}>Jelajahi Fitur</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          <OnboardingHero />

          <View style={[styles.loginCard, { paddingBottom: Math.max(30, insets.bottom + 20) }]}>
            {onboardingState.step < 2 ? (
              <>
                {step === 0 && (
                  <View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={handleEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      {showTooltip && (
                        <Animated.View style={[styles.tooltipContainer, { opacity: tooltipFade }]}>
                          <View style={styles.tooltipContent}>
                            <View style={styles.warningIconContainer}>
                              <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#FFF" />
                            </View>
                            <Text style={styles.tooltipText}>{tooltipMessage}</Text>
                          </View>
                          <View style={styles.tooltipArrow} />
                        </Animated.View>
                      )}
                    </View>
                    <TouchableOpacity style={[styles.nextButton, email.length > 0 ? styles.buttonActive : styles.buttonDisabled]} onPress={() => validateEmailFormat(email) ? setStep(1) : showValidationTooltip()} activeOpacity={0.8}>
                      <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {step === 1 && (
                  <View>
                    <View style={styles.completedEmailBar}>
                      <TouchableOpacity onPress={() => setStep(0)} style={styles.backBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#333" />
                      </TouchableOpacity>
                      <View style={styles.emailTextContainer}>
                        <Text style={styles.completedEmailLabel}>Email</Text>
                        <Text style={styles.completedEmailValue}>{email}</Text>
                      </View>
                    </View>

                    <View style={styles.inputWrapper}>
                      <View style={styles.passwordInputContainer}>
                        <TextInput style={styles.passwordInput} placeholder="Password" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry={secureText} />
                        <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                          <MaterialCommunityIcons name={secureText ? "eye-off" : "eye"} size={22} color="#999" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.nextButton, styles.buttonActive, isLoading && styles.buttonLoading]}
                      onPress={isRegistering ? () => {
                        onboardingState.prepareOnboarding(email, password);
                        onboardingState.setIsRegistering(true);
                        onboardingState.setStep(2);
                      } : loginApp}
                    >
                      {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextButtonText}>{isRegistering ? 'Daftar' : 'Masuk'}</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} /><Text style={styles.dividerText}>or</Text><View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.googleButton} activeOpacity={0.7} onPress={() => Alert.alert('Info', 'Login Google belum tersedia.')}>
                  <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={styles.googleIcon} />
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>

          {onboardingState.step < 2 && isRegistering && (
            <View style={styles.registrationNoticeContainer}>
              <Text style={styles.registrationNoticeText}>
                Email belum terdaftar. Buat akun baru dengan password Anda.
              </Text>
            </View>
          )}
        </ScrollView>
        {Platform.OS === 'android' && (
          <Animated.View style={{ height: keyboardHeightAnim }} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 15, paddingBottom: 15 },
  logoImageLarge: { width: 44, height: 44, borderRadius: 12 },
  headerExploreBtn: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 25, borderWidth: 1, borderColor: '#EAEAEA' },
  headerExploreText: { fontSize: 13, fontWeight: '600', color: '#333' },
  scrollView: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { flexGrow: 1 },
  loginCard: {
    backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 30, paddingTop: 30, paddingBottom: 60, flexGrow: 1,
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.08, shadowRadius: 15
  },
  keyboardAvoidingView: { flexGrow: 1 },
  inputWrapper: { marginBottom: 20, position: 'relative' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 15, height: 56, paddingHorizontal: 20, fontSize: 16, color: '#333' },
  registrationNoticeContainer: { marginTop: -40, marginBottom: 40, paddingHorizontal: 30, alignItems: 'center' },
  registrationNoticeText: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },

  // TOOLTIP STYLES
  tooltipContainer: { position: 'absolute', top: -50, left: 10, right: 10, zIndex: 99 },
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

  completedEmailBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 20 },
  backBtn: { marginRight: 10 },
  emailTextContainer: { flex: 1 },
  completedEmailLabel: { fontSize: 12, color: '#999', fontWeight: '600' },
  completedEmailValue: { fontSize: 14, color: '#333', fontWeight: '500' },

  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, height: 56, paddingHorizontal: 20 },
  passwordInput: { flex: 1, fontSize: 16, color: '#333' },
  eyeIcon: { padding: 5 },

  nextButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#81D4A3', opacity: 0.6 },
  buttonActive: { backgroundColor: '#27AE60' },
  buttonLoading: { opacity: 0.8 },
  nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  dividerText: { marginHorizontal: 15, color: '#999', fontSize: 14, fontWeight: '500' },

  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: '#EAEAEA', backgroundColor: '#FFF' },
  googleIcon: { width: 22, height: 22, marginRight: 12 },
  googleButtonText: { fontSize: 16, fontWeight: '700', color: '#333' },
});
