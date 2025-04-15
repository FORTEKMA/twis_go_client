import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';

export default function SendingRequests({formData, price}) {
  const [distanceBetweenPickupAndDropoff, setDistanceBetweenPickupAndDropoff] =
    useState({
      distnace: null,
      duration: null,
      durationInTraffic: null,
    });
  const currentUser = useSelector(state => state.user.currentUser);
//   console.log('<====>', currentUser, 'current', formData, price);
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

  return (
    <View>
      <Text>SendingRequests</Text>
    </View>
  );
}
