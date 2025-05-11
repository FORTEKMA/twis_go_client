import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { styles } from '../styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import api from '../../../utils/api';
const Step4 = ({ goBack,formData,rideData,goNext  }) => {
 
  const { t } = useTranslation();
  const user = useSelector(state => state.user.currentUser);
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/commands/${rideData?.commande?.documentId}?populate[0]=driver&populate[1]=driver.profilePicture&populate[2]=driver.vehicule`).then(res => {
      setCommande(res.data.data);
      setLoading(false);
    }).catch(error => {
      setLoading(false);
    });
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
      {/* Driver Card */}
      <View style={{gap:10, marginBottom: 18, marginTop: 10 ,flexDirection: 'row', alignItems: 'center',width:"100%" }}>
          <TouchableOpacity
        style={{  backgroundColor: '#fff', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
        onPress={goBack}
      >
        <MaterialCommunityIcons name="arrow-left" size={28} color="#19191C" />
      </TouchableOpacity>
      <Text style={{ fontWeight: '700', fontSize: hp(2.2), color: '#19191C', }}>{t('booking.step4.confirm_ride')}</Text>

          </View>
      <View style={localStyles.card}>
        <View style={localStyles.row}>
          <Image source={{ uri: commande?.driver?.profilePicture?.url }} style={localStyles.avatar} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={localStyles.driverName}>{t('driver_name', { name: commande?.driver?.firstName })}</Text>
            <Text style={localStyles.car}>{t('car_model', { model: commande?.driver?.vehicule?.model })}</Text>
            <View style={localStyles.plateRow}>
              <MaterialCommunityIcons name="car" size={18} color="#19191C" style={{ marginRight: 4 }} />
              <Text style={localStyles.plate}>{commande?.driver?.vehicule?.matriculation}</Text>
            </View>
          </View>
          <View style={localStyles.ratingBox}>
            <FontAwesome name="star" size={16} color="#F9DC76" />
            <Text style={localStyles.ratingText}>{commande?.driver?.rating||"4.5"}</Text>
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
      <View style={{ alignItems: 'center', marginTop: 0 }}>
        <View style={localStyles.nextButtonWrapper}>
          <Text style={localStyles.nextButtonPrice}>{parseFloat(commande?.totalPrice).toFixed(2)} DT</Text>
          <Text style={localStyles.nextButtonText} onPress={goNext}>{t('go_to_payment')}</Text>
        </View>
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
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#F9DC76',
  },
  driverName: {
    fontWeight: '700',
    fontSize: hp(2.2),
    color: '#19191C',
  },
  car: {
    color: '#BDBDBD',
    fontSize: hp(1.7),
    marginTop: 2,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  plate: {
    backgroundColor: '#F3F3F3',
    color: '#19191C',
    fontWeight: '700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: hp(1.7),
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F9DC76',
    marginLeft: 10,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '700',
    color: '#19191C',
    fontSize: hp(1.8),
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
  priceBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'center',
    marginTop: 30,
  },
  priceCurrency: {
    color: '#19191C',
    fontWeight: '700',
    fontSize: hp(2.5),
    marginBottom: 2,
    marginRight: 2,
  },
  price: {
    color: '#19191C',
    fontWeight: '700',
    fontSize: hp(5.5),
    lineHeight: hp(6),
  },
  priceCents: {
    color: '#19191C',
    fontWeight: '700',
    fontSize: hp(2.5),
    marginBottom: 2,
    marginLeft: 1,
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

export default Step4; 