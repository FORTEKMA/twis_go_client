import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, I18nManager } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import ConfirmButton from './ConfirmButton';
import Geolocation from 'react-native-geolocation-service';
import { getAddressFromCoordinates } from '../../../utils/helpers/mapUtils';
import { Spinner, Toast } from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { API_GOOGLE } from "@env";

// Tunisia's approximate boundaries
const TUNISIA_BOUNDS = {
  north: 37.5439,
  south: 30.2302,
  east: 11.5983,
  west: 7.5248
};

const isInTunisia = (latitude, longitude) => {
  return (
    latitude >= TUNISIA_BOUNDS.south &&
    latitude <= TUNISIA_BOUNDS.north &&
    longitude >= TUNISIA_BOUNDS.west &&
    longitude <= TUNISIA_BOUNDS.east
  );
};

const DropoffLocation = ({ formData, goNext, isMapDragging, onBack, animateToRegion }) => {
  const { t } = useTranslation();
  const [dropoffAddress, setDropoffAddress] = useState(formData?.dropoffAddress || {});
  const [isLocationValid, setIsLocationValid] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (formData?.dropAddress) {
      setDropoffAddress(formData.dropAddress);
      const isValid = isInTunisia(formData.dropAddress.latitude, formData.dropAddress.longitude);
      setIsLocationValid(isValid);
      inputRef.current?.clear();
    }
  }, [formData]);

  if (!isLocationValid) {
    return (
      <View style={[styles.step1Wrapper, isMapDragging && { opacity: 0.5 }]}>
        <View style={localStyles.header}>
          <TouchableOpacity onPress={onBack} style={localStyles.backButton}>
            <MaterialCommunityIcons name={I18nManager.isRTL?"arrow-right": "arrow-left"} size={28} color="#030303" />
          </TouchableOpacity>
          <Text style={localStyles.headerTitle}>{t('location.where_to')}</Text>
          
        </View>
        <View style={localStyles.content}>
          <View style={localStyles.errorContainer}>
            <MaterialIcons name="error-outline" size={40} color="#ff3b30" />
            <Text style={localStyles.errorText}>
              {t('location.outside_tunisia') || 'This location is outside Tunisia. Please select a location within Tunisia.'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.step1Wrapper, isMapDragging && { opacity: 0.5 }]}>
      <View style={localStyles.header}>
        <TouchableOpacity onPress={onBack} style={localStyles.backButton}>
          <MaterialCommunityIcons name={I18nManager.isRTL?"arrow-right": "arrow-left"} size={28} color="#030303" />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>{t('location.where_to')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={localStyles.content}>
        <GooglePlacesAutocomplete
          predefinedPlacesAlwaysVisible={false}
          placeholder={t('location.dropOff')}
          debounce={300}
          onPress={(data, details = null) => {
            if (details) {
              const newAddress = {
                address: details.formatted_address,
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              };
              const isValid = isInTunisia(details.geometry.location.lat, details.geometry.location.lng);
              setIsLocationValid(isValid);
              setDropoffAddress(newAddress);
              if (animateToRegion && isValid) {
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
          query={{
            key: API_GOOGLE,
            language: 'en',
            components: 'country:tn',
          }}
          textInputProps={{
            placeholder: formData?.dropAddress?.address ? formData?.dropAddress?.address : "",
            placeholderTextColor: "#ccc",
            style: {
              width: "100%"
            }
          }}
          styles={{
            container: {
              width: "100%"
            },
            textInputContainer: {
              borderWidth: 3,
              borderColor: '#ccc',
              borderRadius: 8,
              backgroundColor: '#fff',
              color: "#000",
              height: 50,
              paddingHorizontal: 10,
            },
            listView: {
              marginTop: 15,
            },
            textInput: {
              height: 50,
              color: '#000',
              fontSize: 16,
              placeholderTextColor: "#ccc",
              width: "100%"
            },
            row: {
              width: "100%"
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
        onPress={() => goNext({ dropAddress: dropoffAddress })}
        text={t('location.continue')}
        disabled={!dropoffAddress.latitude}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:"flex-start"
,    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: "100%",
    gap:10
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    padding: 16,
    width: "100%"
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  errorText: {
    marginTop: 10,
    color: '#ff3b30',
    textAlign: 'center',
    fontSize: 16,
  }
});

export default DropoffLocation; 