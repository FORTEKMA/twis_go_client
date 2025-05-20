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

import {ONESIGNAL_DRIVER_APP_ID,ONESIGNAL_DRIVER_APP_API_KEY} from '@env';
 
export const sendNotificationToDrivers = async (
 { driver,
  formData,
  currentUser,}
 
) => {
  
    // Prepare ride info
    const rideInfo = {
      type: "new_command",
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
      time: formData.time||Date.now(),
      price: formData.price,
      currentUser: currentUser,
      distanceBetweenPickupAndDropoff: formData.distance,
      driverPosition: '',
    };


   return axios.post(
        'https://onesignal.com/api/v1/notifications',
        {
          app_id: ONESIGNAL_DRIVER_APP_ID,
           
          "include_aliases": {
    "external_id": [ String(driver.id) ]
  },
    "target_channel": "push",
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

       

  
};

export const calculatePrice = async (formData,driver=null) => {
  const data={
    
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

  if(driver){
    data.driverLocation={
      "lat": driver.latitude,
      "lng": driver.longitude
    }
  }
 
  const response = await api.post('/calcul',data);
   return response.data;
}

export const sendActionToDrivers = async (driverID, replay="") => {
  

  return axios.post(
    'https://onesignal.com/api/v1/notifications',
    {
      app_id: ONESIGNAL_DRIVER_APP_ID,
      include_player_ids: [driverID],
      headings: {en: 'New Ride'},
      contents: {
        en: 'You have a new ride request!',
        ar: 'لديك طلب رحلة جديد!',
      },
      priority: 10,
      data: {
  
        type:replay
      },
    },
    {
      headers: {
        Authorization: `Basic ${ONESIGNAL_DRIVER_APP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );



}