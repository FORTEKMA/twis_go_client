import React from 'react';
import { StyleSheet, View } from 'react-native';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import 'react-native-gesture-handler';
import { withStallion } from 'react-native-stallion';
import store from './store';
import { setStoreReference } from './utils/api';
import Main from './main';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ModalPortal } from 'react-native-modals';
import Toast from 'react-native-toast-message';
import CheckConnection from './components/CheckConnection';

// App shell keeps providers only; initialization moved to main.js


let persistor = persistStore(store);

// Set store reference for API module
setStoreReference(store);

 

const App=()=> {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <View style={styles.container}>
            <Main />
             <CheckConnection />
              
              
              <Toast
        position='top'
        
      />
            
          </View>
          <ModalPortal />
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

export default withStallion(App);


