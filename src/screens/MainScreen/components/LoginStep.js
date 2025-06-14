import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { OneSignal } from "react-native-onesignal";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { googleSignIn, appleSignIn } from '../../../services/socialAuth';
import { userRegister } from '../../../store/userSlice/userSlice';
import EmailLoginForm from '../../../screens/Login/components/EmailLoginForm';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginStep = ({ onLoginSuccess, onBack, onRegisterPress }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await googleSignIn();
      OneSignal.login(String(result.user.id));
      console.log("resultresult",result)
      if(!result.user.email||!result.user.lastName||!result.user.firstName||!result.user.phoneNumber)
         
        onRegisterPress(result)
else  
    {
      await dispatch(userRegister(result));
      onLoginSuccess();
    }
    } catch (error) {
      console.log(error, 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setIsAppleLoading(true);
      const result = await appleSignIn();
      OneSignal.login(String(result.user.id));
      if(!result.user.email||!result.user.lastName||!result.user.firstName||!result.user.phoneNumber)
         
      onRegisterPress(result)
else {    
      await dispatch(userRegister(result));

      onLoginSuccess();}
    } catch (error) {
      console.log(error, 'error');
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleEmailLoginSuccess = () => {
    onLoginSuccess();
  };

  return (
    <View style={styles.container}>
      

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#0c0c0c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('login.needToLogin')}</Text>
       
      </View>

       
      
        

      <View style={styles.formContainer}>
        <EmailLoginForm hideForgetPassword={true} onLoginSuccess={handleEmailLoginSuccess} />
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>{t('login.orLoginWith')}</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socialLoginContainer}>
       {Platform.OS=="ios"&&( <TouchableOpacity 
          style={styles.socialButton} 
          onPress={handleAppleLogin}
          disabled={isAppleLoading}
        >
          {isAppleLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <FontAwesome name="apple" size={24} color="#000" />
              <Text style={[styles.socialButtonText, { color: '#000' }]}>
                Apple
              </Text>
            </>
          )}
        </TouchableOpacity>)}

        <TouchableOpacity 
          style={styles.socialButton} 
          onPress={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <ActivityIndicator size="small" color="#DB4437" />
          ) : (
            <>
              <FontAwesome name="google" size={24} color="#DB4437" />
              <Text style={[styles.socialButtonText, { color: '#DB4437' }]}>
                Google
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.registerButton}
        onPress={onRegisterPress}
      >
        <Text style={styles.registerButtonText}>
          {t('login.registerNow')}
        </Text>
      </TouchableOpacity>
 
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: '#fff', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 

},
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
   // justifyContent: 'space-between',
 //   paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width:"100%",
    gap:10
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    width:"80%"
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8391A1',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECF4',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#8391A1',
    fontSize: 14,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8F9',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: '#E8ECF4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  guestButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderWidth:3,
    borderColor:"#0c0c0c",
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#0c0c0c',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginStep; 