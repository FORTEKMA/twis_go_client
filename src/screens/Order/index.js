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
import CustomAlert from "./components/CustomAlert";
import { useTranslation } from 'react-i18next';
//import { updateReservation } from '../../store/slices/commandesSlice';
import { OneSignal } from "react-native-onesignal";
const Order = ({ route }) => {
  const { t } = useTranslation();
  const { id } = route.params;
  const order = useSelector((state) => state?.commandes?.OrderById);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const refresh = route.params?.refresh;
  const [showAlert, setShowAlert] = useState(false);
 

  useEffect(() => {
    if (isFocused) {
      dispatch(getOrderById({ id }));
    }
  }, [isFocused, id]);

 

  useEffect(() => {
 
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
   
      if(event?.notification?.additionalData?.type=="commande_status_updated"){
        
        if(event?.notification?.additionalData?.status=="Canceled_by_partner"){
          setShowAlert(true);
         return
        }
       
        dispatch(getOrderById({ id }));

        if(event?.notification?.additionalData?.status=="Completed"){
          navigation.navigate('Rating', { order })
          
        }

       
        
     }
      

      });
  return () => {
    OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
   }
  }, []);
  

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
