import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, I18nManager, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { styles } from '../styles';
import api from "../../../utils/api"
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { calculatePrice } from '../../../utils/CalculateDistanceAndTime';
import { 
  trackBookingStepViewed,
  trackBookingStepCompleted,
  trackBookingStepBack,
  trackRideConfirmed
} from '../../../utils/analytics';

const vehicleOptions = 
{
1:  {
    key: 'eco',
    label: 'Éco',
    nearby: 4,
    icon:require('../../../assets/TawsiletEcoCar.png'),
    id:1,
    description:'eco_description'
  },
 2: {
    key: 'berline',
    label: 'Berline',
    nearby: 4,
    icon:require('../../../assets/TawsiletBerlineCar.png'),
    id:2,
    description:'berline_description'
  },
3:  {
    key: 'van',
    label: 'Van',
    nearby:7,
    icon:require('../../../assets/TawsiletVanCar.png'),
    id:3,
    description:'van_description'
  },
};
const Step3 = ({ goBack, formData, rideData, goNext, handleReset }) => {
  const { t } = useTranslation();
  const user = useSelector(state => state.user.currentUser);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
           <Image source={vehicleOptions[formData?.vehicleType?.id].icon} style={{ width: 70, height: 70, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={localStyles.carType}>{t(`booking.step3.${vehicleOptions[formData?.vehicleType?.id].key}`)}</Text>
            <Text style={localStyles.carDescription}>{t(vehicleOptions[formData?.vehicleType?.id].description)}</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carType: {
    fontWeight: '700',
    fontSize: hp(2.2),
    color: '#030303',
    textAlign:I18nManager.isRTL?"left":"left",
  },
  carDescription: {
    color: '#BDBDBD',
    fontSize: hp(1.7),
    marginTop: 2,
    textAlign:I18nManager.isRTL?"left":"left",

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
    textAlign:I18nManager.isRTL?"left":"left",
     
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

export default Step3; 