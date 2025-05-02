import axios from 'axios';

export async function calculateDistanceAndTime(startCoords, endCoords) {
  const apiKey = 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE';

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords}&destination=${endCoords}&key=${apiKey}&language=fr`;

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
  drivers,
  formData,
  currentUser,
) => {
  console.log('====================================================');
  console.log('===============================drivers=====================');
  console.log(drivers);

  for (const driver of drivers) {
    const notificationId = driver.notificationId;
    if (!notificationId) continue;
    console.log(notificationId, '==== notificationId ====');

    // Prepare ride info
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

    await wait(2200); // Optional pause to prevent request flood
  }
};
