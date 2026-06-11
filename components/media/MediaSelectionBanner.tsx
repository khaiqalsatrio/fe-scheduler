import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Trash2 } from 'lucide-react-native';

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
        <TouchableOpacity onPress={onCancel} style={styles.iconBtn}>
          <X color="#FFF" size={22} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
          <Trash2 color="#EF4444" size={22} />
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
    gap: 16,
  },
  iconBtn: {
    padding: 8,
  },
});
