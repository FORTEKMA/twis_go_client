import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getOrdersById,
  updateReservation,
} from '../store/commandeSlice/commandeSlice';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {colors} from '../utils/colors';
import Divider from '../components/Divider';
import StarRating from 'react-native-star-rating-widget';
import {Input} from 'native-base';
import {sendNotification} from '../store/notificationSlice/notificationSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Rating from './Rating';
import Tracking from './Tracking';
const NotifDetails = ({route}) => {
  const {id} = route.params;
  const order = useSelector(state => state?.commandes?.OrderById);
  const user = useSelector(state => state.user.currentUser);
  const [pickupCoordinate, setPickupCoordinate] = useState([0, 0]);
  const [dropCoordinate, setDropCoordinateCoordinate] = useState([0, 0]);
  const dispatch = useDispatch();
  const start = require('../assets/historyStart.png');
  const end = require('../assets/historyArrive.png');
  const dots = require('../assets/dots.png');
  const livraison = require('../assets/livraison.png');
  const money = require('../assets/Money.png');
  const [rating, setRating] = useState(0);
  const [driverPosition, setDriverPosition] = useState([0, 0]);
  const [cancelModal, setCancelModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [ping, setPing] = useState(false);
  const [loding, setLoding] = useState(false);
  const [timer, setTimer] = useState(30);
  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);
  useEffect(() => {
    setLoding(true);
    dispatch(getOrdersById({id: id})).then(() => setLoding(false));
  }, [id, ping]);
  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      } else {
        // Timer reaches 0, dispatch getOrderById and handle loading state
        setLoding(true);
        dispatch(getOrdersById({id: id}))
          .then(() => setLoding(false))
          .catch(error => {
            // Handle error if needed
            console.error('Error fetching order:', error);
            setLoding(false); // Ensure loading state is reset in case of error
          });
        setTimer(30); // Reset timer to 30 after dispatching getOrderById
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  useEffect(() => {
    if (order?.driver_id?.data) {
      if (
        order?.commandStatus === 'Processing' &&
        order?.driver_id?.data?.accountOverview[0]
          ?.position
      ) {
        setDriverPosition([
          parseFloat(
            order?.driver_id?.data?.accountOverview[0]
              ?.position?.coords?.latitude,
          ),
          parseFloat(
            order?.driver_id?.data?.accountOverview[0]
              ?.position?.coords?.longitude,
          ),
        ]);
      }
    }
  }, [order]);

  useEffect(() => {
    if (order) {
      // Check if the nested properties are available before accessing their values
      if (
        order?.pickUpAddress &&
        order?.dropOfAddress
      ) {
        setPickupCoordinate([
          parseFloat(order?.pickUpAddress?.coordonne?.latitude),
          parseFloat(order?.pickUpAddress?.coordonne?.longitude),
        ]);
        setDropCoordinateCoordinate([
          parseFloat(order?.dropOfAddress?.coordonne?.latitude),
          parseFloat(order?.dropOfAddress?.coordonne?.longitude),
        ]);
      }
    }
  }, [order]);

  const centerLatitude = (pickupCoordinate[0] + dropCoordinate[0]) / 2;
  const centerLongitude = (pickupCoordinate[1] + dropCoordinate[1]) / 2;
  const latitudeDelta = Math.abs(pickupCoordinate[0] - dropCoordinate[0]) * 1.5;
  const longitudeDelta =
    Math.abs(pickupCoordinate[1] - dropCoordinate[1]) * 1.5;
  const mapRegion = {
    latitude: centerLatitude,
    longitude: centerLongitude,
    latitudeDelta,
    longitudeDelta,
  };
  const origin = {latitude: dropCoordinate[0], longitude: dropCoordinate[1]};
  const destination = {
    latitude: pickupCoordinate[0],
    longitude: pickupCoordinate[1],
  };
  const DriverCurrentPos = {
    latitude: driverPosition[0],
    longitude: driverPosition[1],
  };
  const GOOGLE_MAPS_APIKEY = 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE';
  const getStatusBadgeColor = status => {
    switch (status) {
      case 'Pending':
        return '#f294f770'; // Set the color for Pending status
      case 'Processing':
        return '#abf5ce'; // Set the color for Processing status
      case 'Completed':
        return 'cyan'; // Set the color for Completed status

      case 'Canceled':
        return 'orange'; // Set the color for Canceled status
      default:
        return 'gray'; // Set a default color if the status is not recognized
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'Pending':
        return 'En attente';
      case 'Processing':
        return 'En cours';
      case 'Completed':
        return 'Livré';

      case 'Canceled':
        return 'Annuler';
      default:
        return 'Inconnu';
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {loding ? (
        <ActivityIndicator />
      ) : order?.commandStatus === 'Completed' ? (
        <Rating order={order} />
      ) : (
        <Tracking order={order} timer={timer} setTimer={setTimer} />
      )}
    </SafeAreaView>
  );
};

export default NotifDetails;

const styles = StyleSheet.create({
  container: {
    height: hp(30),
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: wp('80%'),
    flex: 0.27,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,

    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: hp(1.5),
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalHead: {
    flex: 0.7,
    alignItems: 'center',

    justifyContent: 'space-evenly',
    paddingHorizontal: 15,
  },
  modalBottom: {
    width: '100%',
    flex: 0.3,
    backgroundColor: colors.primary,
    alignItems: 'center',

    justifyContent: 'center',
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
});
