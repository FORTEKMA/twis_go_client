/* eslint-disable react-hooks/exhaustive-deps */
import React, {useRef, useState, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  useWindowDimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {RadioButton} from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../utils/colors';
import {ScrollView} from 'react-native-gesture-handler';
import {Input, Pressable, Switch} from 'native-base';
import DatePicker from 'react-native-date-picker';
import Divider from './Divider';
import Counter from './Counter';
import PickUpAdress from './PickUpAdress';
import DropAdress from './DropAdress';
import {useDispatch, useSelector} from 'react-redux';
import {getObjetAll} from '../store/objectSlice/objectSlice';
import {
  AutocompleteDropdown,
  AutocompleteDropdownContextProvider,
} from 'react-native-autocomplete-dropdown';
import {formatDateTime} from '../utils/formatDateTime';
import StepOne from './estimation/StepOne';
import StepTwo from './estimation/StepTwo';
import EstimationCard from './estimation/EstimationCard';
import {calculateDistanceAndTime} from '../utils/CalculateDistanceAndTime';
import Payemant from './Payemant';
import axios from 'axios';
import {StripeProvider} from '@stripe/stripe-react-native';
import {setNewCommande} from '../store/commandeSlice/commandeSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {getCurrentUser} from '../store/userSlice/userSlice';
const Estimation = ({currentStep, setCurrentStep}) => {
  const {width, height} = useWindowDimensions();
  const dispatch = useDispatch();
  const current = useSelector(state => state?.user?.currentUser);
  const time = require('../assets/Time.png');
  const arrow = require('../assets/rightArrow.png');
  const access = require('../assets/access.png');
  const note = require('../assets/note.png');
  const loader = require('../assets/Loader.png');
  const truck = require('../assets/TRUCK.png');
  const loaderGrey = require('../assets/GreyLoader.png');
  const truckGrey = require('../assets/GreyTruck.png');
  const yellowArrowRight = require('../assets/ArrowYellowRight.png');
  const yellowArrowLeft = require('../assets/ArrowYellowLeft.png');
  const yellowBox = require('../assets/YellowBox.png');

  const objet = useSelector(state => state.objects?.objects?.data);
  const [selectedArticles, setSelectedArticles] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOption, setSelectedOption] = useState('Au pied du camion');
  const [selectedOption2, setSelectedOption2] = useState('Au pied du camion');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);
  const [hasElevator, setHasElevator] = useState(false);
  const [hasElevator2, setHasElevator2] = useState(false);
  const [inputerrors, setInputErrors] = useState({});
  const [maxVolumeReached, setMaxVolumeReached] = useState(false);
  const [volume, setVolume] = useState(0);
  const [selectedCard, setSelectedCard] = useState(1);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const initialState = useSelector(state => state?.commandes?.newCommande);

  const [newreservation, setNewreservation] = useState(initialState);
  console.log(newreservation);
  // useEffect(() => {
  //   dispatch(getCurrentUser());
  // }, []);
  useEffect(() => {
    dispatch(
      setNewCommande({
        ...initialState,
        data: {...initialState.data, client_id: current?.id},
      }),
    );
    setNewreservation({
      ...initialState,
      data: {...initialState.data, client_id: current?.id},
    });
    setHasElevator(false);
    setCount(0);
    setCount2(0);
    setSwitchChecked(false);
  }, []);

  useEffect(() => {
    // Check if both start and end coordinates are available
    if (
      newreservation?.data?.pickUpAddress?.coordonne?.latitude &&
      newreservation?.data?.pickUpAddress?.coordonne?.longitude &&
      newreservation?.data?.dropOfAddress?.coordonne?.latitude &&
      newreservation?.data?.dropOfAddress?.coordonne?.longitude
    ) {
      // Call the calculateDistanceAndTime function with the coordinates
      calculateDistanceAndTime(
        `${newreservation?.data?.pickUpAddress?.coordonne?.latitude},${newreservation?.data?.pickUpAddress?.coordonne?.longitude}`,
        `${newreservation?.data?.dropOfAddress?.coordonne?.latitude},${newreservation?.data?.dropOfAddress?.coordonne?.longitude}`,
      ).then(result => {
        if (result) {
          // Set the distance and duration in the newreservation state
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

  const formatedDate = formatDateTime(
    newreservation?.data?.departDate,
    newreservation?.data?.deparTime,
  );

  const calculateTotalVolume = articles => {
    return articles.reduce(
      (total, article) => total + article?.item?.volume * article.quant,
      0,
    );
  };
  const handleSelectChange = value => {
    const findObject = objet?.find(
      el => el?.attributes?.objet?.id === value?.id,
    );

    if (findObject) {
      setSelectedArticles(prevSelectedArticles => {
        const updatedArticles = [...prevSelectedArticles];
        const existingItemIndex = updatedArticles.findIndex(
          item => item.item.name === findObject?.attributes?.objet?.name,
        );

        if (existingItemIndex !== -1) {
          // If the item already exists, increment the count
          updatedArticles[existingItemIndex].quant += 1;
        } else {
          // If the item doesn't exist and the total volume is less than or equal to 20, add it to the list
          const totalVolume = calculateTotalVolume(updatedArticles);

          if (totalVolume + findObject?.attributes?.objet?.volume <= 20) {
            updatedArticles.push({
              item: {
                id: findObject?.attributes?.objet?.id,
                name: findObject?.attributes?.objet?.name,
                volume: findObject?.attributes?.objet?.volume,
                category: findObject?.attributes?.objet?.category,
                weight: findObject?.attributes?.objet?.weight,
              },
              quant: 1,
            });
          }
        }

        const totalVolume = calculateTotalVolume(updatedArticles);
        setVolume(totalVolume);
        if (totalVolume > 20) {
          setMaxVolumeReached(true);
        } else {
          setMaxVolumeReached(false);
        }

        return updatedArticles;
      });
    }
  };

  const handleDecreaseQuant = index => {
    setSelectedArticles(prevSelectedArticles => {
      const updatedArticles = [...prevSelectedArticles];
      if (updatedArticles[index].quant > 0) {
        updatedArticles[index].quant -= 1;
        if (updatedArticles[index].quant === 0) {
          // Remove the item when quant reaches 0
          updatedArticles.splice(index, 1);
        }
      }
      const totalVolume = calculateTotalVolume(updatedArticles);
      if (totalVolume > 20) {
        setMaxVolumeReached(true);
      } else {
        setMaxVolumeReached(false);
      }
      return updatedArticles;
    });
  };

  const handleIncreaseQuant = index => {
    setSelectedArticles(prevSelectedArticles => {
      const updatedArticles = [...prevSelectedArticles];
      updatedArticles[index].quant += 1;
      const totalVolume = calculateTotalVolume(updatedArticles);
      setVolume(totalVolume);
      if (totalVolume > 20) {
        setMaxVolumeReached(true);
        // You can also add additional logic to prevent adding more items here
      } else {
        setMaxVolumeReached(false);
      }
      return updatedArticles;
    });
  };

  useEffect(() => {
    dispatch(getObjetAll());

    return () => {
      setNewreservation(initialState);
    };
  }, []);

  const autoCompleteOptions = objet?.map(item => ({
    id: item.attributes.objet.id,
    title: `${item.attributes.objet.name} (${item.attributes.objet.volume})m³`,
  }));

  const handleOptionSelect = (option, updatedCount, updatedHasElevator) => {
    setSelectedOption(option);
    let updatedPickUpAccess = {
      options: 'Camion',
      floor: 0,
    };

    if (option === 'chez moi') {
      if (updatedCount === 0) {
        updatedPickUpAccess = {
          options: 'Rez-de-chaussée',
          floor: 0,
        };
      } else {
        updatedPickUpAccess = {
          options: updatedHasElevator ? 'Ascenseur' : 'Monter',
          floor: updatedCount,
        };
      }
    }

    setNewreservation(prevReservation => ({
      ...prevReservation,
      data: {
        ...prevReservation.data,
        pickUpAcces: updatedPickUpAccess,
      },
    }));
  };
  const handleOptionSelectDrop = (option, updatedCount, updatedHasElevator) => {
    setSelectedOption2(option);

    let updatedDropUpAccess = {
      options: 'Camion',
      floor: 0,
    };

    if (option === 'chez moi') {
      if (updatedCount === 0) {
        updatedDropUpAccess = {
          options: 'Rez-de-chaussée',
          floor: 0,
        };
      } else {
        updatedDropUpAccess = {
          options: updatedHasElevator ? 'Ascenseur' : 'Monter',
          floor: updatedCount,
        };
      }
    }

    setNewreservation(prevReservation => ({
      ...prevReservation,
      data: {
        ...prevReservation.data,
        dropAcces: updatedDropUpAccess,
      },
    }));
  };
  const handleIncrease = () => {
    const updatedCount = count + 1;
    setCount(updatedCount);
    handleOptionSelect(selectedOption, updatedCount, hasElevator);
  };

  const handleDecrease = () => {
    const updatedCount = count - 1;
    setCount(updatedCount);
    handleOptionSelect(selectedOption, updatedCount, hasElevator);
  };
  const handleIncreaseDrop = () => {
    const updatedCount = count2 + 1;
    setCount2(updatedCount);
    handleOptionSelectDrop(selectedOption2, updatedCount, hasElevator);
  };

  const handleDecreaseDrop = () => {
    const updatedCount = count2 - 1;
    setCount2(updatedCount);
    handleOptionSelectDrop(selectedOption2, updatedCount, hasElevator);
  };
  const handleDate = selectedDate => {
    const currentDate = new Date();
    const twoHoursFromNow = new Date(
      currentDate.getTime() + 2 * 60 * 60 * 1000,
    );

    if (selectedDate < twoHoursFromNow) {
      // Show the error popup or handle it as needed
    } else {
      setDate(selectedDate);
      const year = selectedDate.getUTCFullYear();
      const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0'); // Adding 1 because months are 0-indexed
      const day = String(selectedDate.getUTCDate()).padStart(2, '0');
      const hour = String(selectedDate.getUTCHours()).padStart(2, '0');
      const minute = String(selectedDate.getUTCMinutes()).padStart(2, '0');
      const second = String(selectedDate.getUTCSeconds()).padStart(2, '0');

      const departDate = `${year}-${month}-${day}`;
      const deparTime = `${hour}:${minute}:${second}`;

      setNewreservation(prevReservation => ({
        ...prevReservation,
        data: {
          ...prevReservation.data,
          departDate,
          deparTime,
        },
      }));
      setInputErrors(prev => ({
        ...prev,
        departDate: '',
      }));
    }
  };

  const isStepOneValid = () => {
    const {
      pickUpAddress,
      departDate,

      pickUpAcces,
    } = newreservation.data;

    const errors = {};

    if (
      !pickUpAddress.Address ||
      pickUpAddress.Address === 'Votre adresse de départ'
    ) {
      errors.pickUpAddress = "L'adresse de prise en charge est requise.";
    }
    if (!departDate) {
      errors.departDate = 'La date de départ est requise.';
    }

    if (!selectedOption) {
      errors.pickUpAcces = "L'accès à la prise en charge est requis.";
    }

    return errors;
  };
  const isStepTwoValid = () => {
    const {dropOfAddress, dropAcces} = newreservation.data;

    const errors = {};

    if (
      !dropOfAddress.Address ||
      dropOfAddress.Address === "Votre adresse d'arrivée"
    ) {
      errors.dropOfAddress = "L'adresse de prise en charge est requise.";
    }

    if (!selectedOption2) {
      errors.pickUpAcces = "L'accès à la prise en charge est requis.";
    }

    return errors;
  };
  const isStepThreeValid = () => {
    const errors = {};
    if (selectedArticles.length === 0) {
      errors.item = 'Veuillez sélectionner des articles.';
    }

    return errors;
  };
  const nextToArrival = () => {
    const stepOneErrors = isStepOneValid();
    if (Object.keys(stepOneErrors).length === 0) {
      setCurrentStep(2);
    } else {
      setInputErrors(stepOneErrors);
    }
  };
  const nextToObject = () => {
    const stepTwoErrors = isStepTwoValid();
    if (Object.keys(stepTwoErrors).length === 0) {
      setCurrentStep(3);
    } else {
      setInputErrors(stepTwoErrors);
    }
  };
  const nextToEstimation = () => {
    const stepThreeErrors = isStepThreeValid();
    if (Object.keys(stepThreeErrors).length === 0) {
      setNewreservation(prevReservation => ({
        ...prevReservation,
        data: {
          ...prevReservation.data,
          items: selectedArticles,
        },
      }));
      setCurrentStep(4);
    } else {
      setInputErrors(stepThreeErrors);
    }
  };

  const nextTofive = () => {
    if (selectedCard === 2) {
      setNewreservation(prevReservation => ({
        ...prevReservation,
        data: {
          ...prevReservation.data,
          dropAcces: {
            options: 'Camion',
            floor: 0,
          },
          pickUpAcces: {
            options: 'Camion',
            floor: 0,
          },
          totalPrice: minPrice,
        },
      }));
    } else {
      setNewreservation(prevReservation => ({
        ...prevReservation,
        data: {
          ...prevReservation.data,
          totalPrice: maxPrice,
        },
      }));
    }
    dispatch(setNewCommande(newreservation));
    setCurrentStep(5);
  };
  const renderStepContent = step => {
    switch (step) {
      case 1:
        return (
          <View>
            <Animated.View
              style={[
                {
                  height: heightAnim,
                  // backgroundColor: heightAnim === 0 ? 'red' : 'red', // Adjust background based on heightAnim
                },
              ]}>
              <StepOne
                date={date}
                setDate={setDate}
                handleDate={handleDate}
                setNewreservation={setNewreservation}
                newreservation={newreservation}
                setInputErrors={setInputErrors}
                inputerrors={inputerrors}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                setSwitchChecked={setSwitchChecked}
                handleOptionSelect={handleOptionSelect}
                switchChecked={switchChecked}
                count={count}
                handleIncrease={handleIncrease}
                hasElevator={hasElevator}
                setHasElevator={setHasElevator}
                handleDecrease={handleDecrease}
                selectedOption={selectedOption}
                visible={visible}
                setVisible={setVisible}
              />
            </Animated.View>
          </View>
        );
      case 2:
        return (
          <StepTwo
            setNewreservation={setNewreservation}
            newreservation={newreservation}
            setInputErrors={setInputErrors}
            setVisible={setVisible2}
            selectedOption={selectedOption2}
            inputerrors={inputerrors}
            visible={visible2}
            handleDecreaseDrop={handleDecreaseDrop}
            handleIncreaseDrop={handleIncreaseDrop}
            hasElevator={hasElevator2}
            setHasElevator={setHasElevator2}
            handleOptionSelectDrop={handleOptionSelectDrop}
            count={count2}
          />
        );
      case 3:
        return (
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{
              width: '100%',

              justifyContent: 'flex-start',
              gap: hp(1),
            }}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  width: wp('100%'),
                  alignItems: 'center',
                }}>
                <View style={{width: wp('80%')}}>
                  <AutocompleteDropdown
                    position="relative"
                    clearOnFocus={true}
                    closeOnBlur={false}
                    closeOnSubmit={false}
                    textInputProps={{
                      placeholder: 'Ex: 1 Table',
                      autoCorrect: false,
                      autoCapitalize: 'none',
                      style: {
                        borderRadius: 25,
                        backgroundColor: '#fff',
                        color: '#111121',
                        paddingLeft: 18,
                        borderBottomColor: 'gray',
                        fontSize: hp(1.5),
                      },
                    }}
                    rightButtonsContainerStyle={{
                      right: 8,
                      height: 30,

                      alignSelf: 'center',
                    }}
                    inputContainerStyle={{
                      backgroundColor: '#fff',
                      borderRadius: 25,
                    }}
                    suggestionsListContainerStyle={{
                      backgroundColor: '#fff',
                      color: 'black',
                      width: '110%',
                      right: wp(13),
                    }}
                    onSelectItem={item => {
                      handleSelectChange(item);
                    }}
                    dataSet={autoCompleteOptions}
                    renderItem={(item, text) => (
                      <Text style={{padding: 10, color: 'black'}}>
                        {item.title}
                      </Text>
                    )}
                  />
                </View>
              </View>
              <Divider />
            </View>
            {selectedArticles.length > 0 && (
              <ScrollView
                style={{
                  height: 180,
                  width: wp('100%'),
                }}
                contentContainerStyle={{
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: 20,
                }}>
                {selectedArticles.map((selectedItem, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}>
                    <Text style={{color: 'black', width: wp('40%')}}>
                      {selectedItem.item.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: hp(1),
                      }}>
                      <TouchableOpacity
                        style={styles.yellowButton}
                        onPress={() => handleDecreaseQuant(index)}>
                        <Text style={styles.buttonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.countValue}>
                        {selectedItem.quant}
                      </Text>
                      <TouchableOpacity
                        style={styles.yellowButton}
                        onPress={() => handleIncreaseQuant(index)}>
                        <Text style={styles.buttonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
            {maxVolumeReached && (
              <Text style={{color: 'red'}}>
                Maximum volume reached ( 20 m³).
              </Text>
            )}
            {inputerrors.item && (
              <Text
                style={{
                  color: 'red',
                  fontWeight: '300',
                  fontStyle: 'italic',
                  marginBottom: 3,
                }}>
                {inputerrors.item}
              </Text>
            )}

            <View
              style={{
                flex: 0.5,
                paddingTop: 10,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 15,
                  paddingLeft: 10,
                }}>
                <Text
                  style={{color: 'black', fontSize: hp(2), fontWeight: '700'}}>
                  Remarque:
                </Text>
              </View>
              <View style={{width: wp('75%')}}>
                <Input
                  style={{
                    height: 150,
                    borderWidth: 1,
                    borderColor: colors.secondary_1,
                    borderRadius: 10,
                    textAlign: 'start',
                    padding: 5,
                    marginTop: 10,
                    paddingLeft: 5,
                  }}
                  variant={'underlined'}
                  placeholder="Dites-nous en plus sur les articles"
                />
              </View>
            </View>
          </ScrollView>
        );

      case 5:
        return (
          <Payemant
            selectedCard={selectedCard}
            newreservation={newreservation}
            setNewreservation={setNewreservation}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setCurrentStep={setCurrentStep}
            initialState={initialState}
            setHasElevator={setHasElevator}
            setSwitchChecked={setSwitchChecked}
          />
        );
      default:
        return null;
    }
  };

  const headerTitle = currentStep => {
    switch (currentStep) {
      case 1:
        return 'Départ';
      case 2:
        return 'Arrivé';
      case 3:
        return ' Vos Objets';

      case 5:
        return 'Payemant';
      default:
        return '';
    }
  };
  const nextBtn = currentStep => {
    switch (currentStep) {
      case 1:
        return nextToArrival();
      case 2:
        return nextToObject();
      case 3:
        return nextToEstimation();
      case 4:
        return nextTofive();

      default:
        return '';
    }
  };
  const [isOpen, setIsOpen] = useState(false); // Track open/close state
  const [heightAnim] = useState(new Animated.Value(0)); // Animated value for height
  // Example step state

  // Function to handle the toggle of the open/close state
  const toggleOpen = () => {
    setIsOpen(!isOpen);

    Animated.timing(heightAnim, {
      toValue: isOpen ? 0 : hp('42%'), // Adjust the height when toggling
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const respHeight = height / 1.5;
  return (
    <AutocompleteDropdownContextProvider>
      {currentStep !== 4 ? (
        <View style={[styles.estimationContainer, {height: "hp('43%')"}]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleOpen}>
              <Icon
                name={isOpen ? 'expand-less' : 'expand-more'}
                size={34}
                color="rgba(24, 54, 90, 1)"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                }
              }}>
              <Ionicons name={'arrow-back-outline'} size={24} color={'white'} />
            </TouchableOpacity>
            <View style={{alignItems: 'center', flex: 0.9}}>
              <Text
                style={{
                  fontWeight: '900',
                  color: 'white',
                  fontSize: hp(2),
                }}>
                {headerTitle(currentStep)}
              </Text>
            </View>
          </View>

          <View style={{flex: 1}}>
            <Animated.View
              style={[
                styles.content1,
                {height: heightAnim}, // Bind the height animation here
              ]}>
              {renderStepContent(currentStep)}

              {currentStep !== 5 && (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => {
                    if (currentStep < 5) {
                      nextBtn(currentStep);
                    } else {
                      // Handle finish action for last step
                    }
                  }}>
                  <Text style={styles.buttonText}>
                    {currentStep === 5 ? 'Terminer' : 'Suivant'}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Toggle Button */}
            <TouchableOpacity onPress={toggleOpen}>
              <Text>{isOpen ? '' : ''}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={{
            width: '100%',

            flex: 0.7,
            alignSelf: 'flex-end',
          }}>
          <ScrollView style={{width: '100%', flex: 1, alignSelf: 'flex-end'}}>
            <EstimationCard
              formatedDate={formatedDate}
              newreservation={newreservation}
              setNewreservation={setNewreservation}
              selectedArticles={selectedArticles}
              nextBtn={nextBtn}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              setSelectedCard={setSelectedCard}
              selectedCard={selectedCard}
              setMinPrice={setMinPrice}
              minPrice={minPrice}
              setMaxPrice={setMaxPrice}
              maxPrice={maxPrice}
            />
          </ScrollView>
        </View>
      )}
    </AutocompleteDropdownContextProvider>
  );
};

export default Estimation;

const styles = StyleSheet.create({
  estimationContainer: {
    backgroundColor: 'white',
    width: '100%',

    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  content1: {
    width: 320,
    padding: 15,
    backgroundColor: 'white', // Optional: Set a background color
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
    // borderRadius: 5,
    marginTop: -70,
    width: 250,
    alignItems: 'center',
    alignSelf: 'center',

    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  containerBtn: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  option: {
    flexDirection: 'row',
    backgroundColor: colors.general_2,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },

  text: {
    fontWeight: '500',
    color: colors.primary,
    fontSize: hp(1.5),
  },
  yellowButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: hp(2),
    color: 'white',
    fontWeight: '700',
  },
  countValue: {
    fontSize: hp(2),
    marginHorizontal: 10,
    color: colors.primary,
  },
  content: {
    padding: 16,
  },
});
