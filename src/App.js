import React, {useEffect, useState} from 'react';

import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Platform,
  SafeAreaView,
  I18nManager
} from 'react-native';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';

import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import 'react-native-gesture-handler';
import store from './store';
import {ONESIGNAL_APP_ID} from '@env';
import {Provider} from 'react-redux';
import {NativeBaseProvider} from 'native-base';
import MainNavigator from './navigators/Main';
import {OneSignal} from 'react-native-onesignal';
import {colors} from './utils/colors';
import './local';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import PopOver from './components/PopOver';
import {ModalPortal} from 'react-native-modals';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "./local";
Sentry.init({
  dsn: 'https://06ca632b0190704d22beae416f99b03e@o4509329011572736.ingest.de.sentry.io/4509329041588304',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

let persistor = persistStore(store);
export default Sentry.wrap(function App() {
  useKeepAwake()


    const setupLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      const language = savedLanguage || "fr";
      await i18n.changeLanguage(language);
      const isRTL = i18n.dir(language) === "rtl";
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    } catch (error) {
      console.error("Error setting up language:", error);
    }
  };

  
  useEffect(() => {
     
      SplashScreen.hide();

      OneSignal.initialize(ONESIGNAL_APP_ID);
      OneSignal.Notifications.requestPermission(true)
        

       setupLanguage()
       
  }, []);
  const [isModalVisible, setModalVisible] = useState(false);
  const [notificationBody, setNotificationBody] = useState('');

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NativeBaseProvider>
            {/* <DrawerNavigation /> */}
            <View style={styles.container}>
              <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                  <MainNavigator />
                  {isModalVisible && (
                    <PopOver
                      notificationBody={notificationBody}
                      isModalVisible={isModalVisible}
                      setModalVisible={setModalVisible}
                    />
                  )}
                </PersistGate>
              </Provider>
            </View>
            <ModalPortal />
          </NativeBaseProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
