/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Switch,
  PermissionsAndroid,
  Pressable,
  KeyboardAvoidingView,
  Image,
  Alert,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import {colors} from '../utils/colors';
import {useSelector} from 'react-redux';
import Payemant from '../components/Payemant';
import polyline from '@mapbox/polyline';
import {getAddressFromCoordinates} from '../utils/helpers/mapUtils';
import WaveCircle from '../components/WaveCircle';
import SendingRequests from '../components/SendingRequests';

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
    selectedDate: null,
    pickup: {
      address: '',
      latitude: null,
      longitude: null,
    },
    drop: {
      address: '',
      latitude: null,
      longitude: null,
    },
  });

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      async position => {
        // Make the callback function async
        try {
          const address = await getAddressFromCoordinates(
            position.coords.latitude,
            position.coords.longitude,
          );

          setFormData(prev => ({
            ...prev,
            useCurrentLocation: true,
            pickup: {
              address: JSON.stringify(address), // Use the address from the geocoding function
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
        } catch (error) {
          console.log('Error fetching address:', error);
        }
      },
      error => console.log(error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );

    setStep(2);
  };
  const GOOGLE_LOGO =
    'https://i.pinimg.com/564x/7a/62/ec/7a62ecaa696f10c3b1c9b88eede32e79.jpg';
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date());
  const [selectedCard, setSelectedCard] = useState(1);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [newreservation, setNewreservation] = useState(initialState);
  const current = useSelector(state => state?.user?.currentUser);
  const objet = useSelector(state => state.objects?.objects?.data);
  const initialState = useSelector(state => state?.commandes?.newCommande);
  const [hasElevator, setHasElevator] = useState(false);
  const [currentStep, setCurrentStep] = useState('pickup'); // 'pickup' or 'drop'
  const [canSelectLocation, setCanSelectLocation] = useState(true);
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
    const now = new Date();
    console.log(selectedDate, selectedDate < now, now);
    if (selectedDate < now) {
      Alert.alert('Invalid Date', "You can't select a date/time in the past.");
      setDatePickerVisibility(false);

      return;
    }
    setFormData(prev => ({
      ...prev,
      selectedDate: selectedDate, // replace `newDate` with your actual date
    }));

    setDate(selectedDate);
    hideDatePicker();
  };

  // Handle switch toggle
  const toggleSwitch = () => {
    setIsSwitchOn(previousState => !previousState);
  };
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
                  {/* You can add checkboxes or other fields here if needed */}
                </View>

                <View style={styles.currentLocation}>
                  <GooglePlacesAutocomplete
                    placeholder="Type the address..."
                    fetchDetails
                    onPress={(data, details = null) => {
                      if (details) {
                        setFormData(prev => ({
                          ...prev,
                          pickup: {
                            address: JSON.stringify(data.description),
                            latitude: parseFloat(
                              JSON.stringify(details?.geometry?.location?.lat),
                            ),
                            longitude: parseFloat(
                              JSON.stringify(details?.geometry?.location?.lng),
                            ),
                          },
                        }));
                      }
                    }}
                    query={{
                      key: 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE',
                      language: 'fr',
                      components: 'country:tn',
                      location: '36.8,10.1',
                      radius: 30000,
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
                        style={{
                          paddingLeft: 10,
                          justifyContent: 'center',
                        }}>
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
                  {/* Add additional fields (time, notes, etc.) here */}
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
              onPress={() => {
                if (formData.pickup.latitude) {
                  setStep(2);
                  setCurrentStep('drop'); // After pickup, switch to drop
                } else {
                  Alert.alert('pick location');
                }
              }}>
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
                <GooglePlacesAutocomplete
                  placeholder="Search"
                  fetchDetails={true} // this is required to get lat/lng
                  onPress={(data, details = null) => {
                    if (details) {
                      setFormData(prev => ({
                        ...prev,
                        drop: {
                          address: JSON.stringify(data.description),
                          latitude: parseFloat(
                            JSON.stringify(details?.geometry?.location?.lat),
                          ),
                          longitude: parseFloat(
                            JSON.stringify(details?.geometry?.location?.lng),
                          ),
                        },
                      }));
                    }
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
                onPress={() => {
                  if (formData.drop.latitude) {
                    setStep(3);
                    setCanSelectLocation(false);
                    fetchRoute();
                  } else {
                    Alert.alert('pick location');
                  }
                }}>
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
                <Pressable onPress={() => setStep(4)}>
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
                        {formatDate(date)}
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
                        {formData.pickup.address}
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
                        {formData.drop.address}
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
            style={{backgroundColor: '#19191C', height: 'auto', width: '100%'}}>
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
                    alignSelf: 'flex-start',
                    left: 0,
                    top: 10,
                  }}
                />
              </Pressable>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                }}>
                <Text style={styles.title}>Price 25€</Text>
              </View>
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
  console.log(formData, 'formData====');
  const [routeCoords, setRouteCoords] = useState([]);

  const fetchRoute = async () => {
    const origin = `${formData.pickup.latitude},${formData.pickup.longitude}`;
    const destination = `${formData.drop.latitude},${formData.drop.longitude}`;
    const API_KEY = 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE'; // Replace this

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&departure_time=now&mode=driving&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.routes.length) {
      const points = polyline.decode(data.routes[0].overview_polyline.points);
      const coords = points.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));
      setRouteCoords(coords);
    }
  };

  useEffect(() => {
    if (isSwitchOn) {
      setFormData(prev => ({
        ...prev,
        selectedDate: new Date(),
      }));
    }
  }, [isSwitchOn]);
  //////////////////////36.80557596268572, 10.180696783260366

  const mapRef = useRef(null);
  const hasAnimatedRef = useRef(false); // 🚫 Prevent multiple animations

  const [mapRegion, setMapRegion] = useState({
    latitude: 36.80557596268572,
    longitude: 10.180696783260366,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    if (
      !formData?.pickup?.latitude ||
      !formData?.pickup?.longitude ||
      !mapRef.current
    ) {
      return;
    }

    const initialRegion = {
      latitude: formData.pickup.latitude,
      longitude: formData.pickup.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    // Update state with tight zoom
    setMapRegion(initialRegion);

    // Animate map view to that region
    mapRef.current.animateToRegion(initialRegion, 500);

    const maxDelta = 0.01;
    const step = 0.0001;
    let currentDelta = 0.005;
    let animationFrame;

    const animate = () => {
      if (currentDelta >= maxDelta || !mapRef.current) return;

      currentDelta += step;

      const newRegion = {
        latitude: formData.pickup.latitude,
        longitude: formData.pickup.longitude,
        latitudeDelta: currentDelta,
        longitudeDelta: currentDelta,
      };

      setMapRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 150);

      animationFrame = setTimeout(animate, 800); // not too frequent
    };

    if (
      formData?.drop?.latitude &&
      formData?.drop?.longitude &&
      routeCoords.length === 0
    ) {
      animationFrame = setTimeout(animate, 600); // small delay before zooming out
      hasAnimatedRef.current = true;
    }

    return () => {
      if (animationFrame) clearTimeout(animationFrame);
    };
  }, [
    formData?.pickup?.latitude,
    formData?.pickup?.longitude,
    formData?.drop?.latitude,
    formData?.drop?.longitude,
    routeCoords,
  ]);

  const getAddressFromCoords = async ({latitude, longitude}) => {
    try {
      const apiKey = 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE'; // replace with yours
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return '';
    } catch (error) {
      console.error('Geocoding failed:', error);
      return '';
    }
  };

  return (
    <View style={{flex: 1}}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject} // Map takes up the full screen
        customMapStyle={mapStyle}
        zoomEnabled
        focusable
        region={mapRegion}
        onPress={async e => {
          if (!currentStep) return;

          const coord = e.nativeEvent.coordinate;
          const address = await getAddressFromCoords(coord);
          if (currentStep === 'pickup') {
            setFormData(prev => ({
              ...prev,
              pickup: {
                latitude: coord.latitude,
                longitude: coord.longitude,
                address: address,
              },
            }));
          } else if (currentStep === 'drop') {
            setFormData(prev => ({
              ...prev,
              drop: {
                latitude: coord.latitude,
                longitude: coord.longitude,
                address,
              },
            }));
          }
        }}
        // 👈 Capture tap
      >
        {formData.pickup.latitude && (
          <Marker
            draggable
            onDragEnd={async e => {
              const newCoord = e.nativeEvent.coordinate;
              const address = await getAddressFromCoords(newCoord);
              setFormData(prev => ({
                ...prev,
                pickup: {
                  latitude: newCoord.latitude,
                  longitude: newCoord.longitude,
                  address: address,
                },
              }));
            }}
            coordinate={formData.pickup}
            title="Location"
            anchor={{x: 0.5, y: 0.5}} // Center the marker
          >
            {formData.drop.latitude && routeCoords.length === 0 ? (
              <View
                style={{
                  width: 120,
                  height: 120,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <WaveCircle />
              </View>
            ) : (
              <TouchableWithoutFeedback>
                <Image
                  source={require('../assets/A_Tawsilet.png')}
                  style={{width: 80, height: 80}}
                  resizeMode="contain"
                />
              </TouchableWithoutFeedback>
            )}
          </Marker>
        )}
        {routeCoords.length > 0 && (
          <>
            {/* Start Marker */}

            {/* End Marker */}
            <Marker
              coordinate={formData.drop}
              title="Destination"
              draggable
              onDragEnd={async e => {
                const newCoord = e.nativeEvent.coordinate;
                const address = await getAddressFromCoords(newCoord);
                setFormData(prev => ({
                  ...prev,
                  drop: {
                    latitude: newCoord.latitude,
                    longitude: newCoord.longitude,
                    address: address,
                  },
                }));
              }}>
              <TouchableWithoutFeedback>
                <Image
                  source={require('../assets/B_Tawsilet.png')}
                  style={{width: 80, height: 80}}
                  resizeMode="contain"
                />
              </TouchableWithoutFeedback>
            </Marker>

            {/* Straight-line Route */}
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor="black"
            />
          </>
        )}
      </MapView>
      <SendingRequests formData={formData} price={100} />
      {/* Content Below Map */}
      <View
        style={{
          position: 'absolute', // Position content on top of the map
          top: '2%', // Push content to the bottom
          left: 0,
          right: 0,
          backgroundColor: '#19191C',
          padding: 5,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
          borderBottomLeftRadius: 10,
        }}>
        {renderStep()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    backgroundColor: '#19191C',
    width: '100%',
    marginBottom: 5,
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
  markerContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});
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
