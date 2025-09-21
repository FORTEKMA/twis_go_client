import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, TextInput, Keyboard } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
 
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { API_GOOGLE } from "@env";
import { 
  trackBookingStepViewed,
  trackBookingStepCompleted,
  trackPickupLocationSelected
} from '../../../utils/analytics';

const isInTunisia = (latitude, longitude) => {
  const TUNISIA_BOUNDS = {
    minLat: 30.230236,
    maxLat: 37.543915,
    minLng: 7.524833,
    maxLng: 11.598278
  };
  
  return latitude >= TUNISIA_BOUNDS.minLat && 
         latitude <= TUNISIA_BOUNDS.maxLat && 
         longitude >= TUNISIA_BOUNDS.minLng && 
         longitude <= TUNISIA_BOUNDS.maxLng;
};

const PickupLocation = ({ formData, goNext, isMapDragging, animateToRegion }) => {
  const { t } = useTranslation();
  const [pickupAddress, setPickupAddress] = useState(formData?.pickupAddress || {});
  const inputRef = useRef(null);
  const [isLocationInTunisia, setIsLocationInTunisia] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Track step view
  useEffect(() => {
    trackBookingStepViewed(1, 'Pickup Location');
  }, []);

  // Keyboard listeners for iOS optimization
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      });
      const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
      });

      return () => {
        keyboardWillShowListener?.remove();
        keyboardWillHideListener?.remove();
      };
    }
  }, []);
  
  useEffect(() => {
    if (formData?.pickupAddress) {
      setPickupAddress(formData.pickupAddress);
      const isInTunisiaBounds = isInTunisia(
        formData.pickupAddress.latitude,
        formData.pickupAddress.longitude
      );
      setIsLocationInTunisia(isInTunisiaBounds);
      inputRef.current?.clear();
    }
  }, [formData]);

  const handleLocationSelect = (data, details = null) => {
    if (details) {
      const newAddress = {
        address: details.formatted_address,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      setPickupAddress(newAddress);
      setIsLocationInTunisia(isInTunisia(
        details.geometry.location.lat,
        details.geometry.location.lng
      ));

      inputRef.current?.blur();
      
      // Track location selection
      trackPickupLocationSelected(newAddress, {
        source: 'google_places',
        is_in_tunisia: isInTunisia(details.geometry.location.lat, details.geometry.location.lng)
      });
      
      if (animateToRegion) {
        animateToRegion({
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    }
  };

  const handleContinue = () => {
    trackBookingStepCompleted(1, 'Pickup Location', {
      address: pickupAddress.address,
      latitude: pickupAddress.latitude,
      longitude: pickupAddress.longitude,
      is_in_tunisia: isLocationInTunisia
    });
    goNext({pickupAddress: pickupAddress});
  };

  if (!isLocationInTunisia) {
    return (
      <View style={[localStyles.container, isMapDragging && { opacity: 0.5 }]}>
        <View style={localStyles.uberHeader}>
          <Text style={localStyles.uberTitle}>{t('location.where_are_you')}</Text>
          <Text style={localStyles.uberSubtitle}>{t('location.drag_map_instruction')}</Text>
        </View>
        
        <View style={localStyles.uberContent}>
          <View style={localStyles.errorContainer}>
            <MaterialIcons name="error-outline" size={40} color="#ff3b30" />
            <Text style={localStyles.errorText}>
              {t('location.outside_tunisia') || 'This location is outside of Tunisia. Please select a location within Tunisia.'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[localStyles.container, isMapDragging && { opacity: 0.5 }]}>
      {/* Uber-style Header */}
      <View style={localStyles.uberHeader}>
        <Text style={localStyles.uberTitle}>{t('location.set_pickup_location', 'Set your pickup location')}</Text>
        <Text style={localStyles.uberSubtitle}>{t('location.drag_map_instruction', 'Drag map to move pin')}</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={localStyles.scrollContent}
        contentContainerStyle={localStyles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={localStyles.uberContent}>
          <GooglePlacesAutocomplete
            predefinedPlacesAlwaysVisible={false}
            placeholder={t('location.where_from', 'Where from?')}
            debounce={Platform.OS === 'ios' ? 200 : 300}
            onPress={handleLocationSelect}
            textInputContainer={localStyles.searchContainer}
            requestUrl={{
              useOnPlatform: 'web',
              url: Platform.OS === 'ios' ? 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api' : undefined,
            }}
            textInputProps={{
              style: localStyles.inputWrapper,
              placeholder: formData?.pickupAddress?.address ? formData?.pickupAddress?.address : t('location.where_from', 'Where from?'),
              placeholderTextColor: "#8E8E93",
              ref: inputRef,
              autoCorrect: false,
              autoCapitalize: 'none',
              keyboardType: Platform.OS === 'ios' ? 'default' : 'default',
              returnKeyType: 'search',
              blurOnSubmit: true,
            }}
            renderLeftButton={() => {
              return (
                <MaterialCommunityIcons style={localStyles.leftIcon} name="circle" size={12} color="#000" />
              )
            }}
            query={{
              key: API_GOOGLE,
              language: 'en',
              components: 'country:tn',
              types: 'establishment|geocode',
            }}
            styles={{
              description: localStyles.description,
              textInput: {
                
                color: '#000',
            
              },
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            minLength={2}
            timeout={20000}
            keepResultsAfterBlur={true}
            listUnderlayColor="transparent"
          />
        </View>
      </ScrollView>
      
      {/* Fixed Continue Button */}
      <View style={localStyles.buttonContainer}>
        <TouchableOpacity
          style={[
            localStyles.uberButton,
            !pickupAddress.latitude && localStyles.uberButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!pickupAddress.latitude}
        >
          <Text style={[
            localStyles.uberButtonText,
            !pickupAddress.latitude && localStyles.uberButtonTextDisabled
          ]}>
            {t('location.set_pickup_location', 'Set pickup location')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  uberHeader: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  uberTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  uberSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  uberContent: {
    paddingHorizontal: 24,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: '#fff',
  },
  searchContainer: {
    marginBottom: 24,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
    flex:1,
    marginBottom:15,
    paddingLeft:30,
    color:"#000"
  },
  leftIcon: {
    marginRight: 12,
    position:"absolute",
     left:10,
     top:22,
     zIndex:1000,
    
  },
  autocompleteContainer: {
    flex: 1,
  },
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    marginHorizontal: 0,
    height: 48,
    
  },
  googleTextInput: {
    backgroundColor: 'transparent',
    height: 48,
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  description: {
    color: '#000',
    fontSize: 16,
  },
  searchIconContainer: {
    marginLeft: 12,
  },
  uberButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  uberButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  uberButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uberButtonTextDisabled: {
    color: '#8E8E93',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff3b30',
    marginTop: 24,
  },
  errorText: {
    marginTop: 12,
    color: '#ff3b30',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
});

export default PickupLocation;

