import React, { useEffect, useRef, useState,useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  PermissionsAndroid,
  Platform
} from 'react-native';
import MapView from 'react-native-maps';
import LottieView from 'lottie-react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {API_GOOGLE} from  "@env"
import AutoComplateInput from "./components/AutoComplateInput";
import ConfirmButton from "./components/ConfirmButton";
import Geolocation from '@react-native-community/geolocation';

const initialRegion = {
  latitude: 36.80557596268572,
  longitude: 10.180696783260366,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const LocationMap = ({ route }) => {
  const [textValue, setTextValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState(initialRegion);
  const [disableTracking, setDisableTracking] = useState(false);
  const mapRef = useRef(null);
  const lottieRef = useRef(null);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [hasTouchedMap, setHasTouchedMap] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      getCurrentLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(newRegion);

        mapRef.current?.animateToRegion(newRegion, 1000);
        fetchLocationDetails(latitude, longitude);
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  useLayoutEffect(() => {
    // Hide tab bar
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      // Show tab bar again on exit
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [navigation]);

  const handleRegionChangeComplete = (newRegion) => {
    lottieRef.current?.play(4, 1395);

    setRegion(newRegion);
    if (!disableTracking) {
      fetchLocationDetails(newRegion.latitude, newRegion.longitude);
    }
  };

  const changeRegion = (location) => {
    setDisableTracking(true);
    setRegion(location);
    mapRef.current.animateToRegion(location, 500);
    setTimeout(() => {
      setDisableTracking(false);
    }, 600);
  };

  const fetchLocationDetails = async (lat, lng) => {
    setLoading(true);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_GOOGLE}`;

    try {
      const response = await axios.get(url);
      if (response.data.status === 'OK') {
        const address = response.data.results[0].formatted_address;
        
        setTextValue(address);
        lottieRef.current?.play(1396,1404);
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
      lottieRef.current?.play(1396,1404);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <AntDesign name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{t('Choose_location')}</Text>
          <View style={{ width: 30 }} />
        </View>
      </SafeAreaView>

      <View style={styles.mapContainer}>
        <MapView
          moveOnMarkerPress={false}
          provider="google"
          ref={mapRef}
          showsUserLocation={true}
          showsMyLocationButton
          initialRegion={initialRegion}
          style={styles.map}
          
          onRegionChangeComplete={(newRegion) => {
            lottieRef.current?.play(8, 1395); // Drop animation
            setHasTouchedMap(false);
            setRegion(newRegion);
            fetchLocationDetails(newRegion.latitude, newRegion.longitude);
          }}
        />
        <LottieView
          ref={lottieRef}
          source={require("../../utils/marker.json")}
          style={{ width: 140, height: 140 ,position:"absolute",top:"32%",alignSelf:"center"}}
          loop={false}
          autoPlay={false}
        />
      </View>

      <View style={{ position: "absolute", width: "100%", paddingHorizontal: 10, top:60 }}>
        <AutoComplateInput
          value={textValue}
          setLocationInfo={(text) => setTextValue(text)}
          loading={loading}
          changeRegion={changeRegion}    
          setLoading={(loading) => setLoading(loading)}
        />
      </View>

      <SafeAreaView style={styles.footer}>
        <ConfirmButton
          onPress={()=>{
            console.log({ address: textValue, ...region })
            route.params.setLocation({ address: textValue, ...region });
            navigation.goBack();
          }}
          text={t('save')}
          disabled={textValue.length === 0}
        />   
      </SafeAreaView>
    </View>
  );
};

export default LocationMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    paddingTop:10,
    justifyContent: 'space-between',
    height:120
  },
  iconButton: {
    padding: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  saveButton: {
    alignSelf: 'center',
    width: '90%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
