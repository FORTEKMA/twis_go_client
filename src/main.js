import React, { useEffect, useState } from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import * as amplitude from '@amplitude/analytics-react-native';
import { withStallion, useStallionUpdate, restart } from 'react-native-stallion';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { OneSignal } from 'react-native-onesignal';
import LottieSplashScreen from '@attarchi/react-native-lottie-splash-screen';
import { checkVersion } from 'react-native-check-version';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './local';
import UpdateBlockScreen from './components/UpdateBlockScreen';
import MainNavigator from './navigators/Main';
import api from './utils/api';
import { processNavigationQueue, navigationRef, navigate } from './navigators/navigationRef';
import * as Sentry from '@sentry/react-native';
import { ONESIGNAL_APP_ID } from '@env';
import { useSelector } from 'react-redux';

// Initialize Amplitude once
amplitude.init('d977e9d7ccb4617cd9e2a90ec1d95e27', '', { disableCookies: true });

// Initialize Sentry only in production
if (!__DEV__) {
  Sentry.init({
    dsn: 'https://06ca632b0190704d22beae416f99b03e@o4509329011572736.ingest.de.sentry.io/4509329041588304',
    release: '1.4.1',
    dist: '5',
    enableNative: true,
    debug: false,
    environment: 'production',
  });
}

const Main = () => {
  useKeepAwake();
  const { isRestartRequired } = useStallionUpdate();

  const [updateRequired, setUpdateRequired] = useState(false);
  const [storeUrl, setStoreUrl] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const clientDocumentId = useSelector((state) => state?.user?.user?.documentId || state?.user?.currentUser?.documentId);
 
  const setupLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      const language = savedLanguage || 'fr';
      await i18n.changeLanguage(language);
      const isRTL = i18n.dir(language) === 'rtl';
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    } catch (error) {
      console.error('Error setting up language:', error);
    }
  };

  useEffect(() => {
    if (isRestartRequired) {
      restart();
    }
  }, [isRestartRequired]);

  useEffect(() => {
    if (isInitialized) return;
    setIsInitialized(true);

    // OneSignal
    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.User.setLanguage('fr');
    OneSignal.Notifications.requestPermission(true);

    // Notification open handler
    OneSignal.Notifications.addEventListener('click', (event) => {
      try {
        const data = event?.notification?.additionalData || event?.notification?.data || {};
        const commandId = data.commandId || data.command_id || data.id || data.documentId;
        if (commandId) {
          navigate('Historique', { screen: 'OrderDetails', params: { id: commandId } });
        }
      } catch (e) {
        console.error('Error handling notification open:', e);
      }
    });

    setupLanguage();

    // Maintenance check moved to MainScreen

    // Google Sign-In
    GoogleSignin.configure({
      iosClientId: '960462603456-vkbvlpur2nvg8t2uvo1d1dp2ja1vcoio.apps.googleusercontent.com',
      offlineAccess: false,
      client_id: '960462603456-lea706mqdejqra584ckvd6guhi30pqmp.apps.googleusercontent.com',
    });

    // (active-order redirect moved to a dedicated effect below)

    // Version check
    checkVersion()
      .then((res) => {
        if (res.needsUpdate == true) {
          setUpdateRequired(true);
          setStoreUrl(res.url);
        }
      })
      .catch(() => {});
  }, [isInitialized]);

  // Redirect to active order when user id becomes available/changes
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        if (!clientDocumentId) return;
        const excludedStatuses = [
          'Canceled_by_partner',
          'Completed',
          'Canceled_by_client',
          'Canceled_by_admin',
        ];
        const statusFilter = excludedStatuses
          .map((s) => `filters[commandStatus][$notIn]=${encodeURIComponent(s)}`)
          .join('&');
        const listRes = await api.get(
          `/commands?filters[client][documentId][$eq]=${encodeURIComponent(
            clientDocumentId
          )}&${statusFilter}&sort=createdAt:desc&pagination[pageSize]=5`
        );
        
        
        if (cancelled) return;
        const rawItems = listRes?.data?.data || [];
        // Safe client-side filter (only by commandStatus)
        const items = rawItems.filter((item) => {
          const attrs = item?.attributes || item;
          const status = attrs?.commandStatus;
          const statusOk = !excludedStatuses.includes(status);
          return statusOk;
        });
        if (items.length > 0) {
          const first = items[0];

          const id = first?.documentId || first?.id;
          if (id) {
            navigate('Historique', { screen: 'OrderDetails', params: { id } });
          }
        }
      } catch (_) {}
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [clientDocumentId]);

  const onReady = () => {
    LottieSplashScreen.hide();
    setTimeout(() => {
      processNavigationQueue();
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {updateRequired ? (
        <UpdateBlockScreen storeUrl={storeUrl} />
      ) : (
        <MainNavigator onReady={onReady} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default withStallion(Main);

