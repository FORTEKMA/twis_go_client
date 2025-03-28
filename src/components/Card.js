import {
  StyleSheet,
  Text,
  View,
  Platform,
  Pressable,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import {colors} from '../utils/colors';
import {Badge} from 'native-base';
import Divider from './Divider';
import phone from '../assets/phone.png';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Card = ({order}) => {
  const [rating, setRating] = useState(3); // State to track the selected rating
  const handleRating = value => {
    setRating(value); // Update rating state
  };

  const start = require('../assets/historyStart.png');
  const dotss = require('../assets/dots.png');
  const livraison = require('../assets/livraison.png');
  const navigation = useNavigation();
  const mape = require('../assets/mape.png');
  const end = require('../assets/historyArrive.png');
  const dots = require('../assets/dotes.png');
  const DEFAULT_PROFILE_PICTURE = require('../assets/driveree.png');

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

  const isSpecialStatus = [
    'Driver_on_route_to_pickup',
    'Arrived_at_pickup',
    'Picked_up',
    'On_route_to_delivery',
    'Arrived_at_delivery',
  ].includes(order?.commandStatus);
  const isCanceledOrFailed = [
    'Canceled_by_client',
    'Canceled_by_partner',
  ].includes(order?.commandStatus);
  const isAcceptedStatus = [
    'Dispatched_to_partner',
    'Pending',
    'Assigned_to_driver',
  ].includes(order?.commandStatus);

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

  return (
    <Pressable
      onPress={() => navigation.navigate('order', {id: order.documentId})}
      style={[
        styles.card,
        isSpecialStatus && styles.specialCard, // Apply special styles if status matches
      ]}>
      {isSpecialStatus ? (
        // Special Card Layout
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={styles.refNumberContainere}>
            <Text style={styles.refNumberText}>#{order?.refNumber}</Text>
            <Text style={styles.refNumberTexte}>Suivez votre commande</Text>
            <Badge
              colorScheme={getStatusBadgeColor(order?.commandStatus)}
              style={styles.badge}>
              {getStatusText(order?.commandStatus)}
            </Badge>
          </View>
          <View>
            <Image source={mape} style={styles.mape} />
          </View>
        </View>
      ) : (
        // Default Card Layout
        <>
          {/* Default Header */}
          <View style={styles.header}>
            <View style={styles.refNumberContainer}>
              <Text style={styles.refNumberText}>#{order?.refNumber}</Text>
            </View>
            <View>
              <Badge
                colorScheme={getStatusBadgeColor(order?.commandStatus)}
                style={styles.badge}>
                {getStatusText(order?.commandStatus)}
              </Badge>
            </View>
          </View>
          <Divider />

          {/* Default Content */}
          <View style={styles.content}>
            {isAcceptedStatus ? (
              // Content for Accepted Status
              <>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                  }}>
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
                    <View
                      style={{flex: 1, overflow: 'hidden', paddingLeft: 10}}>
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
                  <View
                    style={{
                      flex: 0.1,
                      justifyContent: 'center',
                      paddingRight: 5,
                      paddingTop: 15,
                      paddingBottom: 15,
                    }}>
                    <Image source={dotss} />
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
                    <View
                      style={{flex: 1, overflow: 'hidden', paddingLeft: 10}}>
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
              </>
            ) : (
              // Content for Other Statuses
              <>
                <View style={styles.addressContainer}>
                  <Text style={styles.dateText}>{order?.departDate}</Text>
                  <Text style={styles.addressText}>
                    {order?.pickUpAddress?.Address}
                  </Text>
                </View>
                <View style={styles.dotsContainer}>
                  <Image source={dots} style={styles.dotsImage} />
                </View>
                <View style={styles.addressContainer}>
                  <Text style={styles.dateText}>{order?.duration}</Text>
                  <Text style={styles.addressText}>
                    {order?.dropOfAddress?.Address}
                  </Text>
                </View>
              </>
            )}
          </View>

          <Divider />

          {/* Conditionally Render Footer */}
          <View style={styles.footer}>
            {[
              'Canceled_by_client',
              'Canceled_by_partner',
              'Failed_pickup',
              'Failed_delivery',
            ].includes(order?.commandStatus) ? (
              <View style={styles.waitingFooter}>
                <Text style={styles.canceledText}>
                  Votre commande est annulée!
                </Text>
              </View>
            ) : isAcceptedStatus ? (
              // Footer for Accepted Status
              <View style={styles.waitingFooter}>
                <Text style={styles.waitingText}>
                  Votre commande est en cours de préparation!
                </Text>
              </View>
            ) : (
              // Default Footer
              <View style={styles.driverInfo}>
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
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Icon
                        key={star}
                        name="star"
                        size={15}
                        color={
                          star <= (order?.driver_id?.rating || 0)
                            ? '#0B3F6E'
                            : '#ccc'
                        }
                        style={styles.star}
                      />
                    ))}
                  </View>
                </View>
                {/* <TouchableOpacity onPress={handleCallDriver}>
                  <Image source={phone} style={styles.phoneImage} />
                </TouchableOpacity> */}
              </View>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    padding: 15,
    width: wp('90%'),
    height: hp(25),
    backgroundColor: 'white',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 20,
    elevation: Platform.OS === 'android' ? 4 : 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
    }),
  },
  specialCard: {
    backgroundColor: '#f3f8ff',
    borderRadius: 30,
    height: hp(23),
    borderColor: colors.primary,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  refNumberContainere: {
    width: '60%',
    marginTop: 30,
    gap: 10,
    alignItems: 'flex-start',
  },
  refNumberText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  refNumberTexte: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 5,
    alignItems: 'center',
    color: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  addressContainer: {
    flex: 1,
    overflow: 'hidden',
    paddingLeft: 10,
  },
  dateText: {
    color: colors.secondary,
    fontSize: hp(1.8),
  },
  addressText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: hp(1.5),
  },
  dotsContainer: {
    justifyContent: 'center',
  },
  dotsImage: {
    width: 20,
    height: 20,
    borderRadius: 35,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 10,
  },
  waitingFooter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontSize: hp(1.8),
    color: colors.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '90%',
    gap: 10,
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
    width: '80%',
  },
  driverName: {
    color: 'black',
    textAlign: 'left',
  },
  driverPhone: {
    color: 'grey',
    textAlign: 'left',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'start',
    marginTop: 5,
  },
  star: {
    marginHorizontal: 2,
  },
  phoneImage: {
    width: 30,
    height: 30,
    alignSelf: 'flex-end',
    marginTop: 15,
  },
  canceledText: {
    fontSize: hp(1.8),
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
});
