/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Switch,
  ScrollView,
  Button,
  PermissionsAndroid,
  Pressable,
  KeyboardAvoidingView,
  Image,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox';
import MapView, {PROVIDER_GOOGLE, Polygon} from 'react-native-maps';
import {colors} from '../utils/colors';
import PickUpAdress from '../components/PickUpAdress';
import {useSelector} from 'react-redux';
import GeoJSONBounds from '../utils/GeoJSON/TN-gouvernorats.json';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import {Divider, Input} from 'native-base';
import EstimationCard from '../components/estimation/EstimationCard';
import {formatDateTime} from '../utils/formatDateTime';
import Payemant from '../components/Payemant';

const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'App needs access to your location.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};
const MainScreen = () => {
  const PREVIOUS = require('../assets/prev.png');
  const poi = require('../assets/poi.png');
  const Car = require('../assets/car.png');
  const from = require('../assets/from.png');
  const To = require('../assets/to.png');
  const miniCar = require('../assets/miniCar.png');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    useCurrentLocation: false,
    pickup: {
      address: '',
      latitude: null,
      longitude: null,
    },
    date: new Date('2025-01-29'), // Set initial date to match the image
    time: new Date(),
    drop: {
      address: '',
      latitude: null,
      longitude: null,
    },
    objects: [],
  });
  const autoCompleteOptions = objet?.map(item => ({
    id: item.attributes.objet.id,
    title: `${item.attributes.objet.name} (${item.attributes.objet.volume})m³`,
  }));

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      position => {
        setFormData(prev => ({
          ...prev,
          useCurrentLocation: true,
          pickup: {
            address: `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          drop: {
            address: `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }));
      },
      error => console.log(error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };
  const GOOGLE_LOGO =
    'https://i.pinimg.com/564x/7a/62/ec/7a62ecaa696f10c3b1c9b88eede32e79.jpg';
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [maxVolumeReached, setMaxVolumeReached] = useState(false);
  const [inputerrors, setInputErrorss] = useState({});
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date());
  const [volume, setVolume] = useState(0);
  const [selectedCard, setSelectedCard] = useState(1);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [outOfService, setOutOfService] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Au pied du camion');
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [inputErrors, setInputErrors] = useState({});
  const [newreservation, setNewreservation] = useState(initialState);
  const current = useSelector(state => state?.user?.currentUser);
  const objet = useSelector(state => state.objects?.objects?.data);
  const initialState = useSelector(state => state?.commandes?.newCommande);
  const [hasElevator, setHasElevator] = useState(false);
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
  // Handle Google Places Autocomplete selection
  const handleAddressSelect = (data, details) => {
    setAddress(details?.formatted_address || '');
  };

  // Show or hide the date picker
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Handle date selection
  const handleDateConfirm = selectedDate => {
    setDate(selectedDate);
    hideDatePicker();
  };

  // Handle switch toggle
  const toggleSwitch = () => {
    setIsSwitchOn(previousState => !previousState);
  };

  const objectsList = [
    {id: 1, name: 'Furniture'},
    {id: 2, name: 'Electronics'},
    {id: 3, name: 'Boxes'},
    {id: 4, name: 'Clothing'},
  ];

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  };
  const formatDate = date => {
    const options = {
      weekday: 'short', // 'Wed'
      day: '2-digit', // '26'
      month: 'short', // 'Mar'
      year: 'numeric', // '2025'
    };

    // Get the date part
    const dateString = date.toLocaleDateString('en-GB', options);

    // Get hour and minute, and pad them if necessary
    const hours = date.getHours().toString().padStart(2, '0'); // Ensure 2-digit hour
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure 2-digit minutes

    // Return formatted string
    return `${dateString} ${hours}:${minutes}`;
  };
  const grandTunisCoordinates = [
    {latitude: 36.8901, longitude: 10.1879}, // La Marsa (start)
    {latitude: 36.8651, longitude: 10.1992}, // Côté Sidi Daoud
    {latitude: 36.8222, longitude: 10.2243}, // Ariana côté nord
    {latitude: 36.81, longitude: 10.219}, // Ariana (northern boundary)
    {latitude: 36.796, longitude: 10.2065}, // Raoued
    {latitude: 36.7666, longitude: 10.1354}, // Kalaat Landlous
    {latitude: 36.7311, longitude: 10.1056}, // Sud Ariana
    {latitude: 36.698, longitude: 10.0831}, // Borj Touil
    {latitude: 36.665, longitude: 10.0785}, // Manouba
    {latitude: 36.6689, longitude: 10.0598}, // Manouba
    {latitude: 36.6503, longitude: 10.0801}, // Mornaguia
    {latitude: 36.6358, longitude: 10.1184}, // Djebel Oust
    {latitude: 36.6685, longitude: 10.2003}, // Fouchana
    {latitude: 36.7041, longitude: 10.2328}, // Ben Arous
    {latitude: 36.7406, longitude: 10.2679}, // Megrine
    {latitude: 36.7816, longitude: 10.2746}, // Tunis centre
    {latitude: 36.8109, longitude: 10.2833}, // Côté Lac
    {latitude: 36.8437, longitude: 10.2575}, // La Goulette
    {latitude: 36.8739, longitude: 10.2304}, // Gammarth
    {latitude: 36.8901, longitude: 10.1879}, // Retour à La Marsa (close loop)
  ];
  // Get current position
  // const getCurrentLocation = async () => {
  //   const hasPermission = await requestLocationPermission();
  //   if (!hasPermission) return;

  //   Geolocation.getCurrentPosition(
  //     position => {
  //       setFormData(prev => ({
  //         ...prev,
  //         drop: {
  //           latitude: position.coords.latitude,
  //           longitude: position.coords.longitude,
  //         },
  //       }));
  //     },
  //     error => console.log(error),
  //     {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
  //   );
  // };

  const handleObjectToggle = id => {
    setFormData(prev => ({
      ...prev,
      objects: prev.objects.includes(id)
        ? prev.objects.filter(item => item !== id)
        : [...prev.objects, id],
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                padding: 5,
              }}>
              <Text style={styles.title}>Pickup Address</Text>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={getCurrentLocation}>
                <MaterialIcons name="my-location" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>Where are you going today?</Text>
            <SafeAreaView style={styles.container}>
              <KeyboardAvoidingView
                behavior="padding"
                style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  {/* Address Checkbox and Input */}
                  {/* <View style={styles.checkboxContainer}>
                    <CheckBox
                      value={formData.pickup !== null}
                      disabled={true}
                    />
                    <Text style={styles.checkboxLabel}>Adresse de départ</Text>
                  </View> */}
                </View>
                <View style={styles.currentLocation}>
                  {!formData.useCurrentLocation && (
                    <GooglePlacesAutocomplete
                      placeholder="Type the address..."
                      onPress={(data, details = null) => {
                        setFormData(prev => ({
                          ...prev,
                          pickup: {
                            address: data.description,
                            latitude: details?.geometry?.location?.lat || null,
                            longitude: details?.geometry?.location?.lng || null,
                          },
                        }));
                      }}
                      query={{
                        key: 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE',
                        language: 'fr',
                        components: 'country:tn',
                        location: '36.8,10.1',
                      }}
                      styles={{
                        textInputContainer: {
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: '#ccc',
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          backgroundColor: '#fff',
                          marginBottom: 5,
                        },
                        textInput: {
                          flex: 1,
                          fontSize: 16,
                          height: 40,
                        },
                      }}
                      renderLeftButton={() => (
                        <View
                          style={{paddingLeft: 10, justifyContent: 'center'}}>
                          <Image
                            source={{uri: GOOGLE_LOGO}}
                            style={{
                              width: 18,
                              height: 18,
                              resizeMode: 'contain',
                            }}
                          />
                        </View>
                      )}
                    />
                  )}
                  {formData.useCurrentLocation && (
                    <TextInput
                      style={styles.input}
                      value={formData.pickup.address}
                      editable={false}
                    />
                  )}
                </View>
                <View
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 20,
                  }}>
                  {/* Time Inputs */}
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>

            <Pressable
              style={{
                padding: 10,
                width: '50%',
                alignSelf: 'flex-end',
                backgroundColor: '#F9DC76',
                borderRadius: 5,
                alignItems: 'center',

                borderWidth: 2,
                borderColor: colors.primary,

                borderRightWidth: 5,
                borderBottomWidth: 5,
                borderTopWidth: 2,
                borderLeftWidth: 2,
              }}
              onPress={() => setStep(2)}>
              <Text
                style={{
                  color: 'black',
                  fontSize: hp(1.8),
                  fontWeight: '600',
                }}>
                Confirm Pickup
              </Text>
            </Pressable>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View
              style={{
                backgroundColor: '#19191C',
                paddingLeft: 15,
                paddingRight: 15,
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  marginBottom: 15,
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'baseline',
                  }}>
                  <Pressable onPress={() => setStep(1)}>
                    <Image
                      source={PREVIOUS}
                      style={{
                        width: 22,
                        height: 22,
                        resizeMode: 'contain',
                        alignSelf: 'flex-end',
                      }}
                    />
                  </Pressable>
                  <Text style={styles.title}>Drop-off Address</Text>
                </View>
              </View>
              <View style={styles.currentLocation}>
                {!formData.useCurrentLocation && (
                  <GooglePlacesAutocomplete
                    placeholder="Type the address..."
                    onPress={(data, details = null) => {
                      setFormData(prev => ({
                        ...prev,
                        drop: {
                          address: data.description,
                          latitude: details?.geometry?.location?.lat || null,
                          longitude: details?.geometry?.location?.lng || null,
                        },
                      }));
                    }}
                    query={{
                      key: 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE',
                      language: 'fr',
                      components: 'country:tn',
                      location: '36.8,10.1',
                    }}
                    styles={{
                      textInputContainer: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        backgroundColor: '#fff',
                        marginBottom: 5,
                      },
                      textInput: {
                        flex: 1,
                        fontSize: 16,
                        height: 40,
                      },
                    }}
                    renderLeftButton={() => (
                      <View style={{paddingLeft: 10, justifyContent: 'center'}}>
                        <Image
                          source={{uri: GOOGLE_LOGO}}
                          style={{width: 18, height: 18, resizeMode: 'contain'}}
                        />
                      </View>
                    )}
                  />
                )}
                {formData.useCurrentLocation && (
                  <TextInput
                    style={styles.input}
                    value={formData.drop.address}
                    editable={false}
                  />
                )}
              </View>
              <Pressable
                style={{
                  padding: 10,
                  width: '50%',
                  alignSelf: 'flex-end',
                  backgroundColor: '#F9DC76',
                  borderRadius: 5,
                  alignItems: 'center',

                  borderWidth: 2,
                  borderColor: colors.primary,

                  borderRightWidth: 5,
                  borderBottomWidth: 5,
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                }}
                onPress={() => setStep(3)}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: hp(1.8),
                    fontWeight: '600',
                  }}>
                  Confirm Drop-off
                </Text>
              </Pressable>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View
              style={{
                backgroundColor: '#19191C', //#19191C
                paddingLeft: 15,
                paddingRight: 15,
                paddingBottom: 15,
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  padding: 5,
                }}>
                <Pressable onPress={() => setStep(2)}>
                  <Image
                    source={PREVIOUS}
                    style={{
                      width: 22,
                      height: 22,
                      resizeMode: 'contain',
                      alignSelf: 'baseline',
                    }}
                  />
                </Pressable>
                <Text style={styles.title}>Pickup Details</Text>
              </View>
              <View
                style={{
                  flex: 0.5,
                  paddingTop: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center', // Align items vertically in the center
                    gap: 15, // Space between the switch and the text
                    marginBottom: 30,
                  }}>
                  <Switch
                    trackColor={{false: '#BAC7D5', true: '#BAC7D5'}} // Track color for false and true
                    thumbColor={'#FFFFFF'} // Thumb color when toggled
                    onValueChange={toggleSwitch} // Trigger the function when value changes
                    value={isSwitchOn} // State that controls whether the switch is on or off
                  />
                  <Text
                    style={{
                      color: 'white',
                      fontSize: hp(1.5),
                      fontWeight: '400',
                    }}>
                    As soon as possible (within 1 hour)
                  </Text>
                </View>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  {/* Main view with DatePicker */}
                  <View
                    style={{
                      width: wp('80%'),
                      borderWidth: 1, // Border thickness
                      borderColor: '#23252f', // Border color
                      padding: 10, // Inner spacing
                      margin: -8,
                      backgroundColor: '#23252f',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    {/* Trigger to show DateTimePickerModal */}
                    <Text
                      style={{
                        color: 'white',
                        fontSize: hp(2),
                        fontWeight: '600',
                      }}
                      onPress={showDatePicker} // Show the date picker when focused
                    >
                      {formatDate(date)}
                    </Text>
                  </View>

                  {/* DateTimePickerModal */}
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible} // Show the modal if true
                    mode="datetime" // Show both Date and Time
                    display="spinner"
                    onConfirm={handleDateConfirm}
                    onCancel={hideDatePicker}
                  />
                </View>
              </View>
              <Pressable
                style={{
                  padding: 10,
                  marginTop: 20,
                  width: '60%',
                  alignSelf: 'flex-end',
                  backgroundColor: '#F9DC76',
                  borderRadius: 5,
                  alignItems: 'center',

                  borderWidth: 2,
                  borderColor: colors.primary,

                  borderRightWidth: 5,
                  borderBottomWidth: 5,
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                }}
                onPress={() => setStep(4)}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: hp(1.8),
                    fontWeight: '600',
                  }}>
                  Confirm Pickup Details
                </Text>
              </Pressable>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <View
              style={{
                backgroundColor: '#19191C', //#19191C
                paddingLeft: 15,
                paddingRight: 15,
                paddingBottom: 15,
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  padding: 5,
                }}>
                <Pressable onPress={() => setStep(3)}>
                  <Image
                    source={PREVIOUS}
                    style={{
                      width: 22,
                      height: 22,
                      resizeMode: 'contain',
                      alignSelf: 'baseline',
                    }}
                  />
                </Pressable>
                <Text style={styles.title}>Choose vehicle</Text>
              </View>
              <View
                style={{
                  flex: 0.5,
                  paddingTop: 10,
                }}>
                <View>
                  <Pressable
                    onPress={() => setStep(5)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center', // Align items vertically in the center
                      gap: 15, // Space between the switch and the text
                      marginBottom: 30,
                      justifyContent: 'space-between', // Align items vertically in the center
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 15, // Space between the switch and the text
                      }}>
                      <Image source={Car} />
                      <View
                        style={{
                          alignItems: 'start', // Align items vertically in the center
                        }}>
                        <Text
                          style={{
                            color: 'white',
                            fontSize: hp(1.5),
                            fontWeight: '700',
                          }}>
                          Just go
                        </Text>
                        <Text
                          style={{
                            color: '#9B9B9B',
                            fontSize: hp(1.5),
                            fontWeight: '400',
                          }}>
                          Near by you
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        alignItems: 'flex-end', // Align items vertically in the center
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: hp(2),
                          fontWeight: '700',
                        }}>
                        $25.00
                      </Text>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: hp(1.5),
                          fontWeight: '400',
                        }}>
                        2 min
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
              
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <View
              style={{
                backgroundColor: '#19191C', //#19191C
                paddingLeft: 15,
                paddingRight: 15,
                paddingBottom: 15,
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  padding: 5,
                }}>
                <Pressable onPress={() => setStep(5)}>
                  <Image
                    source={PREVIOUS}
                    style={{
                      width: 22,
                      height: 22,
                      resizeMode: 'contain',
                      alignSelf: 'baseline',
                    }}
                  />
                </Pressable>
                <Text style={styles.title}>Price 25€</Text>
              </View>
              <View
                style={{
                  flex: 0.5,
                  paddingTop: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center', // Align items vertically in the center
                    gap: 15, // Space between the switch and the text
                    marginBottom: 30,
                    justifyContent: 'space-between', // Align items vertically in the center
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 30, // Space between the switch and the text
                      marginLeft: 10,
                    }}>
                    <Image source={from} />
                    <View
                      style={{
                        alignItems: 'start', // Align items vertically in the center
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: hp(1.5),
                          fontWeight: '700',
                        }}>
                        Departure Date
                      </Text>
                      <Text
                        style={{
                          color: '#9B9B9B',
                          fontSize: hp(1.5),
                          fontWeight: '400',
                        }}>
                        Monday, May 27, from 8 AM to 10 AM
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center', // Align items vertically in the center
                    gap: 15, // Space between the switch and the text
                    marginBottom: 30,
                    justifyContent: 'space-between', // Align items vertically in the center
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 30, // Space between the switch and the text
                      marginLeft: 10,
                    }}>
                    <Image source={To} />
                    <View
                      style={{
                        alignItems: 'start', // Align items vertically in the center
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: hp(1.5),
                          fontWeight: '700',
                        }}>
                        Departure Address
                      </Text>
                      <Text
                        style={{
                          color: '#9B9B9B',
                          fontSize: hp(1.5),
                          fontWeight: '400',
                        }}>
                        17th Arrondissement, Paris, France
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center', // Align items vertically in the center
                    gap: 15, // Space between the switch and the text
                    marginBottom: 30,
                    justifyContent: 'space-between', // Align items vertically in the center
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 30, // Space between the switch and the text
                      marginLeft: 10,
                    }}>
                    <Image source={To} />
                    <View
                      style={{
                        alignItems: 'start', // Align items vertically in the center
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: hp(1.5),
                          fontWeight: '700',
                        }}>
                        Arrival Address
                      </Text>
                      <Text
                        style={{
                          color: '#9B9B9B',
                          fontSize: hp(1.5),
                          fontWeight: '400',
                        }}>
                        3e Arrondissement, Paris, France
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center', // Align items vertically in the center
                    gap: 15, // Space between the switch and the text
                    marginBottom: 30,
                    justifyContent: 'space-between', // Align items vertically in the center
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 30, // Space between the switch and the text
                      marginLeft: 10,
                    }}>
                    <Image source={miniCar} />
                    <View
                      style={{
                        alignItems: 'start', // Align items vertically in the center
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: hp(1.5),
                          fontWeight: '700',
                        }}>
                        Just go
                      </Text>
                      <Text
                        style={{
                          color: '#9B9B9B',
                          fontSize: hp(1.5),
                          fontWeight: '400',
                        }}>
                        Near by you
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Pressable
                style={{
                  padding: 10,
                  width: '60%',
                  alignSelf: 'flex-end',
                  backgroundColor: '#F9DC76',
                  borderRadius: 5,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: colors.primary,
                  borderRightWidth: 5,
                  borderBottomWidth: 5,
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                }}
                onPress={() => setStep(6)}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: hp(1.8),
                    fontWeight: '600',
                  }}>
                  Confirm Details
                </Text>
              </Pressable>
            </View>
          </View>
        );
      case 6:
        return (
          <View
            style={{backgroundColor: '#19191C', height: 'auto', width: '90%'}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'baseline',
                padding: 5,
              }}>
              <Pressable onPress={() => setStep(4)}>
                <Image
                  source={PREVIOUS}
                  style={{
                    width: 22,
                    height: 22,
                    resizeMode: 'contain',
                    alignSelf: 'flex-start',
                    left: 0,
                    top: 10,
                  }}
                />
              </Pressable>
              <Text style={[styles.title, {marginLeft:80}]}>
                Price 25€
              </Text>
            </View>

            <Payemant
              selectedCard={selectedCard}
              newreservation={newreservation}
              setNewreservation={setNewreservation}
              minPrice={minPrice}
              maxPrice={maxPrice}
              // setCurrentStep={setCurrentStep}
              initialState={initialState}
              setHasElevator={setHasElevator}
              setSwitchChecked={setSwitchChecked}
            />
          </View>
        );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={mapStyle} // Apply custom styling
        region={{
          latitude: 37.18,
          longitude: 10.11,
          latitudeDelta: 1.7,
          longitudeDelta: 0.45,
        }}>
        {/* {GeoJSONBounds?.features?.map((feature, index) =>
          feature?.geometry?.type === 'MultiPolygon'
            ? feature.geometry.coordinates.map((polygon, polygonIndex) => (
                <Polygon
                  key={`${index}-${polygonIndex}`}
                  coordinates={polygon[0].map(coord => ({
                    latitude: coord[1],
                    longitude: coord[0],
                  }))}
                  strokeColor="orange"
                  strokeWidth={3}
                  fillColor="rgba(255, 0, 0, 0.2)"
                />
              ))
            : feature.geometry.coordinates.map((polygon, polygonIndex) => (
                <Polygon
                  key={`${index}-${polygonIndex}`}
                  coordinates={polygon.map(coord => ({
                    latitude: coord[1],
                    longitude: coord[0],
                  }))}
                  strokeColor="orange"
                  strokeWidth={3}
                  fillColor="#ffbb8630"
                />
              )),
        )} */}
      </MapView>
      <View
        style={{
          height: 'auto',
          top: 20,
          backgroundColor: '#19191C',
          padding: 5,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#19191C',
          // Add borders using negative margin trick
          borderRightWidth: 5,
          borderBottomWidth: 5,
          borderTopWidth: 0,
          borderLeftWidth: 0,
        }}>
        {renderStep()}
      </View>
    </ScrollView>
  );
};

const mapStyle = [
  {
    featureType: 'all',
    stylers: [{saturation: 0}, {hue: '#e7ecf0'}],
  },
  {
    featureType: 'road',
    stylers: [{saturation: -70}],
  },
  {
    featureType: 'transit',
    stylers: [{visibility: 'off'}],
  },
  {
    featureType: 'poi',
    stylers: [{visibility: 'off'}],
  },
  {
    featureType: 'water',
    stylers: [{visibility: 'simplified'}, {saturation: -60}],
  },
];
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    backgroundColor: '#19191C',
    width: '100%',
  },
  estimationContainer: {
    backgroundColor: '#fff',
    width: '90%',
    flex: 0.73,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  // estimationContainerEs: {
  //   backgroundColor: '#fff',
  //   height: 370,
  //   width: '90%',
  //   flexGrow: 1,
  //   borderTopLeftRadius: 13,
  //   borderTopRightRadius: 13,
  //   alignSelf: 'center',
  //   marginBottom: 15,
  //   marginTop: 15,
  // },

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

    width: wp('80%'),
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  containerBtn: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  option: {
    flexDirection: 'row',
    backgroundColor: colors.general_2,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 5,
  },

  texte: {
    fontWeight: '700',
    color: colors.primary,
    fontSize: hp(2),
  },

  text: {
    fontWeight: '400',
    color: colors.secondary_1,
    fontSize: hp(1.8),
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
    fontWeight: '700',
    color: 'black',
  },
  countValue: {
    fontSize: hp(2),
    marginHorizontal: 10,
    color: colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    color: 'white',
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  autocompleteContainer: {
    flex: 1,
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  logo: {
    marginLeft: 10,
  },
  dateInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  timeInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 60,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 16,
  },
  timeSeparator: {
    marginHorizontal: 5,
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'end',
    alignSelf: 'flex-end',
  },
});

const placesStyles = {
  textInputContainer: {
    width: '100%',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  predefinedPlacesDescription: {
    color: '#1faadb',
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  detailsContainer: {
    marginLeft: 24, // Indent under the checkbox
    marginVertical: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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

    width: wp('80%'),
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  containerBtn: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  option: {
    flexDirection: 'row',
    backgroundColor: colors.general_2,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 5,
  },
  texte: {
    fontWeight: '700',
    color: colors.primary,
    fontSize: hp(2),
  },

  text: {
    fontWeight: '400',
    color: colors.secondary_1,
    fontSize: hp(1.8),
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
    fontWeight: '700',
    color: 'black',
  },
  countValue: {
    fontSize: hp(2),
    marginHorizontal: 10,
    color: colors.primary,
  },
};

export default MainScreen;
