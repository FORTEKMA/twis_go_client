import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Toast } from 'native-base';
import { styles } from '../styles';
import { updateUser, getCurrentUser } from '../../../store/userSlice/userSlice';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';

const PersonalInfo = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
 

  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.currentUser);
 
  const [userData, setUserData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
 
  });

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      await dispatch(updateUser({
        id: user?.id,
        ...userData
      })).unwrap();
      await dispatch(getCurrentUser());
      
      Toast.show({
        title: t('common.success'),
        description: t('profile.personal_info.update_success'),
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      Toast.show({
        title: t('common.error'),
        description: error?.message || t('profile.personal_info.update_error'),
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
   return (
    <View style={styles.sectionContainer}>
      <Header title={t('profile.personal_info.title')} />
      <ScrollView style={{padding:20}}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('profile.personal_info.first_name')}</Text>
          <TextInput
            placeholder={t('profile.personal_info.first_name')}
            placeholderTextColor={"#ccc"}
            style={styles.input}
            value={userData.firstName}
            onChangeText={(text) => setUserData({ ...userData, firstName: text })}
            
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('profile.personal_info.last_name')}</Text>
          <TextInput
            placeholder={t('profile.personal_info.last_name')}
            placeholderTextColor={"#ccc"}
            style={styles.input}
            value={userData.lastName}
            onChangeText={(text) => setUserData({ ...userData, lastName: text })}
         
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('profile.personal_info.email')}</Text>
          <TextInput
            placeholder={t('profile.personal_info.email')}
            placeholderTextColor={"#ccc"}
            style={styles.input}
            value={userData.email}
            onChangeText={(text) => setUserData({ ...userData, email: text })}
            editable={false}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('profile.personal_info.phone')}</Text>
          <TextInput
            placeholder={t('profile.personal_info.phone')}
            placeholderTextColor={"#ccc"}
            style={styles.input}
            value={userData.phoneNumber}
            onChangeText={(text) => setUserData({ ...userData, phoneNumber: text })}
           
            keyboardType="phone-pad"
          />
        </View>
 

        <TouchableOpacity
          style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {t('common.edit')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PersonalInfo; 