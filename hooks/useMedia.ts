import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentService, Document } from '../services/documentService';

export function useMedia() {
  const router = useRouter();
  
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
      await DocumentService.generateRecap([documents[0].id], 'Minta tolong buatkan rekap dari presentasi narasumber', `Rekap - ${docTitle}`);
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
      await DocumentService.generateReport([documents[0].id], 'Buatkan laporan kegiatan hari ini', `Laporan - ${docTitle}`);
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
      await DocumentService.generateMom([documents[0].id], 'Tolong buatkan MoM dari diskusi tim', `MoM - ${docTitle}`);
      Alert.alert('Sukses', `MoM berhasil dibuat dan disimpan sebagai PDF!`);
      fetchDocuments();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal membuat MoM.');
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

  return {
    documents,
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
  };
}
