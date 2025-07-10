import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Image,
  Alert,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Text,
  Keyboard,
  KeyboardEvent,
  StatusBar
} from 'react-native';
import DriverMarker from '../../components/DriverMarker';
import MapView, {Marker, PROVIDER_GOOGLE,Polyline} from 'react-native-maps';
 
import MapViewDirections from 'react-native-maps-directions';
import {useDispatch, useSelector} from 'react-redux';
 import {styles} from './styles';
import ChooseVehicle from './components/ChooseVehicle';
import ConfirmRide from './components/ConfirmRide';
import SearchDrivers from './components/SearchDrivers';
import LoginStep from './components/LoginStep';
import api from '../../utils/api';
import { useToast } from 'native-base';
import { useTranslation } from 'react-i18next';
import CustomAlert from '../../components/CustomAlert';
import Geolocation from '@react-native-community/geolocation';
import { getDatabase, ref as dbRef, onValue, off  } from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import {OneSignal} from 'react-native-onesignal';
 import PickupLocation from './components/PickupLocation';
import DropoffLocation from './components/DropoffLocation';
import LottieView from 'lottie-react-native';
import {API_GOOGLE} from "@env"
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AnimatedPolyline from './components/AnimatedPolyline';
import { 
  trackScreenView, 
  trackRideBookingStarted,
  trackPickupLocationSelected,
  trackDropoffLocationSelected,
  trackVehicleSelected,
  trackRideConfirmed,
  trackRideCancelled,
  trackDriverFound,
  trackLocationPermissionRequested,
  trackLocationPermissionGranted,
  trackLocationPermissionDenied,
  trackCurrentLocationUsed,
  trackBookingStepViewed,
  trackBookingStepCompleted,
  trackBookingStepBack
} from '../../utils/analytics';
import { setMainScreenStep, fetchSettingsWithMapIcons, selectSettingsList } from '../../store/utilsSlice/utilsSlice';
import {
  STEP_NAMES,
  TUNISIA_BOUNDS,
  HAPTIC_OPTIONS,
  GEOLOCATION_OPTIONS,
  MAP_ANIMATION_DURATION,
  LOTTIE_DIMENSIONS,
  calculateDistance,
  isWithinTunisiaBounds,
  getMapCenterPosition,
  getLottieViewPosition,
  filterNearbyDrivers,
  getBottomOffset,
  getAnimationTiming
} from './helper';

import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';

import ActivationCountdown from '../../components/ActivationCountdown';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const SWIPE_THRESHOLD = 120;

import ReactNativeHapticFeedback from "react-native-haptic-feedback";

import mapStyle from '../../utils/googleMapStyle';
import { useNavigation } from '@react-navigation/native';

const MainScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const currentUser = useSelector(state => state?.user?.currentUser);
  const token = useSelector(state => state?.user?.token);
  const toast = useToast();
  const { t } = useTranslation();
  const settingsList = useSelector(selectSettingsList);
  
  // State management
  const [driversIdsNotAccepted, setDriversIdsNotAccepted] = useState([]);
  const [step, setStep] = useState(1);
  const stepRef = useRef(step);
  const [formData, setFormData] = useState({});
  const [layout, setLayout] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [drivers, setDrivers] = useState({});
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const [accepted, setAccepted] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [filteredDrivers, setFilteredDrivers] = useState({});
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [animatedCoords, setAnimatedCoords] = useState([]);
  const [hasTouchedMap, setHasTouchedMap] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [locationAlertMessage, setLocationAlertMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [shouldRepositionLottie, setShouldRepositionLottie] = useState(false);
  const [stepComponentHeight, setStepComponentHeight] = useState(0);
  const [activationDate, setActivationDate] = useState(null);

  // Map region state
  const [mapRegion, setMapRegion] = useState({
    latitude: 36.80557596268572,
    longitude: 10.180696783260366,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Refs
  const mapRef = useRef(null);
  const position = useSharedValue(0);
  const slidePosition = useSharedValue(0);
  const animationIndex = useRef(0);
  const backInterval = useRef(null);
  const startInterval = useRef(null);
  const lottieRef = useRef(null);
  const bannerAnim = useSharedValue(-60);
  const currentLocationButtonPosition = useSharedValue(Platform.OS === "android" ? 350 : 370);
  const previousButtonPosition = useRef(Platform.OS === "android" ? 350 : 370);
  const animationTimeoutRef = useRef(null);

  // Animated style for currentLocationButton
  const currentLocationButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      bottom: currentLocationButtonPosition.value,
    };
  });

  // Animated styles for step transitions
  const stepAnimatedStyle = useAnimatedStyle(() => {
    const translateX = position.value;
    const translateY = slidePosition.value * 300;
    
    return {
      transform: [
        { translateX },
        { translateY }
      ],
    };
  });

  // Track screen view on mount
  useEffect(() => {
    trackScreenView('MainScreen');
  }, []);

  // Track step changes
  useEffect(() => {
    if (STEP_NAMES[step]) {
      trackBookingStepViewed(step, STEP_NAMES[step], {
        has_pickup: !!formData?.pickupAddress,
        has_dropoff: !!formData?.dropAddress,
        has_vehicle: !!formData?.vehicleType
      });
    }
    
    // Reset step component height when step changes
    setStepComponentHeight(0);
    
    // Ensure LottieView is properly positioned when step changes
    if (step <= 2) {
      setTimeout(() => {
        ensureLottieViewPosition();
      }, getAnimationTiming(Platform.OS));
    }
  }, [step, formData]);

  // Animate currentLocationButton when stepComponentHeight changes
  useEffect(() => {
    // Clear any pending animation
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Debounce the animation to prevent rapid successive animations
    animationTimeoutRef.current = setTimeout(() => {
      if (stepComponentHeight > 0) {
        const newPosition = stepComponentHeight + (Platform.OS=="android"?60:90);
        
        // Only animate if position actually changed
        if (Math.abs(newPosition - previousButtonPosition.current) > 5) {
          previousButtonPosition.current = newPosition;
          currentLocationButtonPosition.value = withTiming(newPosition, {
            duration: 400,
          });
        }
      } else {
        // Reset to default position when step changes
        const defaultPosition = Platform.OS === "android" ? 350 : 370;
        
        if (Math.abs(defaultPosition - previousButtonPosition.current) > 5) {
          previousButtonPosition.current = defaultPosition;
          currentLocationButtonPosition.value = withTiming(defaultPosition, {
            duration: 300,
          });
        }
      }
    }, 50); // 50ms debounce

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [stepComponentHeight]);

  // Optimized Firebase listener
  useEffect(() => {
    const db = getDatabase(getApp());
    const driversRef = dbRef(db, 'drivers');

    const unsubscribe = onValue(driversRef, snapshot => {
      const data = snapshot.val() || {};
      
      // Process in chunks to avoid blocking the main thread
      const processChunk = (entries, startIndex) => {
        const chunkSize = 450;
        const chunk = entries.slice(startIndex, startIndex + chunkSize);
        const activeDrivers = {};
        
        chunk.forEach(([uid, driver]) => {
          if (driver.isActive === true && driver.isFree === true && driver.latitude && driver.longitude) {
            activeDrivers[uid] = driver;
          }
        });

        if (startIndex + chunkSize < entries.length) {
          setTimeout(() => processChunk(entries, startIndex + chunkSize), 0);
        } else {
          if (formData?.pickupAddress?.latitude) {
            const nearbyDrivers = filterNearbyDrivers(activeDrivers, formData?.pickupAddress);
            setFilteredDrivers(nearbyDrivers);
          }
        }
      };

      processChunk(Object.entries(data), 0);
    });

    return () => {
      driversRef.off('value', unsubscribe);
    }
  }, [formData?.pickupAddress]);

  // Optimized event handlers
  const handleRegionChange = useCallback((region) => {
    if (step === 1 || step === 2) {
      ReactNativeHapticFeedback.trigger("impactLight", HAPTIC_OPTIONS);
      setIsMapDragging(false);
      setHasTouchedMap(false);
      lottieRef.current?.play(8, 1395);
      fetchLocationDetails(region);
      
      // Ensure LottieView is properly positioned after region change
      setTimeout(() => {
        ensureLottieViewPosition();
      }, getAnimationTiming(Platform.OS));
    }
  }, [step]);

  const handleMapDrag = useCallback(() => {
    if (step === 1 || step === 2) {
      setIsMapDragging(true);
      if (!hasTouchedMap) {
        setHasTouchedMap(true);
        lottieRef.current?.play(0, 7);
      }
    }
  }, [step, hasTouchedMap]);

  const requestLocationPermission = async () => {
    trackLocationPermissionRequested();
    
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      Geolocation.getCurrentPosition(
        (position) => {
          trackLocationPermissionGranted();
          getCurrentLocation();
        },
        (error) => {
          trackLocationPermissionDenied({ platform: 'ios', error: error.message });
          setLocationAlertMessage(t('common.enable_location_services'));
          setShowLocationAlert(true);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
     
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          trackLocationPermissionGranted();
          getCurrentLocation();
        } else {
          trackLocationPermissionDenied({ platform: 'android', reason: 'user_denied' });
          setLocationAlertMessage(t('common.location_permission_required'));
          setShowLocationAlert(true);
        }
      } catch (err) {
        console.warn(err);
        trackLocationPermissionDenied({ platform: 'android', error: err.message });
        setLocationAlertMessage(t('common.location_permission_error'));
        setShowLocationAlert(true);
      }
    }
  };

  const getCurrentLocation = () => {
    try {
      setLoadingCurrentLocation(true);
      trackCurrentLocationUsed();
      
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          };
          
          setCurrentLocation({ latitude, longitude });
          setMapRegion(newRegion);
          setLoadingCurrentLocation(false);
          
          if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 0);
          }
          
          // Force layout update after location change
          setTimeout(() => {
            if (layout.width > 0 && layout.height > 0) {
              setLayout(prevLayout => ({ ...prevLayout }));
              setShouldRepositionLottie(true);
            }
          }, getAnimationTiming(Platform.OS));
          
          // Platform-specific positioning
          setTimeout(() => {
            ensureLottieViewPosition();
          }, Platform.OS === 'ios' ? 100 : 150);
        },
        (error) => { 
          setShowLocationAlert(true); 
          setLoadingCurrentLocation(false); 
          console.log(error);
        },
        GEOLOCATION_OPTIONS
      );
    } catch (error) {
      console.log("error", error);
    }
  };

  // Method to ensure LottieView is properly positioned
  const ensureLottieViewPosition = useCallback(() => {
    if (isLayoutReady && layout.width > 0 && layout.height > 0) {
      setLayout(prevLayout => ({ ...prevLayout }));
      setShouldRepositionLottie(true);
      
      // Platform-specific positioning adjustments
      const timing = getAnimationTiming(Platform.OS);
      setTimeout(() => {
        setLayout(prevLayout => ({ ...prevLayout }));
        setShouldRepositionLottie(true);
      }, timing);
    }
  }, [isLayoutReady, layout.width, layout.height]);

  // Firebase listener for drivers
  useEffect(() => {
    const db = getDatabase(getApp());
    const driversRef = dbRef(db, 'drivers');

    const unsubscribe = onValue(driversRef, snapshot => {
      const data = snapshot.val() || {};
      const activeDrivers = {};

      Object.entries(data).forEach(([uid, driver]) => {
        if (
          driver.isActive === true &&
          driver.isFree === true &&
          driver.latitude &&
          driver.longitude 
        ) { 
          activeDrivers[uid] = driver;
        }
      });

      setFilteredDrivers(activeDrivers);
    });

    return () => {
      driversRef.off('value', unsubscribe);
    }
  }, [currentLocation]);

  useEffect(() => {
    stepRef.current = step;
    dispatch(setMainScreenStep(step));
  }, [step, dispatch]);

  const handleReset = () => {
    setStep(1);
    dispatch(setMainScreenStep(1));
    setFormData({});
    setAccepted(null);
    setDriversIdsNotAccepted([]);
    setDrivers({});
    setAnimatedCoords([]);
    setRouteCoords([]);
    clearInterval(backInterval.current);
  };

  const animateStepTransition = (newStep) => {
    const direction = newStep > step ? 1 : -1;
    position.value = direction * SCREEN_WIDTH;
    
    // Animate back to 0
    position.value = withTiming(0, {
      duration: 300,
    });
  };

  const animateSlideTransition = (isDragging) => {
    slidePosition.value = withTiming(isDragging ? 1 : 0, {
      duration: 300,
    });
  };

  useEffect(() => {
    animateSlideTransition(isMapDragging);
  }, [isMapDragging]);

  const goNext = async (data, handlerNext = true) => {
    try {
      setFormData({...formData, ...data});
      
      // Track ride booking progress
      if (step === 1 && data?.pickupAddress) {
        trackPickupLocationSelected(data.pickupAddress);
        trackRideBookingStarted();
        trackBookingStepCompleted(1, 'Pickup Location', {
          address: data.pickupAddress.address,
          latitude: data.pickupAddress.latitude,
          longitude: data.pickupAddress.longitude
        });
      }
      if (step === 2 && data?.dropAddress) {
        trackDropoffLocationSelected(data.dropAddress);
        trackBookingStepCompleted(2, 'Dropoff Location', {
          address: data.dropAddress.address,
          latitude: data.dropAddress.latitude,
          longitude: data.dropAddress.longitude
        });
      }
      if (step === 3 && data?.vehicleType) {
        trackVehicleSelected(data.vehicleType);
        trackBookingStepCompleted(3, 'Vehicle Selection', {
          vehicle_type: data.vehicleType.key,
          vehicle_id: data.vehicleType.id
        });
      }
      if (step === 4 && data?.confirmed) {
        trackRideConfirmed({
          ...formData,
          ...data
        });
        trackBookingStepCompleted(4, 'Ride Confirmation', {
          price: data.price,
          distance: formData.distance,
          time: formData.time
        });
      }
      
      if (handlerNext) {
        // Check if we need to show login step
        if (step === 4 && !token) {
          animateStepTransition(4.5);
          setStep(4.5);
          dispatch(setMainScreenStep(4.5));
        } else if (step === 4.5) {
          // After login success, go to step 5
          animateStepTransition(5);
          setStep(5);
          dispatch(setMainScreenStep(5));
        } else if (step === 4 && token) {
          // If user is logged in and confirmed ride, go to step 5
          animateStepTransition(5);
          setStep(5);
          dispatch(setMainScreenStep(5));
        } else {
          // For steps 1, 2, 3: increment to next step
          const nextStep = step + 1;
          animateStepTransition(nextStep);
          setStep(nextStep);
          dispatch(setMainScreenStep(nextStep));
        }
        
        if (step === 1) {
          setFormData(prev => ({
            ...prev,
            dropAddress: formData?.pickupAddress,
          }));
        }
        
        if (step === 2 || step === 3) {
          if (formData?.pickupAddress?.latitude && formData?.pickupAddress?.longitude && 
              formData?.dropAddress?.latitude && formData?.dropAddress?.longitude) {
            mapRef?.current?.fitToCoordinates([{
              latitude: formData?.pickupAddress?.latitude,
              longitude: formData?.pickupAddress?.longitude
            }, {
              latitude: formData?.dropAddress?.latitude,
              longitude: formData?.dropAddress?.longitude
            }], {
              edgePadding: {
                top: 90,
                right: 80,
                bottom: SCREEN_HEIGHT * 0.5,
                left: 80,
              },
              animated: true,
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const goBack = () => {
    trackBookingStepBack(step, STEP_NAMES[step] || 'Unknown');

    if (step === 4) {
      console.log("cancel the job");
    }
    
    if (step === 2) {
      setFormData(prev => ({
        ...prev,
        dropAddress: {},
      }));
    }

    if (step === 4.5) {
      // If going back from login step, go back to step 4
      animateStepTransition(4);
      setStep(4);
      dispatch(setMainScreenStep(4));
    } else {
      animateStepTransition(step - 1);
      setStep(step - 1);
      dispatch(setMainScreenStep(step - 1));
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, proceed to step 5
    animateStepTransition(5);
    setStep(5);
    dispatch(setMainScreenStep(5));
  };

  const fetchLocationDetails = async (region) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${region.latitude},${region.longitude}&key=${API_GOOGLE}`;
 
    try {
      const response = await axios.get(url);
      if (response.data.status === 'OK') {
        const address = response?.data?.results[0]?.formatted_address;
        const location = {
          ...region,
          address: address,
        };

        if (step === 1) {
          setFormData(prev => ({
            ...prev,
            pickupAddress: location,
          }));
        } else if (step === 2) {
          setFormData(prev => ({
            ...prev,
            dropAddress: location
          })); 
          lottieRef.current?.play(1396, 1404);
        }

        lottieRef.current?.play(1396, 1404);
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  const handleBackFromStep2 = () => {
    setFormData(prev => ({
      ...prev,
      dropAddress: {},
    }));
    setRouteCoords([]);

    animateStepTransition(step - 1);
    setStep(step - 1);
    dispatch(setMainScreenStep(step - 1));
    
    // Stop the animation loop when going back
    if (startInterval.current) {
      clearInterval(startInterval.current);
    }
    if (backInterval.current) {
      clearInterval(backInterval.current);
    }
    setAnimatedCoords([]);
    setRouteCoords([]);
  };

  useEffect(() => {
    requestLocationPermission();
    const keyboardWillShow = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', handleKeyboardShow)
      : Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    
    const keyboardWillHide = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', handleKeyboardHide)
      : Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleKeyboardShow = (event) => {
    setKeyboardHeight(event.endCoordinates.height);
    setIsKeyboardVisible(true);
  };

  const handleKeyboardHide = () => {
    setKeyboardHeight(0);
    setIsKeyboardVisible(false);
  };

  const getAdjustedCenterCoordinate = async (region) => {
    const centerOffect=Platform.OS=="android"?-30:30

    try {
      const screenPoint = {
        x: SCREEN_WIDTH / 2,
        y: SCREEN_HEIGHT / 2 + centerOffect,
      };
      const coord = await mapRef.current.coordinateForPoint(screenPoint);
      handleRegionChange(coord);
      return coord;
    } catch (err) {
      console.warn("Failed to get coordinate for point:", err);
    }
  };

  // Reset reposition flag when layout changes
  useEffect(() => {
    if (shouldRepositionLottie && isLayoutReady && layout.width > 0 && layout.height > 0) {
      const timer = setTimeout(() => {
        setShouldRepositionLottie(false);
      }, getAnimationTiming(Platform.OS));
      
      return () => clearTimeout(timer);
    }
  }, [shouldRepositionLottie, isLayoutReady, layout.width, layout.height]);

  // Handle layout changes and ensure LottieView positioning
  useEffect(() => {
    if (isLayoutReady && layout.width > 0 && layout.height > 0) {
      const timer = setTimeout(() => {
        setLayout(prevLayout => ({ ...prevLayout }));
      }, Platform.OS === 'android' ? 50 : 30);
      
      return () => clearTimeout(timer);
    }
  }, [isLayoutReady, layout.width, layout.height]);

  // Platform-specific layout adjustments
  useEffect(() => {
    const adjustLayout = () => {
      const { width, height } = Dimensions.get('window');
      const statusBarHeight = StatusBar.currentHeight || 0;
      
      if (Platform.OS === 'android') {
        setLayout({ 
          width, 
          height: height - statusBarHeight 
        });
      } else {
        setLayout({ width, height });
      }
      
      setIsLayoutReady(true);
    };
    
    // Initial adjustment
    adjustLayout();
    
    // Listen for dimension changes
    const subscription = Dimensions.addEventListener('change', adjustLayout);
    
    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!settingsList || settingsList.length === 0) {
      dispatch(fetchSettingsWithMapIcons());
    }
  }, [dispatch, settingsList]);

  useEffect(() => {
    api.get('/parameters').then(response => {
      const activeDateStr = response?.data?.data[0]?.active_date;
      
      if (activeDateStr) setActivationDate(activeDateStr);
    });
  }, []);

  const renderStep = () => {
    const bottomOffset = getBottomOffset(step, token, isKeyboardVisible, keyboardHeight);

    const handleStepLayout = (event) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0) {
        setStepComponentHeight(height);
      }
    };

    return (
      <Animated.View
        style={[
          localStyles.stepContainer,
          stepAnimatedStyle,
          {
            bottom: bottomOffset,
          },
        ]}>
        <View style={localStyles.stepContent} onLayout={handleStepLayout}>
          {step === 1 && (
            <PickupLocation 
              formData={formData} 
              goNext={goNext} 
              isMapDragging={isMapDragging}
              animateToRegion={(data) => mapRef.current.animateToRegion(data)}
            />
          )}
          {step === 2 && (
            <DropoffLocation 
              formData={formData} 
              goNext={goNext} 
              onBack={handleBackFromStep2}
              isMapDragging={isMapDragging}
              animateToRegion={(data) => mapRef.current.animateToRegion(data)}
            />
          )}
          {step === 3 && (
            <ChooseVehicle formData={formData} goNext={goNext} goBack={goBack} />
          )}
          {step === 4 && (
            <ConfirmRide handleReset={handleReset} formData={formData} goNext={goNext} goBack={goBack} />
          )}
          {step === 4.5 && (
            <LoginStep 
              onRegisterPress={(result = {}) => navigation.navigate("Register", { handleLoginSuccess, result })} 
              onLoginSuccess={handleLoginSuccess} 
              onBack={goBack} 
            />
          )}
          {step === 5 && (
            <SearchDrivers goBack={goBack} formData={formData} />
          )}
        </View>
      </Animated.View>
    );
  };

  const renderMap = () => {
    return (
      <MapView
        ref={mapRef}
        style={styles.mapContainer}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        zoomEnabled
        rotateEnabled={false}
        pitchEnabled={false} 
        focusable
        customMapStyle={mapStyle}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPanDrag={handleMapDrag}
        onRegionChangeComplete={getAdjustedCenterCoordinate}
        onMapReady={() => {
          setIsMapReady(true);
          setTimeout(() => {
            ensureLottieViewPosition();
          }, getAnimationTiming(Platform.OS));
        }}
      >
        {formData?.pickupAddress?.latitude && step > 1 && (
          <Marker
            cluster={false}
            coordinate={{
              latitude: formData.pickupAddress.latitude,
              longitude: formData.pickupAddress.longitude
            }}
            tracksViewChanges={false}
          >
            <View style={localStyles.pickupMarker}>
              <View style={localStyles.pickupMarkerInner} />
            </View>
          </Marker>
        )}

        {formData?.dropAddress?.latitude && step > 2 && !isMapDragging && (
          <Marker
            cluster={false}
            coordinate={{
              latitude: formData.dropAddress.latitude,
              longitude: formData.dropAddress.longitude
            }}
            tracksViewChanges={true}
          >
            <View style={localStyles.dropoffMarker}>
              <View style={localStyles.dropoffMarkerInner} />
            </View>
          </Marker>
        )}

        {Object.entries(filteredDrivers).map(([uid, driver]) => (
          <Marker
            key={uid}
            coordinate={{
              latitude: driver.latitude,
              longitude: driver.longitude
            }}
            flat={true}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <DriverMarker type={driver.type} angle={driver.angle} />
          </Marker>
        ))}

        {formData?.pickupAddress?.latitude && formData?.dropAddress?.latitude && !isMapDragging && (
          <MapViewDirections
            origin={{
              latitude: formData.pickupAddress.latitude,
              longitude: formData.pickupAddress.longitude
            }}
            destination={{
              latitude: formData.dropAddress.latitude,
              longitude: formData.dropAddress.longitude
            }}
            mode='DRIVING'
            apikey={API_GOOGLE}
            strokeWidth={7}
            strokeColor="#999"
            onReady={result => {
              if (backInterval.current) {
                setAnimatedCoords([]);
                setRouteCoords([]);
                clearInterval(backInterval.current);
              }
              setRouteCoords(result.coordinates);
            }}
          />
        )}
 
        {routeCoords.length > 0 && <AnimatedPolyline coords={routeCoords} step={step} />}
      </MapView>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={localStyles.container}>
      <View 
        style={{flex: 1}}  
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (width > 0 && height > 0) {
            const statusBarHeight = StatusBar.currentHeight || 0;
            
            if (Platform.OS === 'android') {
              const adjustedHeight = height - statusBarHeight;
              setLayout({ width, height: adjustedHeight });
            } else {
              setLayout({ width, height });
            }
            
            setIsLayoutReady(true);
            
            // Force a re-render after layout change
            setTimeout(() => {
              setLayout(prevLayout => ({ ...prevLayout }));
              setTimeout(() => {
                ensureLottieViewPosition();
              }, Platform.OS === 'android' ? 100 : 50);
            }, Platform.OS === 'android' ? 50 : 30);
          }
        }}
      >
        {activationDate && <ActivationCountdown targetDate={activationDate} />}
        {renderMap()}
        
        {(step === 1 || step === 2) && (
          <Animated.View
            style={[
              localStyles.currentLocationButton,
              currentLocationButtonAnimatedStyle
            ]}
          >
            <TouchableOpacity
              style={localStyles.currentLocationButtonInner}
              onPress={getCurrentLocation}
            >
              {loadingCurrentLocation ? (
                <ActivityIndicator />
              ) : (
                <MaterialIcons name="my-location" size={22} color="#030303" />
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {(step <= 2) && isLayoutReady && isMapReady && layout.width > 0 && layout.height > 0 && (
          <LottieView
            key={`lottie-${shouldRepositionLottie}-${layout.width}-${layout.height}`}
            ref={lottieRef}
            source={require("../../utils/marker.json")}
            style={{
              ...LOTTIE_DIMENSIONS,
              position: "absolute",
              ...getLottieViewPosition(layout, StatusBar.currentHeight || 0),
              pointerEvents: "none",
              backgroundColor: "transparent",
              zIndex: 1000,
              elevation: Platform.OS === 'android' ? 1000 : undefined,
            }}
            loop={false}
            autoPlay={false}
            resizeMode="cover"
            speed={1}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              if (width > 0 && height > 0) {
                setTimeout(() => {
                  setLayout(prevLayout => ({ ...prevLayout }));
                  setShouldRepositionLottie(false);
                }, Platform.OS === 'android' ? 10 : 5);
              }
            }}
          />
        )}
        
        <CustomAlert
          visible={showLocationAlert}
          onClose={() => setShowLocationAlert(false)}
          title={t('common.location_services')}
          message={locationAlertMessage}
          type="warning"
          buttons={[
            {
              text: t('common.settings'),
              onPress: () => {
                setShowLocationAlert(false);
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
              style: 'confirm'
            },
            {
              text: t('common.cancel'),
              onPress: () => setShowLocationAlert(false),
              style: 'cancel'
            }
          ]}
        />
        
        {renderStep()}
      </View>
    </TouchableWithoutFeedback>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    flex: 1,
    zIndex: 2000,
    elevation: Platform.OS === 'android' ? 2000 : undefined,
  },
  stepContent: {
    width: SCREEN_WIDTH,
    backgroundColor: 'transparent',
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentLocationButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupMarker: {
    width: 20, 
    height: 20, 
    borderRadius: 10,
    backgroundColor: '#030303',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pickupMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white'
  },
  dropoffMarker: {
    width: 20, 
    height: 20, 
    backgroundColor: '#030303',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropoffMarkerInner: {
    width: 8,
    height: 8,
    backgroundColor: 'white'
  },
});

export default MainScreen; 