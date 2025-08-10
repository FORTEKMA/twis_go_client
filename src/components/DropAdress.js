import {StyleSheet, Image, View} from 'react-native';
import React from 'react';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const DropAdress = ({setNewreservation, newReservation, setInputErrors}) => {
  const pinIcon = require('../assets/pinIcon.png');
  const api = 'AIzaSyA0JbWwMvbJ7IYcL4_cagsFQLyLqXHA7xs';

  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Image source={pinIcon} style={{alignSelf: 'flex-start', marginTop: 8}} />
      <GooglePlacesAutocomplete
        placeholder={"Addresse de dépot"}
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
                dropOfAddress: {
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
              dropOfAddress: '',
            }));
          }
        }}
        onFail={err => console.log(err)}
        query={{
          key: api,
          language: 'fr',
          description: newReservation?.data?.dropOfAddress?.Address,
          components: 'country:tn',

          types: 'address',
        }}
        textInputProps={{
          placeholderTextColor: 'grey',
          returnKeyType: 'search',
        }}
        styles={{
          textInputContainer: {
            width: '100%',
            color: 'black',
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

export default DropAdress;

const styles = StyleSheet.create({});
