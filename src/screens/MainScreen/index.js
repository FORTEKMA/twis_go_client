import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Image,
  Alert,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Linking,
  ActivityIndicator
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
import {sendNotificationToDrivers,calculatePrice,sendActionToDrivers} from '../../utils/CalculateDistanceAndTime';
import PickupLocation from './components/PickupLocation';
import DropoffLocation from './components/DropoffLocation';
import LottieView from 'lottie-react-native';
import {API_GOOGLE} from "@env"
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const { width: SCREEN_WIDTH,height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
import mapStyle from '../../utils/googleMapStyle';
import { useNavigation } from '@react-navigation/native';
const MainScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const currentUser = useSelector(state => state?.user?.currentUser);
  const token = useSelector(state => state?.user?.token);
   const toast = useToast();
  const { t } = useTranslation();
  const [driversIdsNotAccepted, setDriversIdsNotAccepted] = useState([]);
  const [step, setStep] = useState(1);
  const stepRef = useRef(step);

  const [formData, setFormData] = useState({});
  const [drivers, setDrivers] = useState({});
  const [loadingCurrentLocation,setLoadingCurrentLocation]=useState(false)
  const [accepted, setAccepted] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 36.80557596268572,
    longitude: 10.180696783260366,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const mapRef = useRef(null);
  const position = useRef(new Animated.Value(0)).current;
  const slidePosition = useRef(new Animated.Value(0)).current;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [filteredDrivers, setFilteredDrivers] = useState({});
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [animatedCoords, setAnimatedCoords] = useState([]);
  const animationIndex = useRef(0);
  const backInterval=useRef(null)
  const startInterval=useRef(null)
  const lottieRef = useRef(null);
  const [hasTouchedMap, setHasTouchedMap] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [locationAlertMessage, setLocationAlertMessage] = useState('');
 
  // Memoized distance calculation
  const memoizedCalculateDistance = useMemo(() => {
    return (lat1, lon1, lat2, lon2) => {
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
  }, []);

  // Memoized deg2rad function
  const deg2rad = useMemo(() => {
    return (deg) => deg * (Math.PI / 180);
  }, []);

  // Memoized driver filtering
  const filterNearbyDrivers = useCallback((drivers, currentLocation, maxDistance = 500) => {
    if (!currentLocation) return {};
    
    return Object.entries(drivers).reduce((acc, [uid, driver]) => {
      const distance = memoizedCalculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        driver.latitude,
        driver.longitude
      );
      if (distance <= maxDistance) {
        acc[uid] = driver;
    }
      return acc;
    }, {});
  }, [memoizedCalculateDistance]);

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
          if (driver.isFree && driver.latitude && driver.longitude) {
            activeDrivers[uid] = driver;
          }
        });

        if (startIndex + chunkSize < entries.length) {
          setTimeout(() => processChunk(entries, startIndex + chunkSize), 0);
        } else {
          const nearbyDrivers = filterNearbyDrivers(activeDrivers, currentLocation);
          setFilteredDrivers(nearbyDrivers);
        }
      };

      processChunk(Object.entries(data), 0);
    });

    return () => {
      driversRef.off('value', unsubscribe);
    }
  }, [currentLocation, filterNearbyDrivers]);

  // Optimized route animation
  const simplifyCoordinates = useCallback((coords, tolerance = 0.0001) => {
    if (coords.length <= 2) return coords;
    
    const findPerpendicularDistance = (point, lineStart, lineEnd) => {
      const x = point.latitude;
      const y = point.longitude;
      const x1 = lineStart.latitude;
      const y1 = lineStart.longitude;
      const x2 = lineEnd.latitude;
      const y2 = lineEnd.longitude;
      
      const A = x - x1;
      const B = y - y1;
      const C = x2 - x1;
      const D = y2 - y1;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      
      if (lenSq !== 0) {
        param = dot / lenSq;
      }
      
      let xx, yy;
      
      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }
      
      const dx = x - xx;
      const dy = y - yy;
      
      return Math.sqrt(dx * dx + dy * dy);
    };

    const douglasPeucker = (points, start, end, tolerance) => {
      if (end - start <= 1) return;
      
      let maxDistance = 0;
      let index = start;
      
      for (let i = start + 1; i < end; i++) {
        const distance = findPerpendicularDistance(
          points[i],
          points[start],
          points[end]
        );
        
        if (distance > maxDistance) {
          index = i;
          maxDistance = distance;
        }
      }
      
      if (maxDistance > tolerance) {
        points[index].keep = true;
        douglasPeucker(points, start, index, tolerance);
        douglasPeucker(points, index, end, tolerance);
      }
    };

    const points = coords.map(coord => ({ ...coord, keep: false }));
    points[0].keep = true;
    points[points.length - 1].keep = true;
    
    douglasPeucker(points, 0, points.length - 1, tolerance);
    
    return points.filter(point => point.keep);
  }, []);

  const animatePolylineToStart = useCallback((coords) => {
    animationIndex.current = 0;
    setAnimatedCoords([]);
    
    // Simplify coordinates for smoother animation
    const simplifiedCoords = simplifyCoordinates(coords);
    const totalAnimationDuration = 10;
    const intervalDelay = totalAnimationDuration / simplifiedCoords.length || 1;
    
    if(startInterval.current) {
      clearInterval(startInterval.current);
    }
    
    startInterval.current = setInterval(() => {
      animationIndex.current += 1;
      setAnimatedCoords(simplifiedCoords.slice(0, animationIndex.current));
      
      if (animationIndex.current >= simplifiedCoords.length) {
        clearInterval(startInterval.current);
      }
    }, intervalDelay);
  }, [simplifyCoordinates]);

  // Optimized event handlers
  const handleRegionChange = useCallback((region) => {
    if(step === 1 || step === 2) {
      ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);
      setIsMapDragging(false);
      setHasTouchedMap(false);
      lottieRef.current?.play(8, 1395);
      fetchLocationDetails(region.latitude, region.longitude);
    }
  }, [step]);

  const handleMapDrag = useCallback(() => {
    if(step === 1 || step === 2) {
      setIsMapDragging(true);
      if (!hasTouchedMap) {
        setHasTouchedMap(true);
        lottieRef.current?.play(0, 7);
        if(step === 2 && routeCoords.length > 0) {
          animatePolylineToEnd(routeCoords);
        }
      }
    }
  }, [step, hasTouchedMap, routeCoords]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      Geolocation.getCurrentPosition(
        (position) => {
          getCurrentLocation();
        },
        (error) => {
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
          getCurrentLocation();
        } else {
          setLocationAlertMessage(t('common.location_permission_required'));
          setShowLocationAlert(true);
        }
      } catch (err) {
        console.warn(err);
        setLocationAlertMessage(t('common.location_permission_error'));
        setShowLocationAlert(true);
      }
    }
  };

  const getCurrentLocation = () => {
    try {
      setLoadingCurrentLocation(true)
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setLoadingCurrentLocation(false)
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 0);
        }
      },
      (error) =>{ setShowLocationAlert(true); setLoadingCurrentLocation(false); console.log(error)},
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
       
  } catch (error) {
        console.log("error",error)
  }
  };

  useEffect(() => {
    requestLocationPermission();
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      if(event?.notification?.additionalData?.accept==true){
         navigation.reset({
           index: 0,
           routes: [
             {
               name: 'Historique',
               params: {
                 screen: 'OrderDetails',
                 params: {
                   id: event?.notification?.additionalData?.commande?.data?.documentId
                 }
               }
             }
           ]
         })
        handleReset()
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
      }
      

      });

  

  return () => {
    OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
   }
  }, []);

  useEffect(() => {
   
    const db = getDatabase(getApp());
    const driversRef = dbRef(db, 'drivers');

    const unsubscribe = onValue(driversRef, snapshot => {
      const data = snapshot.val() || {};
      const activeDrivers = {};

      Object.entries(data).forEach(([uid, driver]) => {
        if (
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
    if(step === 5)
      searchDrivers()
   
      
  }, [step]) 
  
  
  handleReset = () => {
    setStep(1)
    setFormData({})
    setAccepted(null)
    setDriversIdsNotAccepted([])
    setDrivers({})
  }

  const animateStepTransition = (newStep) => {
    const direction = newStep > step ? 1 : -1;
    position.setValue(direction * SCREEN_WIDTH);
    
    Animated.spring(position, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const animateSlideTransition = (isDragging) => {
    Animated.spring(slidePosition, {
      toValue: isDragging ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  useEffect(() => {
    animateSlideTransition(isMapDragging);
  }, [isMapDragging]);

   const searchDrivers = async () => {
    let radius = 1;
    let processedDrivers = new Set(); // Track processed drivers to prevent duplicates
    
   
    try {
      while (accepted == null && radius <= 40 && stepRef.current === 5) {
        console.log(`\n📡 Searching drivers in radius: ${radius}km`,`latitude=${formData?.pickupAddress?.latitude}&longitude=${formData?.pickupAddress?.longitude}`);
        let drivers = [];
        if (stepRef.current !== 5) return;
    if(accepted==null){
        try {
          let url=`/drivers-in-radius?radius=${radius}&latitude=${formData?.pickupAddress?.latitude}&longitude=${formData?.pickupAddress?.longitude}&vehicleType=${formData?.vehicleType?.id}`
          // if(driversIdsNotAccepted.length>0){
          //   driversIdsNotAccepted.forEach((id,index)=>{
          //     url+=`&excludedIds[${index}]=${id}`
          //   })
          // }
          const response = await api.get(url);
          
          drivers = response.data || [];
          console.log(`📊 Found ${drivers.length} drivers in radius ${radius}km`);
          
        } catch (error) {
          console.log(`❌ Error fetching drivers in radius ${radius}:`, error.response);
          radius += 1;
          continue;
        }

        // Filter out already processed drivers
        const newDrivers = drivers.filter(driver => !processedDrivers.has(driver.id));
        console.log(`🆕 New drivers to process: ${newDrivers.length}`);
    
        for (const driver of newDrivers) {
          // Skip if driver is already in not accepted list
          if (driversIdsNotAccepted.includes(driver.id)) {
            console.log(`⏭️ Skipping driver ${driver.id} - already in not accepted list`);
            continue;
          }

          console.log(`\n👤 Processing driver ${driver.id}`);
          try {
             
            try {
              console.log(`📱 Sending notification to driver ${driver.id}`);
            const notificationRed=  await sendNotificationToDrivers({
                formData,
                driver,
                currentUser
              });
              console.log(notificationRed)
              console.log(`✅ Notification sent successfully to driver ${driver.id}`);
            } catch (notificationError) {
              console.log(`❌ Error sending notification to driver ${driver.id}:`, notificationError.response);
            }

            console.log(`⏳ Waiting 6 seconds before processing next driver...`);
            await new Promise(resolve => setTimeout(resolve, 60000));
            
            // Add to processed set and not accepted list
            processedDrivers.add(driver.id);
            setDriversIdsNotAccepted(prev => {
              // Prevent duplicates by checking if driver.id is not already in the array
              if (!prev.includes(driver.id)) {
                console.log(`📝 Adding driver ${driver.id} to not accepted list`);
                return [...prev, driver.id];
              }
              console.log(`ℹ️ Driver ${driver.id} already in not accepted list`);
              return prev;
            });

          } catch (driverError) {
            console.log(`❌ Error processing driver ${driver.id}:`, driverError);
            // Add to processed set even if there was an error
            processedDrivers.add(driver.id);
            continue;
          }
        }
        


    
        // If no new drivers were processed in this radius, increase it
        if (newDrivers.length === 0) {
           radius += 1;
        }
      }
        console.log(`\n📊 Current status:
          - Processed drivers: ${processedDrivers.size}
          - Not accepted drivers: ${driversIdsNotAccepted.length}
          - Current radius: ${radius}km
          - Accepted: ${accepted ? 'Yes' : 'No'}
        `);


      }
    
      if (accepted == null) {
        console.log('\n❌ No driver accepted the request after searching all radii');
        toast.show({
          title: t('common.no_driver_accepted'),
          placement: "top",
          status: "error",
          duration: 3000
        });
        setDriversIdsNotAccepted([])
        goBack();
      }
    } catch (error) {
      console.log('\n❌ Unexpected error in searchDrivers:', error);
      toast.show({
        title: t('common.error'),
        placement: "top",
        status: "error",
        duration: 3000
      });
    }
  };
  
  const goNext = async (data,handlerNext=true) => {
     try {
      setFormData({...formData,...data})
      if(handlerNext){
        // Check if we need to show login step
        if (step === 4 && token === -1) {
          animateStepTransition(4.5);
          setStep(4.5);
        } else {
          animateStepTransition(step+1);
          setStep(step+1);
        }
        if(step==1){
          setFormData(prev=>({
            ...prev,
            dropAddress:formData?.pickupAddress,
          }))
        }
        if(step==2||step==3){
          if(formData?.pickupAddress?.latitude&&formData?.pickupAddress?.longitude&&formData?.dropAddress?.latitude&&formData?.dropAddress?.longitude)
          mapRef?.current?.fitToCoordinates([{
            latitude: formData?.pickupAddress?.latitude,
            longitude: formData?.pickupAddress?.longitude
          },{
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
     } catch (error) {
      console.log(error)
     }
  };

  const goBack = () => {
    if(step==4){
      //OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
      console.log("cancel the job");
    }
    if(step==2){
      setFormData(prev=>({
        ...prev,
        dropAddress:{}
      }))
    }
    if(step === 4.5) {
      // If going back from login step, go back to step 4
      animateStepTransition(4);
      setStep(4);
    } else {
      animateStepTransition(step-1);
      setStep(step-1);
    }
  }

  const handleLoginSuccess = () => {
    // After successful login, proceed to step 5
    animateStepTransition(5);
    setStep(5);
  };

 

  

  const fetchLocationDetails = async (lat, lng) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_GOOGLE}`;

    try {
      const response = await axios.get(url);
      if (response.data.status === 'OK') {
        const address = response?.data?.results[0]?.formatted_address;
        const location = {
          address: address,
          latitude: lat,
          longitude: lng
        };

        if (step === 1) {
          setFormData(prev => ({
            ...prev,
            pickupAddress: location
          }));
        } else if (step === 2) {
          setFormData(prev => ({
            ...prev,
            dropAddress: location
          })); 
          lottieRef.current?.play(1396,1404);
        }

        lottieRef.current?.play(1396,1404);

      }
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };
  

  const animatePolylineToEnd = useCallback((coords) => {
    // Simplify coordinates for smoother animation
    const simplifiedCoords = simplifyCoordinates(coords);
    const totalAnimationDuration = 5;
    const intervalDelay = totalAnimationDuration / simplifiedCoords.length || 1;
    
    animationIndex.current = simplifiedCoords.length;
    setAnimatedCoords([]);
  
    if (backInterval.current) {
      clearInterval(backInterval.current);
    }
  
    backInterval.current = setInterval(() => {
      animationIndex.current -= 1;
      setAnimatedCoords(simplifiedCoords.slice(0, animationIndex.current));
      
      if (animationIndex.current <= 0) {
        clearInterval(backInterval.current);
        setAnimatedCoords([]);
        setRouteCoords([]);
      }
    }, intervalDelay);
  }, [simplifyCoordinates]);

 
handleBackFromStep2 = () => {
  
  setFormData(prev=>({
    ...prev,
    dropAddress:{},
    pickupAddress:{}
  }))
  animateStepTransition(step-1);
  setStep(step-1)
  animatePolylineToEnd(routeCoords)
}


  const renderStep = () => {
    const translateX = position.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    });

    const translateY = slidePosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 300],
    });

    return (
      <Animated.View
        style={[
          localStyles.stepContainer,
          {
            transform: [
              { translateX },
              { translateY }
            ],
          },
        ]}>
        <View style={localStyles.stepContent}>
        
          {step === 1 && (
            <PickupLocation 
              formData={formData} 
              goNext={goNext} 
              isMapDragging={isMapDragging}
              animateToRegion={(data)=>mapRef.current.animateToRegion(data)}
            />
          )}
          {step === 2 && (
            <DropoffLocation 
              formData={formData} 
              goNext={goNext} 
              onBack={handleBackFromStep2}
              isMapDragging={isMapDragging}
              animateToRegion={(data)=>mapRef.current.animateToRegion(data)}

            />
          )}
          {step === 3 && (
            <ChooseVehicle formData={formData} goNext={goNext} goBack={goBack} />
          )}
          {step === 4 && (
            <ConfirmRide formData={formData} goNext={goNext} goBack={goBack} />
          )}
          {step === 4.5 && (
            <LoginStep onLoginSuccess={handleLoginSuccess} onBack={goBack} />
          )}
          {step === 5 && (
            <SearchDrivers goBack={goBack} />
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
        onRegionChangeComplete={handleRegionChange}
      >
         

        {/* Pickup Location Marker */}
        {formData?.pickupAddress?.latitude  && (
          <Marker
            coordinate={{
              latitude: formData.pickupAddress.latitude,
              longitude: formData.pickupAddress.longitude
            }}
            tracksViewChanges={Platform.OS==="ios"}
            title="Pickup Location"
          >
            <Image
              source={require('../../assets/startPostion.png')}
              style={{ width: 20, height: 20,resizeMode:"contain" }}
            />
          </Marker>
        )}

        {/* Dropoff Location Marker */}
        {formData?.dropAddress?.latitude && step>1 &&!isMapDragging&& (
          <Marker
            coordinate={{
              latitude: formData.dropAddress.latitude,
              longitude: formData.dropAddress.longitude
            }}
            tracksViewChanges={Platform.OS==="ios"}
            title="Dropoff Location"
          >
            <Image
              source={require('../../assets/endPostion.png')}
              style={{ width: 20, height: 20,resizeMode:"contain" }}
            />
          </Marker>
        )}

        {/* Driver Markers */}
        {Object.entries(filteredDrivers).map(([uid, driver]) => (
          <Marker
            key={uid}
            coordinate={{
              latitude: driver.latitude,
              longitude: driver.longitude
            }}
            title={`Driver ${uid}`}
            tracksViewChanges={Platform.OS==="ios"}
            flat={true}
          >
            <DriverMarker type={driver.type} angle={driver.angle} />
          </Marker>
        ))}

        {/* Directions */}
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
            apikey={API_GOOGLE}
            strokeWidth={7}
            strokeColor="#ccc"
  onReady={result => {

    
    if(backInterval.current)
      {
         
        setAnimatedCoords([])
        setRouteCoords([])
        clearInterval(backInterval.current);


      }

    setRouteCoords(result.coordinates);
    animatePolylineToStart(result.coordinates);
    
   
  }}
          />
        )}

{animatedCoords.length>0&&(<Polyline
  coordinates={animatedCoords}
  strokeWidth={4}
  style={{zIndex:1000 }}
  strokeColor="#444" //#444
/>)}

      </MapView>
    );
  };

  const handleCurrentLocation = () => {
    try {
      setLoadingCurrentLocation(true)
      if (currentLocation) {
        mapRef.current?.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
      }, 1000);
      setLoadingCurrentLocation(false)
    } else {
      getCurrentLocation();
    }
    } catch (error) {
       setLoadingCurrentLocation(false)
      console.log("error",error)
    }
  };

  return (
    <View style={localStyles.container}>
      {renderMap()}
    {(step==1||(step==2)) && (  <LottieView
        ref={lottieRef}
        source={require("../../utils/marker.json")}
        style={{
          width: 140,
          height: 140,
          position: "absolute",
          top:Platform.OS === "ios" ? "39.6%" : "36%",
          alignSelf: "center"
        }}
        loop={false}
        autoPlay={false}
      />)}
      {(step === 1 || step === 2) && (
        <TouchableOpacity
          style={localStyles.currentLocationButton}
          onPress={handleCurrentLocation}
        >
          {loadingCurrentLocation?(<ActivityIndicator/>): <MaterialIcons name="my-location" size={22} color="#595FE5" />}
   
 
        </TouchableOpacity>
      )}
      {renderStep()}  
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
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    
    backgroundColor: 'transparent',
    position:'absolute',
    bottom:0, 
    flex:1,
  },
  stepContent: {
    width: SCREEN_WIDTH,
    backgroundColor: 'transparent',
    flex:1,
   },
   currentLocationButton: {
    position: 'absolute',
    right: 20,
    bottom: 250,
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
  currentLocationIcon: {
    width: 24,
    height: 24,
    tintColor: '#595FE5',
  },
});

export default MainScreen; 