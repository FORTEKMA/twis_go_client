// mapUtils.js
import Geocoder from 'react-native-geocoding';

export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await Geocoder.from(lat, lng);
    return response.results[0].formatted_address;
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Unknown address';
  }
};

export const filterDataByName = (data, names) => {
  return {
    ...data,
    features: data.features.filter(feature => 
      names.includes(feature.properties.name)
    )
  };
};