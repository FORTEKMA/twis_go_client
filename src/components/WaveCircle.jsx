import axios from 'axios';
import React, {useEffect, useRef} from 'react';
import {
  Animated,
  View,
  Image,
  StyleSheet,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSelector} from 'react-redux';

const WaveCircle = ({formData, drivers}) => {
  // const currentUser = useSelector(state => state.user.currentUser);
  // const drivers = useSelector(state => state.driver.drivers);
  console.log('====================================================');
  const rippleCount = 3;
  const ripples = useRef(
    [...Array(rippleCount)].map(() => new Animated.Value(0)),
  ).current;
 
  //   ripples.forEach((anim, index) => {
  //     const delay = index * 1000; // delay each ripple by 1s
  //     Animated.loop(
  //       Animated.sequence([
  //         Animated.delay(delay),
  //         Animated.timing(anim, {
  //           toValue: 1,
  //           duration: 3000,
  //           easing: Easing.out(Easing.ease),
  //           useNativeDriver: true,
  //         }),
  //         Animated.timing(anim, {
  //           toValue: 0,
  //           duration: 0,
  //           useNativeDriver: true,
  //         }),
  //       ]),
  //     ).start();
  //   });
  // }, []);

  // console.log('<====>', currentUser, '===============', formData, price);

  // const sendPushToMultipleUsers = async (userIds, message) => {
  //   const ONESIGNAL_APP_ID = 'your-onesignal-app-id';
  //   const ONESIGNAL_REST_API_KEY = 'your-onesignal-rest-api-key';

  //   const body = {
  //     app_id: ONESIGNAL_APP_ID,
  //     include_external_user_ids: userIds, // array of strings
  //     contents: {en: message},
  //     headings: {en: '📣 Notification'},
  //   };

  //   try {
  //     const response = await fetch('https://onesignal.com/api/v1/notifications', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
  //       },
  //       body: JSON.stringify(body),
  //     });

  //     const data = await response.json();
  //     console.log('Push sent successfully:', data);
  //   } catch (error) {
  //     console.error('Push error:', error);
  //   }
  // };
  // const ONESIGNAL_APP_ID = '42fd5097-a56d-47c5-abaa-6f4a836a143f';
  // const REST_API_KEY =
  //   'os_v2_app_il6vbf5fnvd4lk5kn5fig2quh7tcjfdltfzuajfae3zukc4k5mg365rpcmrql6fkjxdttj33revv7by2ytyyvin3lmemlqdsfnpybdy'; // Replace with your real REST API Key

  // const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  // const sendSequentialNotifications = async drivers => {
  //   console.log('====================================================');
  //   for (const driver of drivers) {
  //     const notificationId = driver.notificationId;
  //     if (!notificationId) continue;
  //     console.log(notificationId, '==== notificationId ====');
  //     // 🛑 Step 2: Prepare ride info
  //     const rideInfo = {
  //       from: formData.pickup.address,
  //       coordonneFrom: {
  //         longitude: formData.pickup.longitude,
  //         latitude: formData.pickup.latitude,
  //       },
  //       coordonneTo: {
  //         longitude: formData.drop.longitude,
  //         latitude: formData.drop.latitude,
  //       },
  //       to: formData.drop.address,
  //       time: formData.selectedDate,
  //       price: driver.price,
  //       currentUser: currentUser,
  //       distanceBetweenPickupAndDropoff: driver.distance,
  //       driverPosition: '',
  //     };

  //     // 🛑 Step 3: Send notification
  //     try {
  //       const response = await axios.post(
  //         'https://onesignal.com/api/v1/notifications',
  //         {
  //           app_id: ONESIGNAL_APP_ID,
  //           include_player_ids: [notificationId],
  //           headings: {en: 'New Ride'},
  //           contents: {
  //             en: 'You have a new ride request!',
  //             ar: 'لديك طلب رحلة جديد!',
  //           },
  //           priority: 10,
  //           data: rideInfo,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Basic ${REST_API_KEY}`,
  //             'Content-Type': 'application/json',
  //           },
  //         },
  //       );

  //       console.log(
  //         `✅ Notification sent to ${driver.username || notificationId}`,
  //       );
  //     } catch (error) {
  //       console.error(
  //         `❌ Error sending notification to ${
  //           driver.username || notificationId
  //         }:`,
  //         error.response?.data || error.message,
  //       );
  //     }
  //     await wait(2200); // optional wait
  //   }
  // };

  // useEffect(() => {
  //   if (drivers?.length > 0) {
  //     sendSequentialNotifications(drivers);
  //   }
  // }, [drivers]);
  return (
    <View style={[styles.markerContainer, {pointerEvents: 'none'}]}>
      {ripples.map((anim, idx) => {
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 3],
        });

        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 0],
        });

        return (
          <Animated.View
            key={idx}
            style={[
              styles.waveCircle,
              {
                transform: [{scale}],
                opacity,
              },
            ]}
          />
        );
      })}

      <TouchableWithoutFeedback>
        <Image
          source={require('../assets/A_Tawsilet.png')}
          style={{width: 80, height: 80}}
          resizeMode="contain"
        />
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 175, 55, 1)',
  },
});

export default WaveCircle;
