import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { ProfileStep } from './ProfileStep';
import { ReferenceStep } from './ReferenceStep';
import { InterestStep } from './InterestStep';
import { TeraProcessing, TeraIntro } from './TeraScreens';
import { ConfirmModal } from '../ConfirmModal';

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
    <View style={[
      styles.onboardingOverlay,
      step === 6 && { backgroundColor: 'transparent' }
    ]}>
      {step === 6 && (
        <>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        </>
      )}
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

      <ConfirmModal
        visible={onboardingState.alertVisible}
        onClose={() => onboardingState.setAlertVisible(false)}
        onConfirm={() => onboardingState.setAlertVisible(false)}
        title={onboardingState.alertTitle}
        message={onboardingState.alertMessage}
        confirmText="OK"
        singleButton={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  onboardingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)', // Lighter overlay to match mockup
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  onboardingModal: {
    width: '85%', // Slightly narrower for better side margins
    backgroundColor: '#FFF',
    borderRadius: 40, // More rounded as per mockup
    padding: 24,
    // Removed overflow: 'hidden' to allow image to slide in from outside screen
    shadowOpacity: 0, // Removed shadow for clean look on blur
    shadowRadius: 0,
    elevation: 0, // Removed elevation for clean look on blur
  },
});
