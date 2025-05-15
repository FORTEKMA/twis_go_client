import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Linking,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from "./components/Header";
//import { updateReservation } from '../../store/slices/commandesSlice';

const Order = ({ route }) => {
  const { id } = route.params;
  const order = useSelector((state) => state?.commandes?.OrderById);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const refresh = route.params?.refresh;
 

  useEffect(() => {
    if (isFocused) {
      dispatch(getOrderById({ id }));
    }
  }, [isFocused, id]);

  

  const handleCallDriver = () => {
    if (order?.driver?.phone) {
      Linking.openURL(`tel:${order.driver.phone}`);
    } else {
      Alert.alert("Error", "Driver's phone number is not available");
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
        <OrderMapView order={order} />
        <OrderBottomCard
          order={order}
          timeToDestination={timeToDestination}
          refresh={refresh}
          onCallDriver={handleCallDriver}
        />
      </View>
    </View>
  );
};

export default Order;
