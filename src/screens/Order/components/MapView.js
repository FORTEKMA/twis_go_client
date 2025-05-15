import React, { useEffect, useState, useRef } from 'react';
import { Image, Dimensions, Appearance } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { styles } from '../styles';
import { API_GOOGLE } from "@env";
import { getDatabase, ref as dbRef, onValue } from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import mapStyle from '../../../utils/googleMapStyle';
import DriverMarker from "../../../components/DriverMarker";

const SCREEN_HEIGHT = Dimensions.get('window').height;

const OrderMapView = ({ order }) => {
  const [driverPosition, setDriverPosition] = useState(null);
  const mapRef = useRef(null);
  const colorScheme = Appearance.getColorScheme();
  const [maxZoomLevel, setMaxZoomLevel] = useState(0);

  const pickup = order?.pickUpAddress?.coordonne;
  const dropoff = order?.dropOfAddress?.coordonne;

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
  console.log("maxZoomLevel",maxZoomLevel)
  return (
    <MapView
      style={styles.map}
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      customMapStyle={mapStyle}
      showsCompass={false}
      rotateEnabled={true}
      minZoomLevel={maxZoomLevel>0?maxZoomLevel-1.9:null}
      pitchEnabled={false}
 

    >
      {pickup && (
        <Marker coordinate={pickup} title="Pickup Location">
          <Image
            source={require('../../../assets/startPostion.png')}
            style={{ width: 20, height: 20, resizeMode: "contain" }}
          />
        </Marker>
      )}

      {dropoff && (
        <Marker coordinate={dropoff} title="Dropoff Location">
          <Image
            source={require('../../../assets/endPostion.png')}
            style={{ width: 20, height: 20, resizeMode: "contain" }}
          />
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
          origin={driverPosition}
          waypoints={[order?.pickUpAddress?.coordonne]}
          destination={dropoff}
          apikey={API_GOOGLE}
          rotateEnabled={false}
          strokeWidth={6}
          
          strokeColor={remainingColor}
        />
      )}
      {["Canceled_by_client", "Canceled_by_driver", "Completed"].includes(order?.commandStatus)&& (
        <MapViewDirections
        origin={order?.pickUpAddress?.coordonne}
        
        destination={dropoff}
        apikey={API_GOOGLE}
        strokeWidth={6}
        strokeColor={remainingColor}
      />
      )}
    </MapView>
  );
};

export default OrderMapView;
