import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../styles';
import { useDispatch } from 'react-redux';
import { userLogin ,updateUser,getCurrentUser} from '../../../store/userSlice/userSlice';
import { useTranslation } from 'react-i18next';
import { OneSignal } from "react-native-onesignal";

const EmailLoginForm = () => {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      identifier: 'ghoudi000@gmail.com',
      password: '123456789m'
    },
    mode: 'onChange'
  });
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');
    try {
      const result = await dispatch(userLogin(data));
      console.log(result, 'result');
      if(result?.payload?.error){
        setLoginError(t('login.invalidCredentials'));
      }
      else {
        const notificationId =await OneSignal.User.pushSubscription.getPushSubscriptionId();
         
        await dispatch(updateUser({
          id: result?.id,
          notificationId
        })).unwrap();
        await dispatch(getCurrentUser());
      }
        
    } catch (error) {
      console.log(error);
      setLoginError(t('login.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="identifier"
          rules={{
            required: t('login.emailRequired'),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('login.invalidEmail')
            }
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={[styles.input, errors.identifier && styles.inputError]}
              placeholder={t('login.emailPlaceholder')}
              placeholderTextColor="#8391A1"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />
        {errors.identifier && (
          <Text style={styles.errorText}>{errors.identifier.message}</Text>
        )}
      </View>
      <View style={styles.inputContainer}>
        <View style={[styles.passwordInputWrapper, errors.password && styles.inputError]}>
          <Controller
            control={control}
            name="password"
            rules={{
              required: t('login.passwordRequired'),
              minLength: {
                value: 6,
                message: t('login.passwordMinLength')
              }
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                style={styles.passwordInput}
                placeholder={t('login.passwordPlaceholder')}
                placeholderTextColor="#8391A1"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                secureTextEntry={!show}
              />
            )}
          />
          <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeIcon}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color="#8391A1" />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={[styles.errorText,{marginTop: 0}]}>{errors.password.message}</Text>
        )}
      </View>
      {loginError ? (
        <Text style={[styles.errorText, { marginTop: 10 }]}>{loginError}</Text>
      ) : null}
      <TouchableOpacity onPress={onForgotPassword}>
        <Text style={styles.forgotPassword}>{t('login.forgotPassword')}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.btn, isLoading && styles.btnDisabled]} 
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.btnText}>{t('login.login')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EmailLoginForm; 