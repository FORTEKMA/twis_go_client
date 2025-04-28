import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import axios from 'axios';

export default function SendingRequests() {
  const currentUser = useSelector(state => state.user.currentUser);
  const ONESIGNAL_APP_ID = '42fd5097-a56d-47c5-abaa-6f4a836a143f';
  const REST_API_KEY =
    'os_v2_app_il6vbf5fnvd4lk5kn5fig2quh7tcjfdltfzuajfae3zukc4k5mg365rpcmrql6fkjxdttj33revv7by2ytyyvin3lmemlqdsfnpybdy'; // Replace with your real REST API Key

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  const sendNotificationToDriver = async (driver, formData) => {
    console.log('====================================================');

    const notificationId = driver.notificationId;
    if (!notificationId) return;
    console.log(notificationId, '==== notificationId ====');

    // 🛑 Step 2: Prepare ride info
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
      price: driver.price,
      currentUser: currentUser,
      distanceBetweenPickupAndDropoff: driver.distance,
      driverPosition: '',
    };

    // 🛑 Step 3: Send notification
    try {
      const response = await axios.post(
        'https://onesignal.com/api/v1/notifications',
        {
          app_id: ONESIGNAL_APP_ID,
          include_player_ids: [notificationId],
          headings: {en: 'New Ride'},
          contents: {
            en: 'You have a new ride request!',
            ar: 'لديك طلب رحلة جديد!',
          },
          priority: 10,
          data: rideInfo,
        },
        {
          headers: {
            Authorization: `Basic ${REST_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(
        `✅ Notification sent to ${driver.username || notificationId}`,
      );
    } catch (error) {
      console.error(
        `❌ Error sending notification to ${
          driver.username || notificationId
        }:`,
        error.response?.data || error.message,
      );
    }

    await wait(2200); // optional wait
  };

  useEffect(() => {
    if (drivers?.length > 0) {
      sendNotificationToDriver(drivers);
    }
  }, [drivers]);
  return (
    <View>
      <Text>SendingRequests</Text>
    </View>
  );
}
