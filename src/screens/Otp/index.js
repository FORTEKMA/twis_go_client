import React, { useEffect, useState } from 'react';
import { View, KeyboardAvoidingView, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { OneSignal } from "react-native-onesignal";
import { Toast } from 'native-base';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/colors';
import { sendVerify, verify, updateUser, getCurrentUser, userRegister } from '../../store/userSlice/userSlice';
import api from '../../utils/api';
import { OtpInput } from "react-native-otp-entry";
import { 
  trackScreenView, 
  trackOtpVerification, 
  trackLoginSuccess, 
  trackLoginFailure,
  trackRegisterSuccess,
  trackRegisterFailure 
} from '../../utils/analytics';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScrollView } from 'react-native-gesture-handler';

const Otp = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { number } = route.params;
  const [otp, setOTP] = useState('');
  const [timer, setTimer] = useState(60);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [verificationSent, setVerificationSent] = useState(true);
  const [error, setError] = useState(false);
  const [error2, setError2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendModalVisible, setIsResendModalVisible] = useState(false);
  const [selectedResendMethod, setSelectedResendMethod] = useState(null);
  const dispatch = useDispatch();

  // Track screen view on mount
  useEffect(() => {
    trackScreenView('OTP', { 
      action_type: route?.params?.put ? 'update_profile' : route?.params?.add ? 'new_registration' : 'login',
      phone_number: number
    });
  }, []);

  useEffect(() => {
    dispatch(sendVerify({phoneNumber:number.replace(/\s/g, ''),"useWhatsapp": false}));
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
      console.log("res",res.data.success)
     
      if (res.data.status == false) {
        trackOtpVerification(false, { error: 'invalid_code' });
        setError(t('otp.invalidCode'));
        setIsLoading(false);
        return;
      } else {
   

        if(route?.params?.put==true){
          api.put(`users/${route?.params?.data?.id}`,{ 
            phoneNumber: number,
            firstName: route?.params?.data?.firstName,
            lastName: route?.params?.data?.lastName,
            email: route?.params?.data?.email,
          },{headers:{Authorization:route?.params?.data?.Authorization}})
          .then(res => {
            OneSignal.login(String(route?.params?.data?.id));
            let tempUser = route?.params?.data.user;
            tempUser.email = route?.params?.data?.email;
            tempUser.phoneNumber = number;
            tempUser.firstName = route?.params?.data?.firstName;
            tempUser.lastName = route?.params?.data?.lastName;
            dispatch(userRegister({jwt: route?.params?.data?.Authorization, user: tempUser}));
            setIsLoading(false);
            trackOtpVerification(true, { action: 'profile_update' });
            if(route?.params?.data?.handleLoginSuccess) {
              route?.params?.data?.handleLoginSuccess();
            }
            navigation.pop(2);
          })
          .catch(err => {
            setIsLoading(false);
            trackOtpVerification(false, { error: 'profile_update_failed' });
            console.log(err);
          });
          return;
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
              trackOtpVerification(true, { action: 'registration' });
              trackRegisterSuccess({ phone_verified: true });
              console.log("route?.params?.data?.handleLoginSuccess",route?.params?.data?.handleLoginSuccess)
              if(route?.params?.data?.handleLoginSuccess){
                route?.params?.data?.handleLoginSuccess()
               
              }
              navigation.pop(2)
            }).catch(err=>{
              console.log(error);
              setError(true);
              trackOtpVerification(false, { error: 'registration_failed' });
              trackRegisterFailure('registration_failed', err.message);
            })
          return
        }
        if (res.data.success == true) {
           
          if (res.data.blocked) {
            trackOtpVerification(false, { error: 'account_blocked' });
            trackLoginFailure('phone', 'account_blocked');
          
            Toast.show({
              title: t('common.error'),
              description: t('auth.account_blocked'),
              placement: "top",
              duration: 3000,
              status: "error"
            });
            navigation.goBack();
            return;
          }

 
          OneSignal.login(String(res.data.id));
          let payload = {
            user: res.data,
            jwt: res.data.authToken
          };
          dispatch(userRegister(payload));
          navigation.pop(2)
          trackOtpVerification(true, { action: 'login' });
          trackLoginSuccess('phone', { phone_verified: true });
        } else {
          trackOtpVerification(false, { error: 'user_not_found' });
          navigation.navigate('Register', { number: number });
        }
      }
    } catch (error) {
      console.log(error.response);
      setError(true);
      trackOtpVerification(false, { error: 'network_error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setIsResendModalVisible(true);
    setSelectedResendMethod(null);
  };

  const handleConfirmResend = () => {
    if (!selectedResendMethod) return;
    setIsResendModalVisible(false);
    const nextAttempt = resendAttempts + 1;
    setResendAttempts(nextAttempt);
    setTimer(60 * Math.pow(2, nextAttempt - 1));
   
    dispatch(sendVerify({phoneNumber:number.replace(/\s/g, ''),useWhatsapp:selectedResendMethod === 'whatsapp'}));
    setVerificationSent(true);
    trackOtpVerification(false, { action: 'resend_requested', attempt: nextAttempt, method: selectedResendMethod });
    // TODO: Implement actual API call for WhatsApp if needed
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
       <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView style={{flex:1}}>

         
          <View style={styles.container}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{t('otp.enter_code')}</Text>
              <Text style={styles.subtitle}>
                {t('otp.code_sent_to')} <Text style={styles.phoneNumber}>{'\u200E' + number}</Text>
              </Text>
            </View>
            <OtpInput
              numberOfDigits={4}
              onTextChange={(text) => setOTP(text)}
              focusColor={error ? '#D21313' : '#18365A'}
              focusStickBlinkingDuration={500}
              theme={{
                containerStyle: styles.otpInputContainer,
                pinCodeContainerStyle: [
                  styles.otpInput,
                  error && styles.otpInputError
                ],
                pinCodeTextStyle: styles.otpInputText,
              }}
              keyboardType="number-pad"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={{height: 100}} />
          </View>
          </ScrollView>
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              style={[styles.resendButton, timer > 0 && styles.resendButtonDisabled]}
              onPress={handleResend}
              disabled={timer > 0}
            >
              <Text style={styles.resendButtonText}>
                {t('otp.resend_code')}
                {timer > 0 && (
                  <Text style={styles.resendCountdown}>  {formatTime(timer)}</Text>
                )}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.continueButton, (isLoading || otp.length !== 4) && styles.continueButtonDisabled]}
              onPress={handleVerify}
              disabled={isLoading || otp.length !== 4}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.continueButtonText}>{t('otp.continue')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      
        <Modal
          isVisible={isResendModalVisible}
          onBackdropPress={() => setIsResendModalVisible(false)}
          onBackButtonPress={() => setIsResendModalVisible(false)}
          style={{ justifyContent: 'flex-end', margin: 0 }}
          backdropOpacity={0.3}
        >
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: '#ccc', marginBottom: 8 }} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8,color: '#0c0c0c', }}>{t('otp.choose_method')}</Text>
             <Text style={{ color: '#0c0c0c', fontSize: 14, textAlign: 'center', marginBottom: 12 }}>{t('otp.method_info', { number })}</Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: selectedResendMethod === 'sms' ? '#0c0c0c50' : '#F8F8F8', borderWidth: selectedResendMethod === 'sms' ? 2 : 0, borderColor: selectedResendMethod === 'sms' ? '#0c0c0c' : 'transparent', borderRadius: 12, padding: 16, marginBottom: 12,gap:5 }}
              onPress={() => setSelectedResendMethod('sms')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#000" style={{ marginLeft: 8 }} />
              <Text style={{ fontSize: 16, color: '#000', fontWeight: '500', flex: 1, textAlign: 'right' }}>{t('otp.sms')}</Text>
              {selectedResendMethod === 'sms' && <Ionicons name="checkmark-circle" size={22} color="#0c0c0c" style={{ marginRight: 8 }} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: selectedResendMethod === 'whatsapp' ? '#0c0c0c50' : '#F8F8F8', borderWidth: selectedResendMethod === 'whatsapp' ? 2 : 0, borderColor: selectedResendMethod === 'whatsapp' ? '#0c0c0c' : 'transparent', borderRadius: 12, padding: 16, marginBottom: 12 ,gap:5 }}
              onPress={() => setSelectedResendMethod('whatsapp')}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" style={{ marginLeft: 8 }} />
              <Text style={{ fontSize: 16, color: '#000', fontWeight: '500', flex: 1, textAlign: 'right' }}>{t('otp.whatsapp')}</Text>
              {selectedResendMethod === 'whatsapp' && <Ionicons name="checkmark-circle" size={22} color="#0c0c0c" style={{ marginRight: 8 }} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: selectedResendMethod ? '#0c0c0c' : '#F0F0F0', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8, opacity: selectedResendMethod ? 1 : 0.6 }}
              onPress={handleConfirmResend}
              disabled={!selectedResendMethod}
            >
              <Text style={{ color: selectedResendMethod ? '#fff' : '#888', fontSize: 16 }}>{t('common.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
   );
};

export default Otp; 