import axios from 'axios';
import api from './api';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function calculateDistanceAndTime(startCoords, endCoords) {
  const apiKey = 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE';


  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.latitude},${startCoords.longitude}&destination=${endCoords.latitude},${endCoords.longitude}&key=${apiKey}&language=fr`;
   try {
    const response = await axios.get(url);

    const distance = response.data.routes[0].legs[0].distance.value;
    const duration = response.data.routes[0].legs[0].duration.text.trim();

    return {
      distance: distance,
      time: duration,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
const ONESIGNAL_APP_ID = '42fd5097-a56d-47c5-abaa-6f4a836a143f';
const REST_API_KEY =
  'os_v2_app_il6vbf5fnvd4lk5kn5fig2quh7tcjfdltfzuajfae3zukc4k5mg365rpcmrql6fkjxdttj33revv7by2ytyyvin3lmemlqdsfnpybdy'; // Replace with your real REST API Key

export const sendNotificationToDrivers = async (
 { driver,
  formData,
  currentUser,}
 
) => {
     const notificationId = driver.notificationId;
 
    // Prepare ride info
    const rideInfo = {
      from: formData.pickupAddress.address,
      coordonneFrom: {
        longitude: formData.pickupAddress.longitude,
        latitude: formData.pickupAddress.latitude,
      },
      coordonneTo: {
        longitude: formData.dropAddress.longitude,
        latitude: formData.dropAddress.latitude,
      },
      to: formData.dropAddress.address,
      time: formData.time,
      price: formData.price,
      currentUser: currentUser,
      distanceBetweenPickupAndDropoff: formData.distance,
      driverPosition: '',
    };
 
   return axios.post(
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

       

  
};

export const calculatePrice = async (formData,driver) => {
  const data={
    "driverLocation": {
      "lat": driver.latitude,
      "lng": driver.longitude
    },
    "accessDepart": {
      "lat": formData.pickupAddress.latitude,
      "lng": formData.pickupAddress.longitude
    },
    "accessArrivee": {
      "lat": formData.dropAddress.latitude,
      "lng": formData.dropAddress.longitude
    },
    "id":formData?.vehicleType?.id
  }
 
  const response = await api.post('/calcul',data);
   return response.data;
}
