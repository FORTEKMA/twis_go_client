import { Platform } from 'react-native';

export const reloadApp = () => {
  if (Platform.OS === 'ios') {
    // For iOS, we need to reload the app
    const { NativeModules } = require('react-native');
    NativeModules.DevSettings.reload();
  } else {
    // For Android, we can use the DevSettings module
    const { DevSettings } = require('react-native');
    DevSettings.reload();
  }
}; 