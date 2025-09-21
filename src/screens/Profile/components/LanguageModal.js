import React from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, Image, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LanguageModal = ({ isVisible, onClose, onLanguageSelect }) => {
  const { t } = useTranslation();
  const translateY = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      translateY.setValue(300);
    }
  }, [isVisible]);

  const isRTL = (language) => {
    return language === 'ar';
  };

  const handleLanguageSelect = (language) => {
    const currentIsRTL = I18nManager.isRTL;
    const newIsRTL = isRTL(language);
    
    // Only show confirmation if direction will change
    if (currentIsRTL !== newIsRTL) {
      onLanguageSelect(language, true);
    } else {
      // If direction doesn't change, change language directly
      onLanguageSelect(language, false);
    }
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ translateY }],
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
        >
          <TouchableOpacity 
            style={{ position: 'absolute', right: 15, top: 15, zIndex: 1 }}
            onPress={onClose}
          >
            <Icon name="close" size={24} color="#18365A" />
          </TouchableOpacity>

          <View style={styles.modalIconContainer}>
            <Icon name="translate" size={40} color="#18365A" />
          </View>
          <Text style={styles.modalTitle}>{t('profile.language.title')}</Text>
          
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[styles.languageButton]}
              onPress={() => handleLanguageSelect('fr')}
            >
              <Image 
                source={{ uri: 'https://flagcdn.com/w40/fr.png' }}
                style={{ width: 30, height: 20, marginRight: 10 }}
                resizeMode="contain"
              />
              <Text style={styles.modalButtonText}>{t('profile.language.french')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageButton]}
              onPress={() => handleLanguageSelect('en')}
            >
              <Image 
                source={{ uri: 'https://flagcdn.com/w40/us.png' }}
                style={{ width: 30, height: 20, marginRight: 10 }}
                resizeMode="contain"
              />
              <Text style={styles.modalButtonText}>{t('profile.language.english')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.languageButton]}
              onPress={() => handleLanguageSelect('ar')}
            >
              <Image 
                source={{ uri: 'https://flagcdn.com/w40/sa.png' }}
                style={{ width: 30, height: 20, marginRight: 10 }}
                resizeMode="contain"
              />
              <Text style={styles.modalButtonText}>{t('profile.language.arabic')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default LanguageModal; 