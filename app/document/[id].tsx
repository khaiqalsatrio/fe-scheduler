import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, FileText, Wand2 } from 'lucide-react-native';
import { DocumentService } from '../../services/documentService';

export default function DocumentDetailScreen() {
  const { url, title, id } = useLocalSearchParams<{ url: string; title: string; id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleShare = useCallback(async () => {
    if (!url) return;
    try {
      await Share.share({
        title: title || 'Document',
        message: url,
        url: url,
      });
    } catch {
      Alert.alert('Gagal', 'Tidak dapat berbagi dokumen ini.');
    }
  }, [url, title]);

  const handleAnalyze = async () => {
    if (!id) {
      Alert.alert('Error', 'ID Dokumen tidak valid.');
      return;
    }
    try {
      setIsAnalyzing(true);
      const res = await DocumentService.generateRecap(
        [id], 
        'Tolong analisa file ini dan ambil poin-poin pentingnya'
      );
      setAnalysisResult(res.result);
    } catch (error: any) {
      console.error('Error analyzing document:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menganalisa dokumen.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Detail Dokumen"
        onBack={() => router.back()}
        onShare={handleShare}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.detailCard}>
          <View style={styles.iconContainer}>
            <FileText color="#E06B32" size={48} />
          </View>
          <Text style={styles.docTitle}>{title || 'Dokumen Tanpa Judul'}</Text>
          <Text style={styles.docSubtitle}>File siap untuk dianalisa</Text>
        </View>

        <TouchableOpacity 
          style={styles.analyzeButton} 
          onPress={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Wand2 color="#FFF" size={20} />
          )}
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing ? 'Sedang Menganalisa...' : 'Analisa Isi File'}
          </Text>
        </TouchableOpacity>

        {analysisResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Hasil Analisa:</Text>
            <Text style={styles.resultText}>{analysisResult}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// --- Sub-component: Header ---
interface HeaderProps {
  title: string;
  onBack: () => void;
  onShare?: () => void;
}

function Header({ title, onBack, onShare }: HeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton} onPress={onBack} accessibilityLabel="Kembali">
        <ArrowLeft color="#111" size={24} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {onShare ? (
        <TouchableOpacity style={styles.iconButton} onPress={onShare} accessibilityLabel="Bagikan">
          <Share2 color="#111" size={20} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  detailCard: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFF0E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  docTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  docSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E06B32',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  analyzeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 32,
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
});