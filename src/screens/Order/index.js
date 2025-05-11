import React, { useEffect, useState,useLayoutEffect } from "react";
import {
  View,
  ActivityIndicator,
 
  Linking,
 
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import Geolocation from "@react-native-community/geolocation";
import { getOrderById } from "../../store/commandeSlice/commandeSlice";
import { colors } from "../../utils/colors";
import { styles } from "./styles";
import OrderMapView from "./components/MapView";
import OrderBottomCard from "./components/OrderBottomCard";
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Header from "./components/Header";
//import { updateReservation } from '../../store/slices/commandesSlice';

const Order = ({ route }) => {
  const { id } = route.params;
  const order = useSelector((state) => state?.commandes?.OrderById);
  const dispatch = useDispatch();
  const [pickupCoordinate, setPickupCoordinate] = useState([0, 0]);
  const [dropCoordinate, setDropCoordinateCoordinate] = useState([0, 0]);
  const [driverPosition, setDriverPosition] = useState([0, 0]);
  const [position, setPosition] = useState(null);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [isUpdating, setIsUpdating] = useState(false);

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
 
  useEffect(() => {
    const _watchId = Geolocation.watchPosition(
      (position) => {
        setPosition(position);
      },
      (error) => {},
      {
        enableHighAccuracy: true,
        distanceFilter: 100,
        interval: 5000,
        fastestInterval: 2000,
      }
    );

    return () => {
      if (_watchId) {
        Geolocation.clearWatch(_watchId);
      }
    };
  }, []);

  useEffect(() => {
    getCurrentPosition();
  }, []);

  const getCurrentPosition = async () => {
    try {
      Geolocation.getCurrentPosition(
        (positi) => {
          setPosition(positi);
        },
        (error) => {},
        {
          accuracy: {
            android: "high",
            ios: "best",
          },
          enableHighAccuracy: true,
          timeout: 1000,
          maximumAge: 10000,
          distanceFilter: 30,
        }
      );
    } catch (e) {}
  };

  useEffect(() => {
    if (isFocused) {
      dispatch(getOrderById({ id }));
    }
  }, [isFocused, id]);

  useEffect(() => {
    if (order?.documentId) {
      setDriverPosition([
        parseFloat(order?.driver?.latitude || 0),
        parseFloat(order?.driver?.longitude || 0),
      ]);
    }
  }, [order]);

  useEffect(() => {
    if (order?.pickUpAddress && order?.dropOfAddress) {
      setPickupCoordinate([
        parseFloat(order?.pickUpAddress?.coordonne?.latitude || 0),
        parseFloat(order?.pickUpAddress?.coordonne?.longitude || 0),
      ]);
      setDropCoordinateCoordinate([
        parseFloat(order?.dropOfAddress?.coordonne?.latitude || 0),
        parseFloat(order?.dropOfAddress?.coordonne?.longitude || 0),
      ]);
    }
  }, [order]);

  const centerLatitude =
    (pickupCoordinate?.[0] + dropCoordinate?.[0] + 2) / 2 || 0;
  const centerLongitude =
    (pickupCoordinate?.[1] + dropCoordinate?.[1]) / 2 || 0;
  const latitudeDelta =
    Math.abs(pickupCoordinate?.[0] - dropCoordinate?.[0]) * 3.5 || 0;
  const longitudeDelta =
    Math.abs(pickupCoordinate?.[1] - dropCoordinate?.[1]) * 5.5 || 0;

  const mapRegion = {
    latitude: centerLatitude || 0,
    longitude: centerLongitude || 0,
    latitudeDelta,
    longitudeDelta,
  };

  const handleOpenInGoogleMaps = (e) => {
    const { latitude, longitude } = e;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open Google Maps:", err)
    );
  };

  const handleCall = () => {
    if (order?.driver?.phoneNumber) {
      Linking.openURL(`tel:${order.driver.phoneNumber}`);
    }
  };

  const handleEndTrip = async (nextStatus) => {
    if (!order?.documentId) {
      console.error('Order or documentId is missing');
      return;
    }

    setIsUpdating(true);
    try {
      // await dispatch(
      //   updateReservation({
      //     id: order.documentId,
      //     body: { data: { commandStatus: nextStatus } },
      //   })
      // ).unwrap();
      // Refresh the order data after status update
      dispatch(getOrderById({ id: order.documentId }));
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) {
    return <ActivityIndicator size="large" color={colors.secondary} />;
  }

  // Helper for time to destination (mocked for now)
  const timeToDestination = order?.duration || "2 min";

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <OrderMapView
          mapRegion={mapRegion}
          pickupCoordinate={pickupCoordinate}
          dropCoordinate={dropCoordinate}
          driverPosition={driverPosition}
          position={position}
          order={order}
          handleOpenInGoogleMaps={handleOpenInGoogleMaps}
        />
        <OrderBottomCard
          order={order}
          timeToDestination={timeToDestination}
          onCall={handleCall}
          onEndTrip={handleEndTrip}
        />
      </View>
    </View>
  );
};

 

export default Order;
