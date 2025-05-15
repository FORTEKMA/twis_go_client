import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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

const DropoffLocation = ({ formData, goNext, isMapDragging, onBack, animateToRegion }) => {
  const { t } = useTranslation();
  const [dropoffAddress, setDropoffAddress] = useState(formData?.dropoffAddress || {});
  const inputRef = useRef(null);
  useEffect(() => {
    if (formData?.dropAddress) {
      setDropoffAddress(formData.dropAddress);
      inputRef.current.setAddressText(formData.dropAddress.address);
    }
  }, [formData]);

  return (
    <View style={[styles.step1Wrapper, isMapDragging && { opacity: 0.5 }]}>
      <View style={localStyles.header}>
        <TouchableOpacity onPress={onBack} style={localStyles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#19191C" />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>{t('location.where_to')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={localStyles.content}>
        <GooglePlacesAutocomplete
          placeholder={t('location.dropOff')}
          onPress={(data, details = null) => {
            if (details) {
              const newAddress = {
                address: details.formatted_address,
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              };
              setDropoffAddress(newAddress);
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

          textInputProps={{
            style:{
               
              color:"#000"
            },
            placeholderTextColor:"#ccc"
          }}
          ref={inputRef}
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
              
            },
            textInput: {
              height: 50,
              color: '#000',
              fontSize: 16,
            },
            listView: {
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              zIndex: 1000,
              marginBottom: 8,
              maxHeight: 200,
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
        onPress={() => goNext({ dropoffAddress })}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: "100%",
    gap: 10
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
    flex: 1,
    padding: 16,
    width: "100%",
    paddingTop: 10
  }
});

export default DropoffLocation; 