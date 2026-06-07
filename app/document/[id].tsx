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
import { ArrowLeft, Share2, FileText, Wand2, Sparkles, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { DocumentService } from '../../services/documentService';

export default function DocumentDetailScreen() {
  const { url, title, id } = useLocalSearchParams<{ url: string; title: string; id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleCopySummary = async () => {
    if (analysisResult) {
      await Clipboard.setStringAsync(analysisResult);
      Alert.alert('Sukses', 'Summary berhasil disalin ke clipboard');
    }
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={{ fontWeight: 'bold', color: '#111' }}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const handleShare = useCallback(async () => {
    if (!url) return;
    try {
      let shareMessage = `File: ${title}\nLink: ${url}`;
      if (analysisResult) {
        shareMessage += `\n\nSummary:\n${analysisResult}`;
      }

      await Share.share({
        title: title || 'Document',
        message: shareMessage,
        url: url,
      });
    } catch {
      Alert.alert('Gagal', 'Tidak dapat berbagi dokumen ini.');
    }
  }, [url, title, analysisResult]);

  const handleAnalyze = async () => {
    if (!id) {
      Alert.alert('Error', 'ID Dokumen tidak valid.');
      return;
    }
    try {
      setIsAnalyzing(true);
      const res = await DocumentService.generateRecap(
        [id],
        'Tolong buatkan summary dari file ini'
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
        title="Document Detail"
        onBack={() => router.back()}
        onShare={handleShare}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.detailCard}>
          <View style={styles.documentPaperCard}>
            <FileText color="#111" size={56} />
            <View style={styles.pdfBadge}>
              <Text style={styles.pdfBadgeText}>PDF</Text>
            </View>
          </View>
          <Text style={styles.docTitle}>{title || 'Untitled Document'}</Text>
          <Text style={styles.docSubtitle}>File is ready to be summarized</Text>
        </View>

        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Sparkles color="#FFF" size={20} />
          )}
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing ? 'Generating Summary...' : 'Generate Summary'}
          </Text>
        </TouchableOpacity>

        {analysisResult && (
          <View style={styles.resultContainer}>
            <View style={[styles.resultHeader, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles color="#000" size={18} />
                <Text style={styles.resultTitleText}>Hasil Summary Tera AI</Text>
                <View style={styles.betaBadge}>
                  <Text style={styles.betaText}>BETA</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleCopySummary} accessibilityLabel="Copy Summary" style={{ padding: 4 }}>
                <Copy color="#6B7280" size={18} />
              </TouchableOpacity>
            </View>
            <Text style={styles.resultText}>{renderFormattedText(analysisResult)}</Text>
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
  documentPaperCard: {
    width: 160,
    height: 210,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pdfBadge: {
    marginTop: 12,
    backgroundColor: '#111',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pdfBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
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
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  analyzeButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 32,
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginLeft: 8,
    marginRight: 8,
  },
  betaBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  betaText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  resultText: {
    padding: 16,
    fontSize: 14,
    color: '#374151',
    lineHeight: 24,
  },
});