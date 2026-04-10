import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Pin, CheckCheck } from 'lucide-react-native';

interface MessageBubbleProps {
  message: string;
  time: string;
  isMine: boolean;
  onLongPress?: () => void;
  isPinned?: boolean;
  isEdited?: boolean;
  replyTo?: {
    name: string;
    text: string;
  };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  time,
  isMine,
  onLongPress,
  isPinned,
  isEdited,
  replyTo,
}) => {
  return (
    <View style={[styles.outerContainer, isMine ? styles.myOuterContainer : styles.theirOuterContainer]}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        onLongPress={onLongPress}
        style={[styles.container, isMine ? styles.myMessageContainer : styles.theirMessageContainer]}
      >
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          {replyTo && (
            <View style={styles.replyContainer}>
              <View style={styles.replyBar} />
              <View style={styles.replyContent}>
                <Text style={styles.replyName}>{replyTo.name}</Text>
                <Text style={styles.replyText} numberOfLines={1}>{replyTo.text}</Text>
              </View>
            </View>
          )}
          
          <Text style={[styles.message, isMine ? styles.myMessage : styles.theirMessage]}>
            {message}
          </Text>
          
          <View style={styles.footer}>
            {isEdited && <Text style={styles.editedLabel}>(diedit)</Text>}
            {isPinned && <Pin size={10} color="#666" style={styles.pinIcon} />}
            <Text style={[styles.time, isMine ? styles.myTime : styles.theirTime]}>{time}</Text>
            {isMine && <CheckCheck size={14} color="#34B7F1" style={styles.checkIcon} />}
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
});
