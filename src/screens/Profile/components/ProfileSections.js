import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, Linking, Alert } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import Icon from "react-native-vector-icons/FontAwesome";
import { useTranslation } from 'react-i18next';
import ProfileSection from '../../../components/ProfileSection';
import { styles } from '../styles';
import { colors } from '../../../utils/colors';

const ProfileSections = ({
  user,
  toEdit,
  handleToggleSection,
  handleUpdate,
  updateUserData,
  setUpdateUserData,
  handleUpdatePassword,
  handleCall,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isDateEndingSoon,
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    handleUpdatePassword(data);
  };

  return (
    <ScrollView style={styles.sectionsContainer}>
      {/* Véhicule Section */}
      <ProfileSection
        title={t('profile.vehicle.title')}
        icon={
          <Image
            source={require("../../../assets/vehicule.png")}
            style={styles.sectionIcon}
          />
        }
        isOpen={toEdit.vehicule}
        onPress={() => handleToggleSection("vehicule")}
      >
        <View style={styles.sectionContent}>
          <Text style={styles.sectionText}>
            {t('profile.vehicle.brand')}: {user?.vehicule?.mark}
          </Text>
          <Text style={styles.sectionText}>
            {t('profile.vehicle.plate')}: {user?.vehicule?.matriculation}
          </Text>
          <Text
            style={[
              styles.sectionText,
              {
                color: isDateEndingSoon(user?.vehicule?.assuranceDate)
                  ? "red"
                  : "grey",
              },
            ]}
          >
            {t('profile.vehicle.insurance')}: {user?.vehicule?.assuranceDate || t('profile.vehicle.not_available')}
          </Text>
        </View>
      </ProfileSection>

      {/* Modifier le profil Section */}
      <ProfileSection
        title={t('profile.edit_profile.title')}
        icon={
          <Image
            source={require("../../../assets/editProfile.png")}
            style={{ height: 20, width: 20 }}
          />
        }
        isOpen={toEdit.edit}
        onPress={() => handleToggleSection("edit")}
      >
        <View style={styles.sectionContent}>
          <TextInput
            style={styles.input}
            placeholder={t('profile.edit_profile.first_name')}
            placeholderTextColor="#999"
            value={updateUserData.firstName}
            onChangeText={(text) =>
              setUpdateUserData({ ...updateUserData, firstName: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder={t('profile.edit_profile.last_name')}
            placeholderTextColor="#999"
            value={updateUserData.lastName}
            onChangeText={(text) =>
              setUpdateUserData({ ...updateUserData, lastName: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder={t('profile.edit_profile.phone')}
            placeholderTextColor="#999"
            value={updateUserData.phoneNumber}
            onChangeText={(text) =>
              setUpdateUserData({ ...updateUserData, phoneNumber: text })
            }
          />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
          <Text style={styles.saveButtonText}>{t('profile.edit_profile.save')}</Text>
        </TouchableOpacity>
      </ProfileSection>

      {/* Password Section */}
      <ProfileSection
        title={t('profile.password.title')}
        icon={
          <Image
            source={require("../../../assets/password.png")}
            style={styles.sectionIcon}
          />
        }
        isOpen={toEdit.password}
        onPress={() => handleToggleSection("password")}
      >
        <View style={styles.sectionContent}>
          <View style={styles.passwordInputContainer}>
            <Controller
              control={control}
              name="currentPassword"
              rules={{ required: t('profile.password.current_password_required') }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder={t('profile.password.current_password')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showCurrentPassword}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showCurrentPassword ? "eye-slash" : "eye"}
                size={20}
                color="#000"
              />
            </TouchableOpacity>
          </View>
          {errors.currentPassword && (
            <Text style={styles.errorText}>
              {errors.currentPassword.message}
            </Text>
          )}
          <View style={styles.passwordInputContainer}>
            <Controller
              control={control}
              name="password"
              rules={{ required: t('profile.password.new_password_required') }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder={t('profile.password.new_password')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showNewPassword ? "eye-slash" : "eye"}
                size={20}
                color="#000"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          )}
          <View style={styles.passwordInputContainer}>
            <Controller
              control={control}
              name="passwordConfirmation"
              rules={{
                required: t('profile.password.confirm_password_required'),
                validate: (value) =>
                  value === control._formValues.password ||
                  t('profile.password.passwords_not_match'),
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder={t('profile.password.confirm_password')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showConfirmPassword ? "eye-slash" : "eye"}
                size={20}
                color="#000"
              />
            </TouchableOpacity>
          </View>
          {errors.passwordConfirmation && (
            <Text style={styles.errorText}>
              {errors.passwordConfirmation.message}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.saveButtonText}>{t('profile.password.update')}</Text>
        </TouchableOpacity>
      </ProfileSection>

      {/* Centre d'aide Section */}
      <ProfileSection
        title={t('profile.help_center.title')}
        icon={
          <Image
            source={require("../../../assets/contactUs.png")}
            style={{ height: 20, width: 20 }}
          />
        }
        isOpen={toEdit.contact}
        onPress={() => handleToggleSection("contact")}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "flex-start",
            display: "flex",
            width: "90%",
            flexDirection: "row",
            height: 200,
            gap: 0,
            marginTop: -40,
          }}
        >
          <Image
            style={{
              width: 130,
              height: 130,
            }}
            source={require("../../../assets/customer.png")}
          />
          <View
            style={{
              alignItems: "flex-end",
              justifyContent: "flex-end",
              display: "flex",
              flexDirection: "column",
              marginTop: 35,
              width: "55%",
              gap: 5,
            }}
          >
            <Text style={{ color: "white", textAlign: "left" }}>
              {t('profile.help_center.available_24_7')}
            </Text>
            <TouchableOpacity
              onPress={handleCall}
              style={{
                width: "40%",
                padding: 4,
                borderRadius: 5,
                height: "4.5%",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                marginTop: 5,
                display: "flex",
                flexDirection: "row",
                gap: 10,
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 1.84,
                elevation: 5,
                backgroundColor: "#0c0c0c",
                borderWidth: 2,
                borderColor: colors.primary,
                borderRightWidth: 3,
                borderBottomWidth: 3,
                borderTopWidth: 1,
                borderLeftWidth: 1,
              }}
            >
              <Text style={{ color: "black", fontWeight: "600" }}>
                {t('profile.help_center.call_us')}
              </Text>
              <Image
                style={{
                  width: 20,
                  height: 20,
                }}
                source={require("../../../assets/telephone.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ProfileSection>
    </ScrollView>
  );
};

export default ProfileSections;
