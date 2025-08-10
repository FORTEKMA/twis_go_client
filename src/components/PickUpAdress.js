import {StyleSheet, Image, View} from 'react-native';
import React from 'react';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const PickUpAdress = ({setNewreservation, newReservation, setInputErrors}) => {
  const pinIcon = require('../assets/pinIcon.png');
  const api = 'AIzaSyA0JbWwMvbJ7IYcL4_cagsFQLyLqXHA7xs';

  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Image source={pinIcon} style={{alignSelf: 'flex-start', marginTop: 8}} />
      <GooglePlacesAutocomplete
        placeholder={'Addresse de départ'}
        minLength={1}
        autoFocus={false}
        returnKeyType="search"
        listViewDisplayed="auto"
        fetchDetails={true}
        filterReverseGeocodingByTypes={['establishment', 'street_address']}
        GooglePlacesDetailsQuery={{
          fields: ['address_components', 'geometry', 'formatted_address'],
        }}
        onPress={(data, details) => {
          if (details) {
            const {geometry, formatted_address} = details;

            setNewreservation(prevReservation => ({
              ...prevReservation,
              data: {
                ...prevReservation.data,
                pickUpAddress: {
                  Address: formatted_address,
                  coordonne: {
                    latitude: geometry.location.lat,
                    longitude: geometry.location.lng,
                  },
                },
              },
            }));
            setInputErrors(prev => ({
              ...prev,
              pickUpAddress: '',
            }));
          }
        }}
        query={{
          key: api,
          language: 'fr',
          description: newReservation?.data?.pickUpAddress?.Address,
          radius: 300,
          location: '48.85581905921355, 2.3472939158007367',
          type: 'address',
          components: 'country:tn',
        }}
        textInputProps={{
          placeholderTextColor: 'grey',
          returnKeyType: 'search',
        }}
        styles={{
          textInputContainer: {
            width: '100%',
            color: 'grey',
            margin: 0,
            padding: 0,
          },
          description: {
            fontWeight: 'bold',
            color: 'black',
          },
          textInput: {
            color: 'black',
          },

          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
      />
    </View>
  );
};

export default PickUpAdress;

const styles = StyleSheet.create({});
