import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../utils/colors';

const OrderCancelConfirmationModal = ({ visible, onClose, onConfirm }) => {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('history.card.cancel_confirmation')}</Text>
          <Text style={styles.modalText}>{t('history.card.cancel_message')}</Text>
          <View style={styles.modalButtons}>


            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonTextPrimary}>{t('common.no')}</Text>
            </TouchableOpacity>


            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={onConfirm}
            >
              <Text style={styles.modalButtonTextSecondary}>{t('common.yes')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonTextSecondary: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OrderCancelConfirmationModal; 