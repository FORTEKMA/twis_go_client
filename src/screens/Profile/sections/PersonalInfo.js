import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, SafeAreaView, StatusBar, Keyboard, TouchableWithoutFeedback ,I18nManager} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Toast } from 'native-base';
import Modal from 'react-native-modal';
import { OtpInput } from 'react-native-otp-entry';
import PhoneInput from 'react-native-phone-input';
import CountryPicker from 'react-native-country-picker-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from '../styles';
import { updateUser, getCurrentUser,updateUserSwitcher } from '../../../store/userSlice/userSlice';
import Header from '../components/Header';
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
  const [otp, setOtp] = useState('');
  const [isFlagsVisible, setFlagsVisible] = useState(false);

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

  const handleOtpConfirm = async (code) => {
    setOtpModalVisible(false);
    setIsLoading(true);
    const finalOtp = typeof code === "string" ? code : otp;
    try {
      // This is where you would call your API to verify the OTP
      // For now, we'll just assume it's correct and proceed
      console.log({
        phoneNumber: userData.phoneNumber.replace(/\s/g, ""),
        code: finalOtp,
      });
      await api.post("/codes/verify-otp", {
        phoneNumber: userData.phoneNumber.replace(/\s/g, ""),
        code: finalOtp,
      });
      await handleUpdate();
    } catch (error) {
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
            style={[styles.nextButton, (isLoading || !isDataChanged) && styles.loginButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={isLoading || !isDataChanged}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>{t("common.edit")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal isVisible={isOtpModalVisible} onBackdropPress={() => setOtpModalVisible(false)} style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 60 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>{t('profile.personal_info.otp_title')}</Text>
          <Text style={{ textAlign: 'center', marginVertical: 10 }}>{t('profile.personal_info.otp_message', { phoneNumber: userData.phoneNumber })}</Text>
          <OtpInput
            numberOfDigits={4}
            focusColor="#0c0c0c"
            focusStickBlinkingDuration={500}
            onTextChange={(text) => setOtp(text)}
            onFilled={handleOtpConfirm}
            theme={{
              containerStyle: { marginVertical: 20 },
              pinCodeContainerStyle: { width: 60, height: 60, borderWidth: 1, borderRadius: 5 },
            }}
          />
          <TouchableOpacity
            style={[styles.nextButton, { marginTop: 20 }]}
            onPress={handleOtpConfirm}
          >
            <Text style={styles.nextButtonText}>{t('common.confirm')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PersonalInfo; 