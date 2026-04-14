import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { ProfileStep } from './ProfileStep';
import { ReferenceStep } from './ReferenceStep';
import { InterestStep } from './InterestStep';
import { TeraProcessing, TeraIntro } from './TeraScreens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingOverlayProps {
  step: number;
  isRegistering: boolean;
  onboardingState: any; // Result from useOnboardingFlow
  onCancel: () => void;
  onComplete: () => void;
}

export const OnboardingOverlay = ({ step, isRegistering, onboardingState, onCancel, onComplete }: OnboardingOverlayProps) => {
  if (step < 2 || step > 6) return null;

  return (
    <View style={styles.onboardingOverlay}>
      <View style={[styles.onboardingModal, step === 4 && { maxHeight: '85%' }]}>
        {step === 2 && (
          <ProfileStep 
            fullName={onboardingState.fullName}
            setFullName={onboardingState.setFullName}
            role={onboardingState.role}
            setRole={onboardingState.setRole}
            isLoading={onboardingState.onboardingLoading || onboardingState.regLoading}
            onCancel={onCancel}
            onContinue={() => onboardingState.handleSaveProfile(isRegistering)}
          />
        )}

        {step === 3 && (
          <ReferenceStep 
            references={onboardingState.references}
            selectedReferences={onboardingState.selectedReferences}
            isLoading={onboardingState.onboardingLoading}
            onToggle={onboardingState.toggleReference}
            onBack={() => onboardingState.setStep(2)}
            onContinue={onboardingState.handleSaveReferences}
          />
        )}

        {step === 4 && (
          <InterestStep 
            selectedInterests={onboardingState.selectedInterests}
            isLoading={onboardingState.onboardingLoading}
            onToggle={onboardingState.toggleInterest}
            onBack={() => onboardingState.setStep(3)}
            onFinish={onboardingState.handleSaveInterests}
          />
        )}

        {step === 5 && <TeraProcessing />}
        
        {step === 6 && <TeraIntro onContinue={onComplete} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  onboardingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)', // Slightly darker for better focus
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  onboardingModal: {
    width: '85%', // Slightly narrower for better side margins
    backgroundColor: '#FFF',
    borderRadius: 32, // More rounded as per mockup
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, // Stronger shadow for depth
    shadowRadius: 18,
    elevation: 24,
  },
});
