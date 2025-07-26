import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Linking,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PhoneInput from 'react-native-phone-input';
import CountryPicker from 'react-native-country-picker-modal';
import { useDispatch, useSelector } from 'react-redux';
import { userRegister } from '../../store/userSlice/userSlice';
import { styles as loginStyles } from '../Login/styles';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { OneSignal } from 'react-native-onesignal';
import {
  trackScreenView,
  trackRegisterAttempt,
  trackRegisterSuccess,
  trackRegisterFailure,
} from '../../utils/analytics';
import EncryptedStorage from 'react-native-encrypted-storage';
import { v4 as uuidv4 } from 'uuid';

// Constants
const PRIMARY_COLOR = '#030303';
const INITIAL_COUNTRY = {
  cca2: 'tn',
  callingCode: '216',
  flag: '🇹🇳',
};
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PASSWORD_SPECIAL_CHARS_REGEX = /[!@#$%^&*(),.?":{}|<>]/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_PHONE_LENGTH = 7;

// Validation rules
const VALIDATION_RULES = {
  name: {
    required: true,
    minWords: 2,
  },
  phone: {
    required: true,
    minLength: MIN_PHONE_LENGTH,
  },
  email: {
    required: true,
    pattern: EMAIL_REGEX,
  },
  password: {
    required: true,
    minLength: MIN_PASSWORD_LENGTH,
    specialChars: true,
  },
};

// Add the persistent device ID generator
export const getPersistentDeviceId = async () => {
  let deviceId = await EncryptedStorage.getItem('persistentDeviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    await EncryptedStorage.setItem('persistentDeviceId', deviceId);
  }
  return deviceId;
};

const Register = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const error = useSelector(state => state.user.error);

  // State management
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFlagsVisible, setIsFlagsVisible] = useState(false);
  const [country, setCountry] = useState(INITIAL_COUNTRY);
  const [errors, setErrors] = useState({});

  // Form state
  const [form, setForm] = useState({
    name: getInitialName(),
    phone: getInitialPhone(),
    email: getInitialEmail(),
    password: '',
  });

  // Refs
  const nameRef = useRef(null);
  const phoneFieldRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const scrollViewRef = useRef(null);
  const phoneInput = useRef(null);

  // Helper functions
  function getInitialName() {
    const user = route?.params?.result?.user;
    if (user?.firstName?.length > 0) {
      return `${user.firstName} ${user.lastName}`;
    }
    return '';
  }
  
  function getInitialPhone() {
    return route?.params?.phoneNumber || route?.params?.number || '';
  }

  function getInitialEmail() {
 
    const user = route?.params?.result?.user;
    if (user?.email && user.email.endsWith('@apple.com')) {
      return '';
    }
    return user?.email || '';
  }

  // Effects
  useEffect(() => {
    trackScreenView('Register', {
      has_social_data: !!route?.params?.result,
      social_provider: route?.params?.result?.user?.provider || 'none',
    });
  }, []);

  useEffect(() => {
    if (route?.params?.number) {
      setForm(prev => ({ ...prev, phone: route.params.number }));
      phoneInput.current?.setValue(route.params.number);
    }
  }, []);

  // Event handlers
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const onSelectCountry = useCallback(selectedCountry => {
    setCountry(selectedCountry);
    if (phoneInput.current) {
      phoneInput.current.selectCountry(selectedCountry.cca2.toLowerCase());
    }
    setIsFlagsVisible(false);
  }, []);

  const scrollToError = useCallback(errorFields => {
    setTimeout(() => {
      if (errorFields.name && nameRef.current) {
        nameRef.current.focus();
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else if (errorFields.phone && phoneFieldRef.current) {
        phoneInput.current?.focus?.();
        phoneFieldRef.current.measure?.((fx, fy, width, height, px, py) => {
          scrollViewRef.current?.scrollTo({ y: py - 60, animated: true });
        });
      } else if (errorFields.email && emailRef.current) {
        emailRef.current.focus();
        scrollViewRef.current?.scrollTo({ y: 300, animated: true });
      } else if (errorFields.password && passwordRef.current) {
        passwordRef.current.focus();
        scrollViewRef.current?.scrollTo({ y: 400, animated: true });
      }
    }, 300);
  }, []);

  // Validation functions
  const validateField = (field, value) => {
  
    const rules = VALIDATION_RULES[field];
    if (!rules) return null;

    if (rules.required && !value) {
      return t(`register.${field}Required`);
    }

    switch (field) {
      case 'name':
        if (value.split(' ').length < rules.minWords) {
          return t('register.fullNameRequired');
        }
        break;
      case 'phone':
        const numericNumber = value.replace(/\D/g, '');
        if (numericNumber.length < rules.minLength) {
          return t('register.invalidPhone');
        }
        if (phoneInput.current && !phoneInput.current.isValidNumber()) {
          return t('register.invalidPhone');
        }
        break;
      case 'email':
        if (!rules.pattern.test(value)) {
          return t('register.invalidEmail');
        }
        break;
      case 'password':
        
        if (route?.params?.result?.user) return null; // Skip password validation for social login
        if (value.length < rules.minLength) {
          return t('register.passwordMinLength');
        }
        if (!PASSWORD_SPECIAL_CHARS_REGEX.test(value)) {
          return t('register.passwordSpecialChar');
        }
        break;
    }
    return null;
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(VALIDATION_RULES).forEach(field => {
     if(route?.params?.result?.user&&field=='password') return
      const error = validateField(field, form[field]);
     
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    if (!isValid) {
      scrollToError(newErrors);
    }
    return isValid;
  };

  // API functions
  const checkUserExists = async () => {
   
    const [emailResponse, phoneResponse] = await Promise.all([
      api.get(`/users?filters[email][$endsWithi]=${form.email.toLowerCase()}`),
      api.get(`/users?filters[phoneNumber][$endsWith]=${form.phone.replace(/\s/g, '').replace('+', '')}`),
    ]);

    const acceptedLength = route?.params?.result?.user?.email?.endsWith('@apple.com') ? 0 : 1;

    if (Array.isArray(emailResponse.data) && emailResponse.data.length > acceptedLength) {
      setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));
      trackRegisterFailure('email_already_exists');
      return false;
    }

    if (Array.isArray(phoneResponse.data) && phoneResponse.data.length > 0) {
      setErrors(prev => ({ ...prev, phone: t('register.phoneTaken') }));
      trackRegisterFailure('phone_already_exists');
      return false;
    }
 
    return true;
  };

  const handleRegistrationSuccess = (responseData) => {
    trackRegisterSuccess({
      has_social_data: !!route?.params?.result,
      social_provider: route?.params?.result?.user?.provider || 'none',
    });
 
     if (route?.params?.number) {
     
      dispatch(userRegister({
        jwt: responseData.jwt,
        user: responseData.user
      }));
      
      if (route?.params?.handleLoginSuccess) {
        route.params.handleLoginSuccess();
        navigation.pop(2);
      }
      else

     navigation.pop(2);
      return;
    }

    navigation.navigate('confirmation', {
      add: true,
      number: form.phone.replace(/\s/g, ''),
      data: {
        username: form.name,
        email: form.email.toLowerCase(),
        phoneNumber: form.phone.replace(/\s/g, ''),
        password: form.password,
        user_role: 'client',
        firstName: form.name.split(' ')[0],
        lastName: form.name.split(' ')[1],
        handleLoginSuccess: route?.params?.handleLoginSuccess,
      },
    });
  };

  const handleRegistrationError = (error) => {
    setIsLoading(false);
    
    if (error.response?.data?.emailExists === true) {
      trackRegisterFailure('email_already_exists');
      setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));
    } else if (error.response?.data?.phoneExists === true) {
      trackRegisterFailure('phone_already_exists');
      setErrors(prev => ({ ...prev, phone: t('register.phoneTaken') }));
    } else if (error.response?.data?.status === 'error') {
      trackRegisterFailure('general_error', error.response?.data?.error?.message);
      Alert.alert(t('common.error'), t('register.generalError'), [
        { text: t('common.ok') },
      ]);
    } else {
      trackRegisterFailure('network_error', error.message);
    }
  };

  // Submit handlers
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    trackRegisterAttempt({
      has_social_data: !!route?.params?.result,
      social_provider: route?.params?.result?.user?.provider || 'none',
    });
if(route?.params?.number)
  {
    const userExists = await checkUserExists();
    if (!userExists) {
      setIsLoading(false);
      return;
    }
  }

    try {
      const deviceId = await getPersistentDeviceId();
      const response = await api.post('register/client', {
        username: form.name,
        email: form.email.toLowerCase(),
        phoneNumber: form.phone.replace(/\s/g, ''),
        password: form.password,
        user_role: 'client',
        firstName: form.name.split(' ')[0],
        lastName: form.name.split(' ')[1],
        validaton: !route?.params?.number,
        device_id:deviceId, // Add deviceId to registration payload
      });

      console.log(response?.data);

      if(response?.data?.phoneExists==true){
        setErrors(prev => ({ ...prev, phone: t('register.phoneTaken') }));
        setIsLoading(false);
        return
      }
      
      if(response?.data?.emailExists==true){
        setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));
        setIsLoading(false);
        return
      }
      

      setIsLoading(false);
      handleRegistrationSuccess(response);
    } catch (error) {
      setIsLoading(false);
      console.log("error",error.response);
      if(error?.response?.data?.error?.message=="Email already exists")
        setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));

      
      handleRegistrationError(error);
    }
  };

  const handleUpdate = async () => {
    if (!validate()) return;
   
    const userExists = await checkUserExists();
    if (!userExists) return;

    navigation.navigate('confirmation', {
      put: true,
      number: form.phone.replace(/\s/g, ''),
      data: {
        number: form.phone.replace(/\s/g, ''),
        firstName: form.name.split(' ')[0],
        lastName: form.name.split(' ')[1],
        Authorization: route?.params?.result?.jwt,
        id: route?.params?.result?.user?.id,
        user: route?.params?.result.user,
        handleLoginSuccess: route?.params?.handleLoginSuccess,
        email: form.email.toLowerCase(),
      },
    });
  };

  // Render helpers
  const renderInputField = (field, placeholder, options = {}) => (
    <View style={loginStyles.inputContainer}>
      <Text style={[loginStyles.inputLabel, { textAlign: 'left' }]}>
        {t(`register.${field}`)}
      </Text>
      <TextInput
        ref={options.ref}
        style={[loginStyles.input, errors[field] && loginStyles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#8391A1"
        value={form[field]}
        onChangeText={v => handleChange(field, v)}
        autoCapitalize={options.autoCapitalize || 'none'}
        keyboardType={options.keyboardType}
        secureTextEntry={field === 'password' ? !show : false}
        {...options}
      />
      {errors[field] && (
        <Text style={loginStyles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const renderPasswordField = () => (
    <View style={loginStyles.inputContainer}>
      <Text style={[loginStyles.inputLabel, { textAlign: 'left' }]}>
        {t('register.password')}
      </Text>
      <View style={[loginStyles.passwordInputWrapper, errors.password && loginStyles.inputError]}>
        <TextInput
          ref={passwordRef}
          style={loginStyles.passwordInput}
          placeholder={t('register.passwordPlaceholder')}
          placeholderTextColor="#8391A1"
          value={form.password}
          onChangeText={v => handleChange('password', v)}
          secureTextEntry={!show}
        />
        <TouchableOpacity onPress={() => setShow(!show)} style={loginStyles.eyeIcon}>
          <Ionicons
            name={show ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#8391A1"
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={[loginStyles.errorText, { marginTop: 5 }]}>{errors.password}</Text>
      )}
    </View>
  );

  const renderPhoneField = () => (
    <View ref={phoneFieldRef} style={loginStyles.inputContainer}>
      <Text style={[loginStyles.inputLabel, { textAlign: 'left' }]}>
        {t('register.phone')}
      </Text>
      <View style={[loginStyles.passwordInputWrapper, errors.phone && loginStyles.inputError, { marginBottom: 0 }]}>
        <PhoneInput
          autoFormat
          initialCountry="tn"
          onPressFlag={() => !route.params?.number && setIsFlagsVisible(true)}
          onChangePhoneNumber={v => handleChange('phone', v)}
          style={{
            flex: 1,
            fontSize: 16,
            color: '#222',
            paddingVertical: 5,
            paddingHorizontal: 18,
            height: 50,
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
          }}
          textComponent={TextInput}
          textProps={{
            placeholder: t('login.phoneNumber'),
            placeholderTextColor: '#8391A1',
            style: {
              color: '#222',
              flex: 1,
              flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
              paddingHorizontal: 10,
            },
          }}
          ref={phoneInput}
          value={form.phone}
          disabled={!!route.params?.number}
        />
      </View>
      {errors.phone && (
        <Text style={[loginStyles.errorText, { marginTop: 5 }]}>{errors.phone}</Text>
      )}
    </View>
  );

  const shouldShowEmailField = () => {
    return !route?.params?.result?.user || route?.params?.result?.user?.email?.endsWith('@apple.com');
  };

  const shouldShowPasswordField = () => {
    return !route?.params?.result?.user;
  };

  const handleSubmitPress = () => { 
    return route?.params?.result?.user ? handleUpdate : handleSubmit;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              alignSelf: 'flex-start',
              marginLeft: 16,
              marginTop: 16,
              marginBottom: 8,
            }}>
            <Ionicons
              name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
              size={28}
              color={PRIMARY_COLOR}
            />
          </TouchableOpacity>

          <ScrollView
            ref={scrollViewRef}
            style={{ paddingHorizontal: 10, flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={loginStyles.header}>
              <Text style={loginStyles.headerTitle}>
                {t('register.createAccount')}
              </Text>
            </View>

            <View style={loginStyles.formContainer}>
              {renderInputField('name', t('register.namePlaceholder'), {
                ref: nameRef,
                autoCapitalize: 'words',
              })}

              {renderPhoneField()}

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

              {shouldShowEmailField() &&
                renderInputField('email', t('register.emailPlaceholder'), {
                  ref: emailRef,
                  keyboardType: 'email-address',
                })}

              {shouldShowPasswordField() && renderPasswordField()}

              <Text style={loginStyles.termsText}>
                {t('register.terms1')}
                <Text
                  style={{ color: PRIMARY_COLOR }}
                  onPress={() => Linking.openURL('https://tawsilet.com/Conditions')}>
                  {t('register.termsOfService')}
                </Text>
                {t('register.terms2')}
              </Text>
            </View>
          </ScrollView>

          <View style={loginStyles.submitButtonContainer}>
            <TouchableOpacity
              style={[
                loginStyles.btn,
                isLoading && loginStyles.btnDisabled,
                { backgroundColor: PRIMARY_COLOR },
              ]}
              onPress={handleSubmitPress()}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[loginStyles.btnText, { color: '#fff' }]}>
                  {t('register.signup')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;
