import React, { useState,useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing,I18nManager } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {calculateDistanceAndTime} from '../../../utils/CalculateDistanceAndTime';
import i18n from '../../../local';
import ConfirmButton from './ConfirmButton';
import { 
  trackBookingStepViewed,
  trackBookingStepCompleted,
  trackBookingStepBack,
  trackVehicleSelected
} from '../../../utils/analytics';

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
  const [selected, setSelected] = useState(formData.vehicleType||vehicleOptions[0]);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formData.selectedDate);
  const [tripDetails, setTripDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Track step view
  useEffect(() => {
    trackBookingStepViewed(3, 'Vehicle Selection');
  }, []);
  
  // New animation system
  const animations = useRef(
    vehicleOptions.map(() => ({
      slide: new Animated.Value(0),
      fade: new Animated.Value(1),
      pulse: new Animated.Value(1),
      glow: new Animated.Value(0)
    }))
  ).current;

  // Pulse animation function
  const startPulseAnimation = (index) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animations[index].pulse, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(animations[index].pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const animateSelection = (index) => {
    // Stop all pulse animations
    animations.forEach(anim => {
      anim.pulse.stopAnimation();
      anim.pulse.setValue(1);
    });

    // Create new animations for each option
    const newAnimations = vehicleOptions.map((_, i) => {
      const isSelected = i === index;
      
      return Animated.parallel([
        // Slide animation
        Animated.spring(animations[i].slide, {
          toValue: isSelected ? 0 : -10,
          useNativeDriver: true,
        //  friction: 8,
        //  tension: 40,
          speed: 12,
          bounciness: 8
        }),
        // Fade animation
        Animated.timing(animations[i].fade, {
          toValue: isSelected ? 1 : 0.7,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        // Glow animation
        Animated.timing(animations[i].glow, {
          toValue: isSelected ? 1 : 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]);
    });

    // Run all animations
    Animated.parallel(newAnimations).start(() => {
     
    });

    if (index !== -1) {
      startPulseAnimation(index);
    }
    
  };

  // Initialize animations
  useEffect(() => {
    const initialIndex = vehicleOptions.findIndex(opt => opt.id === selected.id);
    if (initialIndex !== -1) {
      animateSelection(initialIndex);
    }
  }, []);

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

  const handleVehicleSelect = (option, index) => {
    setSelected(option);
    animateSelection(index);
    
    // Track vehicle selection
    trackVehicleSelected(option, {
      vehicle_type: option.key,
      vehicle_id: option.id,
      step: 3
    });
  };

  const handleBack = () => {
    trackBookingStepBack(3, 'Vehicle Selection');
    goBack();
  };

  const handleConfirm = () => {
    trackBookingStepCompleted(3, 'Vehicle Selection', {
      vehicle_type: selected.key,
      vehicle_id: selected.id,
      has_scheduled_date: !!selectedDate,
      distance: tripDetails?.distance,
      time: tripDetails?.time
    });
    
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
        onPress={handleBack}
      >
        <MaterialCommunityIcons name={I18nManager.isRTL?"arrow-right": "arrow-left"} size={28} color="#030303" />
      </TouchableOpacity>
      <Text style={{ fontWeight: '700', fontSize: hp(2.2), color: '#030303', }}>{t('booking.step3.select_car')}</Text>

          </View>


          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 18 }}>
            {vehicleOptions.map((option, index) => {
              const glowColor = animations[index].glow.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(3, 3, 3, 0)', 'rgba(3, 3, 3, 0.15)']
              });

              return (
                <Animated.View
                  key={option.key}
                  style={{
                    flex: 1,
                    transform: [
                      { translateY: animations[index].slide },
                      { scale: animations[index].pulse }
                    ],
                   // opacity: animations[index].fade,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      backgroundColor: selected.id === option.id ? '#F6F6F6' : '#fff',
                      borderRadius: 14,
                      marginHorizontal: 6,
                      paddingVertical: 12,
                      borderWidth: selected.id === option.id ? 3 : 1,
                      borderColor: selected.id === option.id ? '#030303' : '#E0E0E0',
                    }}
                    onPress={() => handleVehicleSelect(option, index)}
                  >
                    <Animated.View
                      style={{
                        //backgroundColor: glowColor,
                        borderRadius: 12,
                        padding: 8,
                        marginBottom: 6
                      }}
                    >
                      <Image 
                        source={option.icon} 
                        style={{ 
                          width: 72, 
                        //  tintColor:selected.id === option.id ? '#030303' : '#BDBDBD',
                          height: 72,
                          resizeMode: "cover"
                        }} 
                      />
                    </Animated.View>
                    <Text style={{ fontWeight: '700', color: '#000', fontSize: hp(1.8) }}>{t(`booking.step3.${option.key}`)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                      <MaterialCommunityIcons name="account" size={14} color="#BDBDBD" style={{ marginRight: 4 }} />
                      <Text style={{ color: '#BDBDBD', fontSize: hp(1.4) }}>{option.nearby} {t('booking.step3.nearby')}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
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
           
            <ConfirmButton
           onPress={handleConfirm}
          text={t('booking.step3.book_now')}
          disabled={isLoading}
        />


          </View>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            confirmTextIOS={t("confirm")}
            cancelTextIOS={t("cancel")}
            display="spinner"
            minimumDate={new Date(Date.now() + 60 * 60 * 1000)}
            locale={i18n.language}
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