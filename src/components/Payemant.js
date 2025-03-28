import {
  StyleSheet,
  Text,
  View,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Divider from './Divider';
import {colors} from '../utils/colors';
import {useStripe} from '@stripe/stripe-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  createOrder,
  initCommandeState,
  setNewCommande,
  updateReservation,
} from '../store/commandeSlice/commandeSlice';

import {sendNotification} from '../store/notificationSlice/notificationSlice';
import Login from '../screens/Login';
import LogInStepper from './LogInStepper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native'; 

const Payemant = ({

  selectedCard,
  newreservation,
  minPrice,
  maxPrice,
  setCurrentStep,
  initialState,
  setNewreservation,
}) => {
  const current = useSelector(state => state?.user?.currentUser);

  const livraison = require('../assets/Credit.png');
  const money = require('../assets/Payment.png');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedReservation, setUpdatedReservation] = useState(newreservation);
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const dispatch = useDispatch();

  const navigation = useNavigation(); 

  const paymentLivraison = async () => {
    try {
      // Show confirmation alert
      Alert.alert(
        'Voulez-vous confirmer cette commande ?',
        '', // Optional: Message in the alert
        [
          {
            text: 'Annuler',
            onPress: () => console.log('Commande annulée'),
            style: 'cancel',
          },
          {
            text: 'Confirmer',
            onPress: async () => {
              setLoading(true);

              const reservationWithPayType = {
                ...updatedReservation,
                data: {
                  ...updatedReservation.data,
                  payType: 'Livraison',
                  client_id: current?.id,
                },
              };
              setModalVisible(true);
              await dispatch(createOrder(reservationWithPayType)).then(res => {
                if (res?.payload?.status === 200) {
                  dispatch(
                    sendNotification({
                      id: 227,
                      title: 'Nouvelle commande',
                      sendFrom: {
                        id: current?.id,
                        name: current?.firstName,
                        command: res?.payload?.data?.data?.id,
                      },
                      command: res?.payload?.data?.data?.id,
                      notification_type: 'created',
                      types: ['notification', 'email'],
                      smsCore: `${current?.firstName} a passé une commande N°: ${res?.payload?.data?.data?.attributes?.refNumber}`,
                      notificationCore: `${current?.firstName} a passé une commande N°: ${res?.payload?.data?.data?.attributes?.refNumber}`,
                      saveNotification: true,
                      template_id: 'd-8b266aac7fd64f73bab6ee0c80df8dbd',
                      dynamicTemplateData: {
                        commandeid: res?.data?.data?.id,
                      },
                    }),
                  );
                }
              });
              setNewreservation(initialState);
             

     
            },
          },
        ],
        {cancelable: false}, // Optionally make it non-cancelable by tapping outside
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleStripePayment = async () => {
    setLoading(true);
    try {
      // Set the payType in updatedReservation.data
      const reservationWithPayType = {
        ...updatedReservation,
        data: {
          ...updatedReservation.data,
          payType: 'Credit',
        },
      };

      // Dispatch the action with the modified reservation
      const createOrderResponse = await dispatch(
        createOrder(reservationWithPayType),
      ).then(async res => {
        const initResponse = await initPaymentSheet({
          merchantDisplayName: 'Sheelni',
          paymentIntentClientSecret:
            res?.payload?.data?.data?.attributes?.paymentIntent,
        });

        if (initResponse.error) {
          setLoading(false);
          Alert.alert("Une erreur s'est produite");
          return;
        }

        // Present the Payment Sheet from Stripe
        const paymentResponse = await presentPaymentSheet();

        if (paymentResponse.error) {
          Alert.alert(
            `Error code: ${paymentResponse.error.code}`,
            paymentResponse.error.message,
          );
          setLoading(false);
          return;
        }

        // After a successful payment, update the payment status to success
        const reservationId = res?.payload?.data?.data?.id;
        await dispatch(
          updateReservation({
            id: reservationId,
            body: {data: {paymentStatus: 'success'}},
          }),
        );
      });

      // Navigate to the 'Historique' screen
      setNewreservation(initialState);
      dispatch(initCommandeState()).then(() => {
        navigation.navigate('Historique');
        setLoading(false);
        setCurrentStep(1);
      });
    } catch (error) {
      // Handle dispatch error
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      {current ? (
        <View>
          {loading && (
            <View style={styles.overlay}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          )}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.modalHead}>
                  <Text
                    style={{
                      fontWeight: '600',
                      fontSize: hp(2),
                      color: 'black',
                    }}>
                    Merci pour votre demande.
                  </Text>
                  <Text
                    style={{
                      fontWeight: '500',
                      fontSize: hp(1.5),
                      color: 'gray',
                      textAlign: 'center',
                    }}>
                    Veuillez préparer le montant exact pour le règlement lors de
                    la livraison. Merci de votre commande et de votre confiance
                    !
                  </Text>
                </View>
                <Pressable
                  style={styles.modalBottom}
                  onPress={() => {
                    navigation.navigate('Historique');
                    setLoading(false);
                    setCurrentStep(1);
                    setNewreservation(initialState);
                  }}>
                  <Text style={{color: colors.secondary, fontSize: hp(2)}}>
                    Continuer
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <View style={{alignItems: 'center', paddingVertical: 15}}>
            <Text style={{fontWeight: '500', color: 'white', fontSize: hp(2)}}>
              Select the payment method
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => paymentLivraison()}
            style={{
              marginBottom: 10,
            }}>
            <View
              style={{
                alignItems: 'center',
                padding: 15,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                gap: 15,
                borderWidth: 1, // Border thickness
                borderColor: 'black',
                backgroundColor: '#23252F',
              }}>
              <Image source={money} style={{width: 30, height: 30}} />

              <Text style={{color: 'white', fontSize: hp(1.7)}}>
                Payment on delivery
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleStripePayment()}
            style={{
              marginBottom: 10,
            }}>
            <View
              style={{
                alignItems: 'center',
                padding: 15,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                gap: 15,
                borderWidth: 1, // Border thickness
                borderColor: 'black',
                backgroundColor: '#23252F',
              }}>
              <Image source={livraison} style={{width: 30, height: 30}} />
              <Text style={{color: 'white', fontSize: hp(1.7)}}>
                Payment by card
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <LogInStepper />
      )}
    </>
  );
};

export default Payemant;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Adjust the opacity and color as needed
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,

  },
  modalView: {
    width: '80%',
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
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
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
    width: '80%',
    flex: 0.3,
    backgroundColor: colors.primary,
    alignItems: 'center',

    justifyContent: 'center',
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
});
