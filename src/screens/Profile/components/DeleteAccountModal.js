import React from 'react';
import { Modal, View, Text, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { logOut } from '../../../store/userSlice/userSlice';
import OneSignal from 'react-native-onesignal';
import { useNavigation } from '@react-navigation/native';

const DeleteAccountModal = ({ isVisible, onClose }) => {
  const { t } = useTranslation();
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const navigation = useNavigation();

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

  const onDelete = () => {
    console.log("Account deletion confirmed");
    dispatch(logOut()).then(() => {
      OneSignal.logout();
      navigation.navigate("Login");
    });
    onClose();
   
  };

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
            <Icon name="delete-alert" size={40} color="#d32f2f" />
          </View>
          <Text style={styles.modalTitle}>{t('profile.delete_account.title')}</Text>
          <Text style={styles.modalMessage}>
            {t('profile.delete_account.message')}
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>{t('profile.delete_account.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#d32f2f' }]}
              onPress={onDelete}
            >
              <Text style={[styles.modalButtonText, { color: 'white' }]}>{t('profile.delete_account.button')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default DeleteAccountModal; 