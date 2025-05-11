import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Image,
  Alert,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
 
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import {useDispatch, useSelector} from 'react-redux';
import polyline from '@mapbox/polyline';
import {styles} from './styles';
import {getAddressFromCoordinates} from '../../utils/helpers/mapUtils';
import WaveCircle from '../../components/WaveCircle';
import StepLocation from './components/StepLocation';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import MapStyle from '../../utils/googleMapStyle.js';
import api from '../../utils/api';
import { useToast } from 'native-base';
import { useTranslation } from 'react-i18next';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;
import {OneSignal} from 'react-native-onesignal';
import {sendNotificationToDrivers,calculatePrice} from '../../utils/CalculateDistanceAndTime';


const MainScreen = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state?.user?.currentUser);
  const toast = useToast();
  const { t } = useTranslation();
  const [driversIdsNotAccepted, setDriversIdsNotAccepted] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
 
  const [accepted, setAccepted] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 36.80557596268572,
    longitude: 10.180696783260366,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const mapRef = useRef(null);
  const position = useRef(new Animated.Value(0)).current;
 

  useEffect(() => {
    if(step === 3){
      searchDrivers()
       OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
        if(event?.notification?.additionalData?.accept==true){
         setAccepted(event?.notification?.additionalData)
        animateStepTransition(step+1);
        setStep(step+1)
        OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
        }
        

        });
  
    }
    return () => {
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
    }
  }, [step])  

  const animateStepTransition = (newStep) => {
    const direction = newStep > step ? -1 : 1;
    position.setValue(direction * SCREEN_WIDTH);
    
    Animated.spring(position, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

   const searchDrivers = async () => {
    let radius = 1;
    let processedDrivers = new Set(); // Track processed drivers to prevent duplicates
    console.log('🚀 Starting driver search process');
   
    try {
      while (accepted == null && radius <= 10) {
        console.log(`\n📡 Searching drivers in radius: ${radius}km`);
        let drivers = [];
    
        try {
          const response = await api.get(
            `/drivers-in-radius?radius=${radius}&latitude=${formData?.pickupAddress?.latitude}&longitude=${formData?.pickupAddress?.longitude}&vehicleType=${formData?.vehicleType?.id}&excludedIds=${driversIdsNotAccepted}`
          );
          
          drivers = response.data || [];
          console.log(`📊 Found ${drivers.length} drivers in radius ${radius}km`);
          
        } catch (error) {
          console.log(`❌ Error fetching drivers in radius ${radius}:`, error);
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
            const rideData = await calculatePrice(formData, driver);
            console.log(`💰 Calculated price: ${rideData.price}, distance: ${rideData.distance}km, time: ${rideData.time}min`);
            
            setFormData(prev => ({
              ...prev,
              price: rideData.price,
              distance: rideData.distance,
              time: rideData.time
            }));
            
            try {
              console.log(`📱 Sending notification to driver ${driver.id}`);
              await sendNotificationToDrivers({
                formData: {
                  ...formData,
                  price: rideData.price,
                  distance: rideData.distance,
                  time: rideData.time
                },
                driver,
                currentUser
              });
              console.log(`✅ Notification sent successfully to driver ${driver.id}`);
            } catch (notificationError) {
              console.log(`❌ Error sending notification to driver ${driver.id}:`, notificationError);
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
        animateStepTransition(step+1);
        setStep(step+1)
   
     
    
    }
  
     } catch (error) {
      console.log(error)
     }
  
    
  };

  const goBack = () => {
   
    if(step==3){
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
      console.log("cancel the job");
    }
    animateStepTransition(step-1);
    setStep(step-1)
  
  }


  

  const renderRoute = () => {
    if (formData?.dropAddress?.latitude && formData?.dropAddress?.longitude) {
      return (
        <Polyline
          coordinates={[
            {
              latitude: formData?.pickupAddress?.latitude,
              longitude: formData?.pickupAddress?.longitude,
            },
            {
              latitude: formData?.dropAddress?.latitude,
              longitude: formData?.dropAddress?.longitude,
            },
          ]}
          strokeWidth={4}
          strokeColor="blue"
        />
      );
    }
    return null;
  };

  const renderStep = () => {
    const translateX = position.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    });

    return (
      <Animated.View
        
        style={[
          localStyles.stepContainer,
          {
            transform: [{ translateX }],
          },
        ]}>
        <View style={localStyles.stepContent}>
          {step === 1 && (
            <StepLocation formData={formData} goNext={goNext}   />
          )}
          {step === 2 && (
            <Step2 formData={formData} goNext={goNext} goBack={goBack} />
          )}
          {step === 3 && (
            <Step3 formData={formData}  goNext={goNext} goBack={goBack} />
          )}
          {step === 4 && (
            <Step4 formData={formData} rideData={accepted} goNext={goNext} goBack={goBack} />
          )}
          {step === 5 && (
            <Step5 formData={formData} goNext={goNext} goBack={goBack} />
          )}
        </View>
      </Animated.View>
    );
  };

 
 
 

  return (
    <View style={localStyles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={MapStyle}
        zoomEnabled
        focusable
        
        region={mapRegion}
         >
         
        {renderRoute()}
      </MapView>
      {renderStep()}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    
    backgroundColor: 'transparent',
    
    flex:1,
  },
  stepContent: {
    width: SCREEN_WIDTH,
    backgroundColor: 'transparent',
    flex:1,
   },
});

export default MainScreen; 