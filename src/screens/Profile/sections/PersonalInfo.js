import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, SafeAreaView, StatusBar, Keyboard, TouchableWithoutFeedback ,I18nManager} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Toast } from 'native-base';
import PhoneInput from 'react-native-phone-input';
import CountryPicker from 'react-native-country-picker-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from '../styles';
import { updateUser, getCurrentUser,updateUserSwitcher } from '../../../store/userSlice/userSlice';
import Header from '../components/Header';
import OtpModal from '../components/OtpModal';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import api from '../../../utils/api';

const PersonalInfo = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.currentUser);
  const token = useSelector((state) => state.user.token);
  const phoneInputRef = useRef(null);
 
  const [userData, setUserData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
  
  });
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [isOtpModalVisible, setOtpModalVisible] = useState(false);
  const [isFlagsVisible, setFlagsVisible] = useState(false);
  
  // Timer states for preventing multiple updates
  const [timer, setTimer] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isUpdateBlocked, setIsUpdateBlocked] = useState(false);

  const onSelectCountry = (country) => {
    phoneInputRef.current.selectCountry(country.cca2.toLowerCase());
    setFlagsVisible(false);
  };

  const renderCountryFilter = (props) => (
    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20,width:"100%" }}>
      <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{t('profile.personal_info.select_country')}</Text>
        <TouchableOpacity onPress={() => setFlagsVisible(false)}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10,height:90 }}>
        <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', marginBottom: 0, height:"100%", }]}>
          <Icon name="search" size={20} color="#ccc" style={{ marginRight: 10 }} />
          <TextInput
            {...props}
            style={{
              flex: 1,
              height:90,
              textAlign: I18nManager.isRTL ? 'right' : 'left',
               
            }}
            placeholder={t('login.search')}
            placeholderTextColor="#ccc"
            autoFocus
          />
        </View>
      </View>
    </View>
  );

  
  useEffect(() => {
    if (phoneInputRef.current) {
      phoneInputRef.current.setValue(userData.phoneNumber);
    }
  }, []);

  useEffect(() => {
    if (
      user?.phoneNumber !== userData.phoneNumber  
    ) {
      setIsDataChanged(true);
    } else {
      setIsDataChanged(false);
    }
  }, [userData, user]);

  // Timer effect for preventing multiple updates
  useEffect(() => {
    let interval;
    if (timer > 0) {
      setIsUpdateBlocked(true);
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsUpdateBlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsUpdateBlocked(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      const payload = {
        id: user?.id,
        ...userData,
        phoneNumber: userData.phoneNumber.replace(/\s/g, ""),
      };

    

      await dispatch(updateUser(payload)).unwrap();

    

      await dispatch(getCurrentUser());

      Toast.show({
        title: t("common.success"),
        description: t("profile.personal_info.update_success"),
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      Toast.show({
        title: t("common.error"),
        description: error?.message || t("profile.personal_info.update_error"),
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    // Prevent multiple attempts while timer is active
    if (isUpdateBlocked) {
      Toast.show({
        title: t("common.warning"),
        description: t("profile.personal_info.please_wait", { time: formatTime(timer) }),
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (userData.phoneNumber !== user.phoneNumber) {
      if (phoneInputRef.current && !phoneInputRef.current.isValidNumber()) {
        Toast.show({
          title: t("common.error"),
          description: t("signup.step4.errors.invalid_phone"),
          status: "error",
          duration: 3000,
        });
        return;
      }
      setIsLoading(true);
      try {
        const phone = userData.phoneNumber.replace(/\s+/g, "").replace("+", "");
        const phoneResponse = await api.get(
          `/users?filters[phoneNumber][$endsWith]=${phone}`
        );

        if (Array.isArray(phoneResponse.data) && phoneResponse.data.length > 0) {
          Toast.show({
            title: t("common.error"),
            description: t("signup.step4.errors.phone_exists"),
            status: "error",
            duration: 3000,
          });
          return;
        }
        // This is where you would call your API to send an OTP
        // For now, we'll just open the modal
       await api.post('codes/send-otp', { phoneNumber: userData.phoneNumber.replace(/\s/g, '') });

        // Set timer to prevent multiple attempts
        setTimer(60);
        setResendAttempts(0);
        setOtpModalVisible(true);
      } catch (error) {
        Toast.show({
          title: t("common.error"),
          description: t("profile.personal_info.otp_send_error"),
          status: "error",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      handleUpdate();
    }
  };

  const handleOtpSuccess = async () => {
    await handleUpdate();
  };

  const handleOtpError = (error) => {
    console.log('OTP Error:', error);
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    
    try {
      await api.post('codes/send-otp', { phoneNumber: userData.phoneNumber.replace(/\s/g, '') });
      const nextAttempt = resendAttempts + 1;
      setResendAttempts(nextAttempt);
      setTimer(60 * Math.pow(2, nextAttempt - 1));
    } catch (error) {
      Toast.show({
        title: t("common.error"),
        description: t("profile.personal_info.otp_send_error"),
        status: "error",
        duration: 3000,
      });
    }
  };

  const renderInput = (
    label,
    field,
    placeholder,
    keyboardType = "default",
    editable = true
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{t(label)}</Text>
      <TextInput
        style={[styles.input,{color:editable?"#000":"#ccc"}]}
        placeholder={t(placeholder)}
        placeholderTextColor="#ccc"
        value={field === "email" ? user.email : userData[field]}
        onChangeText={(text) => setUserData({ ...userData, [field]: text })}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
     
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.mainContainer}>
            <Header
              style={{ paddingTop: 0 }}
              title={t("profile.personal_info.title")}
            />
           
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.stepContainer}>
                <View style={styles.formContainer}>
                  {renderInput(
                    "profile.personal_info.email",
                    "email",
                    "profile.personal_info.email_placeholder",
                    "email-address",
                    false
                  )}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t("profile.personal_info.phone")}</Text>
                    <PhoneInput
                      ref={phoneInputRef}
                      autoFormat
                      style={[styles.input,{

                        flexDirection:I18nManager.isRTL? "row-reverse":"row",
                        textAlign: I18nManager.isRTL ? 'right' : 'left',

                        
                      }]}
                      initialCountry="tn"
                      textStyle={{ color: "#000" }}
                      textProps={{
                      
                          paddingHorizontal:I18nManager.isRTL ?10:4,
                      
                        placeholder: t("profile.personal_info.phone_placeholder"),
                        placeholderTextColor: "#ccc",
                      }}
                      value={userData.phoneNumber}
                      onChangePhoneNumber={(number) => {
                        setUserData({ ...userData, phoneNumber: number });
                      }}
                      onPressFlag={() => setFlagsVisible(true)}
                    />
                    <CountryPicker
                      withFilter
                      withFlag
                      withCallingCode
                      placeholder=""
                      onSelect={onSelectCountry}
                      visible={isFlagsVisible}
                      onClose={() => setFlagsVisible(false)}
                      translation={I18nManager.isRTL? "ar":"fr"}
                      renderCountryFilter={renderCountryFilter}
                       
                        modalProps={{
                          presentationStyle: 'pageSheet',
                        }}
                        withCloseButton={false}
                       
                      />
                  </View>
                 
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.nextButton, (isLoading || !isDataChanged || isUpdateBlocked) && styles.loginButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={isLoading || !isDataChanged || isUpdateBlocked}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : isUpdateBlocked ? (
              <Text style={styles.nextButtonText}>{t("common.please_wait")} ({formatTime(timer)})</Text>
            ) : (
              <Text style={styles.nextButtonText}>{t("common.edit")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <OtpModal
        isVisible={isOtpModalVisible}
        onClose={() => setOtpModalVisible(false)}
        phoneNumber={userData.phoneNumber}
        onSuccess={handleOtpSuccess}
        onError={handleOtpError}
        timer={timer}
        onResend={handleResendOtp}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </SafeAreaView>
  );
};

export default PersonalInfo; 