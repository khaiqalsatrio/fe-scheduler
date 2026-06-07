import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Search, MoreHorizontal, MoreVertical, Calendar, Gift, Wand2, Upload, FileText, Edit3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DocumentService, Document } from '../../services/documentService';
import { CONFIG } from '../../constants/Config';
import * as DocumentPicker from 'expo-document-picker';

export default function MediaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
          />
          <Text style={styles.headerTitle}>Files</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <MoreHorizontal color="#000" size={20} />
        </TouchableOpacity>
      </View>

      {/* Search Bar / Ask Agent */}
      <TouchableOpacity
        style={styles.searchContainer}
        activeOpacity={0.8}
        onPress={handleAskAgent}
        disabled={!!actionLoading}
      >
        {actionLoading === 'ask-agent' ? (
          <ActivityIndicator size="small" color="#9CA3AF" />
        ) : (
          <Search color="#9CA3AF" size={18} />
        )}
        <Text style={styles.searchText}>
          {actionLoading === 'ask-agent' ? 'Tera AI sedang berpikir...' : 'Ask Tera AI about your files...'}
        </Text>
      </TouchableOpacity>

      {/* UPLOAD BUTTON */}
      <TouchableOpacity onPress={handleUpload} style={styles.uploadBtnMain}>
        <Upload color="#FFF" size={16} />
        <Text style={styles.uploadTextMain}>UPLOAD</Text>
      </TouchableOpacity>

      <ScrollView>
        {/* Document List */}
        <View style={styles.docList}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitleList}>YOUR DOCUMENTS</Text>
            <Text style={styles.listCountText}>Showing {documents.length} files</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#000" style={{ marginVertical: 20 }} />
          ) : documents.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada dokumen.</Text>
          ) : documents.map((doc) => {
            return (
              <TouchableOpacity key={doc.id} style={styles.docItem} onPress={() => handleOpenDocument(doc)}>
                <View style={styles.pdfIconContainer}>
                  <FileText size={20} color="#DE3B32" />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docSubtitle} numberOfLines={1}>
                    {formatFileSize(doc.file_size)} • Modified {doc.location ? `in ${doc.location} ` : ''}by {doc.modifiedBy?.name || 'Unknown'}
                  </Text>
                </View>
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
                style={styles.actionCard}
                onPress={action.onPress}
                disabled={!!actionLoading}
              >
                <View style={styles.actionIconContainer}>
                  {actionLoading === action.id ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Icon color="#000" size={20} />
                  )}
                </View>
                <Text style={styles.actionTitleText}>
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
});
