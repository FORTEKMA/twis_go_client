import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import en from './locales/en.json'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { reloadApp } from '../utils/reloadApp';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: fr
      },
      ar: {
        translation: ar
      },
      en: {
        translation: en
      }
    },
    lng: 'fr', // default language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export const changeLanguage = async (language: string) => {
  const isRTL = language === 'ar';
  
  // Only force RTL/LTR if the current layout direction is different
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    await AsyncStorage.setItem('language', language);
    i18n.changeLanguage(language);
    // Reload the app to apply RTL changes
    reloadApp();
  } else {
    await AsyncStorage.setItem('language', language);
    i18n.changeLanguage(language);
  }
};

export default i18n; 