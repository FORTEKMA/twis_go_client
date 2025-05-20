import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import ConfirmButton from './ConfirmButton';
import Geolocation from 'react-native-geolocation-service';
import { getAddressFromCoordinates } from '../../../utils/helpers/mapUtils';
import { Spinner, Toast } from 'native-base';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { API_GOOGLE } from "@env";

 

const PickupLocation = ({ formData, goNext, isMapDragging, animateToRegion }) => {
  const { t } = useTranslation();
  const [pickupAddress, setPickupAddress] = useState(formData?.pickupAddress || {});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const inputRef = useRef(null);
   useEffect(() => {
    if (formData?.pickupAddress) {
      setPickupAddress(formData.pickupAddress);
      inputRef.current.setAddressText(formData.pickupAddress.address);
    }
  }, [formData]);

  return (
    <View style={[styles.step1Wrapper, isMapDragging && { opacity: 0.5 }]}>
      <View style={localStyles.header}>
        <Text style={localStyles.headerTitle}>{t('location.where_are_you')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={localStyles.content}>
        <GooglePlacesAutocomplete
        predefinedPlacesAlwaysVisible={false}
          placeholder={t('location.pickUp')}
          debounce={300} 
          onPress={(data, details = null) => {
            if (details) {
              const newAddress = {
                address: details.formatted_address,
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              };
              setPickupAddress(newAddress);
              if (animateToRegion) {
                animateToRegion({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                });
              }
            }

          }}
          ref={inputRef}
          
          textInputProps={{
            style:{
               
              color:"#000"
            },
            placeholderTextColor:"#ccc"
          }}
          query={{
            key: API_GOOGLE,
            language: 'en',
            components: 'country:tn',
          }}
          styles={{
            container: {
              flex: 0,
              width: '100%',
              position: 'relative',
            },
            textInputContainer: {
              width: '100%',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              backgroundColor: '#fff',
              color:"#000",
              height: 50,
              paddingHorizontal:10
            },
            textInput: {
              height: 50,
              color: '#000',
              fontSize: 16,
              placeholderTextColor:"#ccc",
              flex:1
            },
            listView: {
            //   position: 'absolute',
            //   bottom: '100%',
            //   left: 0,
            //   right: 0,
            //   backgroundColor: '#fff',
            //  borderWidth: 1,
            //  borderBottomWidth:0,
            //  // borderColor: '#ccc',
            //   borderRadius: 8,
            //   zIndex: 1000,
            //   marginBottom: 8,
            //   maxHeight: 200,
            },
            row: {
              padding: 13,
              height: 'auto',
              minHeight: 44,
            },
            description: {
              color: '#000',
            },
          }}
          
          fetchDetails={true}
          enablePoweredByContainer={false}
          minLength={2}
        />
      </View>

      <ConfirmButton
        onPress={() => goNext({pickupAddress: pickupAddress })}
        text={t('location.continue')}
        disabled={!pickupAddress.latitude}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: "100%"
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
    width: "100%"
  },
});

export default PickupLocation; 