import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import ConfirmButton from './ConfirmButton';
import Geolocation from 'react-native-geolocation-service';
import { getAddressFromCoordinates } from '../../../utils/helpers/mapUtils';
import { Spinner, Toast } from 'native-base';

const SUGGESTED_LOCATIONS = [
  { name: 'Home', icon: 'home' },
  { name: 'Work', icon: 'work' },
  { name: 'Airport', icon: 'flight' },
];

const PickupLocation = ({ formData, goNext, isMapDragging, animateToRegion}) => {
 
  const { t } = useTranslation();
  const [pickupAddress, setPickupAddress] = useState(formData?.pickupAddress || {});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (formData?.pickupAddress) {
      setPickupAddress(formData.pickupAddress);
    }
  }, [formData]);

 

  return (
    <View style={[styles.step1Wrapper, isMapDragging && { opacity: 0.5 }]}>
      <View style={localStyles.header}>
       
        <Text style={localStyles.headerTitle}>{t('location.where_are_you')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={localStyles.content}>
       

        <View style={[localStyles.container, localStyles.selectedContainer]}>
          <Text style={{ color: pickupAddress.address ? '#888' : "#ddd" }}>
            {pickupAddress.address ? pickupAddress.address : t('location.pickUp')}
          </Text>
        </View>
      </View>

      <ConfirmButton
        onPress={() => goNext({ pickupAddress })}
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
    width:"100%"
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
    width:"100%"
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  container: {
    height: 50,
    width:"100%",
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  //  marginBottom: 16,
  },
  selectedContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default PickupLocation; 