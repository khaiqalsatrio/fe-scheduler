import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { EmojiPicker } from './EmojiPicker';
import { Reply, Pin, Copy, Trash2, Edit2, Forward } from 'lucide-react-native';
interface MessageActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onReply: () => void;
  onEdit: () => void;
  onPin: () => void;
  onForward: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
  isPinned?: boolean;
  canEdit?: boolean;
}

export const MessageActionMenu: React.FC<MessageActionMenuProps> = ({
  visible,
  onClose,
  onReply,
  onEdit,
  onPin,
  onForward,
  onCopy,
  onDelete,
  onReact,
  isPinned = false,
  canEdit = false,
}) => {
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = React.useState(false);
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              <View style={styles.reactionRow}>
                {quickReactions.map((emoji) => (
                  <TouchableOpacity 
                    key={emoji} 
                    style={styles.reactionButton}
                    onPress={() => { onReact(emoji); onClose(); }}
                  >
                    <Text style={styles.reactionEmojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={styles.reactionButton}
                  onPress={() => setIsEmojiPickerVisible(true)}
                >
                  <Text style={styles.plusEmojiText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <EmojiPicker
                visible={isEmojiPickerVisible}
                onClose={() => setIsEmojiPickerVisible(false)}
                onSelect={(emoji) => {
                  onReact(emoji);
                  onClose(); // Close the main menu too
                }}
              />

              <TouchableOpacity style={styles.menuItem} onPress={() => { onReply(); onClose(); }}>
                <Reply size={20} color="#333" />
                <Text style={styles.menuText}>Balas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => { onForward(); onClose(); }}>
                <Forward size={20} color="#333" />
                <Text style={styles.menuText}>Teruskan</Text>
              </TouchableOpacity>
              
              {canEdit && (
                <TouchableOpacity style={styles.menuItem} onPress={() => { onEdit(); onClose(); }}>
                  <Edit2 size={20} color="#333" />
                  <Text style={styles.menuText}>Edit</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.menuItem} onPress={() => { onPin(); onClose(); }}>
                <Pin size={20} color="#333" />
                <Text style={styles.menuText}>{isPinned ? 'Lepas Sematan' : 'Sematkan'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => { onCopy(); onClose(); }}>
                <Copy size={20} color="#333" />
                <Text style={styles.menuText}>Salin</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity style={styles.menuItem} onPress={() => { onDelete(); onClose(); }}>
                <Trash2 size={20} color="#FF3B30" />
                <Text style={[styles.menuText, styles.deleteText]}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: 250,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 4,
  },
  deleteText: {
    color: '#FF3B30',
  },
  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  reactionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionEmojiText: {
    fontSize: 22,
  },
  plusEmojiText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
});
