import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
 import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { sendActionToDrivers } from '../../../utils/CalculateDistanceAndTime';
const Step5 = ({
 goBack,
 rideData,
 handleReset
}) => {
  const { t } = useTranslation();
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const navigation=useNavigation()
  const paymentOptions = [
    {
      key: 'online',
      label: t('payment.online'),
      icon: 'credit-card',
      description: t('payment.online_description'),
      disabled: true,
    },
    {
      key: 'cash',
      label: t('payment.cash'),
      icon: 'cash',
      description: t('payment.cash_description'),
      disabled: false,
    },
  ];

  return (
    <View style={localStyles.container}>
      <View style={{gap:10, marginBottom: 18, marginTop: 10, flexDirection: 'row', alignItems: 'center', width:"100%" }}>
        <TouchableOpacity
          style={{ backgroundColor: '#fff', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
          onPress={goBack}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={{ fontWeight: '700', fontSize: hp(2.2), color: '#fff' }}>{t('booking.step5.select_payment')}</Text>
      </View>

      <View style={localStyles.optionsContainer}>
        {paymentOptions.map(option => (
          <TouchableOpacity
            
            disabled={option.disabled}
            key={option.key}
            style={[
              localStyles.optionCard,
              selectedPayment === option.key && localStyles.selectedOption,
              option.disabled && localStyles.disabledOption
            ]}
            onPress={() => setSelectedPayment(option.key)}
          >
            <View style={localStyles.optionContent}>
              <MaterialCommunityIcons 
                name={option.icon} 
                size={32} 
                color={selectedPayment === option.key ? '#030303' : '#fff'} 
                style={{ marginBottom: 8 }} 
              />
              <Text style={localStyles.optionLabel}>{option.label}</Text>
              <Text style={localStyles.optionDescription}>{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={localStyles.confirmButton}
        onPress={() => {
          sendActionToDrivers(rideData?.notificationId, "can_start_ride")
          navigation.navigate('Historique',{
            screen: 'OrderDetails',
            params: {
              id: rideData?.commande?.data?.documentId
            }
          })
          handleReset()
        }}
      >
        <Text style={localStyles.confirmButtonText}>{t('booking.step5.confirm_payment')}</Text>
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
  optionsContainer: {
    marginTop: 20,
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  selectedOption: {
    borderColor: '#030303',
    borderWidth: 2,
    backgroundColor: '#FFFDF5',
  },
  optionContent: {
    alignItems: 'center',
  },
  optionLabel: {
    fontWeight: '700',
    fontSize: hp(2),
    color: '#fff',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#BDBDBD',
    fontSize: hp(1.6),
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#030303',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#030303',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: hp(2.2),
  },
  disabledOption: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
});

export default Step5; 