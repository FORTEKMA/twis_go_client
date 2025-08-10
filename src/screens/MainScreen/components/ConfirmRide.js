import React, { useEffect, useState, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, I18nManager, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { styles } from '../styles';
import api from "../../../utils/api"
import Toast from 'react-native-toast-message';
import WomanValidationModal from './WomanValidationModal';
import LoginModal from '../../LoginModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { calculatePrice } from '../../../utils/CalculateDistanceAndTime';
import { 
  trackBookingStepViewed,
  trackBookingStepCompleted,
  trackBookingStepBack,
  trackRideConfirmed
} from '../../../utils/analytics';

const ConfirmRideComponent = ({ goBack, formData, rideData, goNext, handleReset }) => {
  const { t, i18n: i18nInstance } = useTranslation();
  const user = useSelector(state => state.user.currentUser);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWomanValidationModal, setShowWomanValidationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [womanValidationForm, setWomanValidationForm] = useState({
    user_with_cin: null,
    cinFront: null,
    cinBack: null,
  });
  const [womanValidationLoading, setWomanValidationLoading] = useState(false);
 
  // Get vehicle info from formData
  const getVehicleInfo = () => {
    if (!formData?.vehicleType) {
      return null;
    }
    
    const vehicle = formData.vehicleType;
    return {
      icon: vehicle.icon ,
      label: vehicle.label || getLocalizedName(vehicle),
      description: vehicle.description || getDefaultDescription(vehicle.id)
    };
  };

  // Get localized name based on current language
  const getLocalizedName = (vehicle) => {
    const currentLang = i18nInstance.language;
    switch (currentLang) {
      case 'ar':
        return vehicle.name_ar || vehicle.name_en || 'Vehicle';
      case 'fr':
        return vehicle.name_fr || vehicle.name_en || 'Vehicle';
      default:
        return vehicle.name_en || 'Vehicle';
    }
  };

 

  // Get default description based on vehicle ID
  const getDefaultDescription = (vehicleId) => {
    switch (vehicleId) {
      case 1:
        return 'eco_description';
      case 2:
        return 'berline_description';
      case 3:
        return 'van_description';
      default:
        return 'eco_description';
    }
  };

  // Track step view
  useEffect(() => {
    trackBookingStepViewed(4, 'Ride Confirmation');
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
      
        const response = await calculatePrice(formData)
        setPrice(response.price);
        setLoading(false);
      } catch (error) {
        console.log(error)
        goBack()
        setLoading(false);
      }
    
    }
    getData();
  }, [rideData]);

  const splitDateTime=(isoString)=> {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const departDate = `${year}-${month}-${day}`;
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    const departTime = `${hours}:${minutes}:${seconds}.${milliseconds}`;
  
    return { departDate, deparTime: departTime };
  }

  const handleBack = () => {
    trackBookingStepBack(4, 'Ride Confirmation');
    goBack();
  };

  const handleConfirm = () => {
    // If 'for women' vehicle (id=4), enforce validation here instead of selection screen
    if (formData?.vehicleType?.id === 4) {
      if (!user) {
        setShowLoginModal(true);
        return;
      }
      if (user?.womanValidation?.validation_state === 'valid') {
        // continue
      } else if (user?.womanValidation?.validation_state === 'waiting') {
        Toast.show({
          type: 'info',
          text1: t('choose_vehicle.account_under_validation', 'Your account is under validation.'),
          visibilityTime: 2500,
        });
        return;
      } else if (!user?.womanValidation) {
        setShowWomanValidationModal(true);
        return;
      } else {
        Toast.show({
          type: 'info',
          text1: t('choose_vehicle.must_complete_women_validation', 'You must complete the women validation process to select this vehicle.'),
          visibilityTime: 2500,
        });
        return;
      }
    }
    trackBookingStepCompleted(4, 'Ride Confirmation', {
      price: price,
      distance: formData.distance,
      time: formData.time,
      vehicle_type: formData?.vehicleType?.key,
      has_scheduled_date: !!formData.selectedDate
    });
    goNext({ price });
  };

  const handleReservation = async () => {
    // Enforce women validation here as well for scheduled rides
    if (formData?.vehicleType?.id === 4) {
      if (!user) {
        setShowLoginModal(true);
        return;
      }
      if (user?.womanValidation?.validation_state === 'valid') {
        // continue
      } else if (user?.womanValidation?.validation_state === 'waiting') {
        Toast.show({
          type: 'info',
          text1: t('choose_vehicle.account_under_validation', 'Your account is under validation.'),
          visibilityTime: 2500,
        });
        return;
      } else if (!user?.womanValidation) {
        setShowWomanValidationModal(true);
        return;
      } else {
        Toast.show({
          type: 'info',
          text1: t('choose_vehicle.must_complete_women_validation', 'You must complete the women validation process to select this vehicle.'),
          visibilityTime: 2500,
        });
        return;
      }
    }
    try {
      setIsLoading(true);
      const payload = {
        payType: "Livraison",
        commandStatus: "Pending",
        totalPrice: price,
        distance: formData.distance,
        ...splitDateTime(formData.selectedDate),
      
        duration: formData.time,
        isAccepted: false,
        client: {
          id: user.id
        },
        carType:formData?.vehicleType.id,
        pickUpAddress: {
          Address: formData?.pickupAddress?.address || "Livraison",
          coordonne: {
            longitude: formData?.pickupAddress?.longitude || "17",
            latitude: formData?.pickupAddress?.latitude || "17",
          },
        },
        dropOfAddress: {
          Address: formData?.dropAddress?.address || "Livraison",
          coordonne: {
            longitude: formData?.dropAddress?.longitude || "17",
            latitude: formData?.dropAddress?.latitude || "17",
          },
        }
      }
      const res = await api.post("/commands", { data: payload });
      
      // Track successful reservation
      trackRideConfirmed({
        ...formData,
        price: price,
        reservation_id: res.data?.id
      });
      
      setShowSuccessModal(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[localStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#030303" />
      </View>
    );
  }

  const vehicleInfo = getVehicleInfo();

  // Show error if no vehicle info is available
  if (!vehicleInfo) {
    return (
      <View style={[localStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="car-off" size={48} color="#BDBDBD" />
        <Text style={{ fontSize: hp(1.8), color: '#030303', marginTop: 15, textAlign: 'center' }}>
          Vehicle information not available
        </Text>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      {/* Header */}
      <View style={{ gap: 10, marginBottom: 18, marginTop: 10, flexDirection: 'row', alignItems: 'center', width: "100%" }}>
        <TouchableOpacity
          style={{ backgroundColor: '#fff', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
          onPress={handleBack}
        >
          <MaterialCommunityIcons name={I18nManager.isRTL?"arrow-right":"arrow-left"} size={28} color="#030303" />
        </TouchableOpacity>
        <Text style={{ fontWeight: '700', fontSize: hp(2.2), color: '#030303', }}>{t('booking.step4.confirm_ride')}</Text>
      </View>

      {/* Car Type Card */}
      <View style={localStyles.card}>
        <View style={localStyles.row}>
           <Image source={vehicleInfo.icon} style={{ width: 70, height: 70, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={localStyles.carType}>{vehicleInfo.label}</Text>
            <Text style={localStyles.carDescription}>{t(vehicleInfo.description)}</Text>
          </View>
        </View>
      </View>

      {/* Pickup & Dropoff */}
      <View style={localStyles.infoCard}>
      <View style={localStyles.pickupDropRow}>

      <View style={{ 
     
      width: 20, 
      height: 20, 
      borderRadius: 10,
      backgroundColor: '#030303',
      borderWidth: 2,
      borderColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal:4
 
    }}>
      <View style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white'
      }} />
    </View>
        <View>
        <Text style={localStyles.label}>{t('pickup_point')}</Text>
        <Text style={localStyles.boldText} numberOfLines={1} >{formData?.pickupAddress?.address}</Text>
        </View>
        
      

      </View>

      <View style={localStyles.verticalLine} />

      <View style={[localStyles.pickupDropRow,{marginTop:30,}]}>

      <View style={{ 
    marginLeft:5,
    marginRight:10,
    width: 20, 
    height: 20, 
    backgroundColor: '#030303',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    //marginTop:20
  }}>
    <View style={{
      width: 8,
      height: 8,
      backgroundColor: 'white'
    }} />
  </View>

  <View>
  <Text style={localStyles.label}>{t('pick_off')}</Text>
    <Text style={localStyles.boldText} numberOfLines={1}>{formData?.dropAddress?.address}</Text>
  </View>
  


</View>


      </View>

      {/* Scheduled Date Card - Show only if selectedDate exists */}
      {formData?.selectedDate && (
        <View style={localStyles.dateCard}>
          <View style={localStyles.dateRow}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color="#030303" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={localStyles.dateLabel}>{t('scheduled_date')}</Text>
              <Text style={localStyles.dateText}>
                {new Date(formData.selectedDate).toLocaleDateString(i18nInstance.language === 'ar' ? 'ar-TN' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <MaterialCommunityIcons name="check-circle" size={60} color="#4CAF50" />
            <Text style={localStyles.modalTitle}>{t('success')}</Text>
            <Text style={localStyles.modalText}>{t('common.reservation_created_success')}</Text>
            <TouchableOpacity 
              style={localStyles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                handleReset();
              }}
            >
              <Text style={localStyles.modalButtonText}>{t('ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Next Button */}
      <TouchableOpacity 
        style={[localStyles.nextButtonWrapper, isLoading && localStyles.disabledButton]} 
        onPress={() => formData?.selectedDate != undefined ? handleReservation() : handleConfirm()}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={localStyles.nextButtonPrice}>{parseFloat(price).toFixed(2)} DT</Text>
            <Text style={localStyles.nextButtonText}>{t('common.confirm')}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Price Information */}
      {formData?.selectedDate && (
        <View style={localStyles.priceInfoCard}>
          <View style={localStyles.priceInfoRow}>
            <MaterialCommunityIcons name="information" size={16} color="#6c757d" />
            <Text style={localStyles.priceInfoText}>
              {t('price_includes_reservation', { 
                amount: parseFloat(formData.vehicleType.reservation_price).toFixed(2) 
              })}
            </Text>
          </View>
        </View>
      )}
      <WomanValidationModal
        visible={showWomanValidationModal}
        onClose={() => setShowWomanValidationModal(false)}
        onSubmit={() => {
          setWomanValidationLoading(true);
          // TODO: handle submit logic (API call)
          setTimeout(() => {
            setWomanValidationLoading(false);
            setShowWomanValidationModal(false);
            Toast.show({
              type: 'success',
              text1: 'Validation info submitted! Your account is under review.',
              visibilityTime: 2500,
            });
          }, 1200);
        }}
        form={womanValidationForm}
        setForm={setWomanValidationForm}
        loading={womanValidationLoading}
      />
      <LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} />
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
   // shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
 //   borderLeftWidth: 4,
  //  borderLeftColor: '#030303',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    color: '#BDBDBD',
    fontSize: hp(1.5),
    fontWeight: '400',
    textAlign:  "left",
  },
  dateText: {
    color: '#030303',
    fontWeight: '600',
    fontSize: hp(1.8),
    marginTop: 2,
    textAlign:  "left",
  },
  priceInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  priceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInfoText: {
    fontSize: hp(1.5),
    color: '#6c757d',
    fontWeight: '400',
    marginLeft: 8,

    textAlign:  "left",
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carType: {
    fontWeight: '700',
    fontSize: hp(2.2),
    color: '#030303',
    textAlign:"left",
  },
  carDescription: {
    color: '#BDBDBD',
    fontSize: hp(1.7),
    marginTop: 2,
    textAlign:"left",

  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  pickupDropRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  //  marginBottom: 10,
  },
  label: {
    color: '#BDBDBD',
    fontSize: hp(1.5),
    fontWeight: '400',
    textAlign:"left",
     
  },
  boldText: {
    color: '#030303',
    fontWeight: '700',
    fontSize: hp(2),

  },
  verticalLine: {
    width: 2,
    height: 54,
    backgroundColor: '#030303',
      
    position:"absolute",
    top:55,
    left:32,
    marginBottom: 10,
  },
  nextButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030303',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    marginTop: 8,
    shadowColor: '#030303',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonPrice: {
    color: '#fff',
    fontWeight: '700',
    fontSize: hp(2.2),
    marginRight: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: hp(2.2),
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    color: '#030303',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: hp(1.8),
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#030303',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  modalButtonText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default memo(ConfirmRideComponent); 