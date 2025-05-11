import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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

  useLayoutEffect(() => {
    // Hide tab bar
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      // Show tab bar again on exit
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [navigation]);

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

  return (
    <View style={styles.sectionContainer}>
      <Header title={t('profile.security.title')} />
      <ScrollView style={{padding:20}}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('profile.security.current_password')}</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, errors.currentPassword && styles.inputError]}
              value={passwordData.currentPassword}
              onChangeText={(text) => {
                setPasswordData({ ...passwordData, currentPassword: text });
                if (errors.currentPassword) {
                  setErrors({ ...errors, currentPassword: null });
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
          {errors.currentPassword && (
            <Text style={styles.errorText}>{errors.currentPassword}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('profile.security.new_password')}</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={passwordData.password}
              onChangeText={(text) => {
                setPasswordData({ ...passwordData, password: text });
                if (errors.password) {
                  setErrors({ ...errors, password: null });
                }
              }}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Icon
                name={showNewPassword ? 'eye' : 'eye-off'}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <View>
              {errors.password.map((error, index) => (
                <Text key={index} style={styles.errorText}>{error}</Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('profile.security.confirm_password')}</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, errors.passwordConfirmation && styles.inputError]}
              value={passwordData.passwordConfirmation}
              onChangeText={(text) => {
                setPasswordData({ ...passwordData, passwordConfirmation: text });
                if (errors.passwordConfirmation) {
                  setErrors({ ...errors, passwordConfirmation: null });
                }
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon
                name={showConfirmPassword ? 'eye' : 'eye-off'}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          </View>
          {errors.passwordConfirmation && (
            <Text style={styles.errorText}>{errors.passwordConfirmation}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleUpdatePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#01050D" />
          ) : (
            <Text style={styles.saveButtonText}>{t('profile.security.update_button')}</Text>
          )}
        </TouchableOpacity>
        <View style={{height:100}}></View>
      </ScrollView>
    </View>
  );
};

export default Security; 