import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Mic, Square, Copy, RefreshCcw, CheckCircle2 } from 'lucide-react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { LinearGradient } from 'expo-linear-gradient';

export default function VoiceAiScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [copied, setCopied] = useState(false);

  // Animation for the recording ripple effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // React to voice events in real-time
  useSpeechRecognitionEvent('start', () => setIsRecording(true));
  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
    stopPulseAnimation();
  });
  useSpeechRecognitionEvent('result', (event) => {
    setTranscribedText(event.results[0]?.transcript || '');
  });
  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event);
    setIsRecording(false);
    stopPulseAnimation();
  });

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        alert('Gagal mengakses mikrofon atau izinkan pengenalan suara.');
        return;
      }

      setTranscribedText('');
      startPulseAnimation();

      // Minta API mendengarkan dalam bahasa Indonesia dan kirim event terus-menerus
      ExpoSpeechRecognitionModule.start({
        lang: 'id-ID',
        interimResults: true,
        maxAlternatives: 1,
      });
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
      stopPulseAnimation();
    }
  };

  const stopRecording = () => {
    stopPulseAnimation();
    ExpoSpeechRecognitionModule.stop();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const copyToClipboard = () => {
    if (transcribedText) {
      // In real app, use expo-clipboard
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetAll = () => {
    setTranscribedText('');
    setCopied(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#00BCD4', '#0097A7']} style={styles.header}>
        <Text style={styles.headerTitle}>AI Smart Record</Text>
        <Text style={styles.headerSubtitle}>Rekam suara & ubah jadi teks instan</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Visualizer / Microphone Area */}
        <View style={styles.recordSection}>
          <View style={styles.pulseContainer}>
            {isRecording && (
              <Animated.View
                style={[
                  styles.pulseRing,
                  { transform: [{ scale: pulseAnim }], opacity: 0.3 }
                ]}
              />
            )}

            <TouchableOpacity
              style={[
                styles.micButton,
                isRecording ? styles.micButtonRecording : styles.micButtonIdle
              ]}
              onPress={toggleRecording}
              activeOpacity={0.8}
            >
              {isRecording ? (
                <Square color="#FFF" size={36} fill="#FFF" />
              ) : (
                <Mic color="#FFF" size={40} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.statusContainer}>
            {isRecording ? (
              <Text style={[styles.statusText, { color: '#FF5252', fontWeight: 'bold' }]}>
                Merekam... Ketuk untuk berhenti
              </Text>
            ) : (
              <Text style={styles.statusText}>Ketuk mikrofon untuk merekam</Text>
            )}
          </View>
        </View>

        {/* Result Area */}
        <View style={styles.resultSection}>
          <Text style={styles.resultLabel}>Hasil Transkripsi</Text>
          <View style={styles.resultBox}>
            {transcribedText ? (
              <Text style={styles.resultText}>{transcribedText}</Text>
            ) : (
              <Text style={styles.emptyResultText}>
                {isRecording ? 'Mendengarkan...' : 'Belum ada rekaman.'}
              </Text>
            )}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonGhost]}
              onPress={resetAll}
              disabled={!transcribedText}
            >
              <RefreshCcw size={18} color={transcribedText ? '#666' : '#CCC'} />
              <Text style={[styles.actionButtonText, { color: transcribedText ? '#666' : '#CCC' }]}>Ulangi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={copyToClipboard}
              disabled={!transcribedText}
            >
              {copied ? <CheckCircle2 size={18} color="#FFF" /> : <Copy size={18} color="#FFF" />}
              <Text style={styles.actionButtonTextPrimary}>{copied ? 'Tersalin!' : 'Salin Teks'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  recordSection: {
    alignItems: 'center',
    marginVertical: 40,
    minHeight: 200,
    justifyContent: 'center',
  },
  pulseContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF5252',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  micButtonIdle: {
    backgroundColor: '#00BCD4',
  },
  micButtonRecording: {
    backgroundColor: '#FF5252',
  },
  statusContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transcribingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  resultSection: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  resultBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 15,
    minHeight: 120,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  emptyResultText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonGhost: {
    backgroundColor: '#F0F0F0',
  },
  actionButtonPrimary: {
    backgroundColor: '#00BCD4',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});
