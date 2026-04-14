import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';

interface ProfileStepProps {
  fullName: string;
  setFullName: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  isLoading: boolean;
  onCancel: () => void;
  onContinue: () => void;
}

export const ProfileStep = ({ fullName, setFullName, role, setRole, isLoading, onCancel, onContinue }: ProfileStepProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.onboardingTitle}>Isi Profil</Text>
      <Text style={styles.onboardingStepText}>Step 1 dari 3</Text>

      <View style={styles.avatarContainer}>
        <TouchableOpacity style={styles.avatarRedCircle} activeOpacity={0.7}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.avatarLogoInCircle}
          />
        </TouchableOpacity>
        <Text style={styles.uploadTextGreen}>Upload Photo</Text>
      </View>

      <View style={styles.inputFieldContainer}>
        <Text style={styles.inputLabel}>Nama Lengkap *</Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="Nama lengkap"
          placeholderTextColor="#999"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View style={styles.inputFieldContainer}>
        <Text style={styles.inputLabel}>Role / Pekerjaan *</Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="product manejer, engineer, designer, dll"
          placeholderTextColor="#999"
          value={role}
          onChangeText={setRole}
        />
      </View>

      <View style={styles.onboardingActionRow}>
        <TouchableOpacity style={styles.secondaryActionBtn} onPress={onCancel}>
          <Text style={styles.secondaryActionText}>Batal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryActionBtn, isLoading && styles.buttonLoading]}
          onPress={onContinue}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryActionText}>Lanjut</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  onboardingTitle: { fontSize: 22, fontWeight: '800', color: '#002B49', marginBottom: 2 },
  onboardingStepText: { fontSize: 13, color: '#666', fontWeight: '500', marginBottom: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatarRedCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  avatarLogoInCircle: { width: 60, height: 60, borderRadius: 30 },
  uploadTextGreen: { fontSize: 14, fontWeight: '700', color: '#27AE60', marginTop: 10 },
  inputFieldContainer: { marginBottom: 18 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8, marginLeft: 2 },
  fieldInput: { backgroundColor: '#F3F4F6', borderRadius: 15, height: 52, paddingHorizontal: 18, fontSize: 15, color: '#333' },
  onboardingActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  secondaryActionBtn: { flex: 1, height: 52, borderRadius: 15, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  secondaryActionText: { fontSize: 16, fontWeight: '700', color: '#666' },
  primaryActionBtn: { flex: 1.2, height: 52, borderRadius: 15, backgroundColor: '#27AE60', justifyContent: 'center', alignItems: 'center' },
  primaryActionText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  buttonLoading: { opacity: 0.8 },
});
