import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator ,Image} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { styles } from '../styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { calculatePrice } from '../../../utils/CalculateDistanceAndTime';
const vehicleOptions = [
  {
    key: 'eco',
    label: 'Éco',
    nearby: 4,
    icon:require('../../../assets/TawsiletEcoCar.png'),
    id:1,
    description:'eco_description'
  },
  {
    key: 'berline',
    label: 'Berline',
    nearby: 4,
    icon:require('../../../assets/TawsiletBerlineCar.png'),
    id:2,
    description:'berline_description'
  },
  {
    key: 'van',
    label: 'Van',
    nearby:7,
    icon:require('../../../assets/TawsiletVanCar.png'),
    id:3,
    description:'van_description'
  },
];
const Step3 = ({ goBack, formData, rideData, goNext }) => {
  const { t } = useTranslation();
  const user = useSelector(state => state.user.currentUser);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const response = await calculatePrice(formData)
      setPrice(response.price);
      setLoading(false);
    }
    getData();
  }, [rideData]);

  if (loading) {
    return (
      <View style={[localStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F9DC76" />
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      {/* Header */}
      <View style={{ gap: 10, marginBottom: 18, marginTop: 10, flexDirection: 'row', alignItems: 'center', width: "100%" }}>
        <TouchableOpacity
          style={{ backgroundColor: '#fff', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
          onPress={goBack}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#19191C" />
        </TouchableOpacity>
        <Text style={{ fontWeight: '700', fontSize: hp(2.2), color: '#19191C', }}>{t('booking.step4.confirm_ride')}</Text>
      </View>

      {/* Car Type Card */}
      <View style={localStyles.card}>
        <View style={localStyles.row}>
           <Image source={vehicleOptions[formData?.vehicleType?.id].icon} style={{ width: 70, height: 70, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={localStyles.carType}>{vehicleOptions[formData?.vehicleType?.id].label}</Text>
            <Text style={localStyles.carDescription}>{t(vehicleOptions[formData?.vehicleType?.id].description)}</Text>
          </View>
        </View>
      </View>

      {/* Pickup & Dropoff */}
      <View style={localStyles.infoCard}>
        <View style={localStyles.pickupDropRow}>
          <MaterialCommunityIcons name="map-marker" size={22} color="#F9DC76" style={{ marginRight: 8 }} />
          <View>
            <Text style={localStyles.label}>{t('pickup_point')}</Text>
            <Text style={localStyles.boldText}>{formData?.pickupAddress?.address}</Text>
          </View>
        </View>
        <View style={localStyles.verticalLine} />
        <View style={localStyles.pickupDropRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={22} color="#BDBDBD" style={{ marginRight: 8 }} />
          <View>
            <Text style={localStyles.label}>{t('pick_off')}</Text>
            <Text style={localStyles.boldText}>{formData?.dropAddress?.address}</Text>
          </View>
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={localStyles.nextButtonWrapper} onPress={() => goNext({ price })}>
        
          <Text style={localStyles.nextButtonPrice}>{parseFloat(price).toFixed(2)} DT</Text>
          <Text style={localStyles.nextButtonText} >{t('go_to_payment')}</Text>
      
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
    color: '#19191C',
  },
  carDescription: {
    color: '#BDBDBD',
    fontSize: hp(1.7),
    marginTop: 2,
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  label: {
    color: '#BDBDBD',
    fontSize: hp(1.5),
    fontWeight: '400',
  },
  boldText: {
    color: '#19191C',
    fontWeight: '700',
    fontSize: hp(2),
  },
  verticalLine: {
    width: 2,
    height: 18,
    backgroundColor: '#F9DC76',
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 10,
  },
  nextButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9DC76',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    marginTop: 8,
    shadowColor: '#F9DC76',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonPrice: {
    color: '#19191C',
    fontWeight: '700',
    fontSize: hp(2.2),
    marginRight: 16,
  },
  nextButtonText: {
    color: '#19191C',
    fontWeight: '700',
    fontSize: hp(2.2),
    letterSpacing: 0.5,
  },
});

export default Step3; 