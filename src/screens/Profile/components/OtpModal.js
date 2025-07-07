import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Toast } from 'native-base';
import Modal from 'react-native-modal';
import { OtpInput } from 'react-native-otp-entry';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../../utils/api';

const OtpModal = ({ 
  isVisible, 
  onClose, 
  phoneNumber, 
  onSuccess, 
  onError,
  timer,
  onResend,
  isLoading,
  setIsLoading
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);

  // Auto submit when all fields are filled
  useEffect(() => {
    if (otp.length === 4) {
      handleOtpConfirm(otp);
    }
  }, [otp]);

  const handleOtpConfirm = async (code) => {
    if (code.length !== 4) return;
    
    setIsLoading(true);
    setError(false);
    const finalOtp = typeof code === "string" ? code : otp;
    try {
      console.log({
        phoneNumber: phoneNumber.replace(/\s/g, ""),
        code: finalOtp,
      });
      await api.post("/codes/verify-otp", {
        phoneNumber: phoneNumber.replace(/\s/g, ""),
        code: finalOtp,
      });
      onSuccess();
      onClose();
    } catch (error) {
      setError(t("profile.personal_info.otp_verify_error"));
      onError(error);
      Toast.show({
        title: t("common.error"),
        description: t("profile.personal_info.otp_verify_error"),
        status: "error",
        duration: 3000,
      });
      console.log(error)
    } finally {
      setIsLoading(false);
      setOtp('');
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    onResend();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // OTP Modal Styles
  const otpStyles = {
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 20,
      paddingTop: 30
    },
    backButton: {
      padding: 8,
    },
    titleContainer: {
      marginTop: 100,
      marginBottom: 32,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'left',
      marginBottom: 8,
      marginTop: 16,
    },
    subtitle: {
      color: '#888',
      fontSize: 15,
      textAlign: 'left',
      marginBottom: 2,
    },
    phoneNumber: {
      fontWeight: 'bold',
      color: '#000',
      fontSize: 15,
    },
    otpInputContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 8,
      marginTop: 8,
    },
    otpInput: {
      width: 60,
      height: 60,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      marginHorizontal: 6,
      backgroundColor: '#FAFAFA',
      textAlign: 'center',
      fontSize: 24,
      color: '#000',
    },
    otpInputError: {
      borderColor: '#D21313',
      backgroundColor: '#FFF0F0',
    },
    otpInputText: {
      fontSize: 24,
      color: '#000',
      fontWeight: 'bold',
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      marginTop: 10,
      textAlign: 'left',
      marginBottom: 10,
    },
    bottomButtonsContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 24,
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      gap: 8,
    },
    resendButton: {
      borderColor: '#0c0c0c',
      width: "100%",
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 20,
      alignItems: 'center',
    },
    resendButtonDisabled: {
      opacity: 0.6,
      borderColor: '#0c0c0c60',
    },
    resendButtonText: {
      color: '#888',
      fontSize: 15,
      fontWeight: '500',
    },
    continueButton: {
      width: "100%",
      flex: 1,
      backgroundColor: '#030303',
      borderRadius: 12,
      paddingVertical: 20,
      alignItems: 'center',
    },
    continueButtonDisabled: {
      opacity: 0.6,
    },
    continueButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    resendCountdown: {
      color: '#888',
      fontSize: 15,
      fontWeight: 'bold',
    },
  };

  return (
    <Modal 
      isVisible={isVisible} 
      onBackdropPress={() => {
        // Prevent closing modal while timer is active
        if (timer > 0) {
          Toast.show({
            title: t("common.warning"),
            description: t("profile.personal_info.cannot_close_during_timer"),
            status: "warning",
            duration: 3000,
          });
          return;
        }
        onClose();
      }} 
      style={{ margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={otpStyles.container}>
          <TouchableOpacity 
            style={otpStyles.backButton} 
            onPress={() => {
              // Prevent closing modal while timer is active
              if (timer > 0) {
                Toast.show({
                  title: t("common.warning"),
                  description: t("profile.personal_info.cannot_close_during_timer"),
                  status: "warning",
                  duration: 3000,
                });
                return;
              }
              onClose();
            }}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          
          <View style={otpStyles.titleContainer}>
            <Text style={otpStyles.title}>{t('profile.personal_info.otp_title')}</Text>
            <Text style={otpStyles.subtitle}>
              {t('profile.personal_info.otp_message', { phoneNumber })}
            </Text>
          </View>
          
          <OtpInput
            numberOfDigits={4}
            onTextChange={(text) => setOtp(text)}
            focusColor={error ? '#D21313' : '#18365A'}
            focusStickBlinkingDuration={500}
            theme={{
              containerStyle: otpStyles.otpInputContainer,
              pinCodeContainerStyle: [
                otpStyles.otpInput,
                error && otpStyles.otpInputError
              ],
              pinCodeTextStyle: otpStyles.otpInputText,
            }}
            keyboardType="number-pad"
          />
          
          {error && <Text style={otpStyles.errorText}>{error}</Text>}
          
          <View style={otpStyles.bottomButtonsContainer}>
            <TouchableOpacity
              style={[otpStyles.resendButton, timer > 0 && otpStyles.resendButtonDisabled]}
              onPress={handleResendOtp}
              disabled={timer > 0}
            >
              <Text style={otpStyles.resendButtonText}>
                {t('otp.resend_code')}
                {timer > 0 && (
                  <Text style={otpStyles.resendCountdown}> {formatTime(timer)}</Text>
                )}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[otpStyles.continueButton, (isLoading || otp.length !== 4) && otpStyles.continueButtonDisabled]}
              onPress={() => handleOtpConfirm(otp)}
              disabled={isLoading || otp.length !== 4}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={otpStyles.continueButtonText}>{t('otp.continue')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default OtpModal; 