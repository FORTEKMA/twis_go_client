import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import PhoneInput from 'react-native-phone-input';
import CountryPicker from 'react-native-country-picker-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import { useNavigation } from '@react-navigation/native';
const PhoneLoginForm = React.memo(() => {
  const { t } = useTranslation();
  const phoneInput = useRef(null);
  const [isFlagsVisible, setIsFlagsVisible] = useState(false);
  const navigation = useNavigation();
  const [number, setNumber] = useState('');

  const [country, setCountry] = useState({
    cca2: 'tn',
    callingCode: '216',
    flag: '🇹🇳'
  });

  const onSelectCountry = useCallback((selectedCountry) => {
    setCountry(selectedCountry);
    if (phoneInput.current) {
      phoneInput.current.selectCountry(selectedCountry.cca2.toLowerCase());
    }
    setIsFlagsVisible(false);
  }, []);

  const isPhoneNumberValid = useCallback(() => {
    if (!number) {
      Alert.alert(t('login.enterPhoneNumber'));
      return false;
    }
    const numericNumber = number.replace(/\D/g, '');
    const minimumLength = 7;
    if (numericNumber.length < minimumLength) {
      Alert.alert(t('login.invalidPhoneNumber'));
      return false;
    }
    return true;
  }, [number, t]);

  const handleContinue = useCallback(() => {
    if (isPhoneNumberValid()) {
 
      navigation.navigate('confirmation', {number});
    }
  }, [number, isPhoneNumberValid]);

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <View style={[styles.passwordInputWrapper, { marginBottom: 0 }]}>
          
          <PhoneInput
            autoFormat
            initialCountry="tn"
            onPressFlag={() => setIsFlagsVisible(true)}
            onChangePhoneNumber={setNumber}
          
            style={{
              flex: 1,
              fontSize: 16,
              color: '#222',
              paddingVertical: 5,
              paddingLeft: 18,
              height: 50,
            }}
           
          
            textComponent={TextInput}
            textProps={{
              placeholder: t('login.phoneNumber'),
              placeholderTextColor: '#8391A1',
              style: { color: '#222' }
            }}
            ref={phoneInput}
            value={number}
          />
        </View>
      </View>

      <CountryPicker
        withFilter
        withFlag
        withAlphaFilter
        withCallingCode
        placeholder=""
        onSelect={onSelectCountry}
        visible={isFlagsVisible}
        translation="fra"
        filterProps={{ placeholder: t('login.search') }}
      />

      <Text style={[styles.forgotPassword, { color: '#8391A1',alignSelf: 'flex-start', }]}>
        {t('login.smsInfo')}
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={handleContinue}>
        <Text style={styles.btnText}>{t('login.continue')}</Text>
      </TouchableOpacity>
    </View>
  );
});

export default PhoneLoginForm; 