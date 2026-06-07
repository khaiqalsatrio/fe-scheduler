import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React from 'react';
import { Upload } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useMedia } from '../../hooks/useMedia';

import { MediaHeader } from '../../components/media/MediaHeader';
import { MediaSelectionBanner } from '../../components/media/MediaSelectionBanner';
import { MediaSearchBar } from '../../components/media/MediaSearchBar';
import { MediaDocumentItem } from '../../components/media/MediaDocumentItem';
import { MediaActionList } from '../../components/media/MediaActionList';

export default function MediaScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  const {
    filteredDocuments,
    loading,
    actionLoading,
    searchQuery,
    setSearchQuery,
    isSelectionMode,
    selectedDocs,
    handleGenerateRecap,
    handleGenerateReport,
    handleGenerateMom,
    handleUpload,
    handleOpenDocument,
    toggleSelectionMode,
    toggleDocSelection,
    handleDeleteSelected,
    handleDeleteDocument,
  } = useMedia();

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark, { paddingTop: insets.top }]}>
      <MediaHeader onToggleSelectionMode={toggleSelectionMode} />

      {isSelectionMode && (
        <MediaSelectionBanner 
          selectedCount={selectedDocs.size} 
          onCancel={toggleSelectionMode} 
          onDelete={handleDeleteSelected} 
        />
      )}

      <MediaSearchBar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      <TouchableOpacity onPress={handleUpload} style={[styles.uploadBtnMain, isDarkMode && styles.uploadBtnMainDark]}>
        <Upload color={isDarkMode ? "#000" : "#FFF"} size={16} />
        <Text style={[styles.uploadTextMain, isDarkMode && styles.uploadTextMainDark]}>UPLOAD</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.docList}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitleList}>YOUR DOCUMENTS</Text>
            <Text style={styles.listCountText}>Showing {filteredDocuments.length} files</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#000" style={{ marginVertical: 20 }} />
          ) : filteredDocuments.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada dokumen.</Text>
          ) : filteredDocuments.map((doc) => (
            <MediaDocumentItem 
              key={doc.id}
              doc={doc}
              isSelectionMode={isSelectionMode}
              isSelected={selectedDocs.has(doc.id)}
              onToggleSelection={toggleDocSelection}
              onOpenDocument={handleOpenDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          ))}
        </View>

        <MediaActionList 
          actionLoading={actionLoading}
          onGenerateRecap={handleGenerateRecap}
          onGenerateReport={handleGenerateReport}
          onGenerateMom={handleGenerateMom}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  uploadBtnMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  uploadBtnMainDark: {
    backgroundColor: '#FFF',
  },
  uploadTextMain: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  uploadTextMainDark: {
    color: '#000',
  },
  docList: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleList: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listCountText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginVertical: 20,
    fontSize: 14,
  },
});
