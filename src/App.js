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
import {StripeProvider} from '@stripe/stripe-react-native';
import {OneSignal} from 'react-native-onesignal';
import {useEffect, useState} from 'react';
import {colors} from './utils/colors';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import DrawerNavigation from './navigators/DrawerNavigation';
import PopOver from './components/PopOver';
let persistor = persistStore(store);
export default function App() {
  useEffect(() => {
    OneSignal.initialize('42fd5097-a56d-47c5-abaa-6f4a836a143f');
    OneSignal.Notifications.requestPermission(true);
    console.log(
      OneSignal.User.pushSubscription.getPushSubscriptionId(),
      '========================getPushSubscriptionIdgetPushSubscriptionId====================',
    );
  }, []);
  const [isModalVisible, setModalVisible] = useState(false);
  const [notificationBody, setNotificationBody] = useState('');

  useEffect(() => {
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      // Extract notification body and set it in the state
      const body =
        event.notification.additionalData || 'Default Notification Body ';
      setNotificationBody(body);

      // Open the modal when the notification event is triggered
      setModalVisible(true);

      // Use display() to display the notification after some async work
      event.getNotification().display();
    });

    // Cleanup the event listener when the component unmounts
    return () => {
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
    };
  }, []);
  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey="pk_live_51NXhClKWwyvkxWsPW9XvP8jRCErDQsZESxSL6nguL6FyKL3FyGXQdB5LM0Dy28LO9pPpknPMDCqmu01d7YZ8HTbM00BGpPaPjx"
        urlScheme="your-url-scheme"
        merchantIdentifier="merchant.com.sheelni">
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
      </StripeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
