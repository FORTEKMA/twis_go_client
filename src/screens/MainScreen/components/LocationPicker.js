import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import {View, Image} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {styles} from '../styles';

const LocationPicker = forwardRef(({onLocationSelect, placeholder, setIsFocused}, ref) => {
  const googlePlacesRef = useRef();

  const updateAddressText = (text) => {
    if (googlePlacesRef.current) {
      googlePlacesRef.current.setAddressText(text);
    }
  }

  useImperativeHandle(ref, () => ({
    updateAddressText
  }));

  return (
    <View style={styles.currentLocation}>
      <GooglePlacesAutocomplete
        ref={googlePlacesRef}
        placeholder={placeholder}
        fetchDetails

        onPress={onLocationSelect}
        query={{
          key: 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE',
          language: 'fr',
          components: 'country:tn',
          location: '36.8,10.1',
          radius: 30000,
        }}
        styles={{
          textInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 10,
            backgroundColor: '#fff',
            marginBottom: 5,
          },
          textInput: {
            flex: 1,
            fontSize: 16,
            height: 40,
          },
          listView:{
            zIndex:999999999,
            position:'absolute',
            top:50,
            borderWidth:1,
            borderColor:'#ccc',
            borderRadius:8,
           
          }
        }}
        textInputProps={{
          onFocus:()=>{
          
            setIsFocused&&setIsFocused(true)
          },
          onBlur:()=>{
            
            setIsFocused&&setIsFocused(false)
          }
        }}
        
        
      />
    </View>
  );
});

export default LocationPicker; 