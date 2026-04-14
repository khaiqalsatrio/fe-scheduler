import React, { createContext, useContext, useState } from 'react';
import { useOnboardingFlow as useOnboardingFlowHook } from '../hooks/useOnboardingFlow';
import { useRouter } from 'expo-router';

interface OnboardingContextType {
  // Identical to useOnboardingFlow return type
  step: number;
  setStep: (step: number) => void;
  fullName: string;
  setFullName: (name: string) => void;
  role: string;
  setRole: (role: string) => void;
  avatar?: string;
  setAvatar: (avatar?: string) => void;
  references: any[];
  selectedReferences: string[];
  interests: any[];
  selectedInterests: string[];
  onboardingLoading: boolean;
  regLoading: boolean;
  handleSaveProfile: (isRegistering: boolean) => Promise<void>;
  handleSaveReferences: () => Promise<void>;
  handleSaveInterests: () => Promise<void>;
  toggleReference: (id: string) => void;
  toggleInterest: (id: string) => void;
  alertVisible: boolean;
  setAlertVisible: (visible: boolean) => void;
  alertTitle: string;
  alertMessage: string;
  isRegistering: boolean;
  setIsRegistering: (val: boolean) => void;
  // Extra helper to set auth data from login screen
  prepareOnboarding: (email: string, password: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  
  const onboardingState = useOnboardingFlowHook(
    authData.email,
    authData.password,
    () => {
      router.replace('/(tabs)/chats');
    }
  );

  const prepareOnboarding = (email: string, password: string) => {
    setAuthData({ email, password });
  };

  return (
    <OnboardingContext.Provider value={{ ...onboardingState, prepareOnboarding, isRegistering, setIsRegistering }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
