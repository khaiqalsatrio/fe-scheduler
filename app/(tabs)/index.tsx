import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Platform, StatusBar, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AuthService from '../../services/authService';
import OnboardingService from '../../services/onboardingService';

<<<<<<< HEAD
// Modular Components
import { OnboardingHero } from '../../components/onboarding/OnboardingHero';
import { OnboardingOverlay } from '../../components/onboarding/OnboardingOverlay';

// Custom Hooks
import { useOnboardingFlow } from '../../hooks/useOnboardingFlow';
=======
const SLIDE_DATA = [
  {
    id: '1',
    image: require('../../assets/images/bikindokumen.png'),
    title: 'Bikin dokumen jadi sat set',
    desc: 'Dari chat langsung jadi slide atau dokumen. Gak perlu mulai dari nol.'
  },
  {
    id: '2',
    image: require('../../assets/images/olahdata.png'),
    title: 'Analisa data tanpa pusing',
    desc: 'Tera bantu pecahin data jadi insight yang gampang kamu pahami dan pakai.'
  },
  {
    id: '3',
    image: require('../../assets/images/rapihinkerja.png'),
    title: 'Rapihin kerjaan, biar gak ribet',
    desc: 'Semua flow dan info bisa kamu rapihin langsung di chat. Lebih jelas, lebih cepat.'
  }
];
>>>>>>> 049d75b8c7ba46fec3daffbaccde5396f6a98fbe

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
<<<<<<< HEAD
        <OnboardingHero />
=======
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.imagePlaceholder}>
            <View style={styles.circularMask}>
              <Image source={SLIDE_DATA[currentIndex].image} style={styles.heroImage} resizeMode="cover" />
            </View>
          </View>
          <View style={styles.textSection}>
            <Text style={styles.heroTitle}>{SLIDE_DATA[currentIndex].title}</Text>
            <Text style={styles.heroDesc}>{SLIDE_DATA[currentIndex].desc}</Text>
          </View>
        </Animated.View>
>>>>>>> 049d75b8c7ba46fec3daffbaccde5396f6a98fbe

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
<<<<<<< HEAD
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
=======
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 25, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12, paddingBottom: 15,
  },
  logoImageLarge: { width: 44, height: 44, borderRadius: 12 },
  headerExploreBtn: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 25, borderWidth: 1, borderColor: '#EAEAEA' },
  headerExploreText: { fontSize: 13, fontWeight: '600', color: '#333' },
  scrollContent: { flexGrow: 1 },
  heroSection: { alignItems: 'center', paddingTop: 10, paddingHorizontal: 30, width: '100%' },
  imagePlaceholder: { width: '100%', height: 320, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  circularMask: {
    width: 300,
    height: 300,
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
    borderBottomRightRadius: 150,
    borderBottomLeftRadius: 40,
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },
  textSection: { width: '100%', marginBottom: 20, alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#111', marginBottom: 12, textAlign: 'center' },
  heroDesc: { fontSize: 14, color: '#666', lineHeight: 20, fontWeight: '400', textAlign: 'center', paddingHorizontal: 10 },
  loginCard: {
    backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 30, paddingTop: 40, paddingBottom: 60, flex: 1,
    elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.08, shadowRadius: 15,
  },
  inputWrapper: { marginBottom: 20, position: 'relative' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 15, height: 56, paddingHorizontal: 20, fontSize: 16, color: '#333' },
  
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
    borderRadius: 15, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 20,
  },
>>>>>>> 049d75b8c7ba46fec3daffbaccde5396f6a98fbe
  backBtn: { marginRight: 10 },
  emailTextContainer: { flex: 1 },
  completedEmailLabel: { fontSize: 12, color: '#999', fontWeight: '600' },
  completedEmailValue: { fontSize: 14, color: '#333', fontWeight: '500' },
<<<<<<< HEAD
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, height: 54, paddingHorizontal: 20 },
  passwordInput: { flex: 1, fontSize: 16, color: '#333' },
  eyeIcon: { padding: 5 },
  nextButton: { height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#A8E6CF', opacity: 0.6 },
  buttonActive: { backgroundColor: '#27AE60' },
=======
  passwordInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15,
    height: 56, paddingHorizontal: 20,
  },
  passwordInput: { flex: 1, fontSize: 16, color: '#333' },
  eyeIcon: { padding: 5 },
  nextButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#81D4A3',
  },
  buttonDisabled: { backgroundColor: '#81D4A3', opacity: 0.6 },
  buttonActive: {
    backgroundColor: '#81D4A3',
  },
>>>>>>> 049d75b8c7ba46fec3daffbaccde5396f6a98fbe
  buttonLoading: { opacity: 0.8 },
  nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  dividerText: { marginHorizontal: 15, color: '#999', fontSize: 14, fontWeight: '500' },
<<<<<<< HEAD
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 54, borderRadius: 27, borderWidth: 1.5, borderColor: '#EAEAEA', backgroundColor: '#FFF' },
=======
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56,
    borderRadius: 28, borderWidth: 1.5, borderColor: '#EAEAEA', backgroundColor: '#FFF',
  },
>>>>>>> 049d75b8c7ba46fec3daffbaccde5396f6a98fbe
  googleIcon: { width: 22, height: 22, marginRight: 12 },
  googleButtonText: { fontSize: 16, fontWeight: '700', color: '#333' },
});
