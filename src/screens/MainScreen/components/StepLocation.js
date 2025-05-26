import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, PermissionsAndroid, Alert, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import LocationPicker from './LocationPicker';
import ConfirmButton from './ConfirmButton';
import Geolocation from 'react-native-geolocation-service';
import { getAddressFromCoordinates } from '../../../utils/helpers/mapUtils';
import { Spinner, Toast } from 'native-base';
import { useNavigation } from '@react-navigation/native';

const StepLocation = ({ formData, goNext, isMapDragging, selectedLocation }) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [pickupAddress, setPickupAddress] = useState(formData?.pickupAddress || {});
  const [dropAddress, setDropAddress] = useState(formData.dropAddress || {});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSelectingPickup, setIsSelectingPickup] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (selectedLocation && !isMapDragging) {
      const updateLocation = async () => {
        try {
          const address = await getAddressFromCoordinates(
            selectedLocation.latitude,
            selectedLocation.longitude
          );
          const formattedAddress = JSON.stringify(address);
          
          if (isSelectingPickup) {
            setPickupAddress({
              address: formattedAddress,
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            });
            goNext({
              pickupAddress: {
                address: formattedAddress,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              },
              dropAddress: dropAddress
            });
          } else {
            setDropAddress({
              address: formattedAddress,
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            });
            goNext({
              pickupAddress: pickupAddress,
              dropAddress: {
                address: formattedAddress,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }
            });
          }
        } catch (error) {
          console.log('Error fetching address:', error);
          Toast.show({
            title: t('location.error.fetch_address'),
            status: "error",
            duration: 3000,
            placement: "top"
          });
        }
      };
      updateLocation();
    }
  }, [selectedLocation, isMapDragging]);

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
    <View style={[styles.step1Wrapper]}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.stepperContainer}>
          <View style={styles.stepperCircle} />
          <View style={styles.stepperLine} />
          <View style={styles.stepperIconContainer}>
            <MaterialIcons name="location-on" size={20} color="#BDBDBD" />
          </View>
        </View>
        <View style={styles.stepContent}>
          <View style={[styles.inputRow, { marginBottom: 4 }]}>
            <Text style={[styles.step1Label]}>{t('location.where_are_you')}</Text>
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <Spinner size="sm" color="#030303" />
              ) : (
                <MaterialIcons name="my-location" size={22} color="#030303" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[localStyles.container, isSelectingPickup && localStyles.selectedContainer]}
            onPress={() => setIsSelectingPickup(true)}
          >
            <Text style={{ color: pickupAddress.address ? '#000' : "#ddd" }}>
              {pickupAddress.address ? pickupAddress.address : t('location.pickUp')}
            </Text>
          </TouchableOpacity>

          <View style={[styles.inputRow, { marginTop: 20 }]}>
            <Text style={styles.step1Label}>{t('location.pick_off')}</Text>
            <FontAwesome name="car" size={20} color="#BDBDBD" style={styles.carIcon} />
          </View>

          <TouchableOpacity
            style={[localStyles.container, !isSelectingPickup && localStyles.selectedContainer]}
            onPress={() => setIsSelectingPickup(false)}
          >
            <Text style={{ color: dropAddress.address ? '#000' : "#ddd" }}>
              {dropAddress.address ? dropAddress.address : t('location.pick_off')}
            </Text>
          </TouchableOpacity>
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

const localStyles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  selectedContainer: {
    borderColor: '#030303',
    borderWidth: 2,
  }
});

export default StepLocation; 