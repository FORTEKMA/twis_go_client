import React, { useEffect, useState, useRef } from 'react';
import { Image, Dimensions, Appearance, View, TouchableOpacity, Platform, AppState } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { styles } from '../styles';
import { API_GOOGLE } from "@env";
import { getDatabase, ref as dbRef, onValue } from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import mapStyle from '../../../utils/googleMapStyle';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const OrderMapView = ({ order }) => {
  const mapRef = useRef(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [showResetButton, setShowResetButton] = useState(false);
  const appState = useRef(AppState.currentState);

  const pickup = order?.pickUpAddress?.coordonne;
  const dropoff = order?.dropOfAddress?.coordonne;
  const status = order?.commandStatus;

  const isActive = !["Canceled_by_client", "Canceled_by_driver", "Completed"].includes(status);
  const usePickupRoute = ["Pending", "Go_to_pickup", "Arrived_at_pickup"].includes(status);

  // Fit all available markers to the screen
  const fitCoordinatesToMap = () => {
    if (!mapRef.current) return;
  
    const origin = getRouteOrigin();
    const destination = getRouteDestination();
  
    if (!origin || !destination) return;
   
  setTimeout(()=>{
    mapRef.current?.fitToCoordinates([origin, destination], {
      edgePadding: {
        top: 40,
        right: 80,
        bottom: SCREEN_HEIGHT * 0.5,
        left: 80,
      },
      animated: true,
    });
  },500)
  
  };

  useEffect(() => {
    const origin = getRouteOrigin();
    const destination = getRouteDestination();
  
    
    resetMapView();
    
  }, []);
  

  const resetMapView = () => {
    fitCoordinatesToMap();
    setShowResetButton(false);
  };

  // Listen to driver location updates
  useEffect(() => {
    if (order?.driver?.documentId && isActive) {
      const db = getDatabase(getApp());
      const driverRef = dbRef(db, `drivers/${order.driver.documentId}`);

      const unsubscribe = onValue(driverRef, snapshot => {
        const data = snapshot.val();
        if (data?.latitude && data?.longitude) {
          setDriverPosition({
            latitude: data.latitude,
            longitude: data.longitude,
            type: data.type,
            angle: data.angle,
          });
        }
      });

      return () => driverRef.off('value', unsubscribe);
    }
  }, [order?.driver?.documentId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      resetMapView();
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const getVehicleIcon = (type) => {
    switch (type) {
      case 1: return require("../../../assets/eco.png");
      case 2: return require("../../../assets/van.png");
      case 3: return require("../../../assets/Berline.png");
      default: return null;
    }
  };

  const getRouteOrigin = () => {
    return usePickupRoute ? driverPosition : pickup;
  };

  const getRouteDestination = () => {
    return usePickupRoute ? pickup : dropoff;
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        showsCompass={false}
        rotateEnabled
        pitchEnabled={false}
        initialRegion={{
         ...pickup,
         latitudeDelta: 0.01,
         longitudeDelta: 0.01,
        }}
        onMapReady={resetMapView}
        onLayout={resetMapView}
        onRegionChangeComplete={() => setShowResetButton(true)}
      >
       {pickup && (
          <Marker
            identifier="pickup"
            coordinate={pickup}
            tracksViewChanges={false}
          >
            <View style={CustomStyle.pickupMarker}>
              <View style={CustomStyle.innerPickupMarker} />
            </View>
          </Marker>
        )}

        {dropoff && (
          <Marker
            identifier="dropoff"
            coordinate={dropoff}
            tracksViewChanges={Platform.OS === "ios"}
          >
            <View style={CustomStyle.dropoffMarker}>
              <View style={CustomStyle.innerDropoffMarker} />
            </View>
          </Marker>
        )}

        {driverPosition && (
          <Marker
            identifier="driver"
            coordinate={driverPosition}
            rotation={driverPosition.angle}
            flat
          >
            <View style={{ width: 23, height: 47 }}>
              <Image
                source={getVehicleIcon(driverPosition.type)}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
          </Marker>
        )}  

        {getRouteOrigin() && getRouteDestination() && (
          <MapViewDirections
            origin={getRouteOrigin()}
            destination={getRouteDestination()}
            apikey={API_GOOGLE}
            strokeWidth={6}
            strokeColor="#0c0c0c"
          />
        )} 
      </MapView>

      {showResetButton && (
        <TouchableOpacity
          onPress={resetMapView}
          style={{
            position: 'absolute',
            top: 30,
            right: 20,
            backgroundColor: 'white',
            padding: 10,
            borderRadius: 30,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <Icon name="my-location" size={24} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const CustomStyle = {
  
  pickupMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#030303',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerPickupMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  dropoffMarker: {
    width: 20,
    height: 20,
    backgroundColor: '#030303',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerDropoffMarker: {
    width: 8,
    height: 8,
    backgroundColor: 'white',
  },
};

export default OrderMapView;
