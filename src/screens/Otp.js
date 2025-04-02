/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {sendVerify, verify} from '../store/userSlice/userSlice';
import {Input, KeyboardAvoidingView} from 'native-base';
import {colors} from '../utils/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const Otp = ({route, navigation}) => {
  const {number} = route.params;

  const {width} = useWindowDimensions();
  const [otp, setOTP] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState(false);
  const [error2, setError2] = useState(false);
  const dispatch = useDispatch();
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [activeInput, setActiveInput] = useState(0);

  useEffect(() => {
    navigation.navigate('Register', {number: number});
    if (!verificationSent) {
      dispatch(sendVerify(number));
      setVerificationSent(true);
    }
  }, [dispatch, number, verificationSent]);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleOTPEnter = async () => {
    const enteredOTP = otp.join('');

    // Verify the entered OTP
    dispatch(verify({phoneNumber: number, code: enteredOTP})).then(res => {
      console.log(res.payload, '==================');
      if (!res.payload.success) {
        setError(true);
      } else {
        if (res.payload.user_role !== 'client' && res.payload.authToken) {
          setError2(true);
        } else {
          navigation.navigate('Register', {number: number});
        }
      }
    });
  };

  const focusNextInput = index => {
    if (index < inputRefs.length - 1) {
      setActiveInput(index + 1);
      inputRefs[index + 1].current.focus();
    }
  };

  const handleBackspace = index => {
    if (index > 0) {
      const updatedOTP = [...otp];
      updatedOTP[index - 1] = '';
      setOTP(updatedOTP);
      inputRefs[index - 1].current.focus();
    }
  };

  const handleInputChange = (text, index) => {
    const updatedOTP = [...otp];
    updatedOTP[index] = text;
    setOTP(updatedOTP);

    if (text !== '' && index < inputRefs.length - 1) {
      focusNextInput(index);
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace') {
      handleBackspace(index);
    }
  };

  const handleLastDigitInput = (text, index) => {
    handleInputChange(text, index);
    if (index === inputRefs.length - 1 && text !== '') {
      handleOTPEnter();
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView>
        <View style={styles.titleContainer}>
          <Text
            style={{
              fontWeight: '700',
              color: 'white',
              fontSize: 18,
              marginBottom: -17,
            }}>
            Entrez votre code OTP ici.
          </Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={inputRefs[index]}
                style={styles.otpInput}
                onChangeText={text => handleInputChange(text, index)}
                onKeyPress={event => handleKeyPress(event, index)}
                onSubmitEditing={() => handleLastDigitInput(otp[index], index)}
                value={digit}
                keyboardType="numeric"
                maxLength={1}
                autoFocus={index === activeInput}
              />
            ))}
          </View>
          <View style={{flexDirection: 'row', gap: 5}}>
            <Text
              style={{
                fontWeight: '400',
                color: 'white',
                marginTop: -17,
              }}>
              Vous n'avez pas reçu l'OTP ?
            </Text>
            <TouchableOpacity
              onPress={() => {
                setTimer(60);
                dispatch(sendVerify(number));
              }}>
              <Text
                style={{
                  fontWeight: '700',
                  color: 'white',
                  marginTop: -17,
                }}>
                Renvoyer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{width, padding: 10}}>
          <TouchableOpacity style={styles.btn} onPress={handleOTPEnter}>
            <Text style={styles.btnText}>Verify</Text>
          </TouchableOpacity>
        </View>
        {error && (
          <Text style={{color: 'red', alignSelf: 'center'}}>
            Code est invalid !
          </Text>
        )}
        {error2 && (
          <Text style={{color: 'red', alignSelf: 'center'}}>
            Un problème est survenu
          </Text>
        )}
        {timer > 0 && (
          <View style={styles.timerContainer}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <Text style={styles.timerText}>{timer}s</Text>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Otp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    backgroundColor: '#01050D',
  },
  titleContainer: {
    padding: 10,
    gap: 50,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 7,
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  otpInput: {
    height:70,
    fontSize: 23,
    textAlign: 'center',
    flexBasis: '20%',
    borderWidth: 1, // Add a border to make borderRadius visible
    borderColor: 'white', // Light gray border
    backgroundColor: '#434343',
    color:"white"
    
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    marginTop: 50,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#F0C877',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0C877',
    borderColor: 'rgba(24, 54, 90, 1)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btn: {
    padding: 20,

    backgroundColor: '#F0C877',
    width: '100%',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.primary,
    // Add borders using negative margin trick
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    marginTop: 30,
  },
  btnText: {
    color: 'black',
    textAlign: 'center',
    fontSize: hp(1.7),
    fontWeight: '600',
  },
});
