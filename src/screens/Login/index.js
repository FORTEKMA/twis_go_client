import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Alert, useWindowDimensions ,SafeAreaView,Image,View, TouchableOpacity, Text, TextInput, Animated, Easing, ActivityIndicator,Platform} from 'react-native';
import { useDispatch } from 'react-redux';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import * as Yup from 'yup';
 
import EmailLoginForm from './components/EmailLoginForm';
import PhoneLoginForm from './components/PhoneLoginForm';
import { styles } from './styles';
import { updateUser,getCurrentUser,userRegister} from '../../store/userSlice/userSlice';
import { useTranslation } from 'react-i18next';
import { OneSignal } from "react-native-onesignal";
  
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { googleSignIn,facebookSignIn } from '../../services/socialAuth';

const Login = ({ navigation }) => {
  const { t } = useTranslation();
   const dispatch = useDispatch();
 
  const [number, setNumber] = useState('');
 
  const { width } = useWindowDimensions();
  const [loginMethod, setLoginMethod] = useState('email'); 
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  // Add animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const switchWidth = width  - 40; // 90% of screen width minus margins

  // Create interpolated values for smoother transitions
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, switchWidth / 2],
    extrapolate: 'clamp'
  });

  const handleSwitch = (method) => {
    const toValue = method === 'email' ? 0 : 1;
    setLoginMethod(method);
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 250,
      useNativeDriver: true,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Material Design standard easing
    }).start();
  };

  // Initialize animation position
  useEffect(() => {
    slideAnim.setValue(loginMethod === 'email' ? 0 : 1);
  }, []);


  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await googleSignIn();
      const notificationId = await OneSignal.User.pushSubscription.getPushSubscriptionId();
      result.user.notificationId = notificationId;
      dispatch(userRegister(result));
      
    } catch (error) {
      console.log(error, 'error')
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsFacebookLoading(true);
      const result = await facebookSignIn();
      const notificationId = await OneSignal.User.pushSubscription.getPushSubscriptionId();
      result.user.notificationId = notificationId;
      dispatch(userRegister(result));
    
   
    } catch (error) {
      console.log(error, 'error')
    } finally {
      setIsFacebookLoading(false);
    }
  };

  return (
    <SafeAreaView  style={[styles.container, { width }]}> 
 
   
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('login.welcomeBack')}</Text>
      </View>
      {/* Segmented Switch */}
      <View style={[styles.switchContainer, { width: switchWidth }]}>
        <Animated.View 
          style={[
            styles.switchIndicator,
            {
              transform: [{ translateX }]
            }
          ]}
        />
        <TouchableOpacity
          style={[styles.switchButton, loginMethod === 'email' && styles.switchButtonActive]}
          onPress={() => handleSwitch('email')}
        >
          <Text style={[styles.switchText, loginMethod === 'email' && styles.switchTextActive]}>{t('login.email')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, loginMethod === 'phone' && styles.switchButtonActive]}
          onPress={() => handleSwitch('phone')}
        >
          <Text style={[styles.switchText, loginMethod === 'phone' && styles.switchTextActive]}>{t('login.phoneNumber')}</Text>
        </TouchableOpacity>
      </View>
      {  loginMethod === 'phone' ? (
        <View style={styles.formContainer}>
              <PhoneLoginForm/>
            
          
          
        </View>
      ) : (
        <EmailLoginForm/>
      )}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>{t('login.orLoginWith')}</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity style={styles.socialIcon} onPress={handleFacebookLogin}>
          {isFacebookLoading ? (
            <ActivityIndicator size="small" color="#4267B2" />
          ) : (
            <FontAwesome name="facebook" size={30} color="#4267B2" />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.socialIcon} 
          onPress={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <ActivityIndicator size="small" color="#DB4437" />
          ) : (
            <FontAwesome name="google" size={30} color="#DB4437" />
          )}
        </TouchableOpacity>
    
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
        <Text style={styles.registerText}>{t('login.noAccount')} <Text style={styles.registerNow}>{t('login.registerNow')}</Text></Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.guestBtn} onPress={() =>  dispatch(userRegister({
       user:{ username: 'Guest',
        email: 'guest@example.com',
        phoneNumber: '',
        password: '',
  
        user_role: 'client',},
        jwt: -1,
      }))}>
        <Text style={styles.guestBtnText}>{t('login.enterAsGuest') || 'Enter as Guest'}</Text>
      </TouchableOpacity>
   
    </SafeAreaView>
  );
};

export default Login; 