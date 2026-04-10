import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Reply, Pin, Copy, Trash2, Edit2 } from 'lucide-react-native';

interface MessageActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onReply: () => void;
  onEdit: () => void;
  onPin: () => void;
  onCopy: () => void;
  onDelete: () => void;
  isPinned?: boolean;
}

export const MessageActionMenu: React.FC<MessageActionMenuProps> = ({
  visible,
  onClose,
  onReply,
  onEdit,
  onPin,
  onCopy,
  onDelete,
  isPinned = false,
}) => {
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
              <TouchableOpacity style={styles.menuItem} onPress={() => { onReply(); onClose(); }}>
                <Reply size={20} color="#333" />
                <Text style={styles.menuText}>Balas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => { onEdit(); onClose(); }}>
                <Edit2 size={20} color="#333" />
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
              
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
});
