import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Pin, X } from 'lucide-react-native';
import { Message } from '../../types/chat';

interface PinnedMessagesProps {
  pinnedMessages: Message[];
  activePinnedIndex: number;
  setActivePinnedIndex: React.Dispatch<React.SetStateAction<number>>;
  jumpToMessage: (messageId: string) => void;
  chatName: string;
  onUnpin?: (messageId: string) => void;
}

export function PinnedMessages({
  pinnedMessages,
  activePinnedIndex,
  setActivePinnedIndex,
  jumpToMessage,
  chatName,
  onUnpin
}: PinnedMessagesProps) {
  if (pinnedMessages.length === 0) return null;

  const current = pinnedMessages[activePinnedIndex % pinnedMessages.length];

  return (
    <View style={styles.pinnedMessagesBar}>
      <TouchableOpacity style={styles.pinnedContent} onPress={() => {
        if (current) jumpToMessage(current.id);
        if (pinnedMessages.length > 1) setActivePinnedIndex(prev => (prev + 1) % pinnedMessages.length);
      }}>
        <Pin size={16} color="#666" style={styles.pinnedIcon} />
        <View style={styles.pinnedTextContainer}>
          <Text style={styles.pinnedCompactText} numberOfLines={1}>
            <Text style={styles.pinnedSenderName}>{chatName}: </Text>
            {current?.text}
          </Text>
        </View>
        {pinnedMessages.length > 1 && (
          <View style={styles.pinnedBadgeMini}>
            <Text style={styles.pinnedBadgeText}>{pinnedMessages.length}</Text>
          </View>
        )}
      </TouchableOpacity>
      {onUnpin && (
        <TouchableOpacity 
          style={styles.unpinButton} 
          onPress={() => onUnpin(current.id)}
        >
          <X size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pinnedMessagesBar: { width: '100%', backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0', flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  pinnedContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  pinnedIcon: { marginRight: 10 },
  pinnedTextContainer: { flex: 1 },
  pinnedCompactText: { fontSize: 14, color: '#333' },
  pinnedSenderName: { fontWeight: '700', color: '#00A884' },
  pinnedBadgeMini: { backgroundColor: '#F0F2F5', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  pinnedBadgeText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  unpinButton: { padding: 5, marginLeft: 10 },
});
