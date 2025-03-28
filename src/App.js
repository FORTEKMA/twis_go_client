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

let persistor = persistStore(store);
export default function App() {
  useEffect(() => {
    OneSignal.initialize('2b6f2b0c-0070-4da7-b3c8-f8632a306bcb');
    OneSignal.Notifications.requestPermission(true);
  }, []);
  const [isModalVisible, setModalVisible] = useState(false);
  const [notificationBody, setNotificationBody] = useState('');

  useEffect(() => {
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      // Extract notification body and set it in the state
      const body = event.notification.body || 'Default Notification Body';
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
              <MainNavigator />
              <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => {
                  setModalVisible(!isModalVisible);
                }}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <View style={styles.modalHead}>
                      <Text
                        style={{
                          fontWeight: '600',
                          fontSize: 20,
                          color: 'black',
                        }}>
                        Notification
                      </Text>
                      <Text
                        style={{
                          fontWeight: '500',
                          fontSize: 16,
                          color: 'gray',
                          textAlign: 'center',
                        }}>
                        {notificationBody}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.modalBottom}
                      onPress={() => setModalVisible(!isModalVisible)}>
                      <Text style={{color: colors.secondary}}>Continuer</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
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
    backgroundColor: '#fff',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    zIndex: 9999,
  },
  modalView: {
    width: wp('80%'),
    flex: 0.27,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,

    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalHead: {
    flex: 0.7,
    alignItems: 'center',

    justifyContent: 'space-evenly',
    paddingHorizontal: 15,
  },
  modalBottom: {
    width: '100%',
    flex: 0.3,
    backgroundColor: colors.primary,
    alignItems: 'center',

    justifyContent: 'center',
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
});
