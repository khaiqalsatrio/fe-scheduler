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
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, FileText, Wand2, Sparkles, Copy, ExternalLink } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { DocumentService } from '../../services/documentService';
import { useTheme } from '../../context/ThemeContext';
import { CONFIG } from '../../constants/Config';

export default function DocumentDetailScreen() {
  const { url, title, id } = useLocalSearchParams<{ url: string; title: string; id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

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
          <Text key={index} style={{ fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#111' }}>
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
      const fullUrl = url.startsWith('http') ? url : `${CONFIG.API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      let shareMessage = `File: ${title}\nLink: ${fullUrl}`;
      if (analysisResult) {
        shareMessage += `\n\nSummary:\n${analysisResult}`;
      }

      await Share.share({
        title: title || 'Document',
        message: shareMessage,
        url: fullUrl,
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

  const handleOpenBrowser = useCallback(async () => {
    if (!url) {
      Alert.alert('Error', 'URL dokumen tidak tersedia.');
      return;
    }
    try {
      const fullUrl = url.startsWith('http') ? url : `${CONFIG.API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      await Linking.openURL(fullUrl);
    } catch (error) {
      console.error('Error opening browser:', error);
      Alert.alert('Error', 'Gagal membuka browser.');
    }
  }, [url]);

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark, { paddingTop: insets.top }]}>
      <Header
        title="Document Detail"
        onBack={() => router.back()}
        onShare={handleShare}
        isDarkMode={isDarkMode}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.detailCard}>
          <View style={[styles.documentPaperCard, isDarkMode && styles.documentPaperCardDark]}>
            <FileText color={isDarkMode ? "#FFF" : "#111"} size={56} />
            <View style={[styles.pdfBadge, isDarkMode && styles.pdfBadgeDark]}>
              <Text style={[styles.pdfBadgeText, isDarkMode && styles.textDark]}>PDF</Text>
            </View>
          </View>
          <Text style={[styles.docTitle, isDarkMode && styles.textDark]}>{title || 'Untitled Document'}</Text>
          <Text style={styles.docSubtitle}>File is ready to be summarized</Text>
        </View>

        <View style={{ width: '100%', gap: 12 }}>
          <TouchableOpacity
            style={[styles.analyzeButton, isDarkMode && styles.analyzeButtonDark]}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color={isDarkMode ? "#000" : "#FFF"} />
            ) : (
              <Sparkles color={isDarkMode ? "#000" : "#FFF"} size={20} />
            )}
            <Text style={[styles.analyzeButtonText, isDarkMode && styles.analyzeButtonTextDark]}>
              {isAnalyzing ? 'Generating Summary...' : 'Generate Summary'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.browserButton, isDarkMode && styles.browserButtonDark]}
            onPress={handleOpenBrowser}
          >
            <ExternalLink color={isDarkMode ? "#FFF" : "#111"} size={20} />
            <Text style={[styles.browserButtonText, isDarkMode && styles.textDark]}>
              Open in Browser
            </Text>
          </TouchableOpacity>
        </View>

        {analysisResult && (
          <View style={[styles.resultContainer, isDarkMode && styles.resultContainerDark]}>
            <View style={[styles.resultHeader, isDarkMode && styles.resultHeaderDark, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles color={isDarkMode ? "#FFF" : "#000"} size={18} />
                <Text style={[styles.resultTitleText, isDarkMode && styles.textDark]}>Hasil Summary Tera AI</Text>
                <View style={[styles.betaBadge, isDarkMode && styles.betaBadgeDark]}>
                  <Text style={styles.betaText}>BETA</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleCopySummary} accessibilityLabel="Copy Summary" style={{ padding: 4 }}>
                <Copy color="#6B7280" size={18} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.resultText, isDarkMode && styles.textGrayDark]}>{renderFormattedText(analysisResult)}</Text>
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
  isDarkMode?: boolean;
}

function Header({ title, onBack, onShare, isDarkMode }: HeaderProps) {
  return (
    <View style={[styles.header, isDarkMode && styles.headerDark]}>
      <TouchableOpacity style={styles.iconButton} onPress={onBack} accessibilityLabel="Kembali">
        <ArrowLeft color={isDarkMode ? "#FFF" : "#111"} size={24} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, isDarkMode && styles.textDark]} numberOfLines={1}>
        {title}
      </Text>
      {onShare ? (
        <TouchableOpacity style={styles.iconButton} onPress={onShare} accessibilityLabel="Bagikan">
          <Share2 color={isDarkMode ? "#FFF" : "#111"} size={20} />
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
  containerDark: {
    backgroundColor: '#121212',
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
  headerDark: {
    borderBottomColor: '#333',
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
  documentPaperCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  pdfBadge: {
    marginTop: 12,
    backgroundColor: '#111',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pdfBadgeDark: {
    backgroundColor: '#333',
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
  analyzeButtonDark: {
    backgroundColor: '#FFF',
  },
  analyzeButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  analyzeButtonTextDark: {
    color: '#000',
  },
  browserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  browserButtonDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  browserButtonText: {
    color: '#111',
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
  resultContainerDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
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
  resultHeaderDark: {
    backgroundColor: '#2A2A2A',
    borderBottomColor: '#444',
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
  betaBadgeDark: {
    backgroundColor: '#333',
    borderColor: '#444',
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
  textDark: {
    color: '#FFF',
  },
  textGrayDark: {
    color: '#D1D5DB',
  },
});