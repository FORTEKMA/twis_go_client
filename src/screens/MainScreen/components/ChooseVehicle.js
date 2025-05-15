import React, { useState,useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import MapHeader from './MapHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {calculateDistanceAndTime} from '../../../utils/CalculateDistanceAndTime';
const vehicleOptions = [
  {
    key: 'eco',
    label: 'Éco',
    nearby: 4,
    icon:require('../../../assets/TawsiletEcoCar.png'),
    id:1
  },
  {
    key: 'berline',
    label: 'Berline',
    nearby: 4,
    icon:require('../../../assets/TawsiletBerlineCar.png'),
    id:2
  },
  {
    key: 'van',
    label: 'Van',
    nearby:7,
    icon:require('../../../assets/TawsiletVanCar.png'),
    id:3
  },
];

const ChooseVehicle = ({ goNext, goBack, formData }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(formData.vehicleType||vehicleOptions[1]);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formData.selectedDate);
  const [tripDetails, setTripDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  useEffect(()=>{
    setIsLoading(true);
    calculateDistanceAndTime(formData.pickupAddress,formData.dropAddress).then(res=>{
      setTripDetails(res);
      goNext(res,false);
      setIsLoading(false);
    })
  },[])
  
 

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
   
  };


  const onConfirm = () => {
    goNext({
      vehicleType: selected,
      selectedDate: selectedDate,
    });
  };



  return (
     
      <View style={localStyles.container}>
        <View style={{
          
        }}>

          <View style={{gap:10, marginBottom: 18, marginTop: 10 ,flexDirection: 'row', alignItems: 'center',width:"100%" }}>
          <TouchableOpacity
        style={{  backgroundColor: '#fff', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
        onPress={goBack}
      >
        <MaterialCommunityIcons name="arrow-left" size={28} color="#19191C" />
      </TouchableOpacity>
      <Text style={{ fontWeight: '700', fontSize: hp(2.2), color: '#19191C', }}>{t('booking.step3.select_car')}</Text>

          </View>


          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 18 }}>
            {vehicleOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  backgroundColor: selected.id === option.id ? '#F6F6F6' : '#fff',
                  borderRadius: 14,
                  marginHorizontal: 6,
                  paddingVertical: 12,
                  borderWidth: selected.id === option.id ? 2 : 1,
                  borderColor: selected.id === option.id ? '#F9DC76' : '#E0E0E0',
                  shadowColor: selected.id === option.id ? '#F9DC76' : 'transparent',
                  shadowOpacity: selected.id === option.id ? 0.15 : 0,
                  shadowRadius: 6,
                  elevation: selected.id === option.id ? 2 : 0,
                }}
                onPress={() => setSelected(option)}
              >
                <Image source={option.icon} style={{ width: 72, height: 72, marginBottom: 6,resizeMode:"cover" }} />
                <Text style={{ fontWeight: '700', color: '#19191C', fontSize: hp(1.8) }}>{t(`booking.step3.${option.key}`)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 2  }}>
                  <MaterialCommunityIcons name="account" size={14} color="#BDBDBD" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#BDBDBD', fontSize: hp(1.4),}}>{option.nearby} {t('booking.step3.nearby')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '95%', backgroundColor: '#F6F6F6', borderRadius: 12, padding: 12, marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="map-marker" size={18} color="#BDBDBD" style={{ marginRight: 4 }} />
              <Text style={{ color: '#BDBDBD', fontSize: hp(1.6) }}>{ isLoading ? "..." : (tripDetails?.distance/1000).toFixed(2)+" km"}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#BDBDBD" style={{ marginRight: 4 }} />
              <Text style={{ color: '#BDBDBD', fontSize: hp(1.6) }}>{ isLoading ? "..." : tripDetails?.time}</Text>
            </View>
            {selectedDate && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="calendar" size={18} color="#BDBDBD" style={{ marginRight: 4 }} />
                <Text style={{ color: '#BDBDBD', fontSize: hp(1.6) }}>{ isLoading ? "..." : formatDate(selectedDate)}</Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8, alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#CCC',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
                flexDirection: 'row',
              }}
              onPress={showDatePicker}
            >
              <MaterialCommunityIcons name="clock-outline" size={24} color="#AAA" />
            </TouchableOpacity>
            <TouchableOpacity
            disabled={isLoading}
              style={{
                opacity: isLoading ? 0.5 : 1,
                flex: 1,
                backgroundColor: '#F9DC76',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: '#F9DC76',
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={onConfirm}
            >
              <Text style={{ color: '#19191C', fontWeight: '700', fontSize: hp(2.2) }}>{t('booking.step3.book_now')}</Text>
            </TouchableOpacity>
          </View>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            display="spinner"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
          />
        </View>
      </View>
  
  );
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    margin: 16,
    
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  
  },
});
export default ChooseVehicle; 