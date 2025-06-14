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
import { useIsFocused } from "@react-navigation/native";
import { colors } from "../../utils/colors";
import { styles } from "./styles";
import OrderMapView from "./components/MapView";
import OrderBottomCard from "./components/OrderBottomCard";
import { useNavigation } from '@react-navigation/native';
import Header from "./components/Header";
import CustomAlert from "./components/CustomAlert";
import { useTranslation } from 'react-i18next';
import database from '@react-native-firebase/database';
import api from '../../utils/api';
import { CommonActions } from '@react-navigation/native';

const Order = ({ route }) => {
  const { t } = useTranslation();
  const { id } = route.params;
  console.log(route.params)
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const refresh = route.params?.refresh;
  const [showAlert, setShowAlert] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`commands/${id}?populate[0]=driver&populate[1]=pickUpAddress&populate[2]=dropOfAddress&populate[3]=pickUpAddress.coordonne&populate[4]=dropOfAddress.coordonne&populate[5]=driver.profilePicture&populate[6]=review&populate[7]=driver.vehicule`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Error', 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (isFocused) {
      fetchOrder();
    }
  }, [isFocused, id]);

  useEffect(() => {
    if (!order?.requestId) return;

    const db = database();
    const orderStatusRef = db.ref(`rideRequests/${order.requestId}/commandStatus`);
    console.log("orderStatusRef",`rideRequests/${order.requestId}/commandStatus`)
    const unsubscribe = orderStatusRef.on('value', (snapshot) => {
   
      const status = snapshot.val();
      console.log("snapshot.val()",snapshot.val())
      setOrder({...order,commandStatus:status})

      if([ "Canceled_by_partner","Completed"].includes(status)){
      
      if (status === "Canceled_by_partner") {
        setShowAlert(true);
        return;
      }

    

      if (status === "Completed") {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Rating',
                params: {
                  order
                },
              },
            ],
          })
        );
    
      }
      db.ref(`rideRequests/${order.requestId}`).remove()
    }

    //
    });

    return () => {
      orderStatusRef.off('value', unsubscribe);
    };
  }, [order?.requestId]);

  const handleCallDriver = () => {
    if (order?.driver?.phoneNumber) {
      Linking.openURL(`tel:${order.driver.phoneNumber}`);
    } else {
      Alert.alert("Error", "Driver's phone number is not available");
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    navigation.navigate('Home');
  };

  if (loading || !order) {
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
      <CustomAlert
        visible={showAlert}
        onClose={handleAlertClose}
        title={t('common.order_canceled_title')}
        message={t('common.order_canceled_message')}
      />
    </View>
  );
};

export default Order;
