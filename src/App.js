/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Platform,
  SafeAreaView,
} from 'react-native';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import 'react-native-gesture-handler';
import store from './store';
import {ONESIGNAL_APP_ID} from '@env';
import {Provider} from 'react-redux';
import {NativeBaseProvider} from 'native-base';
import MainNavigator from './navigators/Main';
 import {OneSignal} from 'react-native-onesignal';
import {useEffect, useState} from 'react';
import {colors} from './utils/colors';
import "./local"
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
  import PopOver from './components/PopOver';
let persistor = persistStore(store);
export default function App() {
  useEffect( () => {
 //   initializeFirebase();

    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(true);
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
            </NativeBaseProvider>
          </PersistGate>
        </Provider>
     
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
