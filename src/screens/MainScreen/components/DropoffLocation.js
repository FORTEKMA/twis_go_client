import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, I18nManager, Platform, Keyboard } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { API_GOOGLE } from "@env";
import { 
  trackBookingStepViewed,
  trackBookingStepCompleted,
  trackBookingStepBack,
  trackDropoffLocationSelected
} from '../../../utils/analytics';

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
  
  const [dropoffAddress, setDropoffAddress] = useState(formData?.dropAddress || {});
  const [isLocationValid, setIsLocationValid] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef(null);
  const isInitialLoad = useRef(true);
  const previousDropoffAddress = useRef(null);

  // Track step view
  useEffect(() => {
    trackBookingStepViewed(2, 'Dropoff Location');
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
    if (formData?.dropAddress) {
      // Check if the dropoff address has actually changed
      const currentAddress = `${formData.dropAddress.latitude},${formData.dropAddress.longitude}`;
      const previousAddress = previousDropoffAddress.current;
      
      const hasAddressChanged = previousAddress !== currentAddress;
      
      setDropoffAddress(formData.dropAddress);
      previousDropoffAddress.current = currentAddress;
      
      // Only set hasUserInteracted to true if it's not the initial load
      if (!isInitialLoad.current) {
        setHasUserInteracted(true);
      } else {
        isInitialLoad.current = false;
      }
      
      const isValid = isInTunisia(formData.dropAddress.latitude, formData.dropAddress.longitude);
      setIsLocationValid(isValid);
      
      inputRef.current?.clear();
    }
  }, [formData]);

  const handleLocationSelect = async (data, details = null) => {
    if (details) {
      const newAddress = {
        address: details.formatted_address,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      
      // Check if the address has actually changed
      const currentAddress = `${newAddress.latitude},${newAddress.longitude}`;
      const previousAddress = previousDropoffAddress.current;
      const hasAddressChanged = previousAddress !== currentAddress;
      
      setDropoffAddress(newAddress);
      previousDropoffAddress.current = currentAddress;
      setHasUserInteracted(true);
      
      const isValid = isInTunisia(details.geometry.location.lat, details.geometry.location.lng);
      setIsLocationValid(isValid);
      
      // Track location selection
      trackDropoffLocationSelected(newAddress, {
        source: 'google_places',
        is_in_tunisia: isValid
      });
      
      if (animateToRegion && isValid) {
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
    trackBookingStepCompleted(2, 'Dropoff Location', {
      address: dropoffAddress.address,
      latitude: dropoffAddress.latitude,
      longitude: dropoffAddress.longitude,
      is_in_tunisia: isLocationValid
    });
    goNext({ dropAddress: dropoffAddress });
  };

  const handleBack = () => {
    trackBookingStepBack(2, 'Dropoff Location');
    onBack();
  };

  // Check if we should show the ConfirmButton
  const shouldShowConfirmButton = dropoffAddress.latitude && isLocationValid;
  
  // Check if we should show validation errors (only when user has interacted)
  const shouldShowErrors = hasUserInteracted;

  return (
    <View style={[localStyles.container, isMapDragging && { opacity: 0.5 }]}>
      {/* Uber-style Header with Back Button */}
      <View style={localStyles.uberHeader}>
        <TouchableOpacity onPress={handleBack} style={localStyles.backButton}>
          <MaterialCommunityIcons name={I18nManager.isRTL ? "arrow-right" : "arrow-left"} size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={localStyles.headerTextContainer}>
          <Text style={localStyles.uberTitle}>{t('location.set_destination', 'Set your destination')}</Text>
          <Text style={localStyles.uberSubtitle}>{t('location.drag_map_instruction', 'Drag map to move pin')}</Text>
        </View>
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
            placeholder={t('location.where_to', 'Where to?')}
            debounce={300} 
            onPress={handleLocationSelect}
            textInputContainer={localStyles.searchContainer}
           
             textInputProps={{
              style:localStyles.inputWrapper,
              placeholder:formData?.dropAddress?.address ? formData?.dropAddress?.address : t('location.where_to', 'Where to?'),
              placeholderTextColor:"#8E8E93",
             ref:inputRef, 
              
             }}
             renderLeftButton={()=>{
              return (
                <MaterialCommunityIcons style={localStyles.leftIcon} name="square" size={12} color="#000" />
              )
             }}

          
            query={{
              key: API_GOOGLE,
              language: 'en',
              components: 'country:tn',
            }}
            styles={{
              textInput: {
                
                color: '#000',
            
              },
               
              description: localStyles.description,
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            minLength={2}
          />
          
          {/* Error States */}
          {shouldShowErrors && !isLocationValid && (
            <View style={localStyles.errorContainer}>
              <MaterialIcons name="error-outline" size={24} color="#ff3b30" />
              <Text style={localStyles.errorText}>
                {t('location.outside_tunisia') || 'This location is outside Tunisia. Please select a location within Tunisia.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Continue Button */}
      <View style={localStyles.buttonContainer}>
        <TouchableOpacity
          style={[
            localStyles.uberButton,
            !shouldShowConfirmButton && localStyles.uberButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!shouldShowConfirmButton}
        >
          <Text style={[
            localStyles.uberButtonText,
            !shouldShowConfirmButton && localStyles.uberButtonTextDisabled
          ]}>
            {t('location.search_destination', 'Search destination')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  uberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  uberTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  uberSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF2F2',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  errorText: {
    marginLeft: 12,
    color: '#ff3b30',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
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
});

export default DropoffLocation;

