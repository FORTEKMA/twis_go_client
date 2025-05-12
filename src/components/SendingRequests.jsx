import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {ONESIGNAL_DRIVER_APP_ID,ONESIGNAL_DRIVER_APP_API_KEY} from '@env';

export default function SendingRequests() {
  const currentUser = useSelector(state => state.user.currentUser);
 
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
          app_id: ONESIGNAL_DRIVER_APP_ID,
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
            Authorization: `Basic ${ONESIGNAL_DRIVER_APP_API_KEY}`,
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
