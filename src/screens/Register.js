import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {Input, Button, KeyboardAvoidingView} from 'native-base';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import {userRegister} from '../store/userSlice/userSlice';
import {colors} from '../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const Register = ({route}) => {
  const dispatch = useDispatch();
  const {number} = route.params;
  const {width} = useWindowDimensions();
  const error = useSelector(state => state.user.error);
  const [show, setShow] = useState(false);

  const handleClick = () => setShow(!show);
  const [step, setStep] = useState(1);
  const [user, setUser] = useState({
    username: '',
    email: '',
    phoneNumber: number,
    user_role: 'client',
    password: '',
    accountOverview: [
      {
        __component: 'section.client',

        firstName: '',
        lastName: '',
      },
    ],
  });
  const [errors, setErrors] = useState({});

  const onNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const onSignup = () => {
    if (validateStep(step)) {
      dispatch(userRegister(user));
    }
  };

  const validateStep = currentStep => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!user.email) {
        newErrors.email = 'Email is required';
      }
      if (!/\S+@\S+\.\S+/.test(user.email)) {
        newErrors.email = 'Veuillez saisir une adresse e-mail valide.';
      }
    } else if (currentStep === 2) {
      if (!user.accountOverview[0].firstName) {
        newErrors.firstName = 'Name is required';
      }
      if (!/^[a-zA-ZÀ-ÿ\s']{3,30}$/.test(user.accountOverview[0].firstName)) {
        newErrors.firstName =
          'Le prénom doit contenir entre 3 et 30 caractères, sans caractères spéciaux ni chiffres.';
      }
      if (!user.accountOverview[0].lastName) {
        newErrors.lastName = 'Last Name is required';
      }
      if (!/^[a-zA-ZÀ-ÿ\s']{3,30}$/.test(user.accountOverview[0].lastName)) {
        newErrors.lastName =
          'Le nom doit contenir entre 3 et 30 caractères, sans caractères spéciaux ni chiffres.';
      }
    } else if (currentStep === 3) {
      if (!user.password) {
        newErrors.password = 'Password is required';
      }
      if (user.password.length < 8) {
        newErrors.password =
          'Le mot de passe doit contenir au moins 8 caractères.';
      }
      if (!/\d/.test(user.password)) {
        newErrors.password =
          'Le mot de passe doit contenir au moins un chiffre.';
      }
      if (!/[A-Z]/.test(user.password)) {
        newErrors.password =
          'Le mot de passe doit contenir au moins une majuscule.';
      }
    }

    if (Object.keys(newErrors).length === 0) {
      setErrors({});
      return true;
    } else {
      setErrors(newErrors);
      return false;
    }
  };

  return (
    <ScrollView
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{flexGrow: 1}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior="height"
        keyboardVerticalOffset={{paddingTop: 90}}
        enabled>
        <View style={styles.container}>
          <ScrollView horizontal pagingEnabled>
            {step === 1 && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  width,
                  paddingHorizontal: 20,
                  gap: 30,
                }}>
                <Text
                  style={{
                    fontWeight: '900',
                    color: colors.primary,
                    fontSize: 24,
                  }}>
                  Entrez votre adresse email
                </Text>
                <View style={styles.inputContainer}>
                  <Text
                    style={{
                      fontWeight: '600',
                      color: colors.primary,
                      fontSize: 20,
                    }}>
                    Email
                  </Text>
                  <Input
                    variant="underlined"
                    placeholder="name@example.com"
                    value={user.email}
                    onChangeText={text =>
                      setUser({
                        ...user,
                        email: text,
                        username: text,
                      })
                    }
                  />
                  {errors.email && (
                    <Text style={{color: 'red'}}>{errors.email}</Text>
                  )}
                </View>

                <View style={{alignSelf: 'center', width: wp('100%')}}>
                  <TouchableOpacity style={styles.btn} onPress={onNextStep}>
                    <Text style={styles.btnText}>Suivant</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 2 && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  width,
                  gap: 30,
                  paddingHorizontal: 20,
                }}>
                <Text
                  style={{
                    fontWeight: '900',
                    color: colors.primary,
                    fontSize: 24,
                  }}>
                  Quel est votre nom?
                </Text>
                <View style={styles.inputContainer}>
                  <Text
                    style={{
                      fontWeight: '600',
                      color: colors.primary,
                      fontSize: 20,
                    }}>
                    Nom
                  </Text>
                  <Input
                    variant="underlined"
                    placeholder="Entrez votre nom"
                    value={user.firstName}
                    onChangeText={text =>
                      setUser(prevUser => ({
                        ...prevUser,
                        accountOverview: [
                          {
                            ...prevUser.accountOverview[0],
                            firstName: text,
                          },
                        ],
                      }))
                    }
                  />
                  {errors.firstName && (
                    <Text style={{color: 'red'}}>{errors.firstName}</Text>
                  )}

                  <Text
                    style={{
                      fontWeight: '600',
                      color: colors.primary,
                      fontSize: 20,
                    }}>
                    Prénom
                  </Text>
                  <Input
                    variant="underlined"
                    placeholder="Entrez votre prénom"
                    value={user.lastName}
                    onChangeText={text =>
                      setUser(prevUser => ({
                        ...prevUser,
                        accountOverview: [
                          {
                            ...prevUser.accountOverview[0],
                            lastName: text,
                          },
                        ],
                      }))
                    }
                  />
                  {errors.lastName && (
                    <Text style={{color: 'red'}}>{errors.lastName}</Text>
                  )}
                </View>

                <View style={{alignSelf: 'center', width: wp('100%')}}>
                  <TouchableOpacity style={styles.btn} onPress={onNextStep}>
                    <Text style={styles.btnText}>Suivant</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 3 && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  width,
                  paddingHorizontal: 20,
                  gap: 30,
                }}>
                <Text
                  style={{
                    fontWeight: '900',
                    color: colors.primary,
                    fontSize: 24,
                  }}>
                  Tapez une mot de passe
                </Text>
                <View style={styles.inputContainer}>
                  <Text
                    style={{
                      fontWeight: '600',
                      color: colors.primary,
                      fontSize: 20,
                    }}>
                    Mot de passe
                  </Text>

                  <Input
                    value={user.password}
                    onChangeText={text => setUser({...user, password: text})}
                    type={show ? 'text' : 'password'}
                    InputRightElement={
                      <TouchableOpacity onPress={() => setShow(!show)}>
                        <Ionicons
                          style={{paddingRight: 10}}
                          name={show ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={'gray'}
                        />
                      </TouchableOpacity>
                    }
                    placeholder="Password"
                  />
                  {errors.password && (
                    <Text style={{color: 'red'}}>{errors.password}</Text>
                  )}
                </View>
                <View style={{alignSelf: 'center', width: wp('100%')}}>
                  <TouchableOpacity style={styles.btn} onPress={onSignup}>
                    <Text style={styles.btnText}>Terminer</Text>
                  </TouchableOpacity>
                </View>
                {error && <Text style={{color: 'red'}}>{error}</Text>}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: wp('100%'),
    gap: 15,
  },
  input: {
    width: wp('100%'),
    marginBottom: 10,
  },
  btn: {
    padding: 20,
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginTop: 30,
  },
  btnText: {
    color: colors.secondary,
    textAlign: 'center',
  },
});
