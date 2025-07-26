export const filterDataByName = (data, filter) => {
  // Create a new object with the same outer structure
  const filteredData = {
    ...data, // Copy all top-level properties
    features: data.features.filter((feature) =>
      filter.includes(feature.properties.NAME_1)
    ), // Filter features
  };
  return filteredData;
};

export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const apiKey = process.env.API_GOOGLE;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    if (!response.ok) throw new Error("Error fetching geocode");
    const data = await response.json();
    if (data.status !== "OK")
      throw new Error(data.error_message || "Unknown error");
    return data.results[0]?.formatted_address || "Unknown location";
  } catch (error) {
    console.error("Error in getAddressFromCoordinates:", error);
    return "Error fetching address";
  }
};

export const getDistanceFromGoogleAPI = async (originLat, originLng, destLat, destLng) => {
  try {
    const apiKey = process.env.API_GOOGLE;
    const origins = `${originLat},${originLng}`;
    const destinations = `${destLat},${destLng}`;
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${apiKey}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error fetching distance matrix");
    
    const data = await response.json();
    
    if (data.status !== "OK") {
      throw new Error(data.error_message || "Distance matrix API error");
    }
    
    const element = data.rows[0]?.elements[0];
    if (!element || element.status !== "OK") {
      throw new Error("No route found between the two points");
    }
    
    // Return distance in meters
    return element.distance.value;
  } catch (error) {
    console.error("Error in getDistanceFromGoogleAPI:", error);
    // Fallback to Haversine formula if API fails
    return getDistanceFromLatLonInMeters(originLat, originLng, destLat, destLng);
  }
};

// Fallback Haversine formula function
export const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in meters
  return d;
};

// Ray casting algorithm for point-in-polygon
export function isPointInPolygon(point, polygon) {
  let x = point.lat, y = point.lng;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].lat, yi = polygon[i].lng;
    let xj = polygon[j].lat, yj = polygon[j].lng;
    let intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi + 0.0000001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
