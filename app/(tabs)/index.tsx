import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Platform, StatusBar, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AuthService from '../../services/authService';
import OnboardingService from '../../services/onboardingService';

// Modular Components
import { OnboardingHero } from '../../components/onboarding/OnboardingHero';
import { OnboardingOverlay } from '../../components/onboarding/OnboardingOverlay';

// Custom Hooks
import { useOnboardingFlow } from '../../hooks/useOnboardingFlow';

export default function OnboardingScreen() {
  const router = useRouter();
  
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

  // Onboarding Logic
  const onboardingState = useOnboardingFlow(email, password, () => {
    router.replace('/(tabs)/chats');
  });

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
        const statusData = await OnboardingService.getStatus();
        if (statusData.data?.onboarding_completed) {
          router.replace('/(tabs)/chats');
        } else {
          onboardingState.setStep(2);
        }
      } else {
        const msg = data.message?.toLowerCase() || '';
        if (msg.includes('not found') || msg.includes('tidak terdaftar') || msg.includes('kredensial tidak valid')) {
          setIsRegistering(true);
        } else {
          Alert.alert('Login Gagal', data.message || 'Harap periksa kembali kredensial Anda.');
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('tidak terdaftar') || errorMessage.toLowerCase().includes('kredensial tidak valid')) {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logoImageLarge} />
        <TouchableOpacity style={styles.headerExploreBtn} activeOpacity={0.7} onPress={() => router.replace('/(tabs)/chats')}>
          <Text style={styles.headerExploreText}>Jelajahi Fitur</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OnboardingHero />

        <View style={styles.loginCard}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            
            {onboardingState.step === 2 && isRegistering && onboardingState.step === 2 ? null : (
               <>
                {step === 0 && (
                  <View>
                    <View style={styles.inputWrapper}>
                      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
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
                      onPress={isRegistering ? () => onboardingState.setStep(2) : loginApp}
                    >
                      {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextButtonText}>{isRegistering ? 'Daftar' : 'Masuk'}</Text>}
                    </TouchableOpacity>
                  </View>
                )}
               </>
            )}

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} /><Text style={styles.dividerText}>or</Text><View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} activeOpacity={0.7} onPress={() => Alert.alert('Info', 'Login Google belum tersedia.')}>
              <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>

      <OnboardingOverlay 
        step={onboardingState.step}
        isRegistering={isRegistering}
        onboardingState={onboardingState}
        onCancel={() => onboardingState.setStep(1)}
        onComplete={() => router.replace('/(tabs)/chats')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFD' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12, paddingBottom: 15 },
  logoImageLarge: { width: 44, height: 44, borderRadius: 22 },
  headerExploreBtn: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#EAEAEA' },
  headerExploreText: { fontSize: 13, fontWeight: '600', color: '#333' },
  scrollContent: { flexGrow: 1 },
  loginCard: { backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 40, paddingBottom: 50, flex: 1, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10 },
  inputWrapper: { marginBottom: 15, position: 'relative' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 12, height: 54, paddingHorizontal: 20, fontSize: 16, color: '#333' },
  completedEmailBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 15 },
  backBtn: { marginRight: 10 },
  emailTextContainer: { flex: 1 },
  completedEmailLabel: { fontSize: 12, color: '#999', fontWeight: '600' },
  completedEmailValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, height: 54, paddingHorizontal: 20 },
  passwordInput: { flex: 1, fontSize: 16, color: '#333' },
  eyeIcon: { padding: 5 },
  nextButton: { height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#A8E6CF', opacity: 0.6 },
  buttonActive: { backgroundColor: '#27AE60' },
  buttonLoading: { opacity: 0.8 },
  nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  dividerText: { marginHorizontal: 15, color: '#999', fontSize: 14, fontWeight: '500' },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 54, borderRadius: 27, borderWidth: 1.5, borderColor: '#EAEAEA', backgroundColor: '#FFF' },
  googleIcon: { width: 22, height: 22, marginRight: 12 },
  googleButtonText: { fontSize: 16, fontWeight: '700', color: '#333' },
});
