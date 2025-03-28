import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {RadioButton} from 'react-native-paper';
import Divider from '../Divider';
import {colors} from '../../utils/colors';
import axios from 'axios';
import {API_URL_IOS, API_URL_ANDROID} from '@env';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AvecAide from './AvecAide';
import SansAide from './SansAide';
import { useSelector } from 'react-redux';
import { calculateDistanceAndTime } from '../../utils/CalculateDistanceAndTime';
const API_URL = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;
const EstimationCard = ({
  formatedDate,
  newreservation,
  selectedArticles,
  nextBtn,
  currentStep,
  setCurrentStep,
  setSelectedCard,
  selectedCard,
  setMinPrice,
  setMaxPrice,
  minPrice,
  maxPrice,
}) => {
  const aideActive = require('../../assets/aideActive.png');
  const aideInactive = require('../../assets/aideInactive.png');
  const loader = require('../../assets/Loader.png');
  const truck = require('../../assets/TRUCK.png');
  const loaderGrey = require('../../assets/GreyLoader.png');
  const truckGrey = require('../../assets/GreyTruck.png');
  const yellowArrowRight = require('../../assets/ArrowYellowRight.png');
  const yellowArrowLeft = require('../../assets/ArrowYellowLeft.png');
  const yellowBox = require('../../assets/YellowBox.png');
  const arrowGreyLeft = require('../../assets/ArrowGreyLeft.png');
  const arrowGreyRight = require('../../assets/ArrowGreyRight.png');
  const greyBox = require('../../assets/GreyBox.png');
  const arrow = require('../../assets/rightArrow.png');
  const [loading, setLoading] = useState(true);
  console.log(newreservation, '4');
  const [distance, setDistance] = useState(false);
  const [aide, setAide] = useState(false);
  const [sansAide, setSansAide] = useState(false);

  useEffect(() => {
    if (
      newreservation?.data?.pickUpAddress?.coordonne?.latitude &&
      newreservation?.data?.pickUpAddress?.coordonne?.longitude &&
      newreservation?.data?.dropOfAddress?.coordonne?.latitude &&
      newreservation?.data?.dropOfAddress?.coordonne?.longitude
    ) {
      calculateDistanceAndTime(
        `${newreservation?.data?.pickUpAddress?.coordonne?.latitude},${newreservation?.data?.pickUpAddress?.coordonne?.longitude}`,
        `${newreservation?.data?.dropOfAddress?.coordonne?.latitude},${newreservation?.data?.dropOfAddress?.coordonne?.longitude}`,
      ).then(result => {
        if (result) {
          setNewreservation(prevReservation => ({
            ...prevReservation,
            data: {
              ...prevReservation.data,
              distance: result.distance,
              duration: result.time,
            },
          }));
        }
      });
    }
  }, [
    newreservation?.data?.pickUpAddress?.coordonne?.latitude,
    newreservation?.data?.dropOfAddress?.coordonne?.latitude,
  ]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Start loading
        setLoading(true);

        // Fetch data and perform calculations
        if (newreservation.distance) {
          // Calculate minPrice
          const minPriceResponse = await axios.post(`${API_URL}/api/calcul`, {
            distance: newreservation?.data?.distance,
            volume: newreservation?.data?.items,
          });
          setMinPrice(minPriceResponse.data);

          // Calculate maxPrice
          const maxPriceResponse = await axios.post(`${API_URL}/api/calcul`, {
            distance: newreservation?.data?.distance,
            volume: newreservation?.data?.items,
            accessDepart: newreservation?.data?.pickUpAcces,
            accessArrivee: newreservation?.data?.dropAcces,
          });
          setMaxPrice(maxPriceResponse.data);
        }

        // Stop loading
        setLoading(false);
      } catch (error) {
        console.error(error);
        // Handle errors if needed
        setLoading(false); // Stop loading on error
      }
    };

    fetchData().catch(err => console.log(err));
  }, []);
  useEffect(() => {
    if (
      newreservation?.data?.dropAcces?.options === 'Camion' &&
      newreservation?.data?.pickUpAcces?.options === 'Camion'
    ) {
      setSelectedCard(2);
    } else {
      setSelectedCard(1);
    }
  }, []);

  return (
    <>
      {!(
        newreservation?.data?.dropAcces?.options === 'Camion' &&
        newreservation?.data?.pickUpAcces?.options === 'Camion'
      ) && (
        <Pressable
          behavior="height"
          enabled
          onPress={() => {
            setSelectedCard(1);
          }}
          keyboardShouldPersistTaps="always"
          style={styles.estimationContainerEs}>
          <View
            style={selectedCard === 1 ? styles.header : styles.headerInactive}>
            <RadioButton
              mode={Platform.OS}
              status={selectedCard === 1 ? 'checked' : 'unchecked'}
              color="black"
              onPress={() => {
                setSelectedCard(1);
              }}
            />
            <View style={{alignItems: 'center', flex: 0.9}}>
              {loading ? (
                <Text style={styles.text}>Calcule en cours...</Text>
              ) : (
                <Text style={styles.textPrice}>{maxPrice}Dt</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setAide(!aide)}>
              <Image
                source={selectedCard === 1 ? aideActive : aideInactive}
                style={styles.pinIcon}
              />
            </TouchableOpacity>
          </View>

          {!aide ? (
            <>
              <View style={styles.content1}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginBottom: 10,
                  }}>
                  <Text
                    style={{
                      fontWeight: '700',
                      color: 'black',
                      fontSize: hp(2),
                    }}>
                    Chez moi
                  </Text>
                  <Image
                    source={selectedCard === 1 ? loader : loaderGrey}
                    style={styles.pinIcon}
                  />
                  <Image
                    source={selectedCard === 1 ? loader : loaderGrey}
                    style={styles.pinIcon}
                  />
                  <Image
                    source={selectedCard === 1 ? truck : truckGrey}
                    style={styles.pinIcon}
                  />
                </View>
                <Divider />
                <View style={{justifyContent: 'space-evenly', flex: 1}}>
                  <Text
                    style={{
                      fontWeight: '400',
                      color: 'black',
                      fontSize: hp(1.5),
                      alignSelf: 'center',
                    }}>
                    {formatedDate}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '80%',
                      alignSelf: 'center',
                      gap: 15,
                    }}>
                    <TouchableOpacity onPress={() => setCurrentStep(1)}>
                      <Image
                        source={
                          selectedCard === 1 ? yellowArrowRight : arrowGreyRight
                        }
                        style={styles.pinIcon}
                      />
                    </TouchableOpacity>

                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontWeight: '400',
                          color: 'black',
                          fontSize: hp(1.5),
                        }}
                        numberOfLines={1}>
                        {newreservation?.data?.pickUpAddress?.Address}
                      </Text>
                      <Text
                        style={{
                          fontWeight: '300',
                          color: 'black',
                          fontSize: hp(1.3),
                        }}>
                        {newreservation?.data?.pickUpAcces?.options === 'Camion'
                          ? 'Au pieds de camion'
                          : 'Chez moi'}
                      </Text>
                    </View>
                    <Image source={arrow} style={styles.pinIcon} />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '80%',
                      alignSelf: 'center',
                      gap: 15,
                    }}>
                    <Image
                      source={
                        selectedCard === 1 ? yellowArrowLeft : arrowGreyLeft
                      }
                      style={styles.pinIcon}
                    />
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontWeight: '400',
                          color: 'black',
                          fontSize: hp(1.5),
                        }}
                        numberOfLines={1}>
                        {newreservation?.data?.dropOfAddress?.Address}
                      </Text>
                      <Text
                        style={{
                          fontWeight: '300',
                          color: 'black',
                          fontSize: hp(1.3),
                        }}>
                        {newreservation?.data?.dropAcces?.options === 'Camion'
                          ? 'Au pieds de camion'
                          : 'Chez moi'}
                      </Text>
                    </View>

                    <Image source={arrow} style={styles.pinIcon} />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '80%',
                      alignSelf: 'center',
                      gap: 15,
                    }}>
                    <Image
                      source={selectedCard === 1 ? yellowBox : greyBox}
                      style={styles.pinIcon}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        overflow: 'hidden',
                        flex: 1,
                      }}>
                      {selectedArticles?.map(el => (
                        <Text style={{color: 'black', fontSize: hp(1.5)}}>
                          {el?.item?.name},
                        </Text>
                      ))}
                    </View>
                    <Image source={arrow} style={styles.pinIcon} />
                  </View>
                </View>
              </View>

              {selectedCard === 1 && loading === false && (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => {
                    if (currentStep < 5) {
                      if (
                        minPrice !== null &&
                        minPrice !== undefined &&
                        maxPrice !== null &&
                        maxPrice !== undefined
                      ) {
                        nextBtn(currentStep);
                      }
                    } else {
                      // Dernière étape, effectuez l'action de fin
                      // Vous pouvez gérer l'action de fin ici
                    }
                  }}>
                  <Text style={styles.text}>
                    {currentStep === 4 ? 'Payment' : 'Next'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <AvecAide selectedCard={selectedCard} />
          )}
        </Pressable>
      )}

      <Pressable
        behavior="height"
        enabled
        onPress={() => {
          setSelectedCard(2);
        }}
        keyboardShouldPersistTaps="always"
        style={styles.estimationContainerEs}>
        <View
          style={
            selectedCard === 2 ||
            (newreservation?.data?.dropAcces?.options === 'Camion' &&
              newreservation?.data?.pickUpAcces?.options === 'Camion')
              ? styles.header
              : styles.headerInactive
          }>
          <RadioButton
            mode={Platform.OS}
            status={
              selectedCard === 2 ||
              (newreservation?.data?.dropAcces?.options === 'Camion' &&
                newreservation?.data?.pickUpAcces?.options === 'Camion')
                ? 'checked'
                : 'unchecked'
            }
            color="black"
            onPress={() => {
              setSelectedCard(2);
            }}
          />
          <View style={{alignItems: 'center', flex: 0.9}}>
            {loading ? (
              <Text style={styles.text}>Calcule en cours...</Text>
            ) : (
              <Text style={styles.textPrice}>{minPrice}Dt</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => setSansAide(!sansAide)}>
            <Image
              source={selectedCard === 2 ? aideActive : aideInactive}
              style={styles.pinIcon}
            />
          </TouchableOpacity>
        </View>

        {!sansAide ? (
          <>
            <View style={styles.content1}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}>
                <Text
                  style={{fontWeight: '600', color: 'black', fontSize: hp(2)}}>
                  Au pied du camion
                </Text>
                <Image
                  source={selectedCard === 2 ? loader : loaderGrey}
                  style={styles.pinIcon}
                />
                <Image
                  source={selectedCard === 2 ? truck : truckGrey}
                  style={styles.pinIcon}
                />
              </View>
              <Divider />
              <View style={{justifyContent: 'space-evenly', flex: 1}}>
                <Text
                  style={{
                    fontWeight: '400',
                    color: 'black',
                    fontSize: hp(1.5),
                    alignSelf: 'center',
                  }}>
                  {formatedDate}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '80%',
                    alignSelf: 'center',
                  }}>
                  <Image
                    source={
                      selectedCard === 2 ? yellowArrowRight : arrowGreyRight
                    }
                    style={styles.pinIcon}
                  />
                  <View
                    style={{
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      width: '80%',
                      alignSelf: 'center',
                    }}>
                    <Text
                      style={{
                        fontWeight: '400',
                        color: 'black',
                        fontSize: hp(1.5),
                      }}
                      numberOfLines={1}>
                      {newreservation?.data?.pickUpAddress?.Address}
                    </Text>
                    <Text
                      style={{
                        fontWeight: '300',
                        color: 'black',
                        fontSize: hp(1.3),
                      }}>
                      Au pieds de camion
                    </Text>
                  </View>
                  <Image source={arrow} style={styles.pinIcon} />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '80%',
                    alignSelf: 'center',
                    gap: 15,
                  }}>
                  <Image
                    source={
                      selectedCard === 2 ? yellowArrowLeft : arrowGreyLeft
                    }
                    style={styles.pinIcon}
                  />
                  <View style={{flex: 1}}>
                    <Text
                      style={{
                        fontWeight: '400',
                        color: 'black',
                        fontSize: hp(1.5),
                      }}
                      numberOfLines={1}>
                      {newreservation?.data?.dropOfAddress?.Address}
                    </Text>
                    <Text
                      style={{
                        fontWeight: '300',
                        color: 'black',
                        fontSize: hp(1.3),
                      }}>
                      Au pieds de camion
                    </Text>
                  </View>

                  <Image source={arrow} style={styles.pinIcon} />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '80%',
                    alignSelf: 'center',
                    gap: 15,
                  }}>
                  <Image
                    source={selectedCard === 2 ? yellowBox : greyBox}
                    style={styles.pinIcon}
                  />
                  <View
                    style={{flexDirection: 'row', overflow: 'hidden', flex: 1}}>
                    {selectedArticles?.map(el => (
                      <Text style={{color: 'black', fontSize: hp(1.5)}}>
                        {el?.item?.name},
                      </Text>
                    ))}
                  </View>
                  <Image source={arrow} style={styles.pinIcon} />
                </View>
              </View>
            </View>
            {selectedCard === 2 && loading === false && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => {
                  if (currentStep < 5) {
                    nextBtn(currentStep);
                  } else {
                    // Last step, perform finish action
                    // You can handle the finish action here
                  }
                }}>
                <Text style={styles.text}>
                  {currentStep === 4 ? 'Payment' : 'Next'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <SansAide selectedCard={selectedCard} />
        )}
      </Pressable>
    </>
  );
};

export default EstimationCard;

const styles = StyleSheet.create({
  estimationContainerEs: {
    backgroundColor: '#fff',
    height: 370,
    width: '90%',
    flexGrow: 1,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    alignSelf: 'center',
    marginBottom: 15,
    marginTop: 15,
  },
  content1: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  header: {
    height: 50,
    backgroundColor: colors.secondary,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  headerInactive: {
    height: 50,
    backgroundColor: 'gray',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  nextButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },

  textPrice: {
    fontWeight: '900',
    fontSize: hp(2.5),
    color: colors.primary,
  },
  text: {
    fontWeight: '600',
    fontSize: hp(2),
    color: colors.primary,
  },
  // Add your other styles here as needed
});
