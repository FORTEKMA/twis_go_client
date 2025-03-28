/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Platform,
  TextInput,
  Alert,
  Linking,
} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  changePassword,
  getCurrentUser,
  logOut,
  updateUser,
  uplaodImage,
} from '../store/userSlice/userSlice';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {OneSignal} from 'react-native-onesignal';
import {colors} from '../utils/colors';

import {initCommandeState} from '../store/commandeSlice/commandeSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
// import { border } from 'native-base/lib/typescript/theme/styled-system';
const Profile = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector(state => state.user.token);
  const user = useSelector(state => state.user?.currentUser);
  const navigation = useNavigation();
  const [isModalVisiblee, setModalVisiblee] = useState(false);
  const [isEditProfileModalVisible, setEditProfileModalVisible] =
    useState(false);
  const [galleyModal, setGalleyModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('french');
  const [isModalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [toEdit, setToEdit] = useState({
    edit: false,
    address: false,
    langue: false,
    contact: true,
    privecy: false,
    password: false,
  });
  const [updateUserData, setUpdateUserData] = useState({
    id: user?.id,
    username: user?.email,
    // email: user?.email,
    phoneNumber: user?.phoneNumber,
    firstName: user?.firstName,
    lastName: user?.lastName,
    cin: user?.cin,
  });

  const languages = [
    {id: 'arabic', label: 'Arabe'},
    {id: 'french', label: 'Français'},
    {id: 'english', label: 'Anglais (US)'},
  ];
  const handleAddAddress = () => {
    if (newAddress.trim() === '') {
      Alert.alert('Veuillez entrer une adresse valide.'); // Alert if the address is empty
      return;
    }

    setModalVisiblee(false);
    setNewAddress('');
  };

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();

  const handleSelect = id => {
    setSelectedLanguage(id);
  };
  const handleCall = () => {
    const phoneNumber = `tel:${36848020}`;
    Linking.openURL(phoneNumber).catch(err => {
      console.error('Failed to open phone call:', err);
      Alert.alert('Erreur', 'Impossible de passer un appel téléphonique.');
    });
  };

  // useEffect(() => {
  //   if (!isAuth) {
  //     navigation.navigate('onboarding');
  //   }
  // }, [isAuth, dispatch, navigation]);

  // // // Handle logout action
  // const handleLogout = () => {
  //   dispatch(logOut()).then(() => {
  //     dispatch(initCommandeState());
  //     OneSignal.logout();
  //   });
  //   navigation.navigate('onboarding');
  // };
  // Check if the user is authenticated
  useEffect(() => {
    if (!isAuth) {
      navigation.navigate('onboarding');
    }
  }, [isAuth, dispatch, navigation]);

  // Handle logout action
  const handleLogout = () => {
    dispatch(logOut()).then(() => {
      // dispatch(initCommandeState());
      OneSignal.logout();
      navigation.navigate('onboarding');
    });
  };

  const handleToggleSection = section => {
    setToEdit(prevState => {
      const updatedState = Object.fromEntries(
        Object.entries(prevState).map(([key, value]) => [
          key,
          key === section ? !value : false,
        ]),
      );
      return updatedState;
    });
  };
  // Handle image upload
  const uploadImage = async type => {
    try {
      const options = {
        storageOptions: {
          path: 'image',
        },
      };

      const imagePicker =
        type === 'gallery' ? launchImageLibrary : launchCamera;

      imagePicker(options, async res => {
        if (res.assets && res.assets[0]) {
          const formData = new FormData();
          formData.append('ref', 'plugin::users-permissions.user');
          formData.append('refId', user?.id);
          formData.append('field', 'profilePicture');
          formData.append('files', {
            uri: res.assets[0].uri,
            type: res.assets[0].type,
            name: res.assets[0].fileName,
          });

          await dispatch(uplaodImage(formData)).then(() =>
            dispatch(getCurrentUser()),
          );
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // const uploadImage = async type => {
  //   try {
  //     let options = {
  //       storageOptions: {
  //         path: 'image',
  //       },
  //     };

  //     if (type === 'gallery') {
  //       launchImageLibrary(options, async res => {
  //         var formData = new FormData();
  //         formData.append('ref', 'plugin::users-permissions.user');
  //         formData.append('refId', user?.id);
  //         formData.append('field', 'profile_picture');
  //         formData.append('files', {
  //           uri: res.assets[0].uri,
  //           type: res.assets[0].type,
  //           name: res.assets[0].fileName,
  //         });

  //         try {
  //           await dispatch(uplaodImage(formData)).then(() =>
  //             dispatch(getCurrentUser()),
  //           );
  //         } catch (error) {
  //           console.error('Error uploading image:', error);
  //         }
  //       });
  //     }

  //     if (type === 'camera') {
  //       launchCamera(options, async res => {
  //         var formData = new FormData();
  //         formData.append('ref', 'plugin::users-permissions.user');
  //         formData.append('refId', user?.id);
  //         formData.append('field', 'profile_picture');
  //         formData.append('files', {
  //           uri: res.assets[0].uri,
  //           type: res.assets[0].type,
  //           name: res.assets[0].fileName,
  //         });

  //         try {
  //           await dispatch(uplaodImage(formData)).then(() =>
  //             dispatch(getCurrentUser()),
  //           );
  //         } catch (error) {
  //           console.error('Error uploading image:', error);
  //         }
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error selecting image:', error);
  //   }
  // };

  const handleUpdatee = () => {
    dispatch(updateUser(updateUserData)).then(() => dispatch(getCurrentUser()));
    setEditProfileModalVisible(false);
  };
  const handleUpdatePassword = async e => {
    if (e.password !== e.passwordConfirmation) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      const resultAction = await dispatch(changePassword(e)).unwrap();
      Alert.alert('Succès', 'Mot de passe mis à jour avec succès!');
      setToEdit({password: false}); // Close the password section

      // If the user is a driver, update the token in the state
      if (resultAction.user.user_role === 'client') {
      }
    } catch (error) {
      console.error('Error updating password:', error); // Debugging: Log the error
      Alert.alert(
        'Erreur',
        error?.response?.data?.error?.message ||
          'Échec de la mise à jour du mot de passe.',
      );
    }
  };
  const onSubmit = data => {
    handleUpdatePassword(data); // Pass the form data to the parent handler
  };
  return (
    <ScrollView
      style={{
        width: wp('100%'),
        backgroundColor: 'white',
        height: 'auto',
        alignSelf: 'center',
        position: 'absolute',
        top: Platform.OS === 'android' ? 15 : 70,
        zIndex: 10,
      }}>
      <View
        style={{
          marginTop: 50,
          width: wp('90%'),
          backgroundColor: 'white',
          height: hp(10),
          alignSelf: 'center',
          position: 'absolute',
          top: Platform.OS === 'android' ? 15 : 70,
          zIndex: 10,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{flexDirection: 'row', position: 'relative'}}>
          {/* {galleyModal && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={galleyModal}
              onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                setGalleyModal(!galleyModal);
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.modalHead}>
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: hp(1.5),
                        color: 'black',
                      }}>
                      Choisir..
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 75,
                      }}>
                      <TouchableOpacity
                        onPress={() => uploadImage('camera')}
                        style={{
                          padding: 15,
                          backgroundColor: colors.general_2,
                          borderRadius: 20,
                        }}>
                        <Ionicons
                          name={'camera-outline'}
                          size={50}
                          color={'black'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => uploadImage('gallery')}
                        style={{
                          padding: 15,
                          backgroundColor: colors.general_2,
                          borderRadius: 20,
                        }}>
                        <Ionicons
                          name={'images-outline'}
                          size={50}
                          color={'black'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Pressable
                    style={styles.modalBottom}
                    onPress={() => {
                      setGalleyModal(false);
                    }}>
                    <Text
                      style={{
                        color: colors.general_2,
                        fontSize: hp(1.8),
                        fontWeight: '600',
                      }}>
                      Annuler
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          )} */}
          {galleyModal && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={galleyModal}
              onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                setGalleyModal(!galleyModal);
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.modalHead}>
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: hp(1.5),
                        color: 'black',
                      }}>
                      Choisir..
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',

                        alignItems: 'center',
                        gap: 75,
                      }}>
                      <TouchableOpacity
                        onPress={() => uploadImage('camera')}
                        style={{
                          padding: 15,
                          backgroundColor: colors.general_2,
                          borderRadius: 20,
                        }}>
                        <Ionicons
                          name={'camera-outline'}
                          size={50}
                          color={'black'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => uploadImage('gallery')}
                        style={{
                          padding: 15,
                          backgroundColor: colors.general_2,
                          borderRadius: 20,
                        }}>
                        <Ionicons
                          name={'images-outline'}
                          size={50}
                          color={'black'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Pressable
                    style={styles.modalBottom}
                    onPress={() => {
                      setGalleyModal(false);
                    }}>
                    <Text
                      style={{
                        color: colors.general_2,
                        fontSize: hp(1.8),
                        fontWeight: '600',
                      }}>
                      Annuler
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          )}
          <TouchableOpacity
            onPress={() => setGalleyModal(true)}
            style={{
              flexDirection: 'row',
              position: 'absolute',
              zIndex: 10,
            }}>
            <Image
              style={{
                width: 25,
                height: 25,
              }}
              source={require('../assets/cameraa.png')}
            />
          </TouchableOpacity>

          <Image
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              objectFit: 'cover',
              marginRight: 15,
            }}
            source={{
              uri: user?.profilePicture
                ? `${user?.profilePicture.url}`
                : 'https://sheelni.dev/static/media/mann.e75d61f7e8d9735ae281.png',
            }}
          />

          <View style={{flexDirection: 'column', justifyContent: 'center'}}>
            <Text
              style={{
                color: colors.primary,
                fontWeight: '700',
                fontSize: hp(2.5),
                fontFamily: 'Trebuchet MS',
              }}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text
              style={{
                color: colors.secondary_2,
                fontSize: hp(2),
                fontWeight: '500',
                marginTop: 5,
              }}>
              {user?.email}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#ECECFA',
                marginTop: 20,
                width: wp('35%'),
                padding: 5,
                borderRadius: 15,
                height: hp('5'),
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 15,
                flexDirection: 'row',
                gap: hp(1.4),
                shadowColor: '#c2d4e4',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 1.84,
                elevation: 5,
              }}
              onPress={() => setEditProfileModalVisible(true)}>
              <Image
                style={{
                  width: 26,
                  height: 26,
                  marginLeft: -5,
                }}
                source={require('../assets/edit-text.png')}
              />
              <Text
                style={{
                  color: '#18365A',
                  fontSize: hp(1.9),
                  fontWeight: '600',
                }}>
                Modifier
              </Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={isEditProfileModalVisible}
              onRequestClose={() => {
                setEditProfileModalVisible(!isEditProfileModalVisible);
              }}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContentEdite}>
                  <Text style={styles.modalTitleEdit}>Modifier le profil</Text>
                  <View style={styles.inputContainerEdit}>
                    <TextInput
                      style={styles.inputEdit}
                      placeholder="Prénom"
                      value={updateUserData.firstName}
                      onChangeText={text =>
                        setUpdateUserData({...updateUserData, firstName: text})
                      }
                    />
                    <TextInput
                      style={styles.inputEdit}
                      placeholder="Nom"
                      value={updateUserData.lastName}
                      onChangeText={text =>
                        setUpdateUserData({...updateUserData, lastName: text})
                      }
                    />
                    <TextInput
                      style={styles.inputEdit}
                      placeholder="Téléphone"
                      value={updateUserData.phoneNumber}
                      onChangeText={text =>
                        setUpdateUserData({
                          ...updateUserData,
                          phoneNumber: text,
                        })
                      }
                    />
                  </View>
                  <View style={styles.modalButtonsEdit}>
                    <TouchableOpacity
                      style={[styles.modalButtonEdit, styles.cancelButtonEdit]}
                      onPress={() => setEditProfileModalVisible(false)}>
                      <Text style={styles.modalButtonTextEdit}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButtonEdit, styles.confirmButtonEdit]}
                      onPress={handleUpdatee}>
                      <Text style={styles.modalButtonTextEdit}>
                        Sauvegarder
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </View>
      </View>

      <View
        style={{
          backgroundColor: 'white',
          padding: 10,
          height: hp('100%'),
          gap: hp(1.7),
          width: wp('90%'),
          alignSelf: 'center',
          marginTop: 250,
        }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: hp(1.7),
            padding: 10,
            justifyContent: 'space-between',
            width: wp('85%'),
            backgroundColor: 'white',
            height: hp(7),
            shadowColor: '#c2d4e4',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 1.84,
            elevation: 5,
            borderRadius: 20,
          }}
          onPress={() => handleToggleSection('password')}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: hp(1.7),
            }}>
            <Image
              style={{
                width: 40,
                height: 40,
              }}
              source={require('../assets/password.png')}
            />
            <Text
              style={{
                color: 'black',
                fontSize: hp(2),
                fontWeight: '600',
              }}>
              Mot de passe
            </Text>
          </View>

          {toEdit.password ? (
            <Ionicons
              name={'chevron-up-outline'}
              size={24}
              color={toEdit.password ? 'red' : 'gray'}
            />
          ) : (
            <Ionicons name={'chevron-down-outline'} size={24} color={'gray'} />
          )}
        </TouchableOpacity>

        {toEdit.password && (
          <View>
            <View style={styles.modalContentEdit}>
              <View style={styles.inputContainerEdit}>
                {/* Current Password Field */}
                <View style={styles.passwordInputContainer}>
                  <Controller
                    control={control}
                    name="currentPassword"
                    rules={{required: 'Mot de passe est requis'}}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        style={styles.inputEditt}
                        placeholder="Tapez mot de passe actuel"
                        secureTextEntry={!showCurrentPassword}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeIcon}>
                    <Icon
                      name={showCurrentPassword ? 'eye-slash' : 'eye'}
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
                    rules={{required: 'Nouveau mot de passe est requis'}}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        style={styles.inputEditt}
                        placeholder="Nouveau mot de passe"
                        secureTextEntry={!showNewPassword}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}>
                    <Icon
                      name={showNewPassword ? 'eye-slash' : 'eye'}
                      size={20}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
                <View style={styles.passwordInputContainer}>
                  <Controller
                    control={control}
                    name="passwordConfirmation"
                    rules={{
                      required: 'Confirm mot de passe est requis',
                      validate: value =>
                        value === control._formValues.password ||
                        'Passwords do not match',
                    }}
                    render={({field: {onChange, onBlur, value}}) => (
                      <TextInput
                        style={styles.inputEditt}
                        placeholder="Confirmer le mot de passe"
                        secureTextEntry={!showConfirmPassword}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}>
                    <Icon
                      name={showConfirmPassword ? 'eye-slash' : 'eye'}
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
              <View style={styles.modalButtonsEdit}>
                <TouchableOpacity
                  style={[styles.modalButtonEdit, styles.confirmButtonEdit]}
                  onPress={handleSubmit(onSubmit)}>
                  <Text style={styles.modalButtonTextEdit}>Mettre à jour</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: hp(1.7),
            padding: 10,
            justifyContent: 'space-between',
            width: wp('85%'),
            backgroundColor: 'white',
            height: hp(7),
            shadowColor: '#c2d4e4',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 1.84,
            elevation: 5,
            borderRadius: 20,
          }}
          onPress={() => handleToggleSection('privecy')}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: hp(1.7),
            }}>
            <Image
              style={{
                width: 40,
                height: 40,
              }}
              source={require('../assets/privecy.png')}
            />
            <Text
              style={{
                color: 'black',
                fontSize: hp(2),
                fontWeight: '600',
              }}>
              Politique de confidentialité
            </Text>
          </View>

          {toEdit.privecy ? (
            <Ionicons
              name={'chevron-up-outline'}
              size={24}
              color={toEdit.privecy ? 'green' : 'gray'}
            />
          ) : (
            <Ionicons name={'chevron-down-outline'} size={24} color={'gray'} />
          )}
        </TouchableOpacity>
        {toEdit.privecy && (
          <View style={{height: hp(50), gap: 5, marginLeft: 10}}>
            <ScrollView style={styles.content}>
              <Text style={styles.sectionTitle}>
                1. Engagement de Confidentialité
              </Text>
              <Text style={styles.sectionText}>
                Nous nous engageons à protéger et à respecter votre vie privée.
                Cette politique de confidentialité explique comment nous
                collectons, utilisons, partageons et protégeons vos données
                personnelles.
              </Text>

              <Text style={styles.sectionTitle}>
                2. Données Personnelles Collectées
              </Text>
              <Text style={styles.subSectionTitle}>
                2.1. Traitement Licite et Transparent
              </Text>
              <Text style={styles.sectionText}>
                Nous traitons vos données personnelles de manière licite, loyale
                et transparente. Seules les informations nécessaires aux fins
                spécifiées dans cette politique sont collectées.
              </Text>
              <Text style={styles.subSectionTitle}>
                2.2. Finalités de la Collecte
              </Text>
              <Text style={styles.sectionText}>
                Les données personnelles que nous collectons peuvent inclure :
                {'\n'}- Adresse IP
                {'\n'}- Localisation approximative
                {'\n'}- Contenu consulté sur le site
              </Text>
              <Text style={styles.subSectionTitle}>2.3. Consentement</Text>
              <Text style={styles.sectionText}>
                En utilisant notre site, vous consentez à la collecte
                automatique de certaines données. Vous avez le droit de retirer
                ce consentement à tout moment.
              </Text>

              <Text style={styles.sectionTitle}>
                3. Base Légale du Traitement
              </Text>
              <Text style={styles.sectionText}>
                Le traitement de vos données est licite lorsqu'il repose sur
                l'une des bases suivantes :{'\n'}- Votre consentement explicite
                {'\n'}- L'exécution d'un contrat
                {'\n'}- Le respect d'une obligation légale
              </Text>

              <Text style={styles.sectionTitle}>
                4. Utilisation des Données Personnelles
              </Text>
              <Text style={styles.sectionText}>
                Vos données sont utilisées uniquement aux fins spécifiées dans
                cette politique, sans utilisation abusive ou non divulguée.
              </Text>

              <Text style={styles.sectionTitle}>
                5. Partage des Données Personnelles
              </Text>
              <Text style={styles.sectionText}>
                Nous pouvons partager vos données avec des tiers uniquement
                lorsque cela est nécessaire pour atteindre les objectifs définis
                dans cette politique. Nous nous assurons que ces tiers
                respectent la confidentialité de vos données.
              </Text>

              <Text style={styles.sectionTitle}>
                6. Durée de Conservation des Données
              </Text>
              <Text style={styles.sectionText}>
                Nous conservons vos données aussi longtemps que nécessaire pour
                atteindre les finalités pour lesquelles elles ont été
                collectées, et conformément aux lois en vigueur.
              </Text>

              <Text style={styles.sectionTitle}>7. Protection des Mineurs</Text>
              <Text style={styles.sectionText}>
                Les utilisateurs de moins de 15 ans doivent obtenir l'accord
                d'un représentant légal avant d'utiliser notre site.
              </Text>

              <Text style={styles.sectionTitle}>
                8. Droits des Utilisateurs
              </Text>
              <Text style={styles.sectionText}>
                Conformément au RGPD, vous disposez des droits suivants :{'\n'}-
                Droit d'accès
                {'\n'}- Droit à l'effacement
                {'\n'}- Droit à la limitation du traitement
                {'\n'}- Droit d'opposition au traitement
                {'\n'}- Droit de rectification
                {'\n'}Pour exercer ces droits, veuillez nous contacter à
                l'adresse suivante :{'\n'}Email : contact@sheelni.com
              </Text>

              <Text style={styles.sectionTitle}>
                9. Politique sur les Cookies
              </Text>
              <Text style={styles.sectionText}>
                Nous utilisons des cookies analytiques pour améliorer la
                conception et la fonctionnalité du site. Consultez notre
                politique sur les cookies pour plus d'informations.
              </Text>

              <Text style={styles.sectionTitle}>
                10. Modifications de la Politique
              </Text>
              <Text style={styles.sectionText}>
                Cette politique peut être mise à jour afin de rester conforme
                aux lois en vigueur. Nous vous invitons à la consulter
                régulièrement.
              </Text>

              <Text style={styles.sectionTitle}>11. Contact</Text>
              <Text style={styles.sectionText}>
                Pour toute question concernant cette politique de
                confidentialité, veuillez nous contacter à :{'\n'}Email :
                contact@sheelni.com
                {'\n'}Merci de faire confiance à Sheelni pour la protection de
                vos données personnelles.
              </Text>
            </ScrollView>
          </View>
        )}

        {/* <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: hp(1.7),
            width: wp('85%'),
            backgroundColor: 'white',
            height: hp(7),
            shadowColor: '#c2d4e4',
            shadowOffset: {
              width: 0,
              height: 1, // Adjust the height to move the shadow below the view
            },
            shadowOpacity: 0.1, // Adjust the opacity for a lighter shadow
            shadowRadius: 1.84,
            elevation: 5,
            borderRadius: 20,
            padding: 10,
            justifyContent: 'space-between',
          }}
          onPress={() => handleToggleSection('address')}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: hp(1.7),
            }}>
            <Image
              style={{
                width: 40,
                height: 40,
                // tintColor: toEdit.address ? colors.secondary : 'black',
              }}
              source={require('../assets/adressgreen.png')}
            />
            <Text
              style={{
                color: 'black',
                fontSize: hp(2),
                fontWeight: '600',
              }}>
              Adresse
            </Text>
          </View>

          {toEdit.address ? (
            <Ionicons
              name={'chevron-up-outline'}
              size={24}
              color={toEdit.address ? colors.secondary : 'gray'}
            />
          ) : (
            <Ionicons name={'chevron-down-outline'} size={24} color={'gray'} />
          )}
        </TouchableOpacity>
        {toEdit.address && (
          <View style={{height: hp(50), gap: 5, marginLeft: 10}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 10,
                marginBottom: 10,
              }}>
              <Text
                style={{
                  color: 'black',
                  paddingLeft: 10,
                  fontSize: hp(1.9),
                  fontWeight: 500,
                }}>
                Maison:
              </Text>

              <View style={styles.inputContainer}>
                <Text
                  style={{
                    color: colors.primary,
                    paddingLeft: 10,
                    fontSize: hp(1.8),
                    fontWeight: 600,
                  }}>
                  {' '}
                  Rue de Bizerte Houmt Souk{' '}
                </Text>
              </View>
            </View>

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 10,
                marginBottom: 10,
              }}>
              <Text
                style={{
                  color: 'black',
                  paddingLeft: 10,
                  fontSize: hp(1.9),
                  fontWeight: 500,
                }}>
                Bureau:
              </Text>
              <View style={styles.inputContainer}>
                <Text
                  style={{
                    color: colors.primary,
                    paddingLeft: 10,
                    fontSize: hp(1.8),
                    fontWeight: 600,
                  }}>
                  Avenue du 14 janvier 2011 Houmt Souk
                </Text>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 10,
                marginBottom: 10,
              }}>
              <Text
                style={{
                  color: 'black',
                  paddingLeft: 10,
                  fontSize: hp(1.9),
                  fontWeight: 500,
                }}>
                Banque
              </Text>
              <View style={styles.inputContainer}>
                <Text
                  style={{
                    color: colors.primary,
                    paddingLeft: 10,
                    fontSize: hp(1.8),
                    fontWeight: 600,
                  }}>
                  Sousse, Messadine, km3, rue ta3mir
                </Text>
              </View>
            </View>

            <View>
              <TouchableOpacity
                onPress={() => setModalVisiblee(true)}
                style={{
                  padding: 15,
                  backgroundColor: colors.secondary,
                  borderRadius: 5,
                  alignItems: 'center',

                  borderWidth: 2,
                  borderColor: colors.primary,

                  borderRightWidth: 5,
                  borderBottomWidth: 5,
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                  marginTop: 30,
                  marginBottom: 30,
                }}>
                <Text
                  style={{
                    color: colors.general_2,
                    fontSize: hp(1.8),
                    fontWeight: 700,
                  }}>
                  Ajout autre adresse
                </Text>
              </TouchableOpacity>
              
              <Modal
                visible={isModalVisiblee}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisiblee(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Ajouter une adresse</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Entrez une adresse"
                      value={newAddress}
                      onChangeText={text => setNewAddress(text)}
                    />

                    <View style={styles.modalButtonsEdit}>
                      <TouchableOpacity
                        style={[
                          styles.modalButtonEdit,
                          styles.cancelButtonEdit,
                        ]}
                        onPress={() => setModalVisiblee(false)}>
                        <Text style={styles.modalButtonTextEdit}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalButtonEdit,
                          styles.confirmButtonEdit,
                        ]}
                        onPress={handleAddAddress}>
                        <Text style={styles.modalButtonTextEdit}>Ajouter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </View>
        )} */}

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: hp(1.7),
            padding: 10,
            justifyContent: 'space-between',
            width: wp('85%'),
            backgroundColor: 'white',
            height: hp(7),
            shadowColor: '#c2d4e4',
            shadowOffset: {
              width: 0,
              height: 1, // Adjust the height to move the shadow below the view
            },
            shadowOpacity: 0.1, // Adjust the opacity for a lighter shadow
            shadowRadius: 1.84,
            elevation: 5,
            borderRadius: 20,
          }}
          onPress={() => handleToggleSection('contact')}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: hp(1.7),
            }}>
            <Image
              style={{
                width: 40,
                height: 40,
                // tintColor: toEdit.contact ? colors.secondary : 'black',
              }}
              source={require('../assets/bluecontact.png')}
            />
            <Text
              style={{
                // color: toEdit.contact ? colors.secondary : 'black',
                color: 'black',
                fontSize: hp(2),
                fontWeight: '600',
              }}>
              Centre d'aide
            </Text>
          </View>

          {toEdit.contact ? (
            <Ionicons
              name={'chevron-up-outline'}
              size={24}
              color={toEdit.contact ? '#18365a' : 'gray'}
            />
          ) : (
            <Ionicons name={'chevron-down-outline'} size={24} color={'gray'} />
          )}
        </TouchableOpacity>
        {toEdit.contact && (
          <View
            style={{
              backgroundColor: colors.general_2,
              alignItems: 'center',
              justifyContent: 'flex-start',
              display: 'flex',
              borderRadius: 20,
              flexDirection: 'row',
              height: 200,
              gap: 10,
              padding: 10,
            }}>
            <Image
              style={{
                width: 130,
                height: 130,

                // tintColor: toEdit.contact ? colors.secondary : 'black',
              }}
              source={require('../assets/customer.png')}
            />
            <View
              style={{
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                display: 'flex',
                flexDirection: 'column',
                marginTop: 35,
                width: '50%',
                gap: 5,
              }}>
              <Text style={{color: 'black'}}>
                Prêts à vous aider 24h/24 et 7/7
              </Text>
              <TouchableOpacity
                onPress={handleCall}
                style={{
                  width: wp('40%'),
                  padding: 4,
                  borderRadius: 5,
                  height: hp('4.5'),
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  marginTop: 5,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 10,
                  shadowColor: '#c2d4e4',
                  shadowOffset: {
                    width: 0,
                    height: 1, // Adjust the height to move the shadow below the view
                  },
                  shadowOpacity: 0.1, // Adjust the opacity for a lighter shadow
                  shadowRadius: 1.84,
                  elevation: 5,

                  backgroundColor: colors.secondary,

                  borderWidth: 2,
                  borderColor: colors.primary,

                  borderRightWidth: 3,
                  borderBottomWidth: 3,
                  borderTopWidth: 1,
                  borderLeftWidth: 1,
                }}>
                <Text style={styles.modalButtonTextEdit}>Appelle-nous</Text>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                    // tintColor: toEdit.contact ? colors.secondary : 'black',
                  }}
                  source={require('../assets/telephone.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: hp(1.7),
            padding: 10,
            justifyContent: 'space-between',
            width: wp('85%'),
            backgroundColor: 'white',
            height: hp(7),
            shadowColor: '#c2d4e4',
            shadowOffset: {
              width: 0,
              height: 1, // Adjust the height to move the shadow below the view
            },
            shadowOpacity: 0.1, // Adjust the opacity for a lighter shadow
            shadowRadius: 1.84,
            elevation: 5,
            borderRadius: 20,
          }}
          onPress={() => handleToggleSection('langue')}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: hp(1.7),
            }}>
            <Image
              style={{
                width: 40,
                height: 40,
                // tintColor: toEdit.langue ? colors.secondary : 'black',
              }}
              source={require('../assets/orangelangue.png')}
            />
            <Text
              style={{
                // color: toEdit.langue ? colors.secondary : 'black',
                color: 'black',
                fontSize: hp(2),
                fontWeight: '600',
              }}>
              Langue
            </Text>
          </View>

          {toEdit.langue ? (
            <Ionicons
              name={'chevron-up-outline'}
              size={24}
              color={toEdit.langue ? 'pink' : 'gray'}
            />
          ) : (
            <Ionicons name={'chevron-down-outline'} size={24} color={'gray'} />
          )}
        </TouchableOpacity>
        {toEdit.langue && (
          <View
            style={{
              height: 110,
            }}>
            <View style={styles.containerr}>
              {languages.map(language => (
                <TouchableOpacity
                  key={language.id}
                  style={styles.itemContainerr}
                  onPress={() => handleSelect(language.id)}>
                  <Text style={styles.label}>{language.label}</Text>
                  <View style={styles.radioButton}>
                    {selectedLanguage === language.id && (
                      <View style={styles.innerCircle} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )} */}

        <View
          style={{
            backgroundColor: 'white',
            right: 28,
            height: hp('95%'),
            gap: hp(1.7),
            width: wp('90%'),
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgb(255 246 246)',
              marginTop: 30,
              width: wp('85%'),
              marginLeft: 30,
              padding: 10,
              height: hp('7'),
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingHorizontal: 15,
              flexDirection: 'row',
              gap: hp(1.7),
              shadowColor: '#c2d4e4',
              shadowOffset: {
                width: 0,
                height: 1, // Adjust the height to move the shadow below the view
              },
              shadowOpacity: 0.1, // Adjust the opacity for a lighter shadow
              shadowRadius: 1.84,
              elevation: 5,
              borderRadius: 20,
            }}
            onPress={() => setModalVisible(true)}>
            {/* <Ionicons name={'exit-outline'} size={24} color={'red'} />
             */}
            <Image
              style={{
                width: 26,
                height: 26,
                marginLeft: -5,
              }}
              source={require('../assets/power-off.png')}
            />
            <Text
              style={{color: '#D21313', fontSize: hp(1.9), fontWeight: '600'}}>
              Déconnecter
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{height: hp(75), backgroundColor: 'white'}}>
        {isModalVisible && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
              setModalVisible(!isModalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.modalHead}>
                  <Image
                    style={{
                      width: 25,
                      height: 25,
                      marginLeft: -5,
                      marginTop: 10,
                    }}
                    source={require('../assets/shutdown.png')}
                  />
                  <Text
                    style={{
                      color: 'black',
                      fontWeight: '700',
                      fontSize: hp(2),
                      marginBottom: 10,
                    }}>
                    Se déconnecter ?
                  </Text>

                  <Text
                    style={{
                      fontWeight: '600',
                      fontSize: hp(1.6),
                      color: 'gray',
                      textAlign: 'center',
                    }}>
                    Êtes-vous sûr de vouloir vous déconnecter ?
                  </Text>
                </View>
                <View style={styles.modalBottom2}>
                  <Pressable
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 0.5,
                      backgroundColor: '#f6dddd',
                      width: '100%',

                      height: '50%',
                    }}
                    onPress={() => {
                      setModalVisible(!isModalVisible);
                      handleLogout();
                    }}>
                    <Text
                      style={{
                        color: '#D21313',
                        fontSize: hp(1.7),
                        fontWeight: '700',
                      }}>
                      Oui, déconnexion
                    </Text>
                  </Pressable>
                  <Pressable
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 0.5,
                      backgroundColor: colors.general_2,
                      width: '100%',
                      height: '50%',
                    }}
                    onPress={() => setModalVisible(!isModalVisible)}>
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: hp(1.7),
                        fontWeight: '700',
                      }}>
                      Annuler
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  heading: {
    fontSize: hp(1.5),
    marginBottom: 20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalBottom: {
    width: '100%',
    flex: 0.3,
    backgroundColor: colors.primary,
    alignItems: 'center',

    justifyContent: 'center',
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  modalBottom2: {
    width: '100%',
    flex: 0.7,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  headerr: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  heeading: {
    fontSize: hp(1.5),
    marginBottom: 20,
  },
  centeredView: {
    backgroundColor: '#777e8394',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    flex: 0.27,
    margin: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalVieew: {
    width: '100%',
    height: '100%',
    flex: 0.27,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalHeead: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 15,
  },
  itemContainerr: {
    marginLeft: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'white',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  label: {
    fontWeight: '500',
    fontSize: 12,
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.primary,
  },
  confirmButton: {
    backgroundColor: colors.secondary,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  modalHead: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 15,
  },
  modalContente: {
    width: '100%',
    height: '100%',
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
  },
  modalContentEdit: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  modalContentEdite: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  modalTitleEdit: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  inputContainerEdit: {
    width: '100%',
    marginBottom: 20,
  },
  inputEdit: {
    width: '100%',
    height: 50,
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: hp(1.8),
    backgroundColor: 'white',
  },
  modalButtonsEdit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonEdit: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  cancelButtonEdit: {
    backgroundColor: colors.secondary,
  },
  confirmButtonEdit: {
    backgroundColor: colors.primary,
  },
  modalButtonTextEdit: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputContainers: {
    flex: 1,
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  modalOverlays: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContents: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitles: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputs: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButtonss: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButtons: {
    backgroundColor: colors.primary,
  },
  confirmButtons: {
    backgroundColor: colors.secondary,
  },
  modalButtonTexts: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inputEditt: {
    width: '100%',
    height: 50,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: hp(1.8),
    backgroundColor: 'white',
  },
  passwordInputContainer: {
    display: 'flex',
    gap: -50,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  eyeIcon: {
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1),
  },
  headerText: {
    color: 'black',
    fontSize: hp(2),
    fontWeight: '600',
  },
  content: {
    marginTop: hp(1),
    height: hp(50),
  },
  sectionTitle: {
    color: 'black',
    fontSize: hp(1.8),
    fontWeight: '600',
    marginTop: hp(1),
  },
  subSectionTitle: {
    color: 'black',
    fontSize: hp(1.6),
    fontWeight: '500',
    marginTop: hp(0.5),
  },
  sectionText: {
    color: 'black',
    fontSize: hp(1.6),
    marginTop: hp(0.5),
    lineHeight: hp(2.5),
  },
});
