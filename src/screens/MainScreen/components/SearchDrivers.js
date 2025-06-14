import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions, Image, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useToast } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { OneSignal } from 'react-native-onesignal';
import api from '../../../utils/api';
import { sendNotificationToDrivers } from '../../../utils/CalculateDistanceAndTime';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
const { width } = Dimensions.get('window');
import Ring from './Ring';
import Slider from 'react-native-slide-to-unlock';

const avatarUrls = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
];

const Step4 = ({ goBack, formData }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const navigation = useNavigation();
  const user = useSelector(state => state.user.currentUser);
  const [drivers, setDrivers] = useState([]);
  const [driversIdsNotAccepted, setDriversIdsNotAccepted] = useState([]);
  const [accepted, setAccepted] = useState(null);
  const stepRef = useRef(5);
  const isSearchingRef = useRef(true);
  const requestRef = useRef(null);

  const generateCenteredPositions = (avatarUrls) => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
    const verticalMin = screenHeight * 0.3;
    const verticalMax = screenHeight * 0.6;
    const horizontalMin = screenWidth * 0.25;
    const horizontalMax = screenWidth * 0.75;
  
    return avatarUrls.map((url, i) => {
      const top = Math.floor(Math.random() * (verticalMax - verticalMin)) + verticalMin;
      const left = Math.floor(Math.random() * (horizontalMax - horizontalMin)) + horizontalMin;
  
      return {
        top,
        left,
        avatar: url,
        key: i,
      };
    });
  };

  const searchDrivers = async () => {
    let radius = 1;
    let processedDrivers = new Set();
    
    try {
      const db = database();
      if (!db) {
        throw new Error('Firebase database not initialized');
      }

      const requestData = {
        ...formData,
        status: 'searching',
        createdAt: database.ServerValue.TIMESTAMP,
        user: user,
        pickupAddress: formData.pickupAddress,
        dropoffAddress: formData.dropoffAddress,
        vehicleType: formData.vehicleType,
        notifiedDrivers: {},
      };

      const newRequestRef = db.ref('rideRequests').push();
      if (!newRequestRef) {
        throw new Error('Failed to create request reference');
      }
      
      requestRef.current = newRequestRef;
      await newRequestRef.set(requestData);

      const unsubscribe = newRequestRef.on('value', (snapshot) => {
        if (!snapshot || !snapshot.exists()) {
          return;
        }
        
        const data = snapshot.val();
        if (data && data.status === 'accepted') {
          setAccepted(true);
          isSearchingRef.current = false;
          stepRef.current = 0;
          unsubscribe();
          clearTimeout();
         
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

      while (accepted == null && radius <= 4 && stepRef.current === 5 && isSearchingRef.current) {
        if (!isSearchingRef.current) {
          break;
        }
        
        let drivers = [];
        if (stepRef.current !== 5 || !isSearchingRef.current) {
          return;
        }
        if(accepted==null){
          try {
            let url=`/drivers-in-radius?radius=${radius}&latitude=${formData?.pickupAddress?.latitude}&longitude=${formData?.pickupAddress?.longitude}&vehicleType=${formData?.vehicleType?.id}`
            const response = await api.get(url);
            drivers = response.data || [];
          } catch (error) {
            radius += 1;
            continue;
          }

          const newDrivers = drivers.filter(driver => !processedDrivers.has(driver.id));
       
          for (const driver of newDrivers) {
            if (!isSearchingRef.current) {
              break;
            }
            
            if (driversIdsNotAccepted.includes(driver.id)) {
              continue;
            }

            try {
              if (requestRef.current) {
                await requestRef.current.child('notifiedDrivers').update({
                  [driver.id]: true
                });

                const notificationRed = await sendNotificationToDrivers({
                  formData,
                  driver,
                  currentUser: user
                });
              }
            } catch (notificationError) {
              // Handle notification error silently
            }

            if (!isSearchingRef.current) break;
            
            await new Promise(resolve => setTimeout(resolve, 50000));
            
            if (!isSearchingRef.current) break;
            
            processedDrivers.add(driver.id);
            setDriversIdsNotAccepted(prev => {
              if (!prev.includes(driver.id)) {
                return [...prev, driver.id];
              }
              return prev;
            });

            if (requestRef.current) {
              await requestRef.current.child('notifiedDrivers').update({
                [driver.id]: false
              });
            }
          }

          if (newDrivers.length === 0) {
            radius += 1;
          }
        }
      }
    
      if (accepted == null && isSearchingRef.current) {
        if (requestRef.current && !accepted) {
          await requestRef.current.remove();
        }
        
        toast.show({
          title: t('common.no_driver_accepted'),
          placement: "top",
          status: "error",
          duration: 3000
        });
        setDriversIdsNotAccepted([])
        goBack();
      }

      unsubscribe();
    } catch (error) {
      if (requestRef.current) {
        requestRef.current.off();
      }
      toast.show({
        title: t('common.error'),
        placement: "top",
        status: "error",
        duration: 3000
      });
    }
  };

  useEffect(() => {
    setDrivers(generateCenteredPositions(avatarUrls));
    searchDrivers();

    return () => {
      // Stop all ongoing operations
      isSearchingRef.current = false;
      stepRef.current = 0;
      // Clear any pending timeouts
      clearTimeout();
      
      // Check if the request exists and its status before removing
      if (requestRef.current) {
        requestRef.current.once('value', (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Only remove if the request wasn't accepted
            if (data.status !== 'accepted') {
              requestRef.current.remove();
            }
          }
          // Always remove the listener
          requestRef.current.off();
        });
      }
    }
  }, []);

  // Swipe overlay logic
 
 
  

 

  return (
    <View style={localStyles.container}>
    {/* Status Header */}
    <View style={{ alignItems: 'center', marginTop: hp(2) }}>
      <View style={localStyles.statusIconWrapper}>
        <MaterialCommunityIcons name="progress-clock" size={32} color="#030303" />
      </View>
      <Text style={localStyles.statusTitle}>{t("booking.step3.searching_ride")}</Text>
      <Text style={localStyles.statusSubtitle}>{t("booking.step3.it_may_take_some_time")}</Text>
    </View>

    {/* Waves */}
    <View style={localStyles.animationWrapper}>
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
     <Ring delay={0} />
      <Ring delay={1000} />
      <Ring delay={2000} />
      <Ring delay={2500} />
      <Ring delay={3000} />
      
    </View>

     
      
    </View>
 


<Slider
 
  onEndReached={() => {
    goBack();
  }}
  containerStyle={{
    
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    zIndex:9999999
  }}
  sliderElement={
    <View
      style={{
        width: 50,
       // margin: 4,
        borderRadius: 5,
        height: 60,
        backgroundColor:"#0c0c0c",
        alignItems:"center",
        justifyContent:"center"
      }}
      
    >
        <MaterialCommunityIcons name={I18nManager.isRTL?"arrow-left":"arrow-right"} size={32} color="#fff" />
    </View>
  }
  
>
  <Text>{I18nManager.isRTL ? t('booking.step3.swipe_left_to_cancel') : t('booking.step3.swipe_right_to_cancel')}</Text>
</Slider>

    {/* Add 4 fake drivers with avatars in random positions */}
    <View style={{ position: 'absolute', width: '100%', height: '100%', }}>
      {drivers.map(driver => (
        <View key={driver.key} style={[localStyles.driverAvatar, driver]}>
          <Image source={{ uri: driver.avatar }} style={localStyles.avatarImg} />
        </View>
      ))}
    </View>
  </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    margin: 16,
     flex:1,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    
  },
  statusIconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 8,
    marginBottom: 8,
  },
  statusTitle: {
    fontWeight: '700',
    fontSize: hp(2.5),
    color: '#fff',
    marginTop: 4,
  },
  statusSubtitle: {
    color: '#BDBDBD',
    fontSize: hp(1.7),
    marginTop: 2,
    marginBottom: 10,
  },
  animationWrapper: {
    flex: 1.5, // Make animation area bigger
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2),
    minHeight: 350,
  },
  circle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#000',
    borderStyle: 'dashed',
    borderRadius: 200,
  },
  circleLarge: {
    width: 260,
    height: 260,
    top: '10%',
    left: '50%',
    marginLeft: -130,
  },
  circleMedium: {
    width: 180,
    height: 180,
    top: '22%',
    left: '50%',
    marginLeft: -90,
  },
  circleSmall: {
    width: 110,
    height: 110,
    top: '30%',
    left: '50%',
    marginLeft: -55,
  },
  carWrapper: {
    position: 'absolute',
    top: '48%',
    left: '50%',
    marginLeft: -24,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 12,
    zIndex: 2,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'absolute',
    zIndex: 3,
    alignItems: 'center',
  },
  driverBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    position: 'absolute',
    top: 50,
    left: -30,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  driverName: {
    fontWeight: '700',
    color: '#fff',
    fontSize: hp(1.7),
  },
  driverDistance: {
    color: '#BDBDBD',
    fontSize: hp(1.5),
  },
  cancelWrapper: {
    alignItems: 'center',
    marginBottom: hp(4),
    zIndex:1000,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 220,
  },
  cancelText: {
    color: '#BDBDBD',
    fontWeight: '600',
    fontSize: hp(2),
    marginLeft: 8,
  },
  swipeHint: {
    color: '#BDBDBD',
    fontSize: hp(1.5),
    marginTop: 8,
  },
  driverAvatar: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 2,
    elevation: 3,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
});

export default Step4; 