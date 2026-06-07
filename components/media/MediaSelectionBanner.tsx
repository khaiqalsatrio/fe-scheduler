import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MediaSelectionBannerProps {
  selectedCount: number;
  onCancel: () => void;
  onDelete: () => void;
}

export function MediaSelectionBanner({ selectedCount, onCancel, onDelete }: MediaSelectionBannerProps) {
  return (
    <View style={styles.selectionBanner}>
      <Text style={styles.selectionText}>{selectedCount} item dipilih</Text>
      <View style={styles.selectionActions}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Batal</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectionBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  selectionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
