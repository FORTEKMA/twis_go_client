import React, {useState, useRef, useCallback, useEffect} from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PhoneInput from 'react-native-phone-input';
import CountryPicker from 'react-native-country-picker-modal';
import {useDispatch, useSelector} from 'react-redux';
import {userRegister} from '../../store/userSlice/userSlice';
import {styles as loginStyles} from '../Login/styles';
import {useTranslation} from 'react-i18next';
import api from '../../utils/api';
import {OneSignal} from 'react-native-onesignal';

const PRIMARY_COLOR = '#030303';

const Register = ({navigation, route}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {width} = useWindowDimensions();
  const error = useSelector(state => state.user.error);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
   const [form, setForm] = useState({
    name:route?.params?.result?.user?.firstName?.length>0? route?.params?.result?.user?.firstName + " "+route?.params?.result?.user?.lastName:"",
    phone: route.params?.phoneNumber || '',
    email: route?.params?.result?.user?.email&&route?.params?.result?.user?.email.endsWith("@apple.com")?"":route?.params?.result?.user,
    password: '',
  });
  const [errors, setErrors] = useState({});
  const phoneInput = useRef(null);
  const [isFlagsVisible, setIsFlagsVisible] = useState(false);
  const [country, setCountry] = useState({
    cca2: 'tn',
    callingCode: '216',
    flag: '🇹🇳',
  });


  useEffect(()=>{
    if(route?.params?.number){
      setForm({...form,phone:route?.params?.number})
    }
  },[])

  const handleChange = (field, value) => {
    setForm({...form, [field]: value});
    setErrors({...errors, [field]: undefined});
  };

  const onSelectCountry = useCallback(selectedCountry => {
    setCountry(selectedCountry);
    if (phoneInput.current) {
      phoneInput.current.selectCountry(selectedCountry.cca2.toLowerCase());
    }
    setIsFlagsVisible(false);
  }, []);

  const validate = () => {
    let valid = true;
    let newErrors = {};
    if (!form.name) {
      newErrors.name = t('register.nameRequired');
      valid = false;
    } else if (form.name.split(' ').length < 2) {
      newErrors.name = t('register.fullNameRequired');
      valid = false;
    }
    if (!form.phone) {
      newErrors.phone = t('register.phoneRequired');
      valid = false;
    } else {
      const numericNumber = form.phone.replace(/\D/g, '');
      if (numericNumber.length < 7) {
        newErrors.phone = t('register.invalidPhone');
        valid = false;
      }
    }
    if (!form.email) {
      newErrors.email = t('register.emailRequired');
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = t('register.invalidEmail');
      valid = false;
    }
    if (!route?.params?.result?.user && !form.password) {
      newErrors.password = t('register.passwordRequired');
      valid = false;
    } else if (!route?.params?.result?.user && form.password) {
      if (form.password.length < 6) {
        newErrors.password = t('register.passwordMinLength');
        valid = false;
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
        newErrors.password = t('register.passwordSpecialChar');
        valid = false;
      }
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
//add validation olny is sucess , pass to otp
    api
      .post('register/client', {
        username: form.name,
        email: form.email,
        phoneNumber:form.phone.replace(/\s/g, ''),
        password: form.password,
        user_role: 'client',
        firstName: form.name.split(' ')[0],
        lastName: form.name.split(' ')[1],
        validaton:true
      })
      .then(async response => {
        setIsLoading(false);
        if(response?.data?.emailExists==true){
          setErrors({
            ...errors,
            email: t('register.emailTaken'),
          });
          return
        }
        if(response?.data?.phoneExists==true){
          setErrors({
            ...errors,
            phone: t('register.phoneTaken'),
          });
          return
        }

        navigation.navigate("confirmation",{add:true,
          number:form.phone.replace(/\s/g, ''),
          data:{
            username: form.name,
            email: form.email,
            phoneNumber:form.phone.replace(/\s/g, ''),
            password: form.password,
            user_role: 'client',
            firstName: form.name.split(' ')[0],
            lastName: form.name.split(' ')[1],
            handleLoginSucces:route?.params?.handleLoginSucces
          }
        })
  
      })

      .catch(error => {
        console.log(error.response?.data)
        setIsLoading(false);
        if (error.response?.data?.error?.message === 'Email already exists') {
          setErrors({
            ...errors,
            email: t('register.emailTaken'),
          });
        } else if (
          error.response?.data?.error?.message === 'Phone number already exists'
        ) {
          setErrors({
            ...errors,
            phone: t('register.phoneTaken'),
          });
        } else if (error.response?.data?.status === 'error') {
          Alert.alert(t('common.error'), t('register.generalError'), [
            {text: t('common.ok')},
          ]);
        }
        console.log('error', error);
      });
  };

const handlerUpadte=()=>{
  if (!validate()) return;
 
  navigation.navigate("confirmation",{put:true,
    number:form.phone.replace(/\s/g, ''),
    data:{
      number:form.phone.replace(/\s/g, ''),
      firstName: form.name.split(' ')[0],
      lastName: form.name.split(' ')[1],
      Authorization:route?.params?.result?.jwt,
      id:route?.params?.result?.user?.id,

      user:route?.params?.result.user,
      handleLoginSucces:route?.params?.handleLoginSucces,
      email: form.email,
    }
  })
 
}

  
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            alignSelf: 'flex-start',
            marginLeft: 16,
            marginTop: 16,
            marginBottom: 8,
          }}>
          <Ionicons name={I18nManager.isRTL?"arrow-forward":"arrow-back"} size={28} color={PRIMARY_COLOR} />
        </TouchableOpacity>

        <ScrollView style={{paddingHorizontal: 10, paddingBottom: 30}}>
          <View style={loginStyles.header}>
            <Text style={loginStyles.headerTitle}>
              {t('register.createAccount')}
            </Text>
          </View>
          <View style={loginStyles.formContainer}>
            <View style={loginStyles.inputContainer}>
              <Text
                style={{
                  fontWeight: '600',
                  color: '#222',
                  fontSize: 15,
                  marginBottom: 6,
                  textAlign:"left"
                }}>
                {t('register.namePlaceholder')}
              </Text>
              <TextInput
                style={[loginStyles.input, errors.name && loginStyles.inputError]}
                placeholder={t('register.namePlaceholder')}
                placeholderTextColor="#8391A1"
                value={form.name}
                onChangeText={v => handleChange('name', v)}
                autoCapitalize="words"
              />
              {errors.name && (
                <Text style={loginStyles.errorText}>{errors.name}</Text>
              )}
            </View>
            <View style={loginStyles.inputContainer}>
              <Text
                style={{
                  fontWeight: '600',
                  color: '#222',
                  fontSize: 15,
                    textAlign:"left",
                  marginBottom: 6,
                }}>
                {t('register.phone')}
              </Text>
              <View
                style={[
                  loginStyles.passwordInputWrapper,
                  errors.phone && loginStyles.inputError,
                  {marginBottom: 0},
                ]}>


<PhoneInput
                  autoFormat
                  initialCountry="tn"
                  onPressFlag={() =>   !route.params?.number && setIsFlagsVisible(true)}
                  onChangePhoneNumber={v => handleChange('phone', v)}

                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#222',
                    paddingVertical: 5,
                    paddingHorizontal: 18,
                    height: 50,
                  }}
                  textComponent={TextInput}
                  textProps={{
                    placeholder: t('login.phoneNumber'),
                    placeholderTextColor: '#8391A1',
                    style: { color: '#222',flex:1 }
                  }}
                  ref={phoneInput}
                  value={form.phone}
                  disabled={!!route.params?.number}
                />


                
              </View>
              {errors.phone && (
                <Text style={[loginStyles.errorText,{marginTop:5}]}>{errors.phone}</Text>
              )}
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
              filterProps={{placeholder: t('login.search')}}
            />
         {(!route?.params?.result?.user ||route?.params?.result?.user?.email?.endsWith("@apple.com"))&& (    <View style={loginStyles.inputContainer}>
              <Text
                style={{
                  fontWeight: '600',
                  color: '#222',
                  fontSize: 15,
                  marginBottom: 6,
                    textAlign:"left"
                }}>
                {t('register.email')}
              </Text>
              <TextInput
                style={[
                  loginStyles.input,
                  errors.email && loginStyles.inputError,
                ]}
                placeholder={t('register.emailPlaceholder')}
                placeholderTextColor="#8391A1"
                value={form.email}
                onChangeText={v => handleChange('email', v)}
                autoCapitalize="none"
                keyboardType="email-address"
               />
              {errors.email && (
                <Text style={loginStyles.errorText}>{errors.email}</Text>
              )}
            </View>)}
            {!route?.params?.result?.user && ( <View style={loginStyles.inputContainer}>
              <Text
                style={{
                  fontWeight: '600',
                  color: '#222',
                  fontSize: 15,
                    textAlign:"left",
                  marginBottom: 6,
                }}>
                {t('register.password')}
              </Text>
              
                <View
                  style={[
                    loginStyles.passwordInputWrapper,
                    errors.password && loginStyles.inputError,
                  ]}>
                  <TextInput
                    style={loginStyles.passwordInput}
                    placeholder={t('register.passwordPlaceholder')}
                    placeholderTextColor="#8391A1"
                    value={form.password}
                    onChangeText={v => handleChange('password', v)}
                    secureTextEntry={!show}
                  />
                  <TouchableOpacity
                    onPress={() => setShow(!show)}
                    style={loginStyles.eyeIcon}>
                    <Ionicons
                      name={show ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#8391A1"
                    />
                  </TouchableOpacity>
                </View>
             
              {errors.password && (
                <Text style={[loginStyles.errorText,{marginTop:5}]}>{errors.password}</Text>
              )}
            </View> )}
            <Text
              style={{
                color: '#8391A1',
                fontSize: 13,
                marginTop: 8,
                marginBottom: 16,
                  textAlign:"left"
              }}>
              {t('register.terms1')}
              <Text
                style={{color: PRIMARY_COLOR}}
                onPress={() => Linking.openURL('https://tawsilet.com/Conditions')}>
                {t('register.termsOfService')}
              </Text>
              {t('register.terms2')}
            </Text>
            <TouchableOpacity
              style={[
                loginStyles.btn,
                isLoading && loginStyles.btnDisabled,
                {backgroundColor: PRIMARY_COLOR},
              ]}
              onPress={route?.params?.result?.user?handlerUpadte:handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[loginStyles.btnText, {color: '#fff'}]}>
                  {t('register.signup')}
                </Text>
              )}
            </TouchableOpacity>
            <View style={loginStyles.dividerContainer}>
              <View style={loginStyles.divider} />
              <Text style={loginStyles.dividerText}>{t('register.or')}</Text>
              <View style={loginStyles.divider} />
            </View>

            <View style={{alignItems: 'center', marginTop: 24}}>
              <Text style={{color: '#8391A1', fontSize: 14}}>
                {t('register.alreadyHaveAccount')}{' '}
                <Text
                  style={{color: PRIMARY_COLOR, fontWeight: '700'}}
                  onPress={() => navigation.navigate('login')}>
                  {t('register.signInHere')}
                </Text>
              </Text>
            </View>
          </View>
          <View style={{height: 100}}></View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Register;
