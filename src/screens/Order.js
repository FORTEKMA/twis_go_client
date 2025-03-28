/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  Platform,
  SafeAreaView,
  Modal as RNModal,
  Linking,
  Alert, // Import Linking
} from 'react-native';
import phone from '../assets/phone.png';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getOrderById,
  updateReservation,
} from '../store/commandeSlice/commandeSlice';
import Rating from './Rating';
import MapView, {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {colors} from '../utils/colors';
import Divider from '../components/Divider';
import {Badge, Modal} from 'native-base';
import {sendNotification} from '../store/notificationSlice/notificationSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import SignalerProblem from '../components/SignalerProblem';

const Order = ({route}) => {
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const {id} = route.params;
  const order = useSelector(state => state?.commandes?.OrderById);
  const user = useSelector(state => state.user.currentUser);
  const [pickupCoordinate, setPickupCoordinate] = useState([0, 0]);
  const [dropCoordinate, setDropCoordinateCoordinate] = useState([0, 0]);
  const [driverPosition, setDriverPosition] = useState([0, 0]);
  const [cancelModal, setCancelModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [ping, setPing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const handleRating = value => {
    setRating(value); // Update rating state
  };
  const dispatch = useDispatch();
  const start = require('../assets/historyStart.png');
  const end = require('../assets/historyArrive.png');
  const dots = require('../assets/dots.png');
  const livraison = require('../assets/livraison.png');
  const money = require('../assets/Money.png');

  useEffect(() => {
    setLoading(true);
    dispatch(getOrderById({id: id})).then(() => setLoading(false));
  }, [dispatch, id, ping]);

  // useEffect(() => {
  //   if (order?.driver_id?.location) {
  //     setDriverPosition([
  //       parseFloat(order?.driver_id?.location?.latitude),
  //       parseFloat(order?.driver_id?.location?.longitude),
  //     ]);
  //   }
  // }, [order]);

  useEffect(() => {
    if (order) {
      if (order.pickUpAddress.coordonne && order.dropOfAddress.coordonne) {
        const pickupLat = parseFloat(order.pickUpAddress.coordonne.latitude);
        const pickupLng = parseFloat(order.pickUpAddress.coordonne.longitude);
        const dropLat = parseFloat(order.dropOfAddress.coordonne.latitude);
        const dropLng = parseFloat(order.dropOfAddress.coordonne.longitude);

        if (
          !isNaN(pickupLat) &&
          !isNaN(pickupLng) &&
          !isNaN(dropLat) &&
          !isNaN(dropLng)
        ) {
          setPickupCoordinate([pickupLat, pickupLng]);
          setDropCoordinateCoordinate([dropLat, dropLng]);
        }
      }
    }
  }, [order]);

  const isValidCoordinate = coord => {
    return coord && coord[0] !== 0 && coord[1] !== 0;
  };

  const DEFAULT_PROFILE_PICTURE = require('../assets/driveree.png');

  const centerLatitude = (pickupCoordinate[0] + dropCoordinate[0] + 2) / 2 || 0;
  const centerLongitude = (pickupCoordinate[1] + dropCoordinate[1]) / 2 || 0;
  const latitudeDelta = Math.abs(pickupCoordinate[0] - dropCoordinate[0]) * 3.5;
  const longitudeDelta =
    Math.abs(pickupCoordinate[1] - dropCoordinate[1]) * 5.5;

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
    latitude: order?.driver_id?.location?.latitude,
    longitude: order?.driver_id?.location?.longitude,
  };
  const MAPS_API_KEY = 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE';

  const getStatusBadgeColor = status => {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Assigned_to_driver':
        return 'yellow';
      case 'Driver_on_route_to_pickup':
        return 'purple';
      case 'Arrived_at_pickup':
        return 'blue';
      case 'Picked_up':
        return 'blue';
      case 'On_route_to_delivery':
        return 'blue';
      case 'Arrived_at_delivery':
        return 'blue';
      case 'Delivered':
        return 'ceyan';
      case 'Completed':
        return 'green';
      case 'Failed_pickup':
        return 'red';
      case 'Failed_delivery':
        return 'red';
      case 'Canceled_by_partner':
        return 'red';
      case 'Canceled_by_client':
        return 'red';

      default:
        return 'gray';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'Pending':
        return 'En attente';
      case 'Dispatched_to_partner':
        return 'Commande acceptée par la société';
      case 'Assigned_to_driver':
        return 'Commande acceptée par le livreur';
      case 'Driver_on_route_to_pickup':
        return "Livreur est en route vers l'adresse de rammassage";
      case 'Arrived_at_pickup':
        return 'Livreur est Arrivée au rammassage';
      case 'Picked_up':
        return 'Commande ramassée';
      case 'On_route_to_delivery':
        return "Livreur est en route vers l'adresse de livraison";
      case 'Arrived_at_delivery':
        return 'Livreur est Arrivée au dépot';
      case 'Delivered':
        return 'Commande Terminé';
      case 'Completed':
        return 'Commande Livrée';
      case 'Failed_pickup':
        return 'Commande Annulé ';
      case 'Failed_delivery':
        return 'Commande Annulé ';
      case 'Canceled_by_client':
        return 'Vous avez annulé la commande';
      case 'Canceled_by_partner':
        return 'La société a annulé la commande';
      default:
        return 'Inconnu';
    }
  };

  let paymentText;
  switch (order?.payType) {
    case 'Credit':
      paymentText = 'Payement en ligne';
      break;
    case 'Livraison':
      paymentText = 'Payement à la livraison';
      break;
    default:
      paymentText = 'Impayer!!';
      break;
  }

  const handleCancel = () => {
    dispatch(
      updateReservation({
        id: id,
        body: {
          data: {
            commandStatus: 'Canceled_by_client',
          },
        },
      }),
    ).then(() => {
      // dispatch(
      //   sendNotification({
      //     id: 227,
      //     title: 'Commande annulé',
      //     sendFrom: {
      //       id: user?.id,
      //       name: user?.firstName,
      //       command: id,
      //     },
      //     command: id,
      //     notification_type: 'canceled',
      //     types: ['notification'],
      //     smsCore: `${user?.firstName} a annuler une commande N°: ${order?.refNumber}`,
      //     notificationCore: `${user?.firstName} a annuler une commande N°: ${order?.refNumber}`,
      //     saveNotification: true,
      //     template_id: 'd-8b266aac7fd64f73bab6ee0c80df8dbd',
      //     dynamicTemplateData: {
      //       commandeid: id,
      //     },
      //   }),
      // );
      setPing(!ping);
      setCancelModal(false);
    });
  };
  // 'Pending',
  // 'Dispatched_to_partner',
  // 'Assigned_to_driver',
  // 'Driver_on_route_to_pickup',
  // 'Arrived_at_pickup',
  // 'Picked_up',
  // 'On_route_to_delivery',
  // 'Arrived_at_delivery',
  // 'Canceled_by_client',
  // 'Failed_pickup',
  // 'Failed_delivery',
  // 'Delivered',
  // 'Completed',

  // Function to handle phone call
  const handleCallDriver = () => {
    if (order?.driver_id?.phoneNumber) {
      const phoneNumber = `tel:${order.driver_id.phoneNumber}`;
      Linking.openURL(phoneNumber).catch(err => {
        console.error('Failed to open phone call:', err);
        Alert.alert('Erreur', 'Impossible de passer un appel téléphonique.');
      });
    } else {
      Alert.alert('Erreur', 'Numéro de téléphone du chauffeur non disponible.');
    }
  };

  const renderSimplifiedView = () => {
    const status = order?.commandStatus;
    const statusText = getStatusText(status);

    let statusImage;
    switch (status) {
      case 'Dispatched_to_partner':
        statusImage = require('../assets/accepted.png');
        break;
      case 'Delivered':
        statusImage = require('../assets/Frame3.png');
        break;
      case 'Completed':
        statusImage = require('../assets/completed.png');
        break;
      case 'Pending':
        statusImage = require('../assets/pending.png');
        break;
      default:
        statusImage = require('../assets/default.png');
    }

    return (
      <View style={styles.simplifiedContainer}>
        <Image source={statusImage} style={styles.statusImage} />
        <Text style={styles.refNumberText}>#{order?.refNumber}</Text>
        <Text style={styles.statusText}>{statusText}</Text>
        <TouchableOpacity
          style={styles.detailsIcon}
          onPress={() => setDetailsModalVisible(true)}>
          <Icon name="info-circle" size={30} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFullOrderView = () => {
    // const isCanceledOrFailed = [
    //   'Canceled_by_client',
    //   'Canceled_by_partner',
    // ].includes(order?.commandStatus);
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <ScrollView style={styles.scrollView}>
          {/* Conditionally Render Driver Info */}
          {![
            'Canceled_by_client',
            'Canceled_by_partner',
            'Failed_pickup',
            'Failed_delivery',
          ].includes(order?.commandStatus) &&
            ![
              'Dispatched_to_partner',
              'Pending',
              'Driver_on_route_to_pickup',
              'Picked_up',
              'On_route_to_delivery',
              'Completed',
            ].includes(order?.commandStatus) && (
              <View style={styles.driverInfo}>
                <View style={styles.driverInfoParent}>
                  <Image
                    source={
                      order?.driver_id?.profilePicture?.url
                        ? {uri: order.driver_id.profilePicture.url}
                        : DEFAULT_PROFILE_PICTURE
                    }
                    style={styles.profilePicture}
                  />
                  <View style={styles.driverDetails}>
                    <Text style={styles.driverName}>
                      {order?.driver_id?.firstName} {order?.driver_id?.lastName}
                    </Text>
                    <Text style={styles.driverPhone}>
                      {order?.driver_id?.phoneNumber}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleCallDriver}>
                  <Image source={phone} style={styles.phoneImage} />
                </TouchableOpacity>
              </View>
            )}

          {/* Display canceled or failed message */}
          {[
            'Canceled_by_client',
            'Canceled_by_partner',
            'Failed_pickup',
            'Failed_delivery',
          ].includes(order?.commandStatus) && (
            <View style={styles.canceledContainer}>
              {/* <Text style={styles.canceledText}>
                {getStatusText(order?.commandStatus)}
              </Text> */}
            </View>
          )}

          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}> Objects:</Text>
            <View style={styles.items}>
              {order?.items?.map((el, index) => (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.itemText}>
                    📦 {el?.quant}x {el?.item?.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Conditionally render the "Annuler la commande" button */}

          {/* Conditionally render the rating section */}
          {order?.commandStatus === 'Completed' && (
            <View style={styles.ratingContainer}>
              <Rating order={order} />
            </View>
          )}

          <View style={styles.paymentContainer}>
            <Image
              source={order?.payType === 'Livraison' ? money : livraison}
              style={styles.paymentIcon}
            />
            <Text style={styles.paymentType}>{paymentText}</Text>
            <Text style={styles.paymentAmount}>{order?.totalPrice}Dt</Text>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignSelf: 'flex-end',
            }}>
            <SignalerProblem />
          </View>
          <View>
            {['Pending', 'Dispatched_to_partner'].includes(
              order?.commandStatus,
            ) && (
              <Pressable
                style={styles.openModalButton}
                onPress={() => setCancelModal(true)}>
                <Text style={styles.openModalButtonText}>
                  Annuler la commande
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderOrderDetailsModal = () => {
    return (
      <RNModal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de la commande</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsModalVisible(false)}>
                <Icon name="times" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>{renderFullOrderView()}</ScrollView>
          </View>
        </View>
      </RNModal>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.secondary} />
      ) : (
        <>
          {/* {cancelModal && (
            <Modal
              animationType="slide"
              transparent={true}
              isOpen={cancelModal}
              onRequestClose={() => setCancelModal(!cancelModal)}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.modalHead}>
                    <Text style={styles.modalTitle}>Annuler la commande?</Text>
                    <Text style={styles.modalSubtitle}>
                      Êtes-vous sûr de vouloir annuler la commande ?
                    </Text>
                  </View>
                  <View style={styles.modalBottom2}>
                    <Pressable
                      style={styles.modalButtonYes}
                      onPress={() => {
                        setCancelModal(!cancelModal);
                        handleCancel();
                      }}>
                      <Text style={styles.modalButtonText}>Oui</Text>
                    </Pressable>
                    <Pressable
                      style={styles.modalButtonNo}
                      onPress={() => setCancelModal(!cancelModal)}>
                      <Text style={styles.modalButtonText}>Non</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          )} */}
          {cancelModal && (
            <Modal
              animationType="slide"
              transparent={true}
              isOpen={cancelModal}
              onRequestClose={() => setCancelModal(!cancelModal)}>
              <View style={styles.centeredViewws}>
                <View style={styles.modalViewws}>
                  <View style={styles.modalHeadws}>
                    <Text style={styles.modalTitlews}>
                      Annuler la commande?
                    </Text>
                    <Text style={styles.modalSubtitlews}>
                      Êtes-vous sûr de vouloir annuler la commande ?
                    </Text>
                  </View>
                  <View style={styles.modalBottom2ws}>
                    <Pressable
                      style={styles.modalButtonYesws}
                      onPress={() => {
                        setCancelModal(!cancelModal);
                        handleCancel();
                      }}>
                      <Text style={styles.modalButtonTextws}>Oui</Text>
                    </Pressable>
                    <Pressable
                      style={styles.modalButtonNows}
                      onPress={() => setCancelModal(!cancelModal)}>
                      <Text style={styles.modalButtonTextws}>Non</Text>
                    </Pressable>
                    {/* Add a new button here */}
                    {/* <Pressable
                      style={styles.modalButtonCancelws}
                      onPress={() => {
                        setCancelModal(!cancelModal);
                        // Add any additional functionality for the Cancel button here
                      }}>
                      <Text style={styles.modalButtonTextws}>Annuler</Text>
                    </Pressable> */}
                  </View>
                </View>
              </View>
            </Modal>
          )}
          <View style={styles.container}>
            <MapView style={styles.map} region={mapRegion}>
              {isValidCoordinate(origin) && isValidCoordinate(destination) && (
                <MapViewDirections
                  origin={origin}
                  destination={destination}
                  apikey={MAPS_API_KEY}
                  strokeWidth={3}
                  strokeColor="#e6771d"
                />
              )}
              {order?.driver_id?.location?.latitude &&
                order?.driver_id?.location?.longitude &&
                [
                  'Driver_on_route_to_pickup',
                  'Arrived_at_pickup',
                  'Picked_up',
                  'On_route_to_delivery',
                  'Arrived_at_delivery',
                  'Delivered',
                ].includes(order.commandStatus) && (
                  // order?.commandStatus === 'Driver_on_route_to_pickup'
                  <>
                    <Marker
                      coordinate={{
                        latitude: order?.driver_id?.location?.latitude,
                        longitude: order?.driver_id?.location?.longitude,
                      }}
                      title="Livreur">
                      <Image
                        source={require('../assets/TRUCK.png')}
                        style={{width: 40, height: 20, marginTop: 20}}
                      />
                    </Marker>
                    {isValidCoordinate(origin) &&
                      isValidCoordinate(DriverCurrentPos) && (
                        <MapViewDirections
                          origin={origin}
                          destination={DriverCurrentPos}
                          apikey={MAPS_API_KEY}
                          strokeWidth={5}
                          strokeColor="#595FE5"
                        />
                      )}
                  </>
                )}
              {isValidCoordinate([dropCoordinate[0], dropCoordinate[1]]) && (
                <Marker
                  coordinate={{
                    latitude: dropCoordinate[0],
                    longitude: dropCoordinate[1],
                  }}
                  title="Adresse de dépot">
                  <Image
                    source={require('../assets/destination.png')}
                    style={{width: 30, height: 30, marginTop: 17}}
                  />
                </Marker>
              )}
              {isValidCoordinate([
                pickupCoordinate[0],
                pickupCoordinate[1],
              ]) && (
                <Marker
                  coordinate={{
                    latitude: pickupCoordinate[0],
                    longitude: pickupCoordinate[1],
                  }}
                  title="Adresse de ramassage">
                  <Image
                    source={require('../assets/Points.png')}
                    style={{width: 25, height: 25, marginTop: 5}}
                  />
                </Marker>
              )}
            </MapView>

            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: 'white',
                width: '95%',
                height: hp(17),
                borderRadius: 20,
                marginTop: -5,
                paddingHorizontal: 10,
                gap: 10,
                paddingVertical: 10,
                position: 'absolute',
                top: Platform.OS === 'ios' ? 120 : 15,

                shadowColor: 'black',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 1.84,
                elevation: 5,
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}>
                <View
                  style={{
                    color: colors.secondary,
                    fontWeight: '600',
                    fontSize: 19,
                    right: 5,

                    marginTop: -10,
                  }}>
                  <Badge
                    colorScheme={getStatusBadgeColor(order?.commandStatus)}
                    style={{
                      borderRadius: 6,
                      width: '100%',
                      height: hp(3),
                      alignItems: 'center',
                      color: 'white',
                      marginBottom: 10,

                      justifyContent: 'center',
                      alignSelf: 'center',
                    }}>
                    {getStatusText(order?.commandStatus)}
                  </Badge>
                </View>
              </View>

              <View
                style={{
                  flex: 0.3,
                  paddingLeft: 2,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <Image source={start} width={7} height={7} />
                <View style={{flex: 1, overflow: 'hidden', paddingLeft: 10}}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.secondary_1,
                      fontWeight: '600',
                      fontSize: 11,
                    }}>
                    {order?.pickUpAcces?.options}{' '}
                    {order?.pickUpAcces?.floor > 0
                      ? order?.pickUpAcces?.floor + ' étage'
                      : null}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primary,
                      fontWeight: 600,
                      fontSize: 13,
                    }}>
                    {order?.pickUpAddress?.Address}
                  </Text>
                </View>
                <View>
                  <Text style={{color: colors.secondary_1, fontSize: 13}}>
                    {order?.departDate}
                  </Text>
                </View>
              </View>
              <View style={{flex: 0.1, justifyContent: 'center'}}>
                <Image source={dots} />
              </View>
              <View
                style={{
                  flex: 0.3,
                  paddingLeft: 4,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <Image source={end} />
                <View style={{flex: 1, overflow: 'hidden', paddingLeft: 10}}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.secondary_1,
                      fontWeight: '600',
                      fontSize: 11,
                    }}>
                    {order?.dropAcces?.options}{' '}
                    {order?.dropAcces?.floor > 0
                      ? order?.dropAcces?.floor + ' étage'
                      : null}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.primary,
                      fontWeight: '600',
                      fontSize: 13,
                    }}>
                    {order?.dropOfAddress?.Address}
                  </Text>
                </View>
                <View>
                  <Text style={{color: colors.secondary_1, fontSize: 13}}>
                    {order?.deparTime}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {order ? (
            <>
              {[
                'Dispatched_to_partner',
                'Delivered',
                'Completed',
                'Pending',
                'Canceled_by_client',
                'Canceled_by_partner',
              ].includes(order?.commandStatus)
                ? renderSimplifiedView()
                : renderFullOrderView()}
            </>
          ) : (
            <ActivityIndicator size="large" color={colors.secondary} />
          )}
          {renderOrderDetailsModal()}
        </>
      )}
    </SafeAreaView>
  );
};

export default Order;

const styles = StyleSheet.create({
  container: {
    height: hp(50),
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  addressContainer: {
    backgroundColor: colors.general_2,
    width: '90%',
    borderRadius: 20,
    padding: 15,
    marginTop: -10,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 15,
    right: 20,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.84,
    elevation: 5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addressIcon: {
    width: 20,
    height: 20,
  },
  addressTextContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  addressLabel: {
    color: colors.secondary_1,
    fontWeight: '600',
    fontSize: 11,
  },
  addressText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  addressTime: {
    color: colors.secondary_1,
    fontSize: 13,
  },
  dotsIcon: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  simplifiedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopColor: colors.secondary_3,
    borderTopWidth: 2,
  },
  statusImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  detailsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  scrollView: {
    alignSelf: 'center',
    flex: 1,
    backgroundColor: 'white',
    borderRadiusTop: 20,
    width: '100%',
    padding: 10,
    height: 'auto',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  statusBadge: {
    borderRadius: 6,
    width: '100%',
    height: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  driverInfoContainer: {
    padding: 10,
    alignItems: 'flex-start',
  },
  sectionTitle: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 10,
  },
  driverName: {
    color: colors.primary,
    fontSize: 14,
    textAlign: 'left',
  },
  // driverPhone: {
  //   color: colors.primary,
  //   fontSize: 14,
  // },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 15,
  },
  paymentIcon: {
    width: 24,
    height: 24,
  },
  paymentText: {
    color: 'black',
    fontSize: 16,
  },
  paymentType: {
    color: 'black',
    fontWeight: '500',
    fontSize: 18,
  },
  paymentAmount: {
    color: colors.secondary,
    fontWeight: '600',
    fontSize: 18,
  },
  itemsContainer: {
    padding: 15,
  },
  itemCard: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#18365a',
    marginBottom: 10,
  },
  items: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  itemText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  ratingText: {
    color: 'black',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: wp('100%'),
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    height: hp('100%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  closeButton: {
    padding: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: wp('80%'),
    flex: 0.4,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHead: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 15,
  },
  modalSubtitle: {
    fontWeight: '500',
    fontSize: hp(1.5),
    color: 'gray',
    textAlign: 'center',
  },
  modalBottom2: {
    width: '100%',
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  modalButtonYes: {
    flex: 0.5,
    backgroundColor: colors.secondary,
    borderBottomStartRadius: 20,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonNo: {
    flex: 0.5,
    backgroundColor: colors.primary,
    borderBottomEndRadius: 20,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: colors.primary,
    fontSize: hp(1.5),
  },

  driverInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginBottom: 10,
    marginTop: 10,
    padding: 5,
  },

  driverInfoParent: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  profilePicture: {
    width: 42,
    height: 42,
    borderRadius: 35,
  },
  mape: {
    width: 130,
    height: 130,
    marginTop: 10,
  },
  driverDetails: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '60%',
  },

  driverPhone: {
    color: 'grey',
    textAlign: 'left',
    fontSize: 14,
  },
  // starsContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'start',
  //   alignItems: 'start',
  //   marginTop: 5,
  // },
  // star: {
  //   marginHorizontal: 2,
  // },
  phoneImage: {
    width: 30,
    height: 30,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  openModalButton: {
    backgroundColor: colors.general_2,
    width: '80%',
    padding: 6,
    borderRadius: 5,
    borderColor: colors.primary,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  openModalButtonText: {
    color: colors.primary,
    fontSize: 16,
    textAlign: 'center',
  },
  centeredViewws: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  modalViewws: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalHeadws: {
    marginBottom: 20,
  },
  modalTitlews: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalSubtitlews: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  modalBottom2ws: {
    width: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    textAlign: 'center',
  },
  modalButtonYesws: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  modalButtonNows: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  modalButtonTextws: {
    color: 'white',
    textAlign: 'center',
  },
});
