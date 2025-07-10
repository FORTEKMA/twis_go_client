import { Platform } from 'react-native';

export function parseIcon (element) {
    const typesList = element.types;
    let materialIcon;
  
    // Use a more extensive switch case for different place types
    switch (true) {
        case (typesList.includes('airport')):
            materialIcon = 'local-airport';
            break;
        case (typesList.includes('restaurant')):
            materialIcon = 'restaurant';
            break;
        case (typesList.includes('store')):
            materialIcon = 'local-mall';
            break;
        case (typesList.includes('bar')):
            materialIcon = 'local-bar';
            break;
        case (typesList.includes('hotel')):
            materialIcon = 'hotel';
            break;
        case (typesList.includes('bank')):
            materialIcon = 'account-balance';
            break;
        case (typesList.includes('hospital')):
            materialIcon = 'local-hospital';
            break;
        case (typesList.includes('library')):
            materialIcon = 'local-library';
            break;
        case (typesList.includes('museum')):
            materialIcon = 'museum';
            break;
        case (typesList.includes('park')):
            materialIcon = 'park';
            break;
        case (typesList.includes('shopping_mall')):
            materialIcon = 'local-mall';
            break;
        case (typesList.includes('tourist_attraction')):
            materialIcon = 'explore';
            break;
        case (typesList.includes('train_station')):
            materialIcon = 'train';
            break;
        case (typesList.includes('subway_station')):
            materialIcon = 'subway';
            break;
        case (typesList.includes('bus_station')):
            materialIcon = 'directions-bus';
            break;
        case (typesList.includes('gas_station')):
            materialIcon = 'local-gas-station';
            break;
        case (typesList.includes('church')):
            materialIcon = 'church';
            break;
        case (typesList.includes('synagogue')):
            materialIcon = 'house-of-worship';
            break;
        case (typesList.includes('restaurant')):
            materialIcon = 'local-dining';
            break;
        default:
            materialIcon = 'place';
    }
    
    return materialIcon;
}

// Constants
export const STEP_NAMES = {
  1: 'Pickup Location',
  2: 'Dropoff Location', 
  3: 'Vehicle Selection',
  4: 'Ride Confirmation',
  4.5: 'Login Required',
  5: 'Searching Drivers'
};

export const TUNISIA_BOUNDS = {
  minLat: 30.2302,
  maxLat: 37.5439,
  minLng: 7.5248,
  maxLng: 11.5983
};

export const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 10000,
};

export const MAP_ANIMATION_DURATION = {
  android: 200,
  ios: 150,
};

export const LOTTIE_DIMENSIONS = {
  width: 80,
  height: 100,
};

export const DEFAULT_MAP_REGION = {
  latitude: 36.80557596268572,
  longitude: 10.180696783260366,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const ZOOMED_MAP_REGION = {
  latitudeDelta: 0.002,
  longitudeDelta: 0.002,
};

// Utility functions
export const deg2rad = (deg) => deg * (Math.PI / 180);

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const isWithinTunisiaBounds = (region) => {
  return (
    region.latitude >= TUNISIA_BOUNDS.minLat &&
    region.latitude <= TUNISIA_BOUNDS.maxLat &&
    region.longitude >= TUNISIA_BOUNDS.minLng &&
    region.longitude <= TUNISIA_BOUNDS.maxLng
  );
};

export const getMapCenterPosition = (layout, statusBarHeight = 0) => {
  if (!layout.width || !layout.height) {
    return { x: 0, y: 0 };
  }

  if (Platform.OS === 'android') {
    const adjustedHeight = layout.height - statusBarHeight;
    return {
      x: (layout.width / 2),
      y: adjustedHeight / 2
    };
  } else {
    return {
      x: layout.width / 2,
      y: layout.height / 2
    };
  }
};

export const getLottieViewPosition = (layout, statusBarHeight = 0) => {
  if (!layout.width || !layout.height) {
    return { top: 0, left: 0 };
  }

  const centerPosition = getMapCenterPosition(layout, statusBarHeight);
  const { width: lottieWidth, height: lottieHeight } = LOTTIE_DIMENSIONS;
  
  if (Platform.OS === 'ios') {
    return {
      top: centerPosition.y - (lottieHeight / 2)-20,
      left: centerPosition.x - (lottieWidth / 2)
    };
  } else {
   
    return {
      top: centerPosition.y - (lottieHeight / 2),
      left: centerPosition.x - (lottieWidth / 2)
    };
  }
};

export const filterNearbyDrivers = (drivers, pickupLocation, maxDistance = 2) => {
  if (!pickupLocation?.latitude || !pickupLocation?.longitude) return {};
  
  return Object.entries(drivers).reduce((acc, [uid, driver]) => {
    const distance = calculateDistance(
      pickupLocation.latitude,
      pickupLocation.longitude,
      driver.latitude,
      driver.longitude
    );
    if (distance <= maxDistance) {
      acc[uid] = driver;
    }
    return acc;
  }, {});
};

export const getBottomOffset = (step, token, isKeyboardVisible, keyboardHeight) => {
  if (Platform.OS === "android") {
    return step === 4.5 ? 0 : !token ? 60 : 70;
  } else {
    if (isKeyboardVisible) {
      return keyboardHeight - 20;
    } else {
      return step === 4.5 ? 10 : 100;
    }
  }
};

export const getAnimationTiming = (platform) => {
  return platform === 'android' ? MAP_ANIMATION_DURATION.android : MAP_ANIMATION_DURATION.ios;
};

export const createMapRegion = (latitude, longitude, delta = ZOOMED_MAP_REGION) => {
  return {
    latitude,
    longitude,
    ...delta
  };
};

export const getScreenPoint = (screenWidth, screenHeight) => ({
  x: screenWidth / 2,
  y: screenHeight / 2 - 50,
});

export const getMapFitCoordinates = (pickupAddress, dropAddress, screenHeight) => {
  return [
    {
      latitude: pickupAddress.latitude,
      longitude: pickupAddress.longitude
    },
    {
      latitude: dropAddress.latitude,
      longitude: dropAddress.longitude
    }
  ];
};

export const getMapFitOptions = (screenHeight) => ({
  edgePadding: {
    top: 90,
    right: 80,
    bottom: screenHeight * 0.5,
    left: 80,
  },
  animated: true,
});

export const processDriversInChunks = (data, chunkSize = 450) => {
  const entries = Object.entries(data);
  const activeDrivers = {};
  
  const processChunk = (startIndex) => {
    const chunk = entries.slice(startIndex, startIndex + chunkSize);
    
    chunk.forEach(([uid, driver]) => {
      if (driver.isActive === true && driver.isFree === true && driver.latitude && driver.longitude) {
        activeDrivers[uid] = driver;
      }
    });

    if (startIndex + chunkSize < entries.length) {
      setTimeout(() => processChunk(startIndex + chunkSize), 0);
    }
  };

  processChunk(0);
  return activeDrivers;
};