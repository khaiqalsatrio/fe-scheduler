import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AuthService from '../services/authService';
import OnboardingService from '../services/onboardingService';

export const useOnboardingFlow = (email: string, password: string, onSuccess: () => void) => {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Hidden, 2: Isi Profil, 3: Pilih Referensi, 4: Pilih Interest, 5: Tera Processing, 6: Tera Intro
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [references, setReferences] = useState<any[]>([]);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // --- Custom Alert System ---
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title || 'Info');
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const fetchOnboardingData = async () => {
    try {
      const [refData, intData] = await Promise.all([
        OnboardingService.getReferences(),
        OnboardingService.getInterests()
      ]);
      setReferences(refData.data || []);
      setInterests(intData.data || []);
    } catch (error) {
      console.error('Failed to fetch onboarding data', error);
    }
  };

  const handleRegister = async () => {
    if (!fullName) {
      showAlert('Peringatan', 'Harap isi nama lengkap Anda.');
      return;
    }

    // Generate a username from email for registration
    const username = email.split('@')[0].toLowerCase() + Math.floor(Math.random() * 1000);

    setRegLoading(true);
    try {
      const data = await AuthService.register({
        email,
        password,
        name: fullName,
        username
      });

      // Backend returns the created user object (with `id`) on success — not {status/success}
      if (data.id) {
        // IMPORTANT: After successful registration, we MUST login to get the token
        // so that subsequent onboarding API calls are authorized.
        const loginResult = await AuthService.login(email, password);
        if (!loginResult?.token) {
          showAlert('Error', 'Registrasi berhasil tapi gagal login otomatis. Coba login manual.');
          return false;
        }
        return true;
      } else {
        showAlert('Pendaftaran Gagal', data.message || 'Mohon coba data lain.');
        return false;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mendaftarkan akun.';
      showAlert('Error', msg);
      return false;
    } finally {
      setRegLoading(false);
    }
  };

  const handleSaveProfile = async (isRegistering: boolean) => {
    if (!fullName || !role) {
      showAlert('Peringatan', 'Harap isi nama lengkap dan role pekerjaan Anda.');
      return;
    }

    setOnboardingLoading(true);
    try {
      if (isRegistering) {
        const registered = await handleRegister();
        if (!registered) {
          setOnboardingLoading(false);
          return;
        }
      }
      
      await AuthService.updateCurrentUser({ name: fullName, position: role, avatar });
      await fetchOnboardingData();
      setStep(3);
    } catch (error) {
      showAlert('Error', 'Gagal menyimpan profil.');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleSaveReferences = async () => {
    if (selectedReferences.length === 0) {
      showAlert('Peringatan', 'Pilih minimal satu referensi profesional.');
      return;
    }

    // Since the API requires references and interests together, we just move to the next step
    setStep(4);
  };

  const handleSaveInterests = async () => {
    if (selectedInterests.length === 0) {
      showAlert('Peringatan', 'Pilih minimal satu kategori interest.');
      return;
    }

    const mappedInterests = selectedInterests.map(name => {
      let category = 'Lain-lain';
      if (['Lari & outdoor', 'Fitness & kesehatan', 'Sports & kompetisi'].includes(name)) category = 'Olah Raga';
      else if (['Empati & komunikasi', 'Leadership & teamwork', 'Self-awareness'].includes(name)) category = 'Olah Rasa';
      else if (['Mindfulness'].includes(name)) category = 'Olah Ruh';
      
      return { category, sub_category: name };
    });

    setOnboardingLoading(true);
    try {
      // Find the names of selected references instead of IDs for the API (if selectedReferences contains IDs)
      const referenceNames = selectedReferences.map(id => {
        const ref = references.find(r => r.id === id);
        return ref ? ref.name : id;
      });

      await OnboardingService.submitOnboarding({
        references: referenceNames,
        interests: mappedInterests
      });
      
      setStep(5);
      setTimeout(() => {
        router.replace('/(tabs)/chats');
        setStep(6);
      }, 3000);
    } catch (error) {
      showAlert('Error', 'Gagal menyimpan interest.');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const toggleReference = (id: string) => {
    setSelectedReferences(prev => {
      if (prev.includes(id)) return prev.filter(refId => refId !== id);
      if (prev.length < 5) return [...prev, id];
      showAlert('Peringatan', 'Maksimal 5 referensi yang dapat dipilih.');
      return prev;
    });
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(id)) return prev.filter(intId => intId !== id);
      if (prev.length < 3) return [...prev, id];
      showAlert('Peringatan', 'Maksimal 3 interest yang dapat dipilih.');
      return prev;
    });
  };

  return {
    step,
    setStep,
    fullName,
    setFullName,
    role,
    setRole,
    avatar,
    setAvatar,
    references,
    selectedReferences,
    interests,
    selectedInterests,
    onboardingLoading,
    regLoading,
    handleSaveProfile,
    handleSaveReferences,
    handleSaveInterests,
    toggleReference,
    toggleInterest,
    alertVisible,
    setAlertVisible,
    alertTitle,
    alertMessage,
  };
};
