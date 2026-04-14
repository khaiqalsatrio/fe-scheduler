import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

interface InterestStepProps {
  selectedInterests: string[];
  isLoading: boolean;
  onToggle: (name: string) => void;
  onBack: () => void;
  onFinish: () => void;
}

export const InterestStep = ({ selectedInterests, isLoading, onToggle, onBack, onFinish }: InterestStepProps) => {
  const groups = [
    {
      label: 'Olah Raga',
      items: [
        { name: 'Lari & outdoor', icon: '🏃‍♂️' },
        { name: 'Fitness & kesehatan', icon: '💪' },
        { name: 'Sports & kompetisi', icon: '🏆' }
      ]
    },
    {
      label: 'Olah Rasa',
      items: [
        { name: 'Empati & komunikasi', icon: '🤝' },
        { name: 'Leadership & teamwork', icon: '🧠' },
        { name: 'Self-awareness', icon: '💎' }
      ]
    },
    {
      label: 'Olah Ruh',
      items: [
        { name: 'Mindfulness', icon: '🧘‍♂️' }
      ]
    }
  ];

  return (
    <View>
      <Text style={styles.onboardingTitle}>Pilih Interest</Text>
      <Text style={styles.onboardingStepText}>Step 3 dari 3</Text>
      <Text style={styles.onboardingInstruction}>Pilih kategori yang kamu minati (bisa lebih dari 1)</Text>

      <ScrollView style={styles.interestScrollView} showsVerticalScrollIndicator={true}>
        {groups.map((group) => (
          <View key={group.label}>
            <Text style={styles.interestGroupLabel}>{group.label}</Text>
            {group.items.map((item) => (
              <TouchableOpacity 
                key={item.name} 
                style={[styles.interestCard, selectedInterests.includes(item.name) && styles.interestCardSelected]}
                onPress={() => onToggle(item.name)}
              >
                <Text style={styles.interestCardText}>{item.icon}   {item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.onboardingActionRow}>
        <TouchableOpacity style={styles.secondaryActionBtn} onPress={onBack}>
          <Text style={styles.secondaryActionText}>Kembali</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.primaryActionBtn, isLoading && styles.buttonLoading]} 
          onPress={onFinish}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryActionText}>Selesai</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  onboardingTitle: { fontSize: 22, fontWeight: '800', color: '#002B49', marginBottom: 4 },
  onboardingStepText: { fontSize: 14, color: '#999', fontWeight: '500', marginBottom: 20 },
  onboardingInstruction: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 15 },
  interestScrollView: { maxHeight: 400, marginBottom: 20 },
  interestGroupLabel: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 15, marginBottom: 10 },
  interestCard: {
    width: '100%', paddingVertical: 18, paddingHorizontal: 20, backgroundColor: '#FFF',
    borderRadius: 15, borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 10,
  },
  interestCardSelected: { borderColor: '#27AE60', backgroundColor: '#F7FCF9' },
  interestCardText: { fontSize: 15, color: '#333', fontWeight: '600' },
  onboardingActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  secondaryActionBtn: { flex: 1, height: 52, borderRadius: 15, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  secondaryActionText: { fontSize: 16, fontWeight: '700', color: '#666' },
  primaryActionBtn: { flex: 1.2, height: 52, borderRadius: 15, backgroundColor: '#27AE60', justifyContent: 'center', alignItems: 'center' },
  primaryActionText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  buttonLoading: { opacity: 0.8 },
});
