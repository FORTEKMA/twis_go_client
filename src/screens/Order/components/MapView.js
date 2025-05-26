import React, { useEffect, useState, useRef } from 'react';
import { Image, Dimensions, Appearance, View, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { styles } from '../styles';
import { API_GOOGLE } from "@env";
import { getDatabase, ref as dbRef, onValue } from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import mapStyle from '../../../utils/googleMapStyle';
import DriverMarker from "../../../components/DriverMarker";
import Icon from 'react-native-vector-icons/MaterialIcons';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const OrderMapView = ({ order }) => {
  const [driverPosition, setDriverPosition] = useState(null);
  const mapRef = useRef(null);
  const colorScheme = Appearance.getColorScheme();
  const [maxZoomLevel, setMaxZoomLevel] = useState(0);
  const [showResetButton, setShowResetButton] = useState(false);

  const pickup = order?.pickUpAddress?.coordonne;
  const dropoff = order?.dropOfAddress?.coordonne;

  const resetMapView = () => {
    if (pickup && dropoff) {
      mapRef.current?.fitToCoordinates([pickup, dropoff], {
        edgePadding: {
          top: 40,
          right: 80,
          bottom: SCREEN_HEIGHT * 0.5,
          left: 80,
        },
        animated: true,
      });
      setShowResetButton(false);
    }
  };

  useEffect(() => {
    if (pickup && dropoff) {
      mapRef.current?.fitToCoordinates([pickup, dropoff], {
        edgePadding: {
          top: 40,
          right: 80,
          bottom: SCREEN_HEIGHT * 0.5,
          left: 80,
        },
        animated: true,
      });

      const region = getRegionFromCoordinates(pickup, dropoff);
      const zoom = Math.max(0, Math.min(20, Math.log2(360 / region.longitudeDelta)));
      setMaxZoomLevel(zoom);
    }
  }, [pickup, dropoff]);

  const getRegionFromCoordinates = (start, end, paddingFactor = 1.5) => {
    const latMin = Math.min(start.latitude, end.latitude);
    const latMax = Math.max(start.latitude, end.latitude);
    const lngMin = Math.min(start.longitude, end.longitude);
    const lngMax = Math.max(start.longitude, end.longitude);
  
    const latitude = (latMin + latMax) / 2;
    const longitude = (lngMin + lngMax) / 2;
  
    const latitudeDelta = (latMax - latMin) * paddingFactor;
    const longitudeDelta = (lngMax - lngMin) * paddingFactor;
  
    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    };
  };


  useEffect(() => {
    if (
      order?.driver?.documentId &&
      !["Canceled_by_client", "Canceled_by_driver", "Completed"].includes(order?.commandStatus)
    ) {
      const db = getDatabase(getApp());
      const driverRef = dbRef(db, `drivers/${order.driver.documentId}`);

      const unsubscribe = onValue(driverRef, snapshot => {
        const data = snapshot.val();
       
        if (data?.latitude && data?.longitude) {
          const updatedPos = {
            latitude: data.latitude,
            longitude: data.longitude,
            type: data.type,
            angle: data.angle,
          };
          setDriverPosition(updatedPos);

          // Animate camera to driver's heading
          mapRef.current?.animateCamera({
            center: updatedPos,
            zoom: 17,
            heading: data.angle || 0,
            pitch: 0,
          });
        }
      });

      return () => driverRef.off('value', unsubscribe);
    }
  }, [order?.driver?.documentId]);

 

  // Choose colors based on dark/light mode
  const traveledColor = '#ccc'  
  const remainingColor = '#000'
   return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        showsCompass={false}
        rotateEnabled={true}
        minZoomLevel={maxZoomLevel}
        maxZoomLevel={20}
        pitchEnabled={false}
        onRegionChangeComplete={() => setShowResetButton(true)}
      >
        {pickup && (
          <Marker
            cluster={false}
            coordinate={{
              latitude: pickup.latitude,
              longitude: pickup.longitude
            }}
            tracksViewChanges={false}
            title="Pickup Location"
          >
            <View style={{ 
              width: 20, 
              height: 20, 
              borderRadius: 10,
              backgroundColor: '#030303',
              borderWidth: 2,
              borderColor: 'white',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'white'
              }} />
            </View>
          </Marker>
        )}

        {dropoff && (
          <Marker
            cluster={false}
            coordinate={{
              latitude: dropoff.latitude,
              longitude: dropoff.longitude
            }}
            tracksViewChanges={Platform.OS==="ios"}
            title="Dropoff Location"
          >
            <View style={{ 
              width: 20, 
              height: 20, 
              backgroundColor: '#030303',
              borderWidth: 2,
              borderColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <View style={{
                width: 8,
                height: 8,
                backgroundColor: 'white'
              }} />
            </View>
          </Marker>
        )}

        {driverPosition && (
          <Marker coordinate={driverPosition} >
            <DriverMarker type={driverPosition.type} angle={driverPosition.angle+180} />
          </Marker>
        )}

        {/* Traveled Path */}
        {pickup && driverPosition && (
          <Polyline
            coordinates={[pickup, driverPosition]}
            strokeColor={traveledColor}
            strokeWidth={6}
          />
        )}
    
        {/* Remaining Path */}
        {driverPosition && dropoff && (
          <MapViewDirections
            origin={["Pending","Go_to_pickup","Arrived_at_pickup"].includes(order?.commandStatus) ? driverPosition :order?.pickUpAddress?.coordonne}
          
            destination={["Pending","Go_to_pickup","Arrived_at_pickup"].includes(order?.commandStatus) ? order?.pickUpAddress?.coordonne: dropoff}
            apikey={API_GOOGLE}
            rotateEnabled={false}
            strokeWidth={6}
            
            strokeColor={remainingColor}
          />
        )}

        {["Canceled_by_client", "Canceled_by_driver", "Completed"].includes(order?.commandStatus)&& (
          <MapViewDirections
          origin={["Pending","Go_to_pickup","Arrived_at_pickup"].includes(order?.commandStatus) ? driverPosition :order?.pickUpAddress?.coordonne}
          
          destination={["Pending","Go_to_pickup","Arrived_at_pickup"].includes(order?.commandStatus) ? order?.pickUpAddress?.coordonne: dropoff}
          apikey={API_GOOGLE}
          strokeWidth={6}
          strokeColor={remainingColor}
        />
        )}
      </MapView>
      
      {showResetButton && (
        <TouchableOpacity
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
          onPress={resetMapView}
        >
          <Icon name="my-location" size={24} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default OrderMapView;
