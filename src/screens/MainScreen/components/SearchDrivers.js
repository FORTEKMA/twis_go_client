import React, { useRef, useEffect, useState, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions, Image, I18nManager, ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { OneSignal } from 'react-native-onesignal';
import api from '../../../utils/api';
import { sendNotificationToDrivers } from '../../../utils/CalculateDistanceAndTime';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import { realtimeDb } from '../../../utils/firebase';
import { ref, push, set, update, off, get, onValue, remove } from 'firebase/database';
import Ring from './Ring';
import Slider from 'react-native-slide-to-unlock';
import { 
  trackBookingStepViewed,
  trackBookingStepCompleted,
  trackBookingStepBack,
  trackRideCancelled,
  trackDriverFound
} from '../../../utils/analytics';
import { isPointInPolygon } from '../../../utils/helpers/mapUtils';

 

const SearchDriversComponent = ({ goBack, formData }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useSelector(state => state.user.currentUser);
  const [drivers, setDrivers] = useState([]);
  const [driversIdsNotAccepted, setDriversIdsNotAccepted] = useState([]);
  const [accepted, setAccepted] = useState(null);
  const [parameters, setParameters] = useState(null);
  const stepRef = useRef(5);
  const isSearchingRef = useRef(true);
  const requestRef = useRef(null);
  const processedDriversRef = useRef(new Set()); // Persist processed drivers
  const timedOutDriversRef = useRef(new Set()); // Persist drivers who timed out/ignored requests
  const [redZones, setRedZones] = useState([]);
  const [inRedZone, setInRedZone] = useState(false);
  const [redZonesChecked, setRedZonesChecked] = useState(false);
  const [searchStep, setSearchStep] = useState(0); // 0: initial, 1: searching, 2: found
  const [searchProgress, setSearchProgress] = useState(0);
  const searchStartTime = useRef(Date.now());
  const [avatarUrls, setAvatarUrls] = useState([]);
  const [driversNotified, setDriversNotified] = useState(0);
  const [driverMessages, setDriverMessages] = useState([]);
  const counterScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const radarSweepAnim = useRef(new Animated.Value(0)).current;
  const radarBlipAnim = useRef(new Animated.Value(0)).current;
  const avatarMovementAnim = useRef(new Animated.Value(0)).current;

  // Generate random avatar URLs on component mount
  useEffect(() => {
    const generateRandomAvatars = () => {
      const baseUrl = 'https://randomuser.me/api/portraits/';
      const genders = ['men', 'women'];
      const randomAvatars = [];
      
      for (let i = 0; i < 4; i++) {
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const randomId = Math.floor(Math.random() * 99) + 1;
        randomAvatars.push(`${baseUrl}${gender}/${randomId}.jpg`);
      }
      
      setAvatarUrls(randomAvatars);
    };

    generateRandomAvatars();
  }, []);

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Start search animations
    startSearchAnimations();
  }, []);

  const startSearchAnimations = () => {
    // Radar sweep animation
    Animated.loop(
      Animated.timing(radarSweepAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Radar blip animation for detected drivers
    Animated.loop(
      Animated.sequence([
        Animated.timing(radarBlipAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(radarBlipAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Avatar movement animation - avatars move along the radar circles
    Animated.loop(
      Animated.timing(avatarMovementAnim, {
        toValue: 1,
        duration: 8000, // 8 seconds for a full rotation
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for center
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start progress animation when search begins
  const startProgressAnimation = () => {
    // Progress animation removed - no longer needed
  };

  // Start fast progress animation when no driver found
  const startFastProgressAnimation = () => {
    // Go back immediately and show toast
    goBack();
    // Show toast after a short delay to ensure navigation is complete
    setTimeout(() => {
      Toast.show({
        type: 'error',
        text1: t('common.no_driver_accepted'),
        visibilityTime: 2000,
        onPress: () => {}
      });
    }, 500);
  };

  // Track step view
  useEffect(() => {
    trackBookingStepViewed('search_drivers');
  }, []);

  // Fetch red zones on mount
  useEffect(() => {
    const fetchRedZones = async () => {
      try {
        const response = await api.get('/red-zones');
        const zones = response?.data?.data || response?.data || [];
        setRedZones(zones.filter(z => z.active));
        setRedZonesChecked(true);
      } catch (err) {
        setRedZones([]);
        setRedZonesChecked(true);
      }
    };
    fetchRedZones();
  }, []);

  // Check if pickup or dropoff is in a red zone
  useEffect(() => {
    if (!redZones.length || !formData?.pickupAddress || !formData?.dropAddress) return;
    const pickup = { lat: formData.pickupAddress.latitude, lng: formData.pickupAddress.longitude };
    const drop = { lat: formData.dropAddress.latitude, lng: formData.dropAddress.longitude };
    let foundRedZone = false;
    for (const zone of redZones) {
      if (zone.polygonPath && Array.isArray(zone.polygonPath)) {
        if (isPointInPolygon(pickup, zone.polygonPath) || isPointInPolygon(drop, zone.polygonPath)) {
          foundRedZone = true;
          break;
        }
      }
    }
    setInRedZone(foundRedZone);
  }, [redZones, formData?.pickupAddress, formData?.dropAddress]);

  // If inRedZone, show search UI for 30s, then show no_driver_accepted and goBack
  useEffect(() => {
    if (!inRedZone) return;
    const timer = setTimeout(() => {
      Toast.show({
        type: 'error',
        text1: t('common.no_driver_accepted'),
        visibilityTime: 2000,
        onPress: () => {}
      });
      goBack();
    }, 30000);
    return () => clearTimeout(timer);
  }, [inRedZone]);

  // Fetch parameters from API
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const paramsRes = await api.get('parameters');
        setParameters(paramsRes.data.data[0]);
        
      } catch (error) {
        console.error('Error fetching parameters:', error);
        // Set default parameters if API fails
        setParameters({ min_radius_search: 4 });
      }
    };
    
    fetchParameters();
  }, []);

  const generateRadarPositions = (avatarUrls) => {
    // Radar container is 240x240, so center is at 120, 120
    const radarCenterX = 120;
    const radarCenterY = 120;
    // Radar rings are sized as ring * 80, so radii are 40, 80, 120
    const radarRingRadii = [40, 80, 120]; // Actual radar ring radii
  
    return avatarUrls.map((url, i) => {
      // Choose a random radar ring to position the avatar on
      const ringIndex = Math.floor(Math.random() * radarRingRadii.length);
      const ringRadius = radarRingRadii[ringIndex];
      
      // Generate positions on the radar circles
      const angle = (i * 90) + Math.random() * 30; // Spread around circle with some randomness
      const distance = ringRadius; // Position avatars exactly on the circle
      
      const x = radarCenterX + Math.cos(angle * Math.PI / 180) * distance;
      const y = radarCenterY + Math.sin(angle * Math.PI / 180) * distance;
  
      return {
        x,
        y,
        avatar: url,
        key: i,
        angle,
        distance,
        ringIndex,
      };
    });
  };

  const handleCancelSearch = async () => {
    // Update request status to canceled_search
    if (requestRef.current) {
      try {
        await update(ref(realtimeDb, `rideRequests/${requestRef.current.key}`), {
          status: 'canceled_search'
        });
      } catch (error) {
        console.error('Error updating request status to canceled_search:', error);
      }
    }
    
    trackBookingStepBack('search_drivers');
    trackRideCancelled('user_cancelled', {
      step: 5,
      search_duration: Date.now() - searchStartTime.current
    });
    goBack();
  };

  const searchDrivers = async () => {
    // Reset the searching flag to ensure the while loop can start
    isSearchingRef.current = true;
    stepRef.current = 5;
    
    let radius = 1;
    // processedDriversRef is now used instead of local processedDrivers
    let currentDriverTimeout = null;
    let currentDriverId = null;
    
    try {
      // Validate required formData
      if (!formData?.pickupAddress?.latitude || !formData?.pickupAddress?.longitude) {
        throw new Error('Pickup address coordinates are required');
      }
      
      if (!formData?.dropAddress?.latitude || !formData?.dropAddress?.longitude) {
        throw new Error('Dropoff address coordinates are required');
      }
      
      if (!formData?.vehicleType?.id) {
        throw new Error('Vehicle type is required');
      }

      // Create a unique ride request reference
      const newRequestRef = push(ref(realtimeDb, 'rideRequests'));
      if (!newRequestRef) {
        throw new Error('Failed to create request reference');
      }
      requestRef.current = newRequestRef;

      // Use set to create the initial request object
      await set(newRequestRef, {
        status: 'searching',
        createdAt: Date.now(),
        user: user,
        pickupAddress: formData.pickupAddress,
        dropAddress: formData.dropAddress,
        dropoffAddress: formData.dropAddress,
        vehicleType: formData.vehicleType,
        notifiedDrivers: {},
        price: formData.price,
        distance: formData.distance,
        reservation: formData.selectedDate != null,
        time: formData.time
      });

      // Main listener for request status changes
      const unsubscribe = onValue(newRequestRef, (snapshot) => {
        if (!snapshot || !snapshot.exists()) {
          return;
        }
        
        const data = snapshot.val();
        if (data && data.status === 'accepted') {
          setAccepted(true);
          setSearchStep(2);
          isSearchingRef.current = false;
          stepRef.current = 0;
          unsubscribe();
          unsubscribeNotifiedDrivers();
          if (currentDriverTimeout) {
            clearTimeout(currentDriverTimeout);
          }
          
          // Progress animation removed
         
          // Track driver found
          trackDriverFound(data.driverId, {
            search_duration: Date.now() - searchStartTime.current,
            radius: radius,
            drivers_notified: Object.keys(data.notifiedDrivers || {}).length
          });
         
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Historique',
                params: {
                  screen: 'OrderDetails',
                  params: {
                    id: data.orderId
                  }
                }
              }
            ]
          });
          goBack();
        }
      });

      // Listener for notifiedDrivers changes to detect rejections
      let unsubscribeNotifiedDrivers = null;
      let processNextDriver = null;

      const setupNotifiedDriversListener = () => {
        const notifiedDriversRef = ref(realtimeDb, `rideRequests/${newRequestRef.key}/notifiedDrivers`);
        unsubscribeNotifiedDrivers = onValue(notifiedDriversRef, async (snapshot) => {
          if (!snapshot || !snapshot.exists() || !currentDriverId) {
            return;
          }
          
          const notifiedDrivers = snapshot.val() || {};
          const currentDriverStatus = notifiedDrivers[currentDriverId];
          
          // If current driver rejected (status is false), move to next driver immediately
          if (currentDriverStatus === false) {
            if (currentDriverTimeout) {
              clearTimeout(currentDriverTimeout);
              currentDriverTimeout = null;
            }
            
            processedDriversRef.current.add(currentDriverId);
            timedOutDriversRef.current.add(currentDriverId); // Add to timeout tracking for explicit rejections too
            setDriversIdsNotAccepted(prev => {
              if (!prev.includes(currentDriverId)) {
                return [...prev, currentDriverId];
              }
              return prev;
            });

            // Increment rejected_command_number for the driver
            try {
              // Fetch current driver info
              const userRes = await api.get(`users/${currentDriverId}`);
              const oldRejectedCount = userRes.data?.rejected_command_number || 0;

              // Update with incremented value using PUT
              await api.put(`users/${currentDriverId}`, {
                rejected_command_number: Number(oldRejectedCount) + 1,
              });
            } catch (err) {
              console.error('Failed to update rejected_command_number:', err);
            }
            
            // Process next driver immediately
            if (processNextDriver) {
              processNextDriver();
            }
          }
        });
      };
     
      setupNotifiedDriversListener();
      
      // Function to process drivers with immediate rejection detection
      const processDrivers = async (drivers) => {
        const newDrivers = drivers.filter(driver =>
          !processedDriversRef.current.has(driver.id) && 
          !driversIdsNotAccepted.includes(driver.id) &&
          !timedOutDriversRef.current.has(driver.id)
        );
        
        
        
        
        for (const driver of newDrivers) {
         
          if (!isSearchingRef.current || accepted !== null) {
            break;
          }
          
          if (driversIdsNotAccepted.includes(driver.id) || timedOutDriversRef.current.has(driver.id)) {
            continue;
          }

          currentDriverId = driver.id;

          try {
                          if (requestRef.current) {
                await update(ref(realtimeDb, `rideRequests/${requestRef.current.key}/notifiedDrivers`), {
                  [driver.id]: true
                });

              // Fix the data structure to match what sendNotificationToDrivers expects
              const notificationData = {
                formData: {
                  ...formData,
                  dropAddress: formData.dropAddress, // Fix the property name
                  pickupAddress: formData.pickupAddress
                },
                driver,
                currentUser: user
              };

              const notificationRed = await sendNotificationToDrivers(notificationData);
              
              // Add driver viewing message
              setDriversNotified(prev => prev + 1);
              setDriverMessages(prev => {
                const isFirstDriver = prev.length === 0;
                const message = isFirstDriver 
                  ? t('common.one_driver_viewing')
                  : t('common.another_driver_viewing');
                
                const newMessage = {
                  id: Date.now() + Math.random(),
                  text: message,
                  timestamp: Date.now()
                };
                
                // Animate counter scale on update
                Animated.sequence([
                  Animated.timing(counterScaleAnim, {
                    toValue: 1.2,
                    duration: 150,
                    useNativeDriver: true,
                  }),
                  Animated.timing(counterScaleAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                  }),
                ]).start();
                
                return [...prev, newMessage];
              });
            }
          } catch (notificationError) {
            
            // Handle notification error silently and move to next driver
            processedDriversRef.current.add(driver.id);
            continue;
          }

          if (!isSearchingRef.current || accepted !== null) break;

          // Set timeout for current driver
          currentDriverTimeout = setTimeout(async () => {
            
            
            if (isSearchingRef.current && accepted === null) {
              processedDriversRef.current.add(driver.id);
              timedOutDriversRef.current.add(driver.id); // Add to timeout tracking
              setDriversIdsNotAccepted(prev => {
                if (!prev.includes(driver.id)) {
                  return [...prev, driver.id];
                }
                return prev;
              });

              if (requestRef.current) {
                
                await update(ref(realtimeDb, `rideRequests/${requestRef.current.key}/notifiedDrivers`), {
                  [driver.id]: false
                 
                });
                await update(ref(realtimeDb, `rideRequests/${requestRef.current.key}/silencedDrivers`), {
                  [driver.documentId]: true                 
                });
              }

              // Increment rejected_command_number for the driver (timeout case)
              try {
                const userRes = await api.get(`users/${driver.id}`);
                const oldRejectedCount = userRes.data?.rejected_command_number|| 0;
                console.log("availablePoints",userRes.data.availablePoints);
                console.log("parameters.ignoreRequestDeduction",parameters.ignoreRequestDeduction);
                await api.put(`users/${driver.id}`, {
                  availablePoints:userRes.data.availablePoints - parameters.ignoreRequestDeduction,
                  rejected_command_number: Number(oldRejectedCount) + 1,
                });
                
              } catch (err) {
                console.error('[Timeout] Failed to update rejected_command_number after timeout:', err);
              }
              
              // Process next driver after timeout
              if (processNextDriver) {
                
                processNextDriver();
              }
            } else {
              
            }
          }, 22000);

          // Wait for either rejection (handled by listener) or timeout
          await new Promise((resolve) => {
            processNextDriver = resolve;
          });

          if (!isSearchingRef.current || accepted !== null) break;
        }
      };
 
      // Main search loop - infinite loop to prevent no driver found
      const maxRadius = parameters?.min_radius_search || 4; // Fallback to 4 if not defined
      while (accepted === null && isSearchingRef.current) {
        if (!isSearchingRef.current) {
          break;
        }
        
        let drivers = [];
        if (stepRef.current !== 5 || !isSearchingRef.current) {
          return;
        }
     
        try {
          let url = `/drivers-in-radius?radius=${radius}&latitude=${formData?.pickupAddress?.latitude}&longitude=${formData?.pickupAddress?.longitude}&vehicleType=${formData?.vehicleType?.id}`;
           console.log("url",url);  
          
          const response = await api.get(url);
          drivers = response.data || [];
           
        } catch (error) {
          console.error(`Error fetching drivers for radius ${radius}:`, error.response?.data || error.message);
          radius += 1;
          // Reset radius to 0 when it exceeds maxRadius for infinite search
          if (radius > maxRadius) {
            radius = 0;
            // Clear processed drivers to allow re-searching, but keep timed out drivers excluded
            processedDriversRef.current.clear();
            setDriversIdsNotAccepted([]);
            // Note: timedOutDriversRef is NOT cleared to prevent re-contacting drivers who ignored requests
          }
          continue;
        }

        if (drivers.length > 0) {
          const newDrivers = drivers.filter(driver =>
            !processedDriversRef.current.has(driver.id) && 
            !driversIdsNotAccepted.includes(driver.id) &&
            !timedOutDriversRef.current.has(driver.id)
          );
          if (newDrivers.length > 0) {
            await processDrivers(drivers);
          } else {
            // All drivers in this radius are already processed, increase radius
            radius += 1;
            // Reset radius to 0 when it exceeds maxRadius for infinite search
            if (radius > maxRadius) {
              radius = 0;
              // Clear processed drivers to allow re-searching, but keep timed out drivers excluded
              processedDriversRef.current.clear();
              setDriversIdsNotAccepted([]);
              // Note: timedOutDriversRef is NOT cleared to prevent re-contacting drivers who ignored requests
            }
          }
        } else {
          radius += 1;
          // Reset radius to 0 when it exceeds maxRadius for infinite search
          if (radius > maxRadius) {
            radius = 0;
            // Clear processed drivers to allow re-searching, but keep timed out drivers excluded
            processedDriversRef.current.clear();
            setDriversIdsNotAccepted([]);
            // Note: timedOutDriversRef is NOT cleared to prevent re-contacting drivers who ignored requests
          }
        }
      }
    
      // Note: No driver found logic removed since we now have infinite search loop

      if (unsubscribe) {
        unsubscribe();
      }
      if (unsubscribeNotifiedDrivers) {
        unsubscribeNotifiedDrivers();
      }
      if (currentDriverTimeout) {
        clearTimeout(currentDriverTimeout);
      }
    } catch (error) {
      
              if (requestRef.current) {
          off(requestRef.current);
        }
      
      // Progress animation removed
      
      // Track search error
      trackRideCancelled('search_error', {
        error_message: error.message,
        search_duration: Date.now() - searchStartTime.current
      });
      console.log("error",error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  // Start driver search
  useEffect(() => {
    
    
    
    if(inRedZone){
      
      return;
    } 
    
    // Only start searching when parameters are loaded and avatarUrls are ready
    if (parameters && !inRedZone && avatarUrls.length > 0) {
      
      setDrivers(generateRadarPositions(avatarUrls));
      setSearchStep(1);
      startProgressAnimation(); // Start progress animation
      searchDrivers();
    } else {
      
    }

    return () => {
      
      // Stop all ongoing operations
      isSearchingRef.current = false;
      stepRef.current = 0;
      // Clear any pending timeouts
      clearTimeout();
      
      // Progress animation removed
      
      // Check if the request exists and its status before updating
      if (requestRef.current) {
        get(requestRef.current).then(async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Only update status if the request wasn't accepted
            if (data.status !== 'accepted') {
              try {
                await update(ref(realtimeDb, `rideRequests/${requestRef.current.key}`), {
                  status: 'not_found'
                });
              } catch (error) {
                console.error('Error updating request status to not_found:', error);
              }
            }
          }
          // Always remove the listener
          off(requestRef.current);
        });
      }
    }
  }, [parameters]);

  const renderSearchContent = () => {
    switch (searchStep) {
      case 0:
        return (
          <View style={searchStyles.contentContainer}>
            <Text style={searchStyles.title}>
              {t('preparing_search', 'Initializing radar...')}
            </Text>
            <ActivityIndicator size="large" color="#000000" style={searchStyles.loader} />
          </View>
        );
      
      case 1:
        return (
          <View style={searchStyles.contentContainer}>
            {/* Radar Display */}
            <View style={searchStyles.radarContainer}>
              {/* Radar Background Circles */}
              <View style={searchStyles.radarBackground}>
                {[1, 2, 3].map((ring) => (
                  <View
                    key={ring}
                    style={[
                      searchStyles.radarRing,
                      {
                        width: ring * 80,
                        height: ring * 80,
                        borderRadius: ring * 40,
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Radar Sweep Line */}
              <Animated.View
                style={[
                  searchStyles.radarSweep,
                  {
                    transform: [
                      {
                        rotate: radarSweepAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />

              {/* Center Point */}
              <Animated.View
                style={[
                  searchStyles.radarCenter,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#000000" />
              </Animated.View>

              {/* Driver Blips */}
              {drivers.map((driver, index) => (
                <Animated.View
                  key={driver.key}
                  style={[
                    searchStyles.radarBlip,
                    {
                      left: driver.x - 15,
                      top: driver.y - 15,
                      opacity: radarBlipAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                      transform: [
                        {
                          scale: radarBlipAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.8, 1.2, 0.8],
                          }),
                        },
                        {
                          rotate: avatarMovementAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', `${360 * (index + 1)}deg`],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={searchStyles.blipInner}>
                    <Image source={{ uri: driver.avatar }} style={searchStyles.blipImage} />
                  </View>
                  <View style={searchStyles.blipPulse} />
                </Animated.View>
              ))}
            </View>

            {/* Driver Messages */}
            {driverMessages.length > 0 && (
              <View style={searchStyles.driverMessagesContainer}>
                <ScrollView 
                  style={searchStyles.messagesScrollView}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {driverMessages.map((message, index) => (
                    <Animated.View
                      key={message.id}
                      style={[
                        searchStyles.driverMessage,
                        {
                          transform: [{ scale: counterScaleAnim }],
                          opacity: fadeAnim,
                        }
                      ]}
                    >
                      <MaterialCommunityIcons 
                        name="eye" 
                        size={14} 
                        color="#666666" 
                        style={searchStyles.messageIcon}
                      />
                      <Text style={searchStyles.messageText}>
                        {message.text}
                      </Text>
                    </Animated.View>
                  ))}
                </ScrollView>
              </View>
            )}

          </View>
        );
      
      case 2:
        return (
          <View style={searchStyles.contentContainer}>
            <Animated.View
              style={[
                searchStyles.successContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <MaterialCommunityIcons name="check-circle" size={80} color="#000000" />
              
              <Text style={searchStyles.successTitle}>
                {t('driver_found', 'Target Acquired!')}
              </Text>
              
              {accepted?.driver_data && (
                <View style={searchStyles.driverInfo}>
                  <Image 
                    source={{ uri: accepted.driver_data.avatar || avatarUrls[0] }} 
                    style={searchStyles.driverImage} 
                  />
                  <Text style={searchStyles.driverName}>
                    {accepted.driver_data.name}
                  </Text>
                  <View style={searchStyles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                    <Text style={searchStyles.rating}>
                      {accepted.driver_data.rating || '4.8'}
                    </Text>
                  </View>
                </View>
              )}
              
              <Text style={searchStyles.successMessage}>
                {t('redirecting_tracking', 'Redirecting to tracking...')}
              </Text>
            </Animated.View>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (inRedZone) {
    return (
      <Animated.View 
        style={[
          searchStyles.container,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={searchStyles.redZoneContainer}>
          <MaterialCommunityIcons name="map-marker-off" size={80} color="#FF5722" />
          <Text style={searchStyles.redZoneTitle}>
            {t('service_unavailable', 'Service Unavailable')}
          </Text>
          <Text style={searchStyles.redZoneMessage}>
            {t('red_zone_description', 'Pickup service is not available in this area. Please choose a different location.')}
          </Text>
          
          <TouchableOpacity
            style={searchStyles.backButton}
            onPress={goBack}
            activeOpacity={0.8}
          >
            <Text style={searchStyles.backButtonText}>
              {t('choose_different_location', 'Choose Different Location')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[
        searchStyles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      {/* Header */}
      <View style={searchStyles.header}>
        <TouchableOpacity 
          style={searchStyles.headerBackButton}
          onPress={handleCancelSearch}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name={I18nManager.isRTL ? "chevron-right" : "chevron-left"} 
            size={28} 
            color="#000000" 
          />
        </TouchableOpacity>
        
        <Text style={searchStyles.headerTitle}>
          {searchStep === 2 ? t('driver_found', 'Driver Found!') : t('finding_driver', 'Finding Driver')}
        </Text>
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          searchStyles.mainContent,
          {
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {renderSearchContent()}
      </Animated.View>

      {/* Cancel Button */}
      {searchStep === 1 && (
        <View style={searchStyles.cancelContainer}>
          <TouchableOpacity
            style={searchStyles.cancelButton}
            onPress={handleCancelSearch}
            activeOpacity={0.8}
          >
            <Text style={searchStyles.cancelButtonText}>
              {t('cancel_search', 'Cancel Search')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const searchStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  radarContainer: {
    position: 'relative',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    alignSelf: 'center',
  },
  radarBackground: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
  },
  radarSweep: {
    position: 'absolute',
    width: 4,
    height: 120,
    backgroundColor: '#000000',
    transformOrigin: 'bottom center',
  },
  radarCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  radarBlip: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blipInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#000000',
  },
  blipImage: {
    width: '100%',
    height: '100%',
  },
  blipPulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
  },
  driversContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  loader: {
    marginTop: 40,
  },
  successContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginTop: 24,
    marginBottom: 32,
  },
  driverInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  driverImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 4,
  },
  successMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  cancelContainer: {
    paddingBottom: 20,
    marginTop: 20,
  },
  cancelButton: {
     backgroundColor: '#000000',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  redZoneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  redZoneTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF5722',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  redZoneMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  driverMessagesContainer: {
    marginTop: 16,
    alignItems: 'center',
    height: 80,
    width: '100%',
  },
  messagesScrollView: {
    width: '100%',
    maxHeight: 80,
  },
  driverMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 4,
    marginHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageIcon: {
    marginRight: 6,
  },
  messageText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
  },
});

export default memo(SearchDriversComponent);

