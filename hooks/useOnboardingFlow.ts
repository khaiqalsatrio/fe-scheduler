import { useState } from 'react';
import { Alert } from 'react-native';
import AuthService from '../services/authService';
import OnboardingService from '../services/onboardingService';

export const useOnboardingFlow = (email: string, password: string, onSuccess: () => void) => {
  const [step, setStep] = useState(2); // 2: Isi Profil, 3: Pilih Referensi, 4: Pilih Interest, 5: Tera Processing, 6: Tera Intro
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [references, setReferences] = useState<any[]>([]);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

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
    const finalPhone = `+628${Math.floor(Math.random() * 1000000000)}`;
    const finalNik = `3201${Math.floor(Math.random() * 10000000000)}`;
    const finalCompany = "Digital Asset";

    if (!fullName) {
      Alert.alert('Peringatan', 'Harap isi nama lengkap Anda.');
      return;
    }

    setRegLoading(true);
    try {
      const data = await AuthService.register({
        email,
        password,
        name: fullName,
        phone: finalPhone,
        nik: finalNik,
        company: finalCompany
      });

      if (data.status || data.success) {
        return true;
      } else {
        Alert.alert('Pendaftaran Gagal', data.message || 'Mohon coba data lain.');
        return false;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mendaftarkan akun.';
      Alert.alert('Error', msg);
      return false;
    } finally {
      setRegLoading(false);
    }
  };

  const handleSaveProfile = async (isRegistering: boolean) => {
    if (!fullName || !role) {
      Alert.alert('Peringatan', 'Harap isi nama lengkap dan role pekerjaan Anda.');
      return;
    }

    setOnboardingLoading(true);
    try {
      if (isRegistering) {
        const registered = await handleRegister();
        if (!registered) return;
      }
      
      await OnboardingService.saveStep1({ name: fullName, position: role, avatar });
      await fetchOnboardingData();
      setStep(3);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan profil.');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleSaveReferences = async () => {
    if (selectedReferences.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal satu referensi profesional.');
      return;
    }

    setOnboardingLoading(true);
    try {
      await OnboardingService.saveStep2(selectedReferences);
      setStep(4);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan referensi.');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleSaveInterests = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal satu kategori interest.');
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
      await OnboardingService.saveStep3(mappedInterests);
      setStep(5);
      setTimeout(() => setStep(6), 3000);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan interest.');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const toggleReference = (id: string) => {
    setSelectedReferences(prev => {
      if (prev.includes(id)) return prev.filter(refId => refId !== id);
      if (prev.length < 5) return [...prev, id];
      Alert.alert('Peringatan', 'Maksimal 5 referensi yang dapat dipilih.');
      return prev;
    });
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(id)) return prev.filter(intId => intId !== id);
      if (prev.length < 3) return [...prev, id];
      Alert.alert('Peringatan', 'Maksimal 3 interest yang dapat dipilih.');
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
  };
};
