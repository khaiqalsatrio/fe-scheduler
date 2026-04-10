import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Paperclip, Camera, Mic, Send, X, Check } from 'lucide-react-native';

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
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  replyingTo, 
  onCancelReply,
  isEditing,
  editInitialText,
  onUpdate,
  onCancelEdit
}) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isEditing && editInitialText) {
      setText(editInitialText);
    } else if (!isEditing) {
      setText('');
    }
  }, [isEditing, editInitialText]);

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
            <TextInput
              style={styles.input}
              placeholder="Message or mention @"
              placeholderTextColor="#999"
              value={text}
              onChangeText={setText}
              multiline
            />
            <TouchableOpacity style={styles.iconButton}>
              <Paperclip color="#666" size={22} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Camera color="#666" size={22} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, isEditing && { backgroundColor: '#4CAF50' }]}
            onPress={handleAction}
            activeOpacity={0.8}
          >
            {isEditing ? (
              <Check color="#FFF" size={24} />
            ) : text.trim() ? (
              <Send color="#FFF" size={20} style={{ marginLeft: 2 }} />
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
    backgroundColor: 'transparent',
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
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 5,
    marginRight: 8,
    minHeight: 48,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  iconButton: {
    padding: 8,
  },
});
