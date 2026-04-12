import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Paperclip, Mic, Send, X, Check, Square } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

interface ChatInputProps {
  onSend?: (text: string) => void;
  replyingTo?: {
    name: string;
    text: string;
  } | null;
  onCancelReply?: () => void;
  isEditing?: boolean;
  editInitialText?: string;
  onUpdate?: (text: string) => void;
  onCancelEdit?: () => void;
  onFileSend?: (file: any, type: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  replyingTo,
  onCancelReply,
  isEditing,
  editInitialText,
  onUpdate,
  onCancelEdit,
  onFileSend
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isEditing && editInitialText) {
      setText(editInitialText);
    } else if (!isEditing) {
      setText('');
    }
  }, [isEditing, editInitialText]);

  // Bersihkan timer dan rekaman saat unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []); // Hapus dependensi [recording] agar tidak mengganggu proses rekam

  const handleAction = () => {
    if (text.trim()) {
      if (isEditing && onUpdate) {
        onUpdate(text);
      } else if (onSend) {
        onSend(text);
      }
      setText('');
    }
  };

  const startRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Izin mikrofon diperlukan untuk merekam suara.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.canRecord) {
            setRecordingDuration(Math.floor(status.durationMillis / 1000));
          }
        },
        1000 // Update tiap detik
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      setRecording(null);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      
      if (uri && onFileSend) {
        // Buat objek file buatan untuk onFileSend
        const fileAsset = {
          uri: uri,
          name: `VN-${Date.now()}.mp3`,
          mimeType: 'audio/mpeg',
        };
        onFileSend(fileAsset, 'voice');
      }
      
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const cancelRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    } catch (err) {
      console.error('Failed to cancel recording', err);
    }
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (onFileSend) {
          onFileSend(file, 'file');
        }
      }
    } catch (err) {
      console.warn('Error picking document:', err);
    }
  };



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.mainContainer}>
        {replyingTo && !isEditing && (
          <View style={styles.topBarContainer}>
            <View style={styles.replyBar} />
            <View style={styles.contentArea}>
              <Text style={styles.topBarName}>{replyingTo.name}</Text>
              <Text style={styles.topBarText} numberOfLines={1}>{replyingTo.text}</Text>
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancelReply}>
              <X size={16} color="#999" />
            </TouchableOpacity>
          </View>
        )}

        {isEditing && (
          <View style={styles.topBarContainer}>
            <View style={[styles.replyBar, { backgroundColor: '#FFC107' }]} />
            <View style={styles.contentArea}>
              <Text style={[styles.topBarName, { color: '#FFC107' }]}>Mengedit pesan</Text>
              <Text style={styles.topBarText} numberOfLines={1}>{editInitialText}</Text>
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancelEdit}>
              <X size={16} color="#999" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.container}>
          <View style={styles.inputWrapper}>
            {isRecording ? (
              <View style={styles.recordingOverlay}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTimer}>{formatDuration(recordingDuration)}</Text>
                <Text style={styles.recordingHint}>Merekam...</Text>
                <TouchableOpacity onPress={cancelRecording} style={styles.cancelRecordingBtn}>
                  <Text style={styles.cancelRecordingText}>Batal</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Message or mention @"
                  placeholderTextColor="#999"
                  value={text}
                  onChangeText={setText}
                  multiline
                />
                <TouchableOpacity style={styles.iconButton} onPress={pickDocument}>
                  <Paperclip color="#666" size={22} />
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton, 
              isEditing && { backgroundColor: '#4CAF50' },
              isRecording && { backgroundColor: '#FF5252' }
            ]}
            onPress={isRecording ? stopRecording : text.trim() ? handleAction : startRecording}
            activeOpacity={0.8}
          >
            {isEditing ? (
              <Check color="#FFF" size={24} />
            ) : text.trim() ? (
              <Send color="#FFF" size={20} style={{ marginLeft: 2 }} />
            ) : isRecording ? (
              <Square color="#FFF" size={20} />
            ) : (
              <Mic color="#FFF" size={24} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#F0F2F5', // Light grey background like in reference image
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 8,
    marginBottom: -10,
    paddingTop: 8,
    paddingBottom: 15,
    paddingHorizontal: 12,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  replyBar: {
    width: 4,
    height: '100%',
    backgroundColor: '#00BCD4',
    borderRadius: 2,
  },
  contentArea: {
    flex: 1,
    marginLeft: 10,
  },
  topBarName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00BCD4',
  },
  topBarText: {
    fontSize: 12,
    color: '#666',
  },
  cancelButton: {
    padding: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 24 : 10, // Extra padding for tall Android screens
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 26,
    paddingRight: 6,
    marginRight: 8,
    minHeight: 52,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    paddingLeft: 15,
    maxHeight: 120,
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  iconButton: {
    padding: 8,
  },
  recordingOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
    marginRight: 8,
  },
  recordingTimer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
    marginRight: 10,
  },
  recordingHint: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  cancelRecordingBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cancelRecordingText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
});
