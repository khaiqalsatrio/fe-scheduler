import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Search, MoreHorizontal, MoreVertical, Calendar, Gift, Wand2, Upload, FileText, Edit3, Trash2, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DocumentService, Document } from '../../services/documentService';
import { CONFIG } from '../../constants/Config';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../context/ThemeContext';

export default function MediaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  const filteredDocuments = documents.filter(doc => 
    (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await DocumentService.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents', error);
      Alert.alert('Error', 'Gagal mengambil data dokumen.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecap = async () => {
    if (documents.length === 0) return Alert.alert('Error', 'Pilih dokumen terlebih dahulu');
    try {
      setActionLoading('1');
      const docTitle = documents[0].title || 'Dokumen';
      const result = await DocumentService.generateRecap([documents[0].id], 'Minta tolong buatkan rekap dari presentasi narasumber', `Rekap - ${docTitle}`);
      Alert.alert('Sukses', `Recap berhasil dibuat dan disimpan sebagai PDF!`);
      fetchDocuments();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal membuat rekap.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateReport = async () => {
    if (documents.length === 0) return Alert.alert('Error', 'Pilih dokumen terlebih dahulu');
    try {
      setActionLoading('2');
      const docTitle = documents[0].title || 'Dokumen';
      const result = await DocumentService.generateReport([documents[0].id], 'Buatkan laporan kegiatan hari ini', `Laporan - ${docTitle}`);
      Alert.alert('Sukses', `Laporan berhasil dibuat dan disimpan sebagai PDF!`);
      fetchDocuments();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal membuat laporan.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateMom = async () => {
    if (documents.length === 0) return Alert.alert('Error', 'Pilih dokumen terlebih dahulu');
    try {
      setActionLoading('3');
      const docTitle = documents[0].title || 'Dokumen';
      const result = await DocumentService.generateMom([documents[0].id], 'Tolong buatkan MoM dari diskusi tim', `MoM - ${docTitle}`);
      Alert.alert('Sukses', `MoM berhasil dibuat dan disimpan sebagai PDF!`);
      fetchDocuments();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal membuat MoM.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAskAgent = async () => {
    try {
      setActionLoading('ask-agent');
      const res = await DocumentService.askAgent('Tolong cari dokumen tentang rekap kegiatan bulan lalu');
      Alert.alert('Agent', res.answer);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menghubungi agent.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setLoading(true);
        await DocumentService.uploadDocument(
          file.uri,
          file.name,
          file.mimeType || 'application/pdf',
          file.name.split('.')[0],
          'Mobile Upload'
        );
        Alert.alert('Sukses', 'Dokumen berhasil diupload');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Gagal mengupload dokumen.');
      setLoading(false);
    }
  };

  const handleOpenDocument = (doc: Document) => {
    if (!doc.file_url) {
      Alert.alert('Info', 'Dokumen tidak memiliki URL file untuk dibuka.');
      return;
    }

    router.push({
      pathname: '/document/[id]',
      params: {
        id: doc.id,
        url: doc.file_url,
        title: doc.title || 'Document'
      }
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedDocs(new Set());
  };

  const toggleDocSelection = (id: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDocs(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedDocs.size === 0) {
      Alert.alert('Info', 'Pilih dokumen yang ingin dihapus');
      return;
    }

    Alert.alert(
      'Hapus Dokumen',
      `Apakah Anda yakin ingin menghapus ${selectedDocs.size} dokumen?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const deletePromises = Array.from(selectedDocs).map(id => DocumentService.deleteDocument(id));
              await Promise.all(deletePromises);
              Alert.alert('Sukses', `${selectedDocs.size} dokumen berhasil dihapus`);
              setIsSelectionMode(false);
              setSelectedDocs(new Set());
              fetchDocuments();
            } catch (error) {
              console.error('Error deleting documents:', error);
              Alert.alert('Error', 'Gagal menghapus beberapa dokumen.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteDocument = (id: string, title: string) => {
    Alert.alert(
      'Hapus Dokumen',
      `Apakah Anda yakin ingin menghapus "${title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await DocumentService.deleteDocument(id);
              Alert.alert('Sukses', 'Dokumen berhasil dihapus');
              fetchDocuments();
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Gagal menghapus dokumen.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const actions = [
    { id: '1', title: 'Rekap presentasi narasumber', icon: Calendar, onPress: handleGenerateRecap },
    { id: '2', title: 'Buatkan laporan kegiatan', icon: FileText, onPress: handleGenerateReport },
    { id: '3', title: 'Buatkan MoM diskusi', icon: Edit3, onPress: handleGenerateMom },
  ];

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.containerDark]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
          />
          <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Files</Text>
        </View>
        <TouchableOpacity style={[styles.menuButton, isDarkMode && styles.menuButtonDark]} onPress={toggleSelectionMode}>
          <MoreHorizontal color={isDarkMode ? "#FFF" : "#000"} size={20} />
        </TouchableOpacity>
      </View>

      {isSelectionMode && (
        <View style={styles.selectionBanner}>
          <Text style={styles.selectionText}>{selectedDocs.size} item dipilih</Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity onPress={toggleSelectionMode} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteSelected} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
        <Search color={isDarkMode ? "#9CA3AF" : "#9CA3AF"} size={18} />
        <TextInput
          style={[styles.searchText, isDarkMode && styles.textDark, { flex: 1, height: '100%' }]}
          placeholder="Cari file..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* UPLOAD BUTTON */}
      <TouchableOpacity onPress={handleUpload} style={[styles.uploadBtnMain, isDarkMode && styles.uploadBtnMainDark]}>
        <Upload color={isDarkMode ? "#000" : "#FFF"} size={16} />
        <Text style={[styles.uploadTextMain, isDarkMode && styles.uploadTextMainDark]}>UPLOAD</Text>
      </TouchableOpacity>

      <ScrollView>
        {/* Document List */}
        <View style={styles.docList}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitleList}>YOUR DOCUMENTS</Text>
            <Text style={styles.listCountText}>Showing {filteredDocuments.length} files</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#000" style={{ marginVertical: 20 }} />
          ) : filteredDocuments.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada dokumen.</Text>
          ) : filteredDocuments.map((doc) => {
            const isSelected = selectedDocs.has(doc.id);
            return (
              <TouchableOpacity 
                key={doc.id} 
                style={[styles.docItem, isDarkMode && styles.docItemDark, isSelectionMode && isSelected && { borderColor: '#DE3B32', backgroundColor: isDarkMode ? '#450a0a' : '#FEF2F2' }]} 
                onPress={() => isSelectionMode ? toggleDocSelection(doc.id) : handleOpenDocument(doc)}
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
                  <TouchableOpacity onPress={() => handleDeleteDocument(doc.id, doc.title || 'Dokumen')} style={{ padding: 8 }}>
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
            )
          })}
        </View>

        {/* Action Section */}
        <View style={styles.actionSectionHeader}>
          <Text style={styles.sectionTitleList}>DRAFT WITH TERA AI</Text>
        </View>
        <View style={styles.actionList}>
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, isDarkMode && styles.actionCardDark]}
                onPress={action.onPress}
                disabled={!!actionLoading}
              >
                <View style={styles.actionIconContainer}>
                  {actionLoading === action.id ? (
                    <ActivityIndicator size="small" color={isDarkMode ? "#FFF" : "#000"} />
                  ) : (
                    <Icon color={isDarkMode ? "#FFF" : "#000"} size={20} />
                  )}
                </View>
                <Text style={[styles.actionTitleText, isDarkMode && styles.textDark]}>
                  {actionLoading === action.id ? 'Memproses...' : action.title}
                </Text>
                <Text style={styles.actionDescText}>
                  {action.id === '1' ? 'AI will extract key points from your recording' : action.id === '2' ? 'Generate formal structured reports instantly' : 'Transcribe and summarize meeting notes'}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonDark: {
    backgroundColor: '#1E1E1E',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    gap: 8,
  },
  searchContainerDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  searchText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '400',
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
  uploadTextMain: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  uploadBtnMainDark: {
    backgroundColor: '#FFF',
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
  aiIconContainer: {
    backgroundColor: '#000',
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
  actionSectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  actionList: {
    paddingBottom: 40,
  },
  actionCard: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  actionCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  actionIconContainer: {
    marginBottom: 10,
  },
  actionTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  actionDescText: {
    fontSize: 11,
    color: '#888',
  },
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
  textDark: {
    color: '#FFF',
  },
});
