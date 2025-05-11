import React, { useState , useRef, useEffect} from 'react';
import { View, Text, TouchableOpacity, SafeAreaView,   PermissionsAndroid  , Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import LocationPicker from './LocationPicker';
import ConfirmButton from './ConfirmButton';
import Geolocation from 'react-native-geolocation-service';
import {getAddressFromCoordinates} from '../../../utils/helpers/mapUtils';
import { Spinner, Toast } from 'native-base';




const StepLocation = ({ formData, goNext, }) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [pickupAddress, setPickupAddress] = useState({"address": "Tunis-Carthage International Airport, Tunis, Tunisie", "latitude": 36.8475562, "longitude": 10.2175601});//useState(formData?.pickupAddress||{} );
  const [dropAddress, setDropAddress] = useState({"address": "Géant Tunis City، Cebalat Ben Ammar, Tunisie", "latitude": 36.8999451, "longitude": 10.1244148});//useState(formData.dropAddress||{});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
   const pickupAddressRef = useRef(null);
   const dropAddressRef = useRef(null);

  useEffect(() => {
    if (pickupAddressRef.current&&pickupAddress.address) {
      pickupAddressRef.current.updateAddressText(pickupAddress.address);
    }
    if (dropAddressRef.current&&dropAddress.address) {
      dropAddressRef.current.updateAddressText(dropAddress.address);
    }
  }, []);

  const handlePickupSelect = (data, details) => {
    if (details) {  
      setPickupAddress({
        address: data.description,
        latitude: details?.geometry?.location?.lat,
        longitude: details?.geometry?.location?.lng,
      });
      
    }
  };

  const handleDropSelect = (data, details) => {
    if (details) {
      setDropAddress({
        address: data.description,
        latitude: details?.geometry?.location?.lat,
        longitude: details?.geometry?.location?.lng,
      });
     
    }
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: t('location.permission.title'),
          message: t('location.permission.message'),
          buttonNeutral: t('location.permission.ask_later'),
          buttonNegative: t('location.permission.cancel'),
          buttonPositive: t('location.permission.ok'),
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };



  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setIsLoadingLocation(false);
      Toast.show({
        title: t('location.error.permission_denied'),
        status: "error",
        duration: 3000,
        placement: "top"
      });
      return;
    }

    Geolocation.getCurrentPosition(
      async position => {
        try {
          const address = await getAddressFromCoordinates(
            position.coords.latitude,
            position.coords.longitude,
          );
          const formattedAddress = JSON.stringify(address);
          setPickupAddress({
            address: formattedAddress,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          pickupAddressRef.current.updateAddressText(formattedAddress);
          setIsLoadingLocation(false);
        } catch (error) {
          console.log('Error fetching address:', error);
          setIsLoadingLocation(false);
          Toast.show({
            title: t('location.error.fetch_address'),
            status: "error",
            duration: 3000,
            placement: "top"
          });
        }
      },
      error => {
        console.log(error);
        setIsLoadingLocation(false);
        Toast.show({
          title: t('location.error.get_location'),
          status: "error",
          duration: 3000,
          placement: "top"
        });
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );

 
  };


  const handleConfirm = () => {
    if (pickupAddress.latitude && dropAddress.latitude) {
      goNext({
        pickupAddress,
        dropAddress
      });
    } else {
      Alert.alert(t('booking.step1.pick_location'));
    }
  };


  return (
    <View style={styles.step1Wrapper}>  
  
    <View style={{flexDirection:'row'}}>
      {/* Stepper */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperCircle} />
        <View style={styles.stepperLine} />
        <View style={styles.stepperIconContainer}>
          <MaterialIcons name="location-on" size={20} color="#BDBDBD" />
        </View>
      </View>
      {/* Main Content */}
      <View style={styles.stepContent}>
        {/* Pickup */}
        <View style={[styles.inputRow,{marginBottom:4}]}>
          <Text style={[styles.step1Label]}>{t('location.where_are_you')}</Text>
          <TouchableOpacity 
            style={styles.iconContainer} 
            onPress={getCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <Spinner size="sm" color="#F9DC76" />
            ) : (
              <MaterialIcons name="my-location" size={22} color="#F9DC76" />
            )}
          </TouchableOpacity>
        </View>

     <SafeAreaView style={styles.container}>
     <LocationPicker
              setIsFocused={setIsFocused}
              onLocationSelect={handlePickupSelect}
              placeholder={t('common.search')}
              value={pickupAddress?.address}
              ref={pickupAddressRef}
            />
        </SafeAreaView>  
        {/* Destination */}
      {!isFocused&&(<View style={[styles.inputRow,{marginTop:20}]}>
          <Text style={styles.step1Label}>{t('location.pick_off')}</Text>
          <FontAwesome name="car" size={20} color="#BDBDBD" style={styles.carIcon} />
        </View>)}
      {!isFocused&&(  <SafeAreaView style={styles.container}>
             <LocationPicker
              onLocationSelect={handleDropSelect}
              placeholder={t('booking.step2.search')}
              value={dropAddress?.address}
              ref={dropAddressRef}
            />
         </SafeAreaView>)}
         
      </View>
      
    </View>
    <ConfirmButton
          onPress={handleConfirm}
          text={t('booking.step1.confirm')}
          disabled={!(pickupAddress.latitude && dropAddress.latitude)}
        />   
    </View>
  );
};

export default StepLocation; 