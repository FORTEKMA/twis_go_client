import axios from 'axios';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  View,
  Image,
  StyleSheet,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

const WaveCircle = ({formData, price}) => {
  const [distanceBetweenPickupAndDropoff, setDistanceBetweenPickupAndDropoff] =
    useState({
      distnace: null,
      duration: null,
      durationInTraffic: null,
    });
  const currentUser = useSelector(state => state.user.currentUser);
  const drivers = useSelector(state => state.driver.drivers);
  console.log(drivers, 'drivers==========');
  console.log( 'work==========');
  const rippleCount = 3;
  const ripples = useRef(
    [...Array(rippleCount)].map(() => new Animated.Value(0)),
  ).current;

  // useEffect(() => {
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
  const fetchRoute = async formData => {
    const origin = `${formData.pickup.latitude},${formData.pickup.longitude}`;
    const destination = `${formData.drop.latitude},${formData.drop.longitude}`;
    const API_KEY = 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE';

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&departure_time=now&mode=driving&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.routes.length) {
      const points = polyline.decode(data.routes[0].overview_polyline.points);
      const coords = points.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));
      // setDistanceBetweenPickupAndDropoff(coords);

      const leg = data.routes[0].legs[0];
      setDistanceBetweenPickupAndDropoff({
        distnace: leg.distance.text,
        duration: leg.distance.text,
        durationInTraffic: leg.duration_in_traffic?.text,
      });
      console.log('Distance:', leg.distance.text);
      console.log('Normal Duration:', leg.duration.text);
      console.log(
        'Duration in Traffic:',
        leg.duration_in_traffic?.text || 'N/A',
      );
    }
  };
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
  const ONESIGNAL_APP_ID = '42fd5097-a56d-47c5-abaa-6f4a836a143f';
  const REST_API_KEY = 
    'os_v2_app_il6vbf5fnvd4lk5kn5fig2quh7tcjfdltfzuajfae3zukc4k5mg365rpcmrql6fkjxdttj33revv7by2ytyyvin3lmemlqdsfnpybdy'; // Replace with your real REST API Key

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const sendSequentialNotifications = async drivers => {
    console.log(drivers, '===driver===');
    for (const driver of drivers) {
      const notificationId = driver.notificationId;
      console.log(notificationId, '====notificationId====' ) ;
      console.log(distanceBetweenPickupAndDropoff,'====distanceBetweenPickupAndDropoff====') ;
      if (!notificationId) continue;
      const rideInfo = {
        from: formData.pickup.address,
        coordonneFrom: {
          longitude: formData.pickup.longitude,
          latitude: formData.pickup.latitude,
        },
        coordonneTo: {
          longitude: formData.drop.longitude,
          latitude: formData.drop.latitude,
        },
        to: formData.drop.address,
        time: formData.selectedDate,
        price: price.toString(),
        currentUser: currentUser,
        distanceBetweenPickupAndDropoff: distanceBetweenPickupAndDropoff,
        driverPosition: '',
      }; 

      // const combined = `${message} || ${JSON.stringify(rideInfo)}`;
      try {
        const response = await axios.post(
          'https://onesignal.com/api/v1/notifications',
          {
            app_id: ONESIGNAL_APP_ID,
            include_player_ids: [notificationId],
            // included_segments: ['All'] ,
            headings: {en: 'New Ride'},
            contents: {
              en: `${JSON.stringify(rideInfo)}`,
            },
            priority: 10,
          },
          {
            headers: {
              Authorization: `Basic ${REST_API_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log(
          `✅ Notification sent to ${driver.username && notificationId}`,
        );
      } catch (error) {
        console.error(
          `❌ Error sending notification to ${
            driver.username || notificationId
          }:`,
          error.response?.data || error.message,
        );
      }

      // ⏱ Wait 30 seconds before moving to next driver
      await wait(10000);
    }
  };
  useEffect(() => {
    if (drivers?.length > 0) {
      sendSequentialNotifications(drivers);
    }
  }, [drivers]);

  // const sendNotification = async () => {
  //   try {
  //     const response = await axios.post(
  //       'https://onesignal.com/api/v1/notifications',
  //       {
  //         app_id: ONESIGNAL_APP_ID,
  //         // included_segments: ['a6a05c54-2dc8-4f9a-87f2-2d4d19d0e2be'], // You can also use ['Subscribed Users'] or target specific player_ids
  //         include_player_ids: ['a6a05c54-2dc8-4f9a-87f2-2d4d19d0e2be'],
  //         headings: {en: 'New Ride'},
  //         contents: {
  //           en: `${currentUser.firstName} ${currentUser.lastName} need new ride from ${formData.pickup.address} to ${formData.drop.address}
  //           money ${price}`,
  //         },
  //         priority: 10,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Basic ${REST_API_KEY}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     console.log('Notification sent ✅:', response.data);
  //   } catch (error) {
  //     console.error(
  //       'Error sending notification ❌:',
  //       error.response?.data || error.message,
  //     );
  //   }
  // };
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
