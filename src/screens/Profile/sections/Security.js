import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView, SafeAreaView, StatusBar, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useDispatch } from 'react-redux';
import { styles } from '../styles';
import { changePassword } from '../../../store/userSlice/userSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Toast } from 'native-base';

const Security = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    password: '',
    passwordConfirmation: '',
  });

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push(t('profile.security.validation.min_length'));
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('profile.security.validation.uppercase'));
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t('profile.security.validation.lowercase'));
    }
    if (!/[0-9]/.test(password)) {
      errors.push(t('profile.security.validation.number'));
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push(t('profile.security.validation.special'));
    }
    return errors;
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t('profile.security.validation.current_required');
    }

    const passwordErrors = validatePassword(passwordData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors;
    }

    if (passwordData.password !== passwordData.passwordConfirmation) {
      newErrors.passwordConfirmation = t('profile.security.validation.passwords_not_match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validateInputs()) {
      Toast.show({
        title: t('profile.security.validation.title'),
        description: Object.values(errors)
          .flat()
          .join('\n'),
        placement: "top",
        status: "error"
      });
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(changePassword(passwordData)).unwrap();
      Toast.show({
        title: t('common.success'),
        description: t('profile.security.update_success'),
        placement: "top",
        status: "success"
      });
      setPasswordData({
        currentPassword: '',
        password: '',
        passwordConfirmation: '',
      });
      setErrors({});
    } catch (error) {
      Toast.show({
        title: t('common.error'),
        description: error?.response?.data?.error?.message ||
          t('profile.security.update_error'),
        placement: "top",
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (label, field, placeholder, secureTextEntry = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{t(label)}</Text>
      {secureTextEntry ? (
        <View style={[styles.passwordContainer, errors[field] && styles.passwordContainerError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder={t(placeholder)}
            placeholderTextColor="#ccc"
            value={passwordData[field]}
            onChangeText={(text) => {
              setPasswordData({ ...passwordData, [field]: text });
              if (errors[field]) {
                setErrors({ ...errors, [field]: null });
              }
            }}
            secureTextEntry={!showCurrentPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            <Icon
              name={showCurrentPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TextInput
          style={[styles.input, errors[field] && styles.inputError]}
          placeholder={t(placeholder)}
          placeholderTextColor="#ccc"
          value={passwordData[field]}
          onChangeText={(text) => {
            setPasswordData({ ...passwordData, [field]: text });
            if (errors[field]) {
              setErrors({ ...errors, [field]: null });
            }
          }}
          secureTextEntry={secureTextEntry}
        />
      )}
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.mainContainer}>
            <Header style={{paddingTop:0}} title={t('profile.security.title')} />
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.stepContainer}>
                <View style={styles.formContainer}>
                  {renderInput(
                    'profile.security.current_password',
                    'currentPassword',
                    'profile.security.current_password',
                    true
                  )}
                  {renderInput(
                    'profile.security.new_password',
                    'password',
                    'profile.security.new_password',
                    true
                  )}
                  {renderInput(
                    'profile.security.confirm_password',
                    'passwordConfirmation',
                    'profile.security.confirm_password',
                    true
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.nextButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleUpdatePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {t('profile.security.update_button')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Security; 