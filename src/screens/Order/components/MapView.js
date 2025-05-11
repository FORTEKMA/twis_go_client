import React, { useMemo } from 'react';
import { Platform, Linking, Image, View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { styles } from '../styles';
import { GOOGLE_MAPS_APIKEY } from '../../../config/constants';
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

const ORDER_STATUS = {
  PENDING: "Pending",
  ASSIGNED: "Assigned_to_driver",
  ON_ROUTE_TO_PICKUP: "Driver_on_route_to_pickup",
  ARRIVED_PICKUP: "Arrived_at_pickup",
  PICKED_UP: "Picked_up",
  ON_ROUTE_TO_DELIVERY: "On_route_to_delivery",
  ARRIVED_DELIVERY: "Arrived_at_delivery",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  FAILED_PICKUP: "Failed_pickup",
  FAILED_DELIVERY: "Failed_delivery",
};

const OrderMapView = ({
  mapRegion,
  pickupCoordinate,
  dropCoordinate,
  driverPosition,
  position,
  order,
 
  handleOpenInGoogleMaps,
}) => {
  // Memoize coordinates to prevent unnecessary recalculations
  const coordinates = useMemo(() => ({
    driver: {
      latitude: order?.driver?.latitude || 0,
      longitude: order?.driver?.longitude || 0,
    },
    pickup: {
      latitude: order?.pickUpAddress?.coordonne?.latitude || 0,
      longitude: order?.pickUpAddress?.coordonne?.longitude || 0,
    },
    drop: {
      latitude: order?.dropOfAddress?.coordonne?.latitude || 0,
      longitude: order?.dropOfAddress?.coordonne?.longitude || 0,
    },
  }), [order]);

 

  return (
    <MapView
      style={styles.map}
      region={mapRegion}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
    >
      
      
      
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
  pickupCoordinate: PropTypes.arrayOf(PropTypes.number).isRequired,
  dropCoordinate: PropTypes.arrayOf(PropTypes.number).isRequired,
  driverPosition: PropTypes.arrayOf(PropTypes.number),
  position: PropTypes.shape({
    coords: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
  }),
  order: PropTypes.object,
 
  handleOpenInGoogleMaps: PropTypes.func.isRequired,
};

export default OrderMapView;
