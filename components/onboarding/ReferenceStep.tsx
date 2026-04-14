import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface ReferenceStepProps {
  references: any[];
  selectedReferences: string[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const ReferenceStep = ({ references, selectedReferences, isLoading, onToggle, onBack, onContinue }: ReferenceStepProps) => {
  const displayRefs = references.length > 0 ? references : [
    {id: '1', name: 'AI untuk decision making'}, {id: '2', name: 'Product discovery'}, 
    {id: '3', name: 'User behavior analysis'}, {id: '4', name: 'Experimentation'}, 
    {id: '5', name: 'Growth strategy'}, {id: '6', name: 'Product analytics'},
    {id: '7', name: 'User research'}, {id: '8', name: 'A/B testing'},
    {id: '9', name: 'Feature prioritization'}, {id: '10', name: 'Market analysis'},
    {id: '11', name: 'Product roadmap'}, {id: '12', name: 'User feedback'},
    {id: '13', name: 'Product metrics'}, {id: '14', name: 'Competitive analysis'},
    {id: '15', name: 'Product lifecycle'}
  ];

  return (
    <View>
      <Text style={styles.onboardingTitle}>Pilih Referensi</Text>
      <Text style={styles.onboardingStepText}>Step 2 dari 3</Text>
      <Text style={styles.onboardingInstruction}>Pilih maksimal 5 topik yang relevan dengan pekerjaanmu</Text>
      
      <Text style={styles.selectionCountGreen}>{selectedReferences.length}/5 dipilih</Text>

      <View style={styles.referenceChipContainer}>
        {displayRefs.map((ref: any) => (
          <TouchableOpacity 
            key={ref.id || ref.name} 
            style={[styles.refChip, selectedReferences.includes(ref.id) && styles.refChipSelected]}
            onPress={() => onToggle(ref.id)}
          >
            <Text style={[styles.refChipText, selectedReferences.includes(ref.id) && styles.refChipTextSelected]}>
              {ref.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.onboardingActionRow}>
        <TouchableOpacity style={styles.secondaryActionBtn} onPress={onBack}>
          <Text style={styles.secondaryActionText}>Kembali</Text>
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
  onboardingTitle: { fontSize: 22, fontWeight: '800', color: '#002B49', marginBottom: 4 },
  onboardingStepText: { fontSize: 14, color: '#999', fontWeight: '500', marginBottom: 20 },
  onboardingInstruction: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 15 },
  selectionCountGreen: { fontSize: 16, fontWeight: '700', color: '#27AE60', textAlign: 'center', marginBottom: 15 },
  referenceChipContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 25 },
  refChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#EAEAEA',
    backgroundColor: '#FFF', marginRight: 8, marginBottom: 10,
  },
  refChipSelected: { backgroundColor: '#E9F7F0', borderColor: '#27AE60' },
  refChipText: { fontSize: 13, color: '#333', fontWeight: '500' },
  refChipTextSelected: { color: '#27AE60', fontWeight: '700' },
  onboardingActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  secondaryActionBtn: { flex: 1, height: 52, borderRadius: 15, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  secondaryActionText: { fontSize: 16, fontWeight: '700', color: '#666' },
  primaryActionBtn: { flex: 1.2, height: 52, borderRadius: 15, backgroundColor: '#27AE60', justifyContent: 'center', alignItems: 'center' },
  primaryActionText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  buttonLoading: { opacity: 0.8 },
});
