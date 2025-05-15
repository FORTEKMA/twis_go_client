import React, { useMemo, useEffect, useState ,useRef} from 'react';
import { Platform, Linking, Image, View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { styles } from '../styles';
import { API_GOOGLE } from "@env"
import { getDatabase, ref as dbRef, onValue, off } from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import DriverMarker from "../../../components/DriverMarker";
const region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
}
// Constants
const MARKER_IMAGES = {
  pickup: require("../../../assets/Points.png"),
  drop: require("../../../assets/homee.png"),
  driver: require("../../../assets/TRUCK.png"),
};

const MARKER_SIZES = {
  pickup: { width: 35, height: 40 },
  drop: { width: 40, height: 40 },
  driver: { width: 40, height: 25, marginTop: 20 },
};

 

const OrderMapView = ({
 
  order,
}) => {
  const [driverPosition, setDriverPosition] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
  
    if(order?.dropOfAddress?.coordonne){
      mapRef.current.fitToCoordinates([order?.dropOfAddress?.coordonne,order?.pickUpAddress?.coordonne], 100,{
        edgePadding: {
          top: 80,
          right: 80,
          bottom: 650,
          left: 80
        }   
      });
    }
  }, [order?.dropOfAddress?.coordonne]);

  useEffect(() => {
    
    
    if (order?.driver?.documentId&&!["Canceled_by_client","Canceled_by_driver","Completed"].includes(order?.status)) {
      const db = getDatabase(getApp());
      const driverRef = dbRef(db, `drivers/${order.driver.documentId}`);

      const unsubscribe = onValue(driverRef, snapshot => {
        const data = snapshot.val();
        console.log("data",data)
        if (data && data.latitude && data.longitude) {
          setDriverPosition({
            latitude: data.latitude,
            longitude: data.longitude,
            type: data.type,
            angle: data.angle
          });
        }
      });


      return () => {
        driverRef.off('value', unsubscribe);
      };
    }
  }, [order?.driver?.documentId]);


  
  return (
    <MapView
      style={styles.map}
      ref={mapRef}
      region={region}
      provider={PROVIDER_GOOGLE}
    >
      {/* Pickup Marker */}
      <Marker
        coordinate={order?.pickUpAddress?.coordonne}
        title="Pickup Location"
      >
        <Image
           source={require('../../../assets/startPostion.png')}
           style={{ width: 20, height: 20,resizeMode:"contain" }}
        />
        <Callout>
          <View style={enhancedStyles.callout}>
            <Text style={enhancedStyles.calloutTitle}>Pickup Location</Text>
            <Text style={enhancedStyles.calloutAddress}>{order?.pickUpAddress?.coordinate?.address}</Text>
          </View>
        </Callout>
      </Marker>

      {/* Dropoff Marker */}
      <Marker
        coordinate={order?.dropOfAddress?.coordonne}
        title="Dropoff Location"
      >
        <Image
          source={require('../../../assets/endPostion.png')}
          style={{ width: 20, height: 20,resizeMode:"contain" }}
        />
        <Callout>
          <View style={enhancedStyles.callout}>
            <Text style={enhancedStyles.calloutTitle}>Dropoff Location</Text>
            <Text style={enhancedStyles.calloutAddress}>{order.dropOfAddress.coordinate?.address}</Text>
          </View>
        </Callout>
      </Marker>

      {/* Driver Marker */}
      {driverPosition && (
        <Marker
          coordinate={driverPosition}
       
            tracksViewChanges={false}
        >
 <DriverMarker type={driverPosition.type} angle={driverPosition.angle} />

          
        </Marker>
      )}

      {/* Directions */}
      <MapViewDirections
        origin={order?.pickUpAddress?.coordonne}
        destination={order?.dropOfAddress?.coordonne}
        apikey={API_GOOGLE}
        strokeWidth={3}
        strokeColor="#595FE5"
      />
    </MapView>
  );
};

const enhancedStyles = StyleSheet.create({
  callout: {
    width: 200,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calloutContainer: {
    padding: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  calloutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  calloutAddress: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  calloutDistance: {
    fontSize: 13,
    color: '#595FE5',
    marginBottom: 3,
  },
  calloutDuration: {
    fontSize: 13,
    color: '#595FE5',
  },
});

OrderMapView.propTypes = {
  mapRegion: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    latitudeDelta: PropTypes.number.isRequired,
    longitudeDelta: PropTypes.number.isRequired,
  }).isRequired,
  order: PropTypes.object,
};

export default OrderMapView;
