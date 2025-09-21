import React from 'react';
import { Modal, View, Text, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LogoutModal = ({ isVisible, onClose, onLogout }) => {
  const { t } = useTranslation();
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleValue }],
              width: '90%',
            },
          ]}
        >
          <View style={styles.modalIconContainer}>
            <Icon name="logout" size={40} color="#18365A" />
          </View>
          <Text style={styles.modalTitle}>{t('profile.logout.title')}</Text>
          <Text style={styles.modalMessage}>
            {t('profile.logout.message')}
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>{t('profile.logout.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary,]}
              onPress={onLogout}
            >
              <Text style={[styles.modalButtonText,{color:"#fff"}]}>{t('profile.logout.button')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default LogoutModal;
