import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, PermissionsAndroid } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from 'react-native-geolocation-service';
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox';

const Steps = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pickup: null,
    date: new Date(),
    time: new Date(),
    drop: null,
    useCurrentLocation: false,
    objects: []
  });

  const objectsList = [
    { id: 1, name: 'Furniture' },
    { id: 2, name: 'Electronics' },
    { id: 3, name: 'Boxes' },
    { id: 4, name: 'Clothing' },
  ];

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  };

  // Get current position
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          drop: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
        }));
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleObjectToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      objects: prev.objects.includes(id)
        ? prev.objects.filter(item => item !== id)
        : [...prev.objects, id]
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Step 1: Pickup Details</Text>
            
            <GooglePlacesAutocomplete
              placeholder="Enter pickup address"
              onPress={(data, details = null) => {
                setFormData(prev => ({
                  ...prev,
                  pickup: {
                    address: data.description,
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                  }
                }));
              }}
              query={{
                key: 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE',
                language: 'en',
                components: 'country:tn',
                types: '(cities)',
                location: '36.8,10.1', // Tunis coordinates
                radius: 30000,
              }}
              styles={placesStyles}
            />

            <DateTimePicker
              value={formData.date}
              mode="date"
              onChange={(_, date) => setFormData(prev => ({ ...prev, date }))}
            />

            <DateTimePicker
              value={formData.time}
              mode="time"
              onChange={(_, time) => setFormData(prev => ({ ...prev, time }))}
            />

            <Button title="Next" onPress={() => setStep(2)} />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Step 2: Drop Details</Text>

            <View style={styles.currentLocation}>
              <CheckBox
                value={formData.useCurrentLocation}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, useCurrentLocation: value }));
                  if (value) getCurrentLocation();
                }}
              />
              <Text>Use Current Location</Text>
            </View>

            {!formData.useCurrentLocation && (
              <GooglePlacesAutocomplete
                placeholder="Enter drop address"
                onPress={(data, details = null) => {
                  setFormData(prev => ({
                    ...prev,
                    drop: {
                      address: data.description,
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    }
                  }));
                }}
                query={{
                  key: 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE',
                  language: 'en',
                  components: 'country:tn',
                }}
                styles={placesStyles}
              />
            )}

            <Button title="Previous" onPress={() => setStep(1)} />
            <Button title="Next" onPress={() => setStep(3)} />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Step 3: Select Objects</Text>
            
            {objectsList.map(item => (
              <View key={item.id} style={styles.checkboxContainer}>
                <CheckBox
                  value={formData.objects.includes(item.id)}
                  onValueChange={() => handleObjectToggle(item.id)}
                />
                <Text>{item.name}</Text>
              </View>
            ))}

            <Button title="Previous" onPress={() => setStep(2)} />
            <Button title="Submit" onPress={() => console.log(formData)} />
          </View>
        );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderStep()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});

const placesStyles = {
  textInputContainer: {
    width: '100%',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  predefinedPlacesDescription: {
    color: '#1faadb',
  },
};

export default Steps;