import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileText, Trash2, Check } from 'lucide-react-native';
import { Document } from '../../services/documentService';
import { useTheme } from '../../context/ThemeContext';

interface MediaDocumentItemProps {
  doc: Document;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onOpenDocument: (doc: Document) => void;
  onDeleteDocument: (id: string, title: string) => void;
}

export function MediaDocumentItem({
  doc,
  isSelectionMode,
  isSelected,
  onToggleSelection,
  onOpenDocument,
  onDeleteDocument,
}: MediaDocumentItemProps) {
  const { isDarkMode } = useTheme();

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.docItem, 
        isDarkMode && styles.docItemDark, 
        isSelectionMode && isSelected && { borderColor: '#DE3B32', backgroundColor: isDarkMode ? '#450a0a' : '#FEF2F2' }
      ]} 
      onPress={() => isSelectionMode ? onToggleSelection(doc.id) : onOpenDocument(doc)}
      activeOpacity={0.7}
    >
      <View style={styles.pdfIconContainer}>
        <FileText size={20} color="#DE3B32" />
      </View>
      <View style={styles.docInfo}>
        <Text style={[styles.docTitle, isDarkMode && styles.textDark]}>{doc.title}</Text>
        <Text style={styles.docSubtitle} numberOfLines={1}>
          {formatFileSize(doc.file_size)} • Modified {doc.location ? `in ${doc.location} ` : ''}by {doc.modifiedBy?.name || 'Unknown'}
        </Text>
      </View>
      {!isSelectionMode ? (
        <TouchableOpacity onPress={() => onDeleteDocument(doc.id, doc.title || 'Dokumen')} style={{ padding: 8 }}>
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      ) : (
        <View style={{ padding: 8 }}>
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: isSelected ? 0 : 2,
            borderColor: '#D1D5DB',
            backgroundColor: isSelected ? '#DE3B32' : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  docItemDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  pdfIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#FADBD8',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
    paddingRight: 10,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  docSubtitle: {
    fontSize: 11,
    color: '#888',
  },
  textDark: {
    color: '#FFF',
  },
});
