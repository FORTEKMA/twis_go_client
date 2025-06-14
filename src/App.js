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
import CheckConnection from './components/CheckConnection';
Sentry.init({
  dsn: 'https://06ca632b0190704d22beae416f99b03e@o4509329011572736.ingest.de.sentry.io/4509329041588304',
  release: "com.fortekma.tawsilet", // Must match Gradle
  dist: "1.4.1", // Must match Gradle
  enableNative: true,
});

let persistor = persistStore(store);
const App=()=> {
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
     

    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(true)
        

    setupLanguage()
       
  }, []);

  onReady=()=>{
    SplashScreen.hide();
  }

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
                  <MainNavigator  onReady={onReady} />
                  <CheckConnection />
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Sentry.wrap(App)
