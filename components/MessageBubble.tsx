import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Pin, Check, CheckCheck, FileText, Play, Pause, Mic, Ban } from 'lucide-react-native';
import { Audio } from 'expo-av';

interface MessageBubbleProps {
  id: string;
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
  isPlaying?: boolean;
  onVoiceFinish?: (id: string) => void;
  onPlayStarted?: (id: string) => void;
  reactions?: {
    emoji: string;
    user_id: string;
    user?: { name: string };
  }[];
  myUserId?: string;
  onReactionPress?: (emoji: string) => void;
  isDeleted?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  id,
  message,
  time,
  isMine,
  onLongPress,
  isPinned,
  isEdited,
  status = 'sent',
  replyTo,
  file,
  isPlaying: forcePlay,
  onVoiceFinish,
  onPlayStarted,
  reactions = [],
  myUserId,
  onReactionPress,
  isDeleted
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

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Effect untuk menangani autoplay dari luar
  useEffect(() => {
    if (forcePlay && isVoice && !isPlaying && !isLoadingAudio) {
      handlePlayPause();
    }
  }, [forcePlay]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Playback error: ${status.error}`);
      }
      return;
    }

    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
      soundRef.current?.stopAsync();
      soundRef.current?.setPositionAsync(0);
      if (onVoiceFinish) onVoiceFinish(id);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (soundRef.current) {
        const status: any = await soundRef.current.getStatusAsync();
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          if (status.didJustFinish || status.positionMillis >= (status.durationMillis || 0)) {
            await soundRef.current.setPositionAsync(0);
          }
          await soundRef.current.playAsync();
          if (onPlayStarted) onPlayStarted(id);
        }
      } else if (file?.url) {
        setIsLoadingAudio(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: file.url },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = newSound;
        setSound(newSound);
        if (onPlayStarted) onPlayStarted(id);
      }
    } catch (error) {
      console.error('Error in handlePlayPause', error);
    } finally {
      setIsLoadingAudio(false);
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
        activeOpacity={isDeleted ? 1 : 0.8} 
        onLongPress={isDeleted ? undefined : onLongPress}
        style={[
          styles.container, 
          isMine ? styles.myMessageContainer : styles.theirMessageContainer,
          isImage && !isDeleted && { maxWidth: '75%' }
        ]}
      >
        <View style={[
          styles.bubble, 
          isMine ? (isDeleted ? styles.myDeletedBubble : styles.myBubble) : (isDeleted ? styles.theirDeletedBubble : styles.theirBubble),
          isOnlyImage && !isDeleted && { paddingHorizontal: 4, paddingVertical: 4 }
        ]}>
          {isDeleted ? (
            <View style={styles.deletedContainer}>
              <Ban size={16} color="#999" style={styles.deletedIcon} />
              <Text style={styles.deletedText}>
                {isMine ? 'Anda menghapus pesan ini' : 'Pesan ini telah dihapus'}
              </Text>
              <Text style={styles.timeDeleted}>{time}</Text>
            </View>
          ) : (
            <>
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
              <View style={styles.voiceLayout}>
                <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
                  {isLoadingAudio ? (
                    <ActivityIndicator size="small" color={isMine ? "#00BCD4" : "#999"} />
                  ) : isPlaying ? (
                    <Pause color={isMine ? "#00BCD4" : "#666"} size={32} fill={isMine ? "#00BCD4" : "#666"} />
                  ) : (
                    <Play color={isMine ? "#00BCD4" : "#666"} size={32} fill={isMine ? "#00BCD4" : "#666"} />
                  )}
                </TouchableOpacity>
                
                <View style={styles.voiceRightSide}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: duration > 0 ? `${(position / duration) * 100}%` : '0%',
                          backgroundColor: isMine ? '#00BCD4' : '#666'
                        }
                      ]} 
                    />
                    <View style={styles.progressHandle} />
                  </View>
                  <View style={styles.voiceFooter}>
                    <Text style={styles.voiceDuration}>
                      {isPlaying || position > 0 ? formatTime(position) : formatTime(duration)}
                    </Text>
                    <View style={styles.voiceMicIcon}>
                      <Mic size={14} color={position > 0 || isPlaying ? "#34B7F1" : "#999"} />
                    </View>
                  </View>
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
          </>
          )}
        </View>
      </TouchableOpacity>
      
      {reactions.length > 0 && !isDeleted && (
        <View style={[styles.reactionsContainer, isMine ? styles.myReactions : styles.theirReactions]}>
          {Object.entries(
            reactions.reduce((acc: any, curr) => {
              acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
              return acc;
            }, {})
          ).map(([emoji, count]: [string, any]) => {
            const hasMyReaction = reactions.some(r => r.emoji === emoji && r.user_id === myUserId);
            return (
              <TouchableOpacity
                key={emoji}
                style={[styles.reactionChip, hasMyReaction && styles.myReactionChip]}
                onPress={() => onReactionPress?.(emoji)}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
  myDeletedBubble: {
    backgroundColor: '#D9FDD3', // WhatsApp sender deleted green
    borderWidth: 1,
    borderColor: '#C1E9BA',
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
  },
  theirDeletedBubble: {
    backgroundColor: '#F0F2F5', // WhatsApp receiver deleted grey
    borderWidth: 1,
    borderColor: '#E1E4E8',
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
  deletedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
    paddingVertical: 2,
  },
  deletedIcon: {
    marginRight: 8,
  },
  deletedText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    flex: 1,
  },
  timeDeleted: {
    fontSize: 10,
    color: '#999',
    marginLeft: 10,
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
    paddingVertical: 4,
    minWidth: 220,
  },
  voiceLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  voiceRightSide: {
    flex: 1,
    paddingRight: 5,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 1.5,
    width: '100%',
    marginBottom: 8,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  progressHandle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent', // Can be made visible if needed
    right: -5,
  },
  voiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceDuration: {
    fontSize: 12,
    color: '#666',
    fontVariant: ['tabular-nums'],
  },
  voiceMicIcon: {
    marginLeft: 5,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -8, // Overlay slightly on bubble
    zIndex: 10,
    elevation: 2,
    paddingHorizontal: 8,
  },
  myReactions: {
    justifyContent: 'flex-end',
    marginRight: 15,
  },
  theirReactions: {
    justifyContent: 'flex-start',
    marginLeft: 15,
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  myReactionChip: {
    backgroundColor: '#D1FAE5',
    borderColor: '#34D399',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    marginLeft: 2,
    color: '#666',
    fontWeight: '600',
  },
});
