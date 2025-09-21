import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../../../utils/colors";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const ImagePickerModal = ({ isVisible, onClose, onCameraPress, onGalleryPress }) => {
  const { t } = useTranslation();
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible!=false}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.image_picker.title')}</Text>
              <Text style={styles.modalSubtitle}>{t('profile.image_picker.subtitle')}</Text>
            </View>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                onPress={onCameraPress}
                style={styles.optionButton}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="camera-outline"
                    size={40}
                    color={colors.secondary}
                  />
                </View>
                <Text style={styles.optionText}>{t('profile.image_picker.camera')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onGalleryPress}
                style={styles.optionButton}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="images-outline"
                    size={40}
                    color={colors.secondary}
                  />
                </View>
                <Text style={styles.optionText}>{t('profile.image_picker.gallery')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t('profile.image_picker.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: hp(2),
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  modalTitle: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: hp(0.5),
  },
  modalSubtitle: {
    fontSize: hp(1.6),
    color: '#666',
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: hp(2),
  },
  optionButton: {
    alignItems: 'center',
    width: wp(40),
  },
  iconContainer: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  optionText: {
    fontSize: hp(1.6),
    color: colors.secondary,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#F8F8F8',
    padding: hp(1.5),
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.secondary,
    fontSize: hp(1.8),
    fontWeight: '600',
  },
});

export default ImagePickerModal;
