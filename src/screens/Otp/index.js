import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, KeyboardAvoidingView, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { OneSignal } from "react-native-onesignal";
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/colors';
import {sendVerify, verify,updateUser,getCurrentUser} from '../../store/userSlice/userSlice';

const Otp = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { number } = route.params;
  const [otp, setOTP] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [verificationSent, setVerificationSent] = useState(true);
  const [error, setError] = useState(false);
  const [error2, setError2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [activeInput, setActiveInput] = useState(0);

  useEffect(() => {
    dispatch(sendVerify(number.replace(/\s/g, '')));
    setVerificationSent(true);
  }, []);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
       dispatch(verify({phoneNumber: number.replace(/\s/g, ''), code: otp.join('')})).then(async res => {
        const notificationId =await OneSignal.User.pushSubscription.getPushSubscriptionId();
        console.log(" res?.payload?.user?.id,", res?.payload);
        await dispatch(updateUser({
          id: res?.payload?.id,
          notificationId
        })).unwrap();
        await dispatch(getCurrentUser());
        console.log(res, 'res');
       if(res?.payload?.status==false){
        setError(t('otp.invalidCode'));
       }
       
        
        setIsLoading(false);
      });
 
      // Handle successful verification
    } catch (error) {
      setError(true);
    } finally {
    
    }
  };

  const handleResend = () => {
    setTimer(60);
    setVerificationSent(true);
    // Add your resend logic here
  };

  useEffect(() => {
    // Auto submit when all fields are filled
    if (otp.every(digit => digit !== '')) {
      handleVerify();
    }
  }, [otp]);

  useEffect(() => {
    let interval;
    if (timer > 0 && verificationSent) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, verificationSent]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 8 }}>{t('otp.verify_phone')}</Text>
        <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>
          {t('otp.code_sent_to')} {number}
        </Text>
      </View>
      <View style={styles.otpContainer}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={inputRefs[idx]}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={value => {
              const newOtp = [...otp];
              newOtp[idx] = value;
              setOTP(newOtp);
              if (value && idx < 3) {
                inputRefs[idx + 1].current.focus();
              }
            }}
            onFocus={() => setActiveInput(idx)}
            returnKeyType="next"
            autoFocus={idx === 0}
          />
        ))}
      </View>
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>{t('otp.didnt_get_otp')}</Text>
        {timer > 0 ? (
          <View style={styles.timerContainer}>
            <Icon name="time-outline" size={16} color="#888" style={styles.timerIcon} />
            <Text style={styles.timerText}>
              {t('otp.resend_in')} <Text style={styles.timerCount}>{formatTime(timer)}</Text>
            </Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
            <Icon name="refresh-outline" size={16} color={colors.primary} style={styles.resendIcon} />
            <Text style={styles.resendButtonText}>{t('otp.resend_code')}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      <TouchableOpacity 
        style={[styles.btn, isLoading && styles.btnDisabled]} 
        onPress={handleVerify}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.btnText}>{t('otp.verify')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Otp; 