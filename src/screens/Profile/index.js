import React, { useEffect, useState } from "react";
import { SafeAreaView, TouchableOpacity, Image, Text, Alert, Linking, View, ScrollView, I18nManager  } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { differenceInMonths, differenceInDays, parseISO } from "date-fns";
import { OneSignal } from "react-native-onesignal";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/colors';
import { styles } from './styles';
import ProfileHeader from './components/ProfileHeader';
 import LogoutModal from './components/LogoutModal';
import ImagePickerModal from './components/ImagePickerModal';
import LanguageModal from './components/LanguageModal';
import DeleteAccountModal from './components/DeleteAccountModal';
import {
  getCurrentUser,
  logOut,
  uplaodImage,
} from "../../store/userSlice/userSlice";

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isAuth = useSelector((state) => state.user.token);
  const user = useSelector((state) => state?.user?.currentUser);

  // State variables
  const [galleyModal, setGalleyModal] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

  // Check if the user is authenticated
  useEffect(() => {
    if (!isAuth) {
      navigation.navigate("Login");
    }
  }, [isAuth, dispatch]);

  // Handle logout action
  const handleLogout = () => {
    dispatch(logOut()).then(() => {
      OneSignal.logout();
      navigation.navigate("Login");
    });
  };

  // Handle image upload
  const uploadImage = async (type) => {
    try {
      const options = {
        storageOptions: {
          path: "image",
        },
      };

      const imagePicker =
        type === "gallery" ? launchImageLibrary : launchCamera;

      imagePicker(options, async (res) => {
        if (res.assets && res.assets[0]) {
          const formData = new FormData();
          formData.append("ref", "plugin::users-permissions.user");
          formData.append("refId", user?.id);
          formData.append("field", "profilePicture");
          formData.append("files", {
            uri: res.assets[0].uri,
            type: res.assets[0].type,
            name: res.assets[0].fileName,
          });

          await dispatch(uplaodImage(formData)).then(() =>
            dispatch(getCurrentUser())
          );
        }
      });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const menuButtons = [
    { title: t('profile.menu.information'), screen: 'PersonalInfo' },
    { title: t('profile.menu.security'), screen: 'Security' },
 
    { title: t('profile.menu.help'), screen: 'Help' },
  ];

  // Handle account deletion
  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = () => {
    console.log("Account deletion confirmed");
    setDeleteModalVisible(false);
    // Add your account deletion logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ProfileHeader
          user={user}
          onImagePress={() => setGalleyModal(true)}
        />
        
       
        <View style={styles.menuContainer}>
          {menuButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuButton}
              onPress={() => navigation.navigate(button.screen)}
            >
              <Text style={styles.menuButtonText}>{button.title}</Text>
              <Ionicons name={I18nManager.isRTL ? "chevron-back-outline" : "chevron-forward-outline"} size={24} color={"#000"} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setLanguageModalVisible(true)}
          >
            <Text style={styles.menuButtonText}>{t('profile.language.title')}</Text>
            <Ionicons name="language-outline" size={24} color={"#000"} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="log-out-outline" size={24} color={"#000"} />
          <Text style={styles.logoutText}>{t('profile.logout.button')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, { marginTop: 10, backgroundColor: '#ffebee' }]}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={24} color="#d32f2f" />
          <Text style={[styles.logoutText, { color: '#d32f2f' }]}>{t('profile.delete_account.button')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <LogoutModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onLogout={handleLogout}
      />

      <ImagePickerModal
        isVisible={galleyModal}
        onClose={() => setGalleyModal(false)}
        onCameraPress={() => {
          setGalleyModal(false);
          uploadImage("camera");
        }}
        onGalleryPress={() => {
          setGalleyModal(false);
          uploadImage("gallery");
        }}
      />

      <LanguageModal
        isVisible={isLanguageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />

      <DeleteAccountModal
        isVisible={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onDelete={confirmDeleteAccount}
      />
    </SafeAreaView>
  );
};

export default Profile;
