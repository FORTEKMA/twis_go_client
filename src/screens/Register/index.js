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
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PhoneInput from 'react-native-phone-input';
import CountryPicker from 'react-native-country-picker-modal';
import { useDispatch, useSelector } from 'react-redux';
import { userRegister, forgetPassword } from '../../store/userSlice/userSlice';
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
import uuid from 'react-native-uuid';


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
    deviceId = uuid.v4();
    await EncryptedStorage.setItem('persistentDeviceId', deviceId);
  }
  return deviceId;
};

const Register = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const error = useSelector(state => state.user.error);
  const insets = useSafeAreaInsets();

  // Typography sizes
  const LABEL_FONT_SIZE = 14;
  const INFO_FONT_SIZE = 12;
  const ERROR_FONT_SIZE = 12;

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
  // Email verification UI state
  const [emailCode, setEmailCode] = useState('');
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const emailTimerRef = useRef(null);
  // Email cooldown that doubles each time: 60s, 120s, 240s, ...
  const [emailCooldown, setEmailCooldown] = useState(60);

  // Refs
  const nameRef = useRef(null);
  const phoneFieldRef = useRef(null);
  const emailRef = useRef(null);
  const emailCodeRef = useRef(null);
  const passwordRef = useRef(null);
  const scrollViewRef = useRef(null);
  const phoneInput = useRef(null);
  const currentScrollY = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const lastFocusedRef = useRef(null);

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

  // Email timer countdown
  useEffect(() => {
    if (emailTimer > 0) {
      emailTimerRef.current && clearInterval(emailTimerRef.current);
      emailTimerRef.current = setInterval(() => {
        setEmailTimer(prev => {
          if (prev <= 1) {
            clearInterval(emailTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (emailTimerRef.current) clearInterval(emailTimerRef.current);
    };
  }, [emailTimer]);
  // Email code handlers
  const handleSendEmailCode = async () => {
    // validate email before sending
    const emailError = validateField('email', form.email || '');
    if (emailError) {
      setErrors(prev => ({ ...prev, email: emailError }));
      scrollToError({ email: true });
      return;
    }

    // Check if email already exists before sending code
    try {
      setIsSendingEmailCode(true);
      
      const emailResponse = await api.get(`/users?filters[email][$endsWithi]=${form.email.toLowerCase()}`);
      console.log("emailResponse",emailResponse.data);
      if (Array.isArray(emailResponse.data) && emailResponse.data.length > 0) {
        setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));
        scrollToError({ email: true });
        return;
      }
      
      // Call API to send registration code
      await api.post('codes/send-registration-code', {
        email: (form.email || '').toLowerCase(),
      });
      setEmailCodeSent(true);
      setEmailTimer(emailCooldown);
      setEmailCooldown(prev => prev * 2);
    } catch (e) {
      console.log("error",e);
      // surface a generic error on email field
      setErrors(prev => ({ ...prev, email: t('register.emailCodeSendFailed') || 'Failed to send code' }));
    } finally {
      setIsSendingEmailCode(false);
    }
  };


  // Ensure focused input is visible (not hidden by keyboard/footer)
  const scrollToInput = useCallback((targetRef) => {
    const measureAndScroll = () => {
      if (!targetRef?.current || !scrollViewRef.current) return;
      targetRef.current.measureInWindow?.((x, y, w, h) => {
        const screenH = Dimensions.get('window').height;
        const safeGap = 16; // breathing room above keyboard/footer
        const obscuringBottom = screenH - keyboardHeight - Math.max(footerHeight, 0) - safeGap;
        const fieldBottom = (y || 0) + (h || 0);
        if (fieldBottom > obscuringBottom) {
          const delta = fieldBottom - obscuringBottom;
          const nextY = Math.max(currentScrollY.current + delta, 0);
          scrollViewRef.current?.scrollTo({ y: nextY, animated: true });
        } else if ((y || 0) < 80) {
          const nextY = Math.max(currentScrollY.current + (y - 80), 0);
          scrollViewRef.current?.scrollTo({ y: nextY, animated: true });
        }
      });
    };


    // Run now and again after keyboard animation settles
    requestAnimationFrame(measureAndScroll);
    setTimeout(measureAndScroll, Platform.OS === 'ios' ? 200 : 300);
  }, [keyboardHeight, footerHeight]);

  useEffect(() => {
    if (route?.params?.number) {
      setForm(prev => ({ ...prev, phone: route.params.number }));
      phoneInput.current?.setValue(route.params.number);
    }
  }, []);

  // Keyboard listeners to track keyboard height for accurate scroll calculations
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e?.endCoordinates?.height || 0);
      // re-ensure focused field visibility after keyboard shows
      if (lastFocusedRef.current) {
        setTimeout(() => scrollToInput(lastFocusedRef.current), 50);
      }
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub?.remove?.();
      hideSub?.remove?.();
    };
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

    // Require email verification code if email flow initiated
    if (shouldShowEmailField() && emailCodeSent) {
      if (!emailCode || emailCode.trim().length === 0) {
        newErrors.emailCode = t('register.emailCodeRequired') || 'Please enter the verification code';
        isValid = false;
      }
    }
    console.log("newErrors",newErrors);
   
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

    const acceptedLength = 0;

    if (Array.isArray(emailResponse.data) && emailResponse.data.length > acceptedLength) {
      setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));
      trackRegisterFailure('email_already_exists');
      // bring email into view
      scrollToError({ email: true });
      return false;
    }

    if (Array.isArray(phoneResponse.data) && phoneResponse.data.length > 0) {
      setErrors(prev => ({ ...prev, phone: t('register.phoneTaken') }));
      trackRegisterFailure('phone_already_exists');
      // bring phone into view
      scrollToError({ phone: true });
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
    const data = error?.response?.data;
    const message = data?.error?.message || data?.message || '';

    // Normalize message for matching
    const msg = (typeof message === 'string' ? message : '').toLowerCase();

    // 1) Explicit boolean flags
    if (data?.emailExists === true) {
      trackRegisterFailure('email_already_exists');
      setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));
      scrollToError({ email: true });
      return;
    }
    if (data?.phoneExists === true) {
      trackRegisterFailure('phone_already_exists');
      setErrors(prev => ({ ...prev, phone: t('register.phoneTaken') }));
      scrollToError({ phone: true });
      return;
    }

    // 2) Message-based detection
    if (msg.includes('email already exists') || msg.includes('email exists')) {
      trackRegisterFailure('email_already_exists');
      setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));
      scrollToError({ email: true });
      return;
    }
    if (msg.includes('phone already exists') || msg.includes('phone exists')) {
      trackRegisterFailure('phone_already_exists');
      setErrors(prev => ({ ...prev, phone: t('register.phoneTaken') }));
      scrollToError({ phone: true });
      return;
    }

    // 3) Field-level errors array or object
    const errorsArr = data?.errors || data?.error?.details || [];
    if (Array.isArray(errorsArr) && errorsArr.length > 0) {
      let setAny = false;
      errorsArr.forEach(e => {
        const path = (e?.path || e?.field || '').toString().toLowerCase();
        const msg = (e?.message || '').toLowerCase();
        if (path.includes('email') || msg.includes('email')) {
          setAny = true;
          setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));
        }
        if (path.includes('phone') || msg.includes('phone')) {
          setAny = true;
          setErrors(prev => ({ ...prev, phone: t('register.phoneTaken') }));
        }
      });
      if (setAny) {
        // Prefer focusing email first, else phone
        const target = errorsArr.find(e => (e?.path || '').toString().toLowerCase().includes('email')) ? { email: true } : { phone: true };
        scrollToError(target);
        return;
      }
    }

    // 4) Generic server error
    if (data?.status === 'error' || error?.response?.status >= 400) {
      trackRegisterFailure('general_error', message);
      Alert.alert(t('common.error'), t('register.generalError'), [
        { text: t('common.ok') },
      ]);
      return;
    }

    // 5) Network or unknown error
    trackRegisterFailure('network_error', error?.message);
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

    // Verify email code before proceeding (if email field is part of the flow)
    if (shouldShowEmailField()) {
      if (!emailCodeSent || !emailCode?.trim()) {
        setErrors(prev => ({ ...prev, emailCode: t('register.emailCodeRequired') || 'Please enter the verification code' }));
        setIsLoading(false);
        return;
      }
      try {
        await api.post('codes/verify-registration-code', {
          email: (form.email || '').toLowerCase(),
          code: emailCode.trim(),
        });
      } catch (e) {
        setIsLoading(false);
        setErrors(prev => ({ ...prev, emailCode: t('register.invalidCode') || 'Invalid or expired verification code' }));
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

 
      if(response?.data?.phoneExists==true){
        setErrors(prev => ({ ...prev, phone: t('register.phoneTaken') }));
        // Bring phone error into view
        scrollToError({ phone: true });
        setIsLoading(false);
        return
      }
      
      if(response?.data?.emailExists==true){
        setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));
        // Bring email error into view
        scrollToError({ email: true });
        setIsLoading(false);
        return
      }
      

      setIsLoading(false);
      handleRegistrationSuccess(response);
    } catch (error) {
      console.log("error",error);
      setIsLoading(false);
      handleRegistrationError(error);
    }
  };

  const handleUpdate = async () => {
    console.log("handleUpdate");
    if (!validate()) return;
    
    const userExists = await checkUserExists();
    console.log("userExists",userExists);
    if (!userExists&&!["google","apple"].includes(route?.params?.result?.user.provider)) return;
   
    // Verify email code before proceeding when editing
    if (shouldShowEmailField()) {
      if (!emailCodeSent || !emailCode?.trim()) {
        setErrors(prev => ({ ...prev, emailCode: t('register.emailCodeRequired') || 'Please enter the verification code' }));
        return;
      }
      try {
        await api.post('codes/verify-registration-code', {
          email: (form.email || '').toLowerCase(),
          code: emailCode.trim(),
        });
      } catch (e) {
        setErrors(prev => ({ ...prev, emailCode: t('register.invalidCode') || 'Invalid or expired verification code' }));
        return;
      }
    }

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
      <Text style={[loginStyles.inputLabel, { textAlign: 'left', fontSize: LABEL_FONT_SIZE }]}>
        {t(`register.${field}`)}
      </Text>
      <TextInput
        ref={options.ref}
        style={[loginStyles.input, errors[field] && loginStyles.inputError, { marginTop: 8 }]}
        placeholder={placeholder}
        placeholderTextColor="#8391A1"
        value={form[field]}
        onChangeText={v => handleChange(field, v)}
        autoCapitalize={options.autoCapitalize || 'none'}
        keyboardType={options.keyboardType}
        secureTextEntry={field === 'password' ? !show : false}
        onFocus={options.onFocus}
        {...options}
      />
      {errors[field] && (
        <Text style={[loginStyles.errorText, { fontSize: ERROR_FONT_SIZE }]}>{errors[field]}</Text>
      )}
    </View>
  );

  const formatEmailTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderEmailField = () => (
    <View style={loginStyles.inputContainer}>
      <Text style={[loginStyles.inputLabel, { textAlign: 'left', fontSize: LABEL_FONT_SIZE }]}>
        {t('register.email')}
      </Text>
      {/* Instruction under label */}
      <Text style={{ color: '#6B7280', fontSize: INFO_FONT_SIZE, marginTop: 4 }}>
        {t('register.emailInstruction')}
      </Text>
      <View style={[loginStyles.passwordInputWrapper, errors.email && loginStyles.inputError, { marginTop: 8 }]}> 
        <TextInput
          ref={emailRef}
          style={[loginStyles.passwordInput]}
          placeholder={t('register.emailPlaceholder')}
          placeholderTextColor="#8391A1"
          value={form.email}
          onChangeText={v => handleChange('email', v)}
          autoCapitalize='none'
          keyboardType='email-address'
          onFocus={() => { lastFocusedRef.current = emailRef; scrollToInput(emailRef); }}
        />
      </View>
      {/* Send code button below input */}
      <TouchableOpacity
        onPress={handleSendEmailCode}
        disabled={
          isSendingEmailCode || emailTimer > 0 || !!validateField('email', form.email || '')
        }
        style={[
          {
            alignSelf: 'flex-start',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            marginTop: 12,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: (isSendingEmailCode || emailTimer > 0 || !!validateField('email', form.email || '')) ? '#E5E7EB' : PRIMARY_COLOR,
          },
        ]}
      >
        {isSendingEmailCode ? (
          <ActivityIndicator size="small" color={PRIMARY_COLOR} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={(emailTimer > 0 || !!validateField('email', form.email || '')) ? '#9CA3AF' : PRIMARY_COLOR}
              style={{ marginRight: 8 }}
            />
            <Text style={{
              fontWeight: '700',
              color: (emailTimer > 0 || !!validateField('email', form.email || '')) ? '#9CA3AF' : PRIMARY_COLOR,
            }}>
              {emailTimer > 0 ? `${t('register.codeSent')} · ${formatEmailTime(emailTimer)}` : (t('register.sendVerification') || 'Send code to email')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {errors.email && (
        <Text style={[loginStyles.errorText, { marginTop: 5, fontSize: ERROR_FONT_SIZE }]}>{errors.email}</Text>
      )}

      {emailCodeSent && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: '#6B7280', fontSize: INFO_FONT_SIZE, marginBottom: 6 }}>
            {t('register.checkSpam')}
          </Text>
          <Text style={[loginStyles.inputLabel, { textAlign: 'left', fontSize: LABEL_FONT_SIZE }]}>
            {t('register.emailCode') || 'Verification code'}
          </Text>
          <Text style={{ color: '#6B7280', fontSize: INFO_FONT_SIZE, marginTop: 2, marginBottom: 6 }}>
            {t('register.enterCodeHelp')}
          </Text>
          <TextInput
            ref={emailCodeRef}
            style={[loginStyles.input, errors.emailCode && loginStyles.inputError, { marginTop: 8 }]}
            placeholder={t('register.emailCodePlaceholder') || 'Enter code'}
            placeholderTextColor="#8391A1"
            value={emailCode}
            onChangeText={setEmailCode}
            keyboardType='number-pad'
            onFocus={() => { lastFocusedRef.current = emailCodeRef; scrollToInput(emailCodeRef); }}
            maxLength={6}
          />
          {errors.emailCode && (
            <Text style={[loginStyles.errorText, { marginTop: 5, fontSize: ERROR_FONT_SIZE }]}>{errors.emailCode}</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderPasswordField = () => (
    <View style={loginStyles.inputContainer}>
      <Text style={[loginStyles.inputLabel, { textAlign: 'left', fontSize: LABEL_FONT_SIZE }]}>
        {t('register.password')}
      </Text>
      <View style={[loginStyles.passwordInputWrapper, errors.password && loginStyles.inputError, { marginTop: 8 }]}>
        <TextInput
          ref={passwordRef}
          style={loginStyles.passwordInput}
          placeholder={t('register.passwordPlaceholder')}
          placeholderTextColor="#8391A1"
          value={form.password}
          onChangeText={v => handleChange('password', v)}
          secureTextEntry={!show}
          onFocus={() => { lastFocusedRef.current = passwordRef; scrollToInput(passwordRef); }}
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
        <Text style={[loginStyles.errorText, { marginTop: 5, fontSize: ERROR_FONT_SIZE }]}>{errors.password}</Text>
      )}
    </View>
  );

  const renderPhoneField = () => (
    <View ref={phoneFieldRef} style={loginStyles.inputContainer}>
      <Text style={[loginStyles.inputLabel, { textAlign: 'left', fontSize: LABEL_FONT_SIZE }]}>
        {t('register.phone')}
      </Text>
      <View style={[loginStyles.passwordInputWrapper, errors.phone && loginStyles.inputError, { marginBottom: 0, marginTop: 8 }]}>
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
            onFocus: () => { lastFocusedRef.current = phoneFieldRef; scrollToInput(phoneFieldRef); },
          }}
          ref={phoneInput}
          value={form.phone}
          disabled={!!route.params?.number}
        />
      </View>
      {errors.phone && (
        <Text style={[loginStyles.errorText, { marginTop: 5, fontSize: ERROR_FONT_SIZE }]}>{errors.phone}</Text>
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
    console.log("handleSubmitPress");
    return route?.params?.result?.user ? handleUpdate() : handleSubmit();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {/* Fixed header bar with safe padding */}
          <View style={[
            loginStyles.header,
            {
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
              paddingBottom: 12,
              paddingTop: insets.top+20 || 0,
              backgroundColor: 'white',
            }
          ]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={loginStyles.closeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <Ionicons
                name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
                size={22}
                color={'#111827'}
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>
              {t('register.createAccount')}
            </Text>
            {/* Spacer to keep title centered */}
            <View style={{ width: 40, height: 40 }} />
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={{ paddingHorizontal: 10, flex: 1 }}
            contentContainerStyle={{ paddingBottom: Math.max((footerHeight || 0) + 40, Platform.OS === 'ios' ? 120 : 100) }}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            onScroll={(e) => {
              currentScrollY.current = e?.nativeEvent?.contentOffset?.y || 0;
            }}
            onContentSizeChange={() => {
              if (lastFocusedRef.current) {
                // re-check after layout changes (validation errors, etc.)
                setTimeout(() => scrollToInput(lastFocusedRef.current), 30);
              }
            }}
            scrollEventThrottle={16}
          >
            <View style={loginStyles.formContainer}>
              {renderInputField('name', t('register.namePlaceholder'), {
                ref: nameRef,
                autoCapitalize: 'words',
                onFocus: () => { lastFocusedRef.current = nameRef; scrollToInput(nameRef); },
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

              {shouldShowEmailField() && renderEmailField()}

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

          <View
            style={loginStyles.submitButtonContainer}
            onLayout={(e) => setFooterHeight(e?.nativeEvent?.layout?.height || 0)}
          >
            <TouchableOpacity
              style={[
                loginStyles.btn,
                isLoading && loginStyles.btnDisabled,
                { backgroundColor: PRIMARY_COLOR },
              ]}
              onPress={handleSubmitPress}
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
    </View>
  );
};

export default Register;
