import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import type { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';
import Pdf from 'react-native-pdf';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, RefreshCw, AlertCircle } from 'lucide-react-native';
import { CONFIG } from '../../constants/Config';

type LoadState = 'loading' | 'success' | 'error';

export default function DocumentDetailScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [webViewKey, setWebViewKey] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // --- URL Construction ---
  const buildFullUrl = useCallback((): string | null => {
    if (!url) return null;
    const decodedUrl = decodeURIComponent(url);
    if (decodedUrl.startsWith('http')) return decodedUrl;
    return `${CONFIG.API_BASE_URL}${decodedUrl.startsWith('/') ? '' : '/'}${decodedUrl}`;
  }, [url]);

  const fullUrl = buildFullUrl();
  const isPdf = fullUrl?.toLowerCase().endsWith('.pdf') ?? false;

  // For non-PDF files on Android, use Google Docs Viewer
  const webViewUrl = useCallback((): string | null => {
    if (!fullUrl || isPdf) return fullUrl;
    const isLocalUrl =
      fullUrl.includes('10.0.2.2') ||
      fullUrl.includes('localhost') ||
      fullUrl.includes('127.0.0.1');
    if (Platform.OS === 'android' && !isLocalUrl) {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fullUrl)}`;
    }
    return fullUrl;
  }, [fullUrl, isPdf])();

  // --- Handlers ---
  const handleShare = useCallback(async () => {
    if (!fullUrl) return;
    try {
      await Share.share({
        title: title || 'Document',
        message: fullUrl,
        url: fullUrl,
      });
    } catch {
      Alert.alert('Gagal', 'Tidak dapat berbagi dokumen ini.');
    }
  }, [fullUrl, title]);

  const handleRetry = useCallback(() => {
    setLoadState('loading');
    setWebViewKey((prev) => prev + 1);
  }, []);

  // WebView handlers
  const handleWebViewError = useCallback((e: WebViewErrorEvent) => {
    console.warn('[DocumentDetail] WebView error:', e.nativeEvent);
    setLoadState('error');
  }, []);

  const handleWebViewLoadEnd = useCallback(() => {
    setLoadState((prev) => (prev === 'error' ? 'error' : 'success'));
  }, []);

  // PDF handlers
  const handlePdfLoadComplete = useCallback((pages: number) => {
    setTotalPages(pages);
    setLoadState('success');
  }, []);

  const handlePdfError = useCallback((error: object) => {
    console.warn('[DocumentDetail] PDF error:', error);
    setLoadState('error');
  }, []);

  const handlePdfPageChanged = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // --- Render: No URL ---
  if (!fullUrl) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Error" onBack={() => router.back()} onShare={undefined} />
        <View style={styles.centeredContainer}>
          <AlertCircle color="#E06B32" size={48} />
          <Text style={styles.errorTitle}>URL Tidak Ditemukan</Text>
          <Text style={styles.errorSubtitle}>URL dokumen tidak tersedia atau tidak valid.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={title || 'Document Detail'}
        onBack={() => router.back()}
        onShare={handleShare}
      />

      {/* Page counter — only shown for PDF when loaded */}
      {isPdf && loadState === 'success' && totalPages > 0 && (
        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>
            {currentPage} / {totalPages}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {/* ── PDF Viewer ── */}
        {isPdf ? (
          <Pdf
            key={webViewKey}
            source={{ uri: fullUrl, cache: true }}
            style={[
              styles.pdf,
              (loadState === 'loading' || loadState === 'error') && styles.hidden,
            ]}
            onLoadComplete={handlePdfLoadComplete}
            onError={handlePdfError}
            onPageChanged={handlePdfPageChanged}
            enablePaging
            trustAllCerts={false}
          />
        ) : (
          /* ── WebView for non-PDF files ── */
          <WebView
            key={webViewKey}
            source={{ uri: webViewUrl! }}
            style={[
              styles.webview,
              (loadState === 'loading' || loadState === 'error') && styles.hidden,
            ]}
            onLoadEnd={handleWebViewLoadEnd}
            onError={handleWebViewError}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
            allowsInlineMediaPlayback
            allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
          />
        )}

        {/* Loading overlay */}
        {loadState === 'loading' && (
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color="#E06B32" />
            <Text style={styles.loadingText}>Memuat dokumen...</Text>
          </View>
        )}

        {/* Error overlay */}
        {loadState === 'error' && (
          <View style={styles.centeredContainer}>
            <AlertCircle color="#E06B32" size={48} />
            <Text style={styles.errorTitle}>Gagal Memuat Dokumen</Text>
            <Text style={styles.errorSubtitle}>
              Dokumen tidak dapat ditampilkan. Periksa koneksi internet Anda dan coba lagi.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <RefreshCw color="#FFF" size={16} />
              <Text style={styles.retryText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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

// --- Styles ---
const { width, height } = Dimensions.get('window');

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
  pageIndicator: {
    alignSelf: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 6,
  },
  pageIndicatorText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width,
    height,
    backgroundColor: '#F3F4F6',
  },
  webview: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
  centeredContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  errorSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: '#E06B32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
});