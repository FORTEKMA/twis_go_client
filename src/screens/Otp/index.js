import React, { useEffect, useState } from 'react';
import { View, KeyboardAvoidingView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { OneSignal } from "react-native-onesignal";
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/colors';
import { sendVerify, verify, updateUser, getCurrentUser, userRegister } from '../../store/userSlice/userSlice';
import api from '../../utils/api';
import { OtpInput } from "react-native-otp-entry";

const Otp = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { number } = route.params;
  const [otp, setOTP] = useState('');
  const [timer, setTimer] = useState(60);
  const [verificationSent, setVerificationSent] = useState(true);
  const [error, setError] = useState(false);
  const [error2, setError2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(sendVerify(number.replace(/\s/g, '')));
    setVerificationSent(true);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 4) return;
    
    setIsLoading(true);
    setError(false);
    try {
      const res = await api.post('verify-code', {
        phoneNumber: number.replace(/\s/g, ''),
        code: otp
      });
     
      if (res.data.status == false) {
        setError(t('otp.invalidCode'));
        setIsLoading(false);
        return;
      } else {
        console.log("res.data.",res.data)

        if(route?.params?.put==true){
          api.put(`users/${route?.params?.data?.id}`,{ 

phoneNumber:number,
firstName: route?.params?.data?.firstName,
lastName:route?.params?.data?.lastName,
lastName:route?.params?.data?.email,
},{headers:{Authorization:route?.params?.data?.Authorization}}).then(res=>{

OneSignal.login(String(route?.params?.data?.id));
let tempUser=route?.params?.data.user
tempUser.email= route?.params?.data?.email;
tempUser.phoneNumber=number
tempUser.firstName=route?.params?.data?.firstName,
tempUser.lastName=route?.params?.data?.lastName,
dispatch(userRegister({jwt:route?.params?.data?.Authorization,user:tempUser}));
setIsLoading(false);
if(route?.params?.data?.handleLoginSucces)
{ route?.params?.data?.handleLoginSuccess()
navigation.pop(2)}
setIsLoading(false);
}).catch(err=>{
  setIsLoading(false);
  
  console.log(err)})
          return
        }

        if(route?.params?.add==true){
          api
          .post('register/client', {
            username:  route?.params?.data?.username,
            email:  route?.params?.data?.email,
            phoneNumber: route?.params?.data?.phoneNumber,
            password:  route?.params?.data?.password,
            user_role: 'client',
            firstName:  route?.params?.data?.firstName,
            lastName:  route?.params?.data?.lastName,
             
          }).then(response=>{
              OneSignal.login(String(response.data.user.id));
        dispatch(userRegister(response.data));
        if(route?.params?.data?.handleLoginSuccess){
          route?.params?.data?.handleLoginSuccess()
          navigation.pop(2)
        }
          }).catch(err=>{
            console.log(error);
            setError(true);
          })
          return
        }
        if (res.data.success == true) {
          console.log("route?.params?.put",route?.params?.put)
         

 
          OneSignal.login(String(res.data.id));
          let payload = {
            user: res.data,
            jwt: res.data.authToken
          };
          dispatch(userRegister(payload));}
         else {
          navigation.navigate('Register', { number: number });
        }
      }
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setVerificationSent(true);
    // Add your resend logic here
  };

  useEffect(() => {
    // Auto submit when all fields are filled
    if (otp.length === 4) {
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
          {t('otp.code_sent_to')} {'\u200E' + number}
        </Text>
      </View>
      <OtpInput
        numberOfDigits={4}
        onTextChange={(text) => setOTP(text)}
        focusColor="#18365A"
        focusStickBlinkingDuration={500}
        theme={{
          containerStyle: {
            marginBottom: 32,
          },
          pinCodeContainerStyle: {
            width: 60,
            height: 60,
            borderWidth: 1,
            borderColor: '#18365A',
            borderRadius: 8,
          },
          pinCodeTextStyle: {
            fontSize: 24,
            color: '#000',
          },
        }}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.resendContainer}>
        {verificationSent ? (
          <View style={styles.timerContainer}>
            <Icon name="time-outline" size={16} color="#888" style={styles.timerIcon} />
            <Text style={styles.timerText}>
              {t('otp.resend_in')} <Text style={styles.timerCount}>{formatTime(timer)}</Text>
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
            <Icon name="refresh-outline" size={16} color={colors.primary} style={styles.resendIcon} />
            <Text style={styles.resendButtonText}>{t('otp.resend_code')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[styles.btn, isLoading && styles.btnDisabled]}
        onPress={handleVerify}
        disabled={isLoading || otp.length !== 4}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>{t('otp.verify')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Otp; 