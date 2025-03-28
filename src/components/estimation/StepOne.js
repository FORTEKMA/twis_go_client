/* eslint-disable react-hooks/exhaustive-deps */
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

import React, {useEffect, useState} from 'react';
import PickUpAdress from '../PickUpAdress';
import Divider from '../Divider';
import {Switch} from 'native-base';
import {colors} from '../../utils/colors';
import {Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import TimeDropDown from '../TimeDropDown';
import MinutesDropDown from '../MinutesDropDown';
import DatePopUp from '../DatePopUp';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const StepOne = ({
  date,
  handleDate,
  setNewreservation,
  newreservation,
  setInputErrors,
  inputerrors,
  showDatePicker,
  setShowDatePicker,
  setSwitchChecked,

  handleOptionSelect,
  switchChecked,
  count,
  handleIncrease,
  hasElevator,
  setHasElevator,
  handleDecrease,
  selectedOption,
  visible,
  setVisible,
  setDate,
}) => {
  const time = require('../../assets/Time.png');
  const arrow = require('../../assets/rightArrow.png');
  const access = require('../../assets/access.png');

  const [heur, setHeur] = useState('');
  const [minute, setMinute] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('06');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [outOfService, setOutOfService] = useState(false);

  const [dateFromApi, setDateFromApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date(dateFromApi);
  const currentHour = currentDate.getHours();
  const isDisabled = currentHour >= 17 || currentHour < 5;
  const twoHoursFromNow = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000);
  const minDate = new Date(twoHoursFromNow.getTime() + 1000);
  const [dateNow, setDateNow] = useState(null);
  useEffect(() => {
    const finalTime = heur + ':' + minute + ':00:000';
    if (heur && minute) {
      setNewreservation({
        ...newreservation,
        data: {...newreservation.data, deparTime: finalTime},
      });
    }
  }, [minute, heur]);
  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', {month: 'short'});
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const timeZoneOffset = date.getTimezoneOffset() / 60;
    const newDate = new Date(date.getTime() + timeZoneOffset * 60 * 60 * 1000);
    const timeZoneName = newDate.toString().match(/\(([^)]+)\)$/)[1];
    const formattedDate = `${newDate
      .toString()
      .substr(
        0,
        3,
      )} ${month} ${day} ${year} ${hours}:${minutes}:${seconds} GMT${
      timeZoneOffset > 0 ? '-' : '+'
    }${Math.abs(timeZoneOffset)}00 (${timeZoneName})`;
    return formattedDate;
  }
  const fetchTime = async () => {
    try {
      const response = await fetch(
        `http://worldtimeapi.org/api/timezone/Europe/Paris`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const resData = await response.json();
      console.log(resData?.datetime, 'fdfdfdfdfdfdfdfd');
      setDateNow(resData?.datetime);
      const formattedDateTime = formatDate(resData?.datetime);

      setDateFromApi(formattedDateTime);
    } catch (error) {
      console.error('Error fetching time:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTime();
  }, [handleSwitchChange]);

  const handleSwitchChange = value => {
    setOutOfService(isDisabled);
    if (value) {
      if (isDisabled) {
        setHeur('07');
        setMinute('00');

        const newDate = new Date();

        const departDate = new Date(newDate.toISOString().split('T')[0]);

        departDate.setDate(departDate.getDate() + 1);

        // Check if the selected time is before 00:00
        if (parseInt(departDate.getHours()) < 7) {
          // If before 00:00, add one more day
          departDate.setDate(departDate.getDate() - 1);
        }

        setNewreservation(prevReservation => ({
          ...prevReservation,
          data: {
            ...prevReservation.data,
            departDate: departDate.toISOString().split('T')[0],
            deparTime: '07:00:00:000',
          },
        }));
      } else {
        // Get the current date and time
        const currentDate = new Date(dateNow);
        console.log(currentDate);
        console.log(dateNow);
        // Set the departDate to today
        const departDate = currentDate.toISOString().split('T')[0];

        // Set the deparTime to the current time + 3 hours
        currentDate.setHours(currentDate.getHours() + 3);
        const deparTime = currentDate.toISOString().split('T')[1].split('Z')[0];

        // Split the time part by ':' to get hour, minutes, and seconds
        const hour = deparTime.split(':')[0];
        const minutes = deparTime.split(':')[1];

        // Assuming setHeur and setMinute are state-setting functions
        setHeur(hour);
        setMinute(minutes);

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

        setShowDatePicker(false);
      }
    } else {
      setNewreservation(prevReservation => ({
        ...prevReservation,
        data: {
          ...prevReservation.data,
          departDate: null,
          deparTime: null,
        },
      }));
      setHeur('');
      setMinute('');
    }
  };

  return (
    <View
      style={{
        flex: 1,
      }}>
      <PickUpAdress
        setNewreservation={setNewreservation}
        newReservation={newreservation}
        setInputErrors={setInputErrors}
      />
      {inputerrors.pickUpAddress && (
        <Text
          style={{
            color: 'red',
            fontWeight: '300',
            fontStyle: 'italic',
            fontSize: hp(1.5),
            marginBottom: 3,
          }}>
          {inputerrors.pickUpAddress}
        </Text>
      )}
      <View
      // nestedScrollEnabled={true}
      // keyboardShouldPersistTaps="always"
      // contentContainerStyle={{flexGrow: 1}}
      >
        {/*   <TouchableOpacity
            onPress={() => {
              setShowDatePicker(!showDatePicker);
              setSwitchChecked(false);
            }}>
            <View
              style={{
                paddingTop: 15,
                paddingBottom: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 23,
                  flexDirection: 'row',
                }}>
                <Image source={time} style={styles.pinIcon} />
                <Text style={styles.text}>Date de Dèpart</Text>
              </View>
              <Image source={arrow} style={styles.pinIcon} />
            </View>
          </TouchableOpacity>*/}
        {inputerrors.departDate && (
          <Text
            style={{
              color: 'red',
              fontWeight: '300',
              fontStyle: 'italic',
              marginBottom: 3,
            }}>
            {inputerrors.departDate}
          </Text>
        )}

        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            alignSelf: 'center',
            paddingHorizontal: 10,
          }}>
          <TimeDropDown
            hour={heur}
            setData={setHeur}
            newreservation={newreservation}
          />
          <MinutesDropDown minutes={minute} setData={setMinute} />
        </View>

        <View
          style={{
            alignSelf: 'flex-start',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 5,
          }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'flex-start',

              flexDirection: 'row',
            }}>
            <Switch
              size={Platform.OS === 'ios' ? 'sm' : 'md'}
              isChecked={switchChecked}
              onValueChange={value => {
                setSwitchChecked(value);
                handleSwitchChange(value);
              }}
              trackColor={{false: '#ccc', true: 'orange'}} // Gray when off, orange when on
              thumbColor={switchChecked ? 'darkorange' : '#fff'} // Dark orange when active
            />

            <Text
              style={{
                color: switchChecked ? colors.primary : 'grey', // Blue when switch is ON, Grey when OFF
                fontWeight: switchChecked ? '700' : '600',
              }}>
              Au plus tôt (dans 2h)
            </Text>
          </View>
          {outOfService && (
            <Text style={{color: 'grey', fontSize: hp(1.6)}}>
              Service indisponible de 22h à 6h.
            </Text>
          )}
        </View>
        {showDatePicker && (
          <DatePicker
            is24hourSource="locale"
            mode="datetime"
            locale="fr"
            date={date}
            onDateChange={handleDate}
            minimumDate={minDate}
            textColor="#26282b"
            style={{alignSelf: 'center'}}
          />
        )}

        <View
          style={{
            paddingTop: 5,
            paddingBottom: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: hp(1.5),
              flexDirection: 'row',
            }}>
            <Text style={styles.texte}>Accès</Text>
          </View>

          <View style={styles.containerBtn}>
            <Pressable
              style={{
                ...styles.option,
                ...(selectedOption === 'Au pied du camion'
                  ? {backgroundColor: colors.secondary}
                  : 'gray'),
              }}
              onPress={() => {
                handleOptionSelect('Au pied du camion', 0);
                setVisible(false);
                setInputErrors(prev => ({
                  ...prev,
                  pickUpAcces: '',
                }));
              }}>
              <Text
                style={{
                  color:
                    selectedOption === 'Au pied du camion'
                      ? colors.primary
                      : colors.text,
                  fontWeight:
                    selectedOption === 'Au pied du camion' ? '700' : '500',
                }}>
                Camion
              </Text>
            </Pressable>

            <Pressable
              style={{
                ...styles.option,
                ...(selectedOption === 'chez moi'
                  ? {backgroundColor: colors.secondary}
                  : 'gray'),
              }}
              onPress={() => {
                handleOptionSelect('chez moi', count); // You can pass the count here
                setVisible(true);
                setInputErrors(prev => ({
                  ...prev,
                  pickUpAcces: '',
                }));
              }}>
              <Text
                style={{
                  color:
                    selectedOption === 'chez moi'
                      ? colors.primary
                      : colors.text,
                  fontWeight: selectedOption === 'chez moi' ? '700' : '500',
                }}>
                Chez moi
              </Text>
            </Pressable>
          </View>
        </View>

        {/* {inputerrors.pickUpAcces && (
          <Text
            style={{
              color: 'red',
              fontWeight: '300',
              fontStyle: 'italic',
              marginBottom: 3,
            }}>
            {inputerrors.pickUpAcces}
          </Text> */}
        {/* )} */}
        <View style={{}}>
          {visible && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: hp(1),
                  marginBottom: 15,
                  marginTop: 10,
                }}>
                <TouchableOpacity
                  style={styles.yellowButton}
                  onPress={() => handleDecrease()}>
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.countValue}>
                  {count === 0 ? 'RDC' : count}
                </Text>
                <TouchableOpacity
                  style={styles.yellowButton}
                  onPress={() => handleIncrease()}>
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
              {count !== 0 && (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {/* <Switch
                      size={Platform.OS === 'ios' ? 'sm' : 'md'}
                      value={hasElevator}
                      onValueChange={value => {
                        setHasElevator(value);
                        handleOptionSelect(selectedOption, count, value);
                      }}
                    /> */}
                  <Switch
                    size={Platform.OS === 'ios' ? 'sm' : 'md'}
                    value={hasElevator}
                    onValueChange={value => {
                      setHasElevator(value);
                      handleOptionSelect(selectedOption, count, value);
                    }}
                    trackColor={{false: '#ccc', true: 'orange'}} // Gray when off, orange when on
                    thumbColor={hasElevator ? 'darkorange' : '#fff'} // Dark orange when active
                  />

                  <Text
                    style={{
                      color: hasElevator ? colors.primary : 'grey', // Blue when switch is ON, Grey when OFF
                      fontWeight: hasElevator ? '800' : '600',
                    }}>
                    Avec Ascenseur
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default StepOne;

const styles = StyleSheet.create({
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
});
