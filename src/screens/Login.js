/* eslint-disable react-native/no-inline-styles */
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {colors} from '../utils/colors';
import {HStack, Input} from 'native-base';
import CountryPicker from 'react-native-country-picker-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PhoneInput from 'react-native-phone-input';
import Divider from '../components/Divider';
import {useDispatch, useSelector} from 'react-redux';
import {
  forgetPassword,
  getCurrentUser,
  updateUser,
  userLogin,
} from '../store/userSlice/userSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Controller, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { OneSignal } from 'react-native-onesignal';

const loginSchema = Yup.object().shape({
  identifier: Yup.string()
    .email('Veuillez saisir une adresse e-mail valide.')
    .required('Email est requis'),
  password: Yup.string()
    .min(6, 'Mot de passe doit contenir au moins 6 caractères.')
    .required('Mot de passe est requis'),
});

const Login = ({navigation}) => {
  const phoneInput = useRef(null);
  const dispatch = useDispatch();
  const [isFlagsVisible, setIsFlagsVisible] = useState(false);
  const [show, setShow] = useState(false);
  const [forgotPsw, setForgotPsw] = useState(false);
  const [Errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginWithEmail, setLoginWithEmail] = useState(false);
  const [login, setLogin] = useState({
    identifier: '',
    password: '',
  });
  const user = useSelector(state => state?.user?.currentUser);

  // Initialize the form using useForm hook
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async data => {
    setIsLoading(true);
    try {
      const result = await dispatch(userLogin(data)); // Dispatch the login action
      console.log(result,'====?')
      if (result.error) {
        // Handle login failure
        Alert.alert('Email ou mot de passe incorrect');
      } else {
        // Handle login success
        dispatch(getCurrentUser()); // Fetch current user details
      }
    } catch (err) {
      // Handle any unexpected errors
      Alert.alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };
    useEffect(() => {
      const updateNotificationId = async () => {
        try {
          const notificationId =
            await OneSignal.User.pushSubscription.getPushSubscriptionId();
          console.log('OneSignal Notification ID:', notificationId);

          if (user && notificationId) {
            await dispatch(
              updateUser({
                id: user.documentId,
                ...user,
                notificationId,
              }),
            );
            dispatch(getCurrentUser());
          }
        } catch (error) {
          console.error('Error updating notification ID:', error);
        }
      };

      updateNotificationId();
    }, [user]);
  const validEmail = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Veuillez saisir une adresse e-mail valide.';
    }

    if (Object.keys(newErrors).length === 0) {
      setErrors({});
      return true;
    } else {
      setErrors(newErrors);
      return false;
    }
  };
  const {width} = useWindowDimensions();
  const setCountry = country => {
    if (phoneInput) {
      phoneInput.current.selectCountry(country.cca2.toLowerCase());
    }
    setIsFlagsVisible(false);
  };
  const isPhoneNumberValid = () => {
    if (!number) {
      alert('Veuillez saisir un numéro de téléphone.');
      return false;
    }

    // Remove any non-numeric characters from the number
    const numericNumber = number.replace(/\D/g, '');

    // Define your minimum length (e.g., 5)
    const minimumLength = 7;

    // Check if the numericNumber has at least the minimum length
    if (numericNumber.length < minimumLength) {
      alert('Numero de téléphone est invalide.');
      return false;
    }

    // You can also check for any additional criteria here, such as allowed characters

    return true;
  };
  const renderFlag = ({imageSource}) => {
    return (
      <HStack alignItems={'center'} space="2">
        <Image
          source={imageSource}
          resizeMode="contain"
          style={{width: 30, height: 25}}
        />
        <Ionicons name={'chevron-down-outline'} size={24} color={'gray'} />
      </HStack>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, {width}]}>
        <Image
          source={require('../assets/tawsiletYellow.png')}
          style={{width: 150, height: 30, marginLeft: 20}}
        />
        {loginWithEmail && !forgotPsw && (
          <TouchableOpacity onPress={() => setLoginWithEmail(false)}>
            <Image source={require('../assets/close.png')} />
          </TouchableOpacity>
        )}
        {!loginWithEmail && !forgotPsw && (
          <TouchableOpacity onPress={() => navigation.navigate('onboarding')}>
            <Ionicons name={'close'} size={24} color={'white'} />
          </TouchableOpacity>
        )}
      </View>
      {forgotPsw && (
        <>
          <View style={{width: '90%', gap: 30}}>
            <View style={{width: '100%'}}>
              <View
                style={{
                  gap: 30,
                  backgroundColor: '#23252F',
                  padding: 30,
                  width: wp('90%'),
                  alignSelf: 'center',
                  height: hp(55),
                  shadowColor: '#4d6685',
                  shadowOffset: {
                    width: 1,
                    height: 1, // Adjust the height to move the shadow below the view
                  },
                  shadowOpacity: 0.3, // Adjust the opacity for a lighter shadow
                  shadowRadius: 1.84,
                  elevation: 5,
                  borderRadius: 10,
                  marginTop: 100,
                }}>
                <Text style={styles.headerTitlee}>
                  Entrez votre email de récuperation
                </Text>

                <Image
                  style={{
                    width: 150,
                    height: 150,
                    alignSelf: 'center',
                    marginBottom: -40,
                  }}
                  source={require('../assets/secure.png')}
                />
                <Text
                  style={{
                    color: "white",
                    fontWeight: '700',
                    marginBottom: -30,
                    fontSize: hp(2),
                  }}>
                  Email de Récupération
                </Text>
                <Input
                  onChangeText={text => setEmail(text)}
                  variant={'underlined'}
                  placeholder="Email@example.com"
                  color="white"
                />
                {Errors.email && (
                  <Text style={{color: 'red'}}>{Errors.email}</Text>
                )}
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => {
                    if (validEmail()) {
                      dispatch(forgetPassword(email)).then(() => {
                        setSent(true);
                        setTimeout(() => {
                          setSent(false);
                          setForgotPsw(false);
                        }, 2000);
                      });
                    }
                  }}>
                  <Text style={styles.btnText}>Envoyer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {sent && (
            <Text style={{color: "white", alignSelf: 'center'}}>
              Email de récuperation a été envouyer
            </Text>
          )}
        </>
      )}

      {loginWithEmail && !forgotPsw && (
        <View style={styles.formContainer}>
          <Text style={styles.headerTitlee}>
            Entrez votre Email et mot de passe
          </Text>

          {/* Email Input */}
          <Text style={{color: 'white', fontSize: hp(1.8), marginTop: 30}}>
            Email
          </Text>
          <Controller
            control={control}
            name="identifier"
            render={({field: {onChange, value}}) => (
              <Input
                width={'100%'}
                placeholder="Email@exemple.com"
                onChangeText={onChange}
                value={value}
                style={{color: 'white'}}
              />
            )}
          />
          {errors.identifier && (
            <Text style={{color: 'red', fontSize: hp(1.5)}}>
              {errors.identifier.message}
            </Text>
          )}

          {/* Password Input */}
          <Text style={{color: 'white', fontSize: hp(1.8)}}>Mot de passe</Text>
          <Controller
            control={control}
            name="password"
            render={({field: {onChange, value}}) => (
              <Input
                width={'100%'}
                onChangeText={onChange}
                value={value}
                type={show ? 'text' : 'password'}
                style={{color: 'white'}}
                InputRightElement={
                  <TouchableOpacity onPress={() => setShow(!show)}>
                    <Ionicons
                      style={{paddingRight: 10}}
                      name={show ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={'white'}
                    />
                  </TouchableOpacity>
                }
                placeholder="Mot de passe"
              />
            )}
          />
          {errors.password && (
            <Text style={{color: 'red', fontSize: hp(1.5)}}>
              {errors.password.message}
            </Text>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.btn}
            onPress={handleSubmit(onSubmit)}
            // onPress={() => {
            //   handleSubmit(data => {
            //     // First, validate and get the form data
            //     setLogin(data); // Update the login state with the validated form data
            //     dispatch(userLogin(data)).then(() =>
            //       dispatch(getCurrentUser()),
            //     ); // Dispatch the user login action with the validated data
            //   })();
            // }}
          >
            <Text style={styles.btnText}>Se connecté</Text>
          </TouchableOpacity>
        </View>
      )}
      {!loginWithEmail && !forgotPsw && (
        <>
          <View style={styles.formContainer}>
            <Text style={styles.headerTitle}>Enter your number</Text>

            <Text style={{color: 'white', fontWeight: 500, marginTop: 30}}>
              Phone Number
            </Text>
            <View style={styles.inputContainer}>
              <View style={{flex: 3}}>
                <PhoneInput
                  renderFlag={renderFlag}
                  autoFormat
                  initialCountry="tn"
                  onPressFlag={() => setIsFlagsVisible(true)}
                  onChangePhoneNumber={phone => setNumber(phone)}
                  style={{
                    marginTop: -10,
                    borderBottomWidth: 1,
                    borderColor: '#B2B5C433',
                    backgroundColor: '#23252F',
                    height: 50,
                    paddingLeft: 20,
                  }}
                  textComponent={TextInput} // Use TextInput as the text component
                  textProps={{
                    style: {
                      color: 'white', // Set the text color to black
                    },
                  }}
                  ref={phoneInput}
                />
              </View>
            </View>
            <CountryPicker
              withFilter
              withFlag
              withAlphaFilter
              withCallingCode
              placeholder=""
              onSelect={item => setCountry(item)}
              visible={isFlagsVisible}
              translation="fra"
              filterProps={{placeholder: 'Rechercher...'}}
            />
            <Text
              style={{
                color: colors.secondary_1,
                fontSize: hp(1.6),
                marginTop: -20,
                marginBottom: 10,
              }}>
              We will send an SMS code to verify your number
            </Text>
            <View>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => {
                  if (isPhoneNumberValid()) {
                    navigation.navigate('confirmation', {number});
                  }
                }}>
                <Text style={styles.btnText}>Continuer</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 15,
              }}>
              <View
                style={{
                  width: '40%',
                  marginRight: 90,
                  backgroundColor: 'white',
                }}>
                <Divider />
              </View>
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: hp(1.5),
                }}>
                Or log in using
              </Text>
              <View
                style={{
                  marginLeft: 90,
                  width: '40%',
                  backgroundColor: 'white',
                }}>
                <Divider />
              </View>
            </View>
            <View>
              <TouchableOpacity
                style={styles.btne}
                onPress={() => {
                  setLoginWithEmail(true);
                }}>
                <Text style={styles.btnText}>Se connecté par E-mail</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setForgotPsw(true)}>
                <Text
                  style={{
                    color: colors.primary,
                    marginTop: 10,
                    alignSelf: 'center',
                  }}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp(6),
    backgroundColor:"black"
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp(9),
    paddingBottom: hp(2.5),
    gap: hp(1),
    width: wp('100%'),
    backgroundColor: 'red',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp(1),
  },
  headerTitlee: {
    marginTop: 10,
    fontWeight: '700',
    fontSize: 18,
    color: 'white',
  },
  headerTitle: {
    marginTop: 50,
    fontWeight: '700',
    fontSize: hp(3),
    color: 'white',
  },
  formContainer: {
    width: wp('100%'),
    padding: hp(2),

    gap: hp(1),
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: hp(1),
    width: '100%',
  },
  countryFlagContainer: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    justifyContent: 'center',
  },
  countryFlag: {
    color: 'white',
    fontSize: hp(1.5),
  },
  input: {
    width: wp('100%'),
  },
  btn: {
    padding: hp(2),
    backgroundColor: '#F0C877',
    borderRadius: 5,
    borderColor: colors.primary,
    // Add borders using negative margin trick
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    marginTop: hp(3),
  },
  btne: {
    padding: hp(2),
    backgroundColor: colors.primary,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: hp(3),
  },
  btnText: {
    color: "black",
    textAlign: 'center',
    fontSize: hp(1.7),
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.primary,
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    color: 'white',
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  socialIcon: {
    width: 50,
    height: 50,
  },
});

export default Login;
