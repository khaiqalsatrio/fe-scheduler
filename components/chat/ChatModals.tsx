import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Animated, TouchableWithoutFeedback } from 'react-native';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
}

interface DeleteModalProps extends BaseModalProps {
  onConfirm: () => void;
}

export const DeleteConversationModal: React.FC<DeleteModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 12,
        speed: 10
      }).start();
    }
  }, [visible, anim]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            {
              opacity: anim,
              transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
            }
          ]}>
            <TouchableWithoutFeedback>
              <View>
                <Text style={styles.modalTitle}>Hapus Percakapan</Text>
                <Text style={styles.modalMessage}>Hapus percakapan terpilih secara permanen?</Text>

                <View style={styles.modalActionContainer}>
                  <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                    <Text style={styles.modalActionText}>BATAL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onConfirm} style={styles.modalDeleteButton}>
                    <Text style={styles.modalDeleteText}>HAPUS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

interface MuteModalProps extends BaseModalProps {
  selectedCount: number;
  muteDuration: string;
  setMuteDuration: (d: '8h' | '1w' | 'always') => void;
  onConfirm: () => void;
}

export const MuteOptionsModal: React.FC<MuteModalProps> = ({
  visible,
  onClose,
  selectedCount,
  muteDuration,
  setMuteDuration,
  onConfirm,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 12,
        speed: 10
      }).start();
    }
  }, [visible, anim]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            {
              opacity: anim,
              transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
            }
          ]}>
            <TouchableWithoutFeedback>
              <View>
                <Text style={styles.muteModalTitle}>Bisukan notifikasi untuk {selectedCount} chat?</Text>

                <TouchableOpacity style={styles.muteOption} onPress={() => setMuteDuration('8h')}>
                  <View style={[styles.muteRadio, muteDuration === '8h' && styles.muteRadioActive]} />
                  <Text style={styles.muteOptionText}>8 Jam</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.muteOption} onPress={() => setMuteDuration('1w')}>
                  <View style={[styles.muteRadio, muteDuration === '1w' && styles.muteRadioActive]} />
                  <Text style={styles.muteOptionText}>1 Minggu</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.muteOption} onPress={() => setMuteDuration('always')}>
                  <View style={[styles.muteRadio, muteDuration === 'always' && styles.muteRadioActive]} />
                  <Text style={styles.muteOptionText}>Selalu</Text>
                </TouchableOpacity>

                <View style={styles.modalActionContainer}>
                  <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                    <Text style={styles.modalActionText}>BATAL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onConfirm} style={{ paddingHorizontal: 16, paddingVertical: 10, marginLeft: 8 }}>
                    <Text style={styles.modalActionText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

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
    maxWidth: 320,
    backgroundColor: '#FFF',
    borderRadius: 8,
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
    color: '#333',
    marginBottom: 15
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22
  },
  modalActionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10
  },
  modalActionText: {
    fontSize: 14,
    color: '#075E54',
    fontWeight: '700'
  },
  modalDeleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 10,
    backgroundColor: '#075E54',
    borderRadius: 4
  },
  modalDeleteText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '700'
  },
  muteModalTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    lineHeight: 24
  },
  muteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  muteRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 15
  },
  muteRadioActive: {
    borderColor: '#075E54',
    backgroundColor: '#075E54'
  },
  muteOptionText: {
    fontSize: 16,
    color: '#333'
  }
});
