import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Pin, Check, CheckCheck, FileText, Play, Pause, Mic } from 'lucide-react-native';
import { Audio } from 'expo-av';

interface MessageBubbleProps {
  message: string;
  time: string;
  isMine: boolean;
  onLongPress?: () => void;
  isPinned?: boolean;
  isEdited?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  replyTo?: {
    name: string;
    text: string;
  };
  file?: {
    url: string;
    name: string;
    type: string;
  };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  time,
  isMine,
  onLongPress,
  isPinned,
  isEdited,
  status = 'sent',
  replyTo,
  file
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const isImage = file?.type?.startsWith('image/') || 
                  file?.url?.toLowerCase().endsWith('.jpg') || 
                  file?.url?.toLowerCase().endsWith('.png') ||
                  file?.url?.toLowerCase().endsWith('.jpeg');

  const isVoice = file?.type?.startsWith('audio/') || 
                  file?.type === 'voice' ||
                  file?.url?.toLowerCase().endsWith('.m4a') ||
                  file?.url?.toLowerCase().endsWith('.mp3');

  // Jika pesan hanya berisi label placeholder "📷 Gambar", kita anggap tidak ada teks (ala WA)
  const isOnlyImage = isImage && (message === '📷 Gambar' || !message.trim());
  const isOnlyVoice = isVoice && (message === '🎤 Pesan Suara' || !message.trim());

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        sound?.setPositionAsync(0);
      }
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } else if (file?.url) {
      try {
        setIsLoadingAudio(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: file.url },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
      } catch (error) {
        console.error('Error loading sound', error);
      } finally {
        setIsLoadingAudio(false);
      }
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={[styles.outerContainer, isMine ? styles.myOuterContainer : styles.theirOuterContainer]}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        onLongPress={onLongPress}
        style={[
          styles.container, 
          isMine ? styles.myMessageContainer : styles.theirMessageContainer,
          isImage && { maxWidth: '75%' }
        ]}
      >
        <View style={[
          styles.bubble, 
          isMine ? styles.myBubble : styles.theirBubble,
          isOnlyImage && { paddingHorizontal: 4, paddingVertical: 4 }
        ]}>
          {replyTo && (
            <View style={styles.replyContainer}>
              <View style={styles.replyBar} />
              <View style={styles.replyContent}>
                <Text style={styles.replyName}>{replyTo.name}</Text>
                <Text style={styles.replyText} numberOfLines={1}>{replyTo.text}</Text>
              </View>
            </View>
          )}
          
          {file && isImage && (
            <Image 
              source={{ uri: file.url }} 
              style={[
                styles.attachedImage,
                isOnlyImage && { marginBottom: 2 }
              ]} 
              resizeMode="cover"
            />
          )}

          {file && isVoice && (
            <View style={styles.voiceContainer}>
              <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
                {isLoadingAudio ? (
                  <ActivityIndicator size="small" color={isMine ? "#00BCD4" : "#25D366"} />
                ) : isPlaying ? (
                  <Pause color={isMine ? "#00BCD4" : "#25D366"} size={28} fill={isMine ? "#00BCD4" : "#25D366"} />
                ) : (
                  <Play color={isMine ? "#00BCD4" : "#25D366"} size={28} fill={isMine ? "#00BCD4" : "#25D366"} />
                )}
              </TouchableOpacity>
              
              <View style={styles.voiceWaveformContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }
                    ]} 
                  />
                </View>
                <View style={styles.voiceFooter}>
                  <Text style={styles.voiceDuration}>
                    {isPlaying || position > 0 ? formatTime(position) : formatTime(duration)}
                  </Text>
                  <Mic size={12} color="#999" />
                </View>
              </View>
            </View>
          )}

          {file && !isImage && !isVoice && (
            <View style={styles.fileContainer}>
              <View style={styles.fileIconWrapper}>
                <FileText color="#FFF" size={24} />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.fileType}>{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</Text>
              </View>
            </View>
          )}
          
          {!isOnlyImage && !isOnlyVoice && (
            <Text style={[styles.message, isMine ? styles.myMessage : styles.theirMessage]}>
              {message}
            </Text>
          )}
          
          <View style={styles.footer}>
            {isEdited && <Text style={styles.editedLabel}>(diedit)</Text>}
            {isPinned && <Pin size={10} color="#666" style={styles.pinIcon} />}
            <Text style={[styles.time, isMine ? styles.myTime : styles.theirTime]}>{time}</Text>
            {isMine && (
              status === 'sent' ? (
                <Check size={14} color="#999" style={styles.checkIcon} />
              ) : (
                <CheckCheck size={14} color={status === 'read' ? "#34B7F1" : "#999"} style={styles.checkIcon} />
              )
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    marginVertical: 2,
  },
  myOuterContainer: {
    alignItems: 'flex-end',
  },
  theirOuterContainer: {
    alignItems: 'flex-start',
  },
  container: {
    maxWidth: '85%',
  },
  myMessageContainer: {
    paddingRight: 10,
  },
  theirMessageContainer: {
    paddingLeft: 10,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    minWidth: 80,
  },
  myBubble: {
    backgroundColor: '#E6F0FA', // Light blueish grey
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
  },
  replyContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  replyBar: {
    width: 4,
    backgroundColor: '#00BCD4',
  },
  replyContent: {
    padding: 4,
    paddingLeft: 8,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00BCD4',
  },
  replyText: {
    fontSize: 12,
    color: '#666',
  },
  message: {
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
  },
  myMessage: {
    color: '#000',
  },
  theirMessage: {
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  pinIcon: {
    marginRight: 4,
  },
  editedLabel: {
    fontSize: 10,
    color: '#999',
    marginRight: 4,
    fontStyle: 'italic',
  },
  time: {
    fontSize: 10,
    color: '#666',
  },
  myTime: {
    color: '#666',
  },
  theirTime: {
    color: '#999',
  },
  checkIcon: {
    marginLeft: 4,
  },
  attachedImage: {
    width: 250,
    height: 180,
    borderRadius: 6,
    marginBottom: 6,
    backgroundColor: '#F0F0F0',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    minWidth: 200,
  },
  fileIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  fileType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginBottom: 6,
    minWidth: 200,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  voiceWaveformContainer: {
    flex: 1,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 1.5,
    width: '100%',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00BCD4',
    borderRadius: 1.5,
  },
  voiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceDuration: {
    fontSize: 11,
    color: '#666',
  },
});
