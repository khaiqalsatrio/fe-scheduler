import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Search, MoreHorizontal, MoreVertical, Calendar, Gift, Wand2, Upload } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DocumentService, Document } from '../../services/documentService';
import * as DocumentPicker from 'expo-document-picker';

export default function MediaScreen() {
  const insets = useSafeAreaInsets();
  
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
      const result = await DocumentService.generateRecap([documents[0].id], 'Minta tolong buatkan rekap dari presentasi narasumber');
      Alert.alert('Sukses', `Recap berhasil dibuat:\n\n${result.result}`);
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
      const result = await DocumentService.generateReport([documents[0].id], 'Buatkan laporan kegiatan hari ini');
      Alert.alert('Sukses', `Laporan berhasil dibuat:\n\n${result.result}`);
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
      const result = await DocumentService.generateMom([documents[0].id], 'Tolong buatkan MoM dari diskusi tim');
      Alert.alert('Sukses', `MoM berhasil dibuat:\n\n${result.result}`);
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

  const actions = [
    { id: '1', title: 'Rekap presentasi narasumber', icon: Calendar, onPress: handleGenerateRecap },
    { id: '2', title: 'Buatkan laporan kegiatan', icon: Gift, onPress: handleGenerateReport },
    { id: '3', title: 'Buatkan MoM diskusi', icon: Wand2, onPress: handleGenerateMom },
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
          <Text style={styles.headerTitle}>ChatAja!</Text>
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
          {actionLoading === 'ask-agent' ? 'Agent sedang berpikir...' : 'Ask ChatAja Agent'}
        </Text>
      </TouchableOpacity>
      
      <ScrollView>
        {/* Document List */}
        <View style={styles.docList}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitleList}>Dokumen Anda</Text>
            <TouchableOpacity onPress={handleUpload} style={styles.uploadBtn}>
               <Upload color="#E06B32" size={16} />
               <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#E06B32" style={{ marginVertical: 20 }} />
          ) : documents.length === 0 ? (
             <Text style={styles.emptyText}>Tidak ada dokumen.</Text>
          ) : documents.map((doc) => (
            <View key={doc.id} style={styles.docItem}>
              <View style={styles.pdfIconContainer}>
                <Text style={styles.pdfIconText}>{doc.file_type?.includes('pdf') ? 'PDF' : 'DOC'}</Text>
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docSubtitle} numberOfLines={1}>
                  {formatFileSize(doc.file_size)}, Modified {doc.location ? `in ${doc.location} ` : ''}by {doc.modifiedBy?.name || 'Unknown'}
                </Text>
              </View>
              <TouchableOpacity style={styles.docMoreBtn}>
                <MoreVertical color="#000" size={18} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Buat Dokumen</Text>
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity 
                key={action.id} 
                style={[styles.actionItem, index !== actions.length - 1 && styles.actionItemBorder]}
                onPress={action.onPress}
                disabled={!!actionLoading}
              >
                {actionLoading === action.id ? (
                  <ActivityIndicator size="small" color="#E06B32" style={styles.actionIcon} />
                ) : (
                  <Icon color="#E06B32" size={18} style={styles.actionIcon} />
                )}
                <Text style={styles.actionText}>
                  {actionLoading === action.id ? 'Memproses dengan AI...' : action.title}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {/* Floating Robot Mascot FAB */}
      <TouchableOpacity 
        style={styles.floatingMascot} 
        activeOpacity={0.8}
        onPress={handleAskAgent}
      >
        <Image
          source={require('../../assets/images/Adobe Express - file (11) 1.png')}
          style={styles.mascotFabImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
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
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    gap: 8,
  },
  searchText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  docList: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleList: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  uploadText: {
    color: '#E06B32',
    fontSize: 13,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  pdfIconContainer: {
    width: 36,
    height: 44,
    backgroundColor: '#DE3B32',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  pdfIconText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  docInfo: {
    flex: 1,
    paddingRight: 10,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  docSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  docMoreBtn: {
    padding: 4,
  },
  actionSection: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
  },
  floatingMascot: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 80,
    height: 80,
    zIndex: 10,
  },
  mascotFabImage: {
    width: '100%',
    height: '100%',
  }
});
