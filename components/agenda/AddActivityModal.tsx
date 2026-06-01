import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  StyleSheet, 
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { X } from 'lucide-react-native';

interface AddActivityModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedTimeSlot: string;
  activityTitle: string;
  setActivityTitle: (text: string) => void;
  activityNotes: string;
  setActivityNotes: (text: string) => void;
  activityLocation: string;
  setActivityLocation: (text: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isVisible,
  onClose,
  selectedTimeSlot,
  activityTitle,
  setActivityTitle,
  activityNotes,
  setActivityNotes,
  activityLocation,
  setActivityLocation,
  onSave,
  isSaving,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.bottomSheetOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity 
          style={styles.bottomSheetBackdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Tambah Aktivitas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>


          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Waktu</Text>
              <Text style={styles.timeValue}>{selectedTimeSlot}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Judul Aktivitas *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Coffee meeting with Ahmad"
                placeholderTextColor="#94A3B8"
                value={activityTitle}
                onChangeText={setActivityTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Lokasi (opsional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Ruang Meeting A"
                placeholderTextColor="#94A3B8"
                value={activityLocation}
                onChangeText={setActivityLocation}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Catatan (opsional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tambahkan catatan..."
                placeholderTextColor="#94A3B8"
                value={activityNotes}
                onChangeText={setActivityNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.saveButton,
                (!activityTitle || isSaving) && styles.saveButtonDisabled
              ]} 
              onPress={onSave}
              disabled={!activityTitle || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheetContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  textArea: {
    height: 100,
  },
  saveButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
