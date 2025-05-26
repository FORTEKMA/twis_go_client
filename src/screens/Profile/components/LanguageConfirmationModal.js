import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';

const LanguageConfirmationModal = ({ isVisible, onClose, onConfirm, selectedLanguage }) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxWidth: '80%', padding: 20 }]}>
          <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 20 }]}>
            {t('profile.language.confirmation_title')}
          </Text>
          <Text style={[styles.modalButtonText, { textAlign: 'center', marginBottom: 20 }]}>
            {t('profile.language.confirmation_message')}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              style={[styles.languageButton, { backgroundColor: '#e0e0e0', marginRight: 10, flex: 1, alignItems: "center", justifyContent: "center" }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { textAlign: "center" }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, { backgroundColor: '#0c0c0c', flex: 1, alignItems: "center", justifyContent: "center" }]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalButtonText, { textAlign: "center" }]}>{t('common.yes')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LanguageConfirmationModal; 