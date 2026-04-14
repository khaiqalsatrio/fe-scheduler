import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  TouchableWithoutFeedback, 
  Platform 
} from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'destructive' | 'primary';
  singleButton?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'primary',
  singleButton = false
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      animatedValue.setValue(0);
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 12,
        speed: 10
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 10
      }).start();
    }
  }, [visible]);

  const confirmButtonColor = type === 'destructive' ? '#E91E63' : '#00A884';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            { 
              opacity: animatedValue,
              transform: [{ 
                scale: animatedValue.interpolate({ 
                  inputRange: [0, 1], 
                  outputRange: [0.8, 1] 
                }) 
              }] 
            }
          ]}>
            <TouchableWithoutFeedback>
              <View>
                <Text style={styles.modalTitle}>{title}</Text>
                <Text style={styles.modalMessage}>{message}</Text>
                
                <View style={styles.modalActionContainer}>
                  {!singleButton && (
                    <TouchableOpacity 
                      onPress={onClose}
                      style={styles.modalCancelButton}
                    >
                      <Text style={styles.modalCancelText}>{cancelText}</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    onPress={onConfirm}
                    style={[styles.modalConfirmButton, { backgroundColor: confirmButtonColor }]}
                  >
                    <Text style={styles.modalConfirmText}>{confirmText}</Text>
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
    maxWidth: 340,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
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
  modalCancelButton: {
    marginRight: 24,
    paddingVertical: 8
  },
  modalCancelText: {
    fontSize: 14,
    color: '#00A884',
    fontWeight: '600'
  },
  modalConfirmButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  modalConfirmText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '700'
  },
});
