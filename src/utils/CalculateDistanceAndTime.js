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
