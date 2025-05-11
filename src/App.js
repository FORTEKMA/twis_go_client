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
import {ONESIGNAL_API_ANDROID, ONESIGNAL_API_IOS} from '@env';
import {Provider} from 'react-redux';
import {Button, NativeBaseProvider} from 'native-base';
import MainNavigator from './navigators/Main';
 import {OneSignal} from 'react-native-onesignal';
import {useEffect, useState} from 'react';
import {colors} from './utils/colors';
import "./local"
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
 import PopOver from './components/PopOver';
let persistor = persistStore(store);
export default function App() {
  useEffect( () => {
    OneSignal.initialize('42fd5097-a56d-47c5-abaa-6f4a836a143f');
    OneSignal.Notifications.requestPermission(true);
  //   const NotificationId =await OneSignal.User.pushSubscription.getPushSubscriptionId();
  // console.log(NotificationId, '============NotificationId=================');
  }, []);
  const [isModalVisible, setModalVisible] = useState(false);
  const [notificationBody, setNotificationBody] = useState('');
  // useEffect(() => {
  //   OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
     
  //     const body = event.notification.additionalData;
     
  //     setNotificationBody(body);
     
  //     setModalVisible(true); 
  //     event.getNotification().display();
  //   }); 
  //   return () => {
  //     OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
  //   };
  // }, []);
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
