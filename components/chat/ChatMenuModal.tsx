import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Animated } from 'react-native';

interface ChatMenuModalProps {
  isMenuModalVisible: boolean;
  setIsMenuModalVisible: (val: boolean) => void;
  menuModalAnim: Animated.Value;
  onDeleteChatPress: () => void;
}

export function ChatMenuModal({
  isMenuModalVisible,
  setIsMenuModalVisible,
  menuModalAnim,
  onDeleteChatPress
}: ChatMenuModalProps) {
  return (
    <Modal
      visible={isMenuModalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={() => setIsMenuModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setIsMenuModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            {
              opacity: menuModalAnim,
              transform: [{ scale: menuModalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
            }
          ]}>
            <TouchableWithoutFeedback>
              <View>
                <Text style={styles.modalTitle}>Opsi Percakapan</Text>
                <Text style={styles.modalMessage}>Pilih tindakan untuk percakapan ini.</Text>

                <View style={[styles.modalActionContainer, { marginTop: 8 }]}>
                  <TouchableOpacity
                    onPress={() => {
                      setIsMenuModalVisible(false);
                      setTimeout(onDeleteChatPress, 300);
                    }}
                    style={{ paddingHorizontal: 16, paddingVertical: 10 }}
                  >
                    <Text style={[styles.modalCancelText, { color: '#00A884', fontSize: 13 }]}>HAPUS CHAT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsMenuModalVisible(false)}
                    style={{ paddingHorizontal: 16, paddingVertical: 10 }}
                  >
                    <Text style={[styles.modalCancelText, { color: '#00A884', fontSize: 13 }]}>BATAL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20
  },
  modalActionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  modalCancelText: {
    fontSize: 14,
    color: '#00A884',
    fontWeight: '600'
  },
});
