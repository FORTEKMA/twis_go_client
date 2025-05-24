import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {Input} from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import {resetPassword} from '../../../store/userSlice/userSlice';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sent, setSent] = useState(true);
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const forgetpasswordCode = useSelector(state => state?.user?.forgetPsw);
  const forgetpasswordEmail = useSelector(state => state?.user?.email);

  const validPassword = () => {
    if (!password) {
      return 'Le mot de passe est requis';
    } else if (password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    return null;
  };

  const passwordsMatch = () => {
    if (password !== confirmPassword) {
      return 'Les mots de passe ne correspondent pas.';
    }
    return null;
  };

  const handleResetPassword = async () => {
    const passwordError = validPassword();
    const matchError = passwordsMatch();
    setLoading(true);
    if (!passwordError && !matchError) {
      try {
        const res = await dispatch(
          resetPassword({
            email: forgetpasswordEmail,
            code: forgetpasswordCode?.code,
            newPassword: password,
          }),
        );
        if (res) {
          setSent(res);
          setLoading(false);
          navigation.navigate('Login');
        }
        setLoading(false);
        return true;
      } catch (error) {
        console.error('Password reset failed:', error);
        setSent(false);
        setLoading(false);
      }
    }
    setLoading(false);
    return false;
  };

  return (
    <>
      <TouchableOpacity
        style={{position: 'absolute', top: '5%', left: '5%', zIndex: 10}}
        onPress={() => navigation.goBack()}>
        <Ionicons name={'arrow-back-outline'} size={25} color={'black'} />
      </TouchableOpacity>

      <View style={styles.recoveryContainer}>
        <Image
          style={styles.recoveryImage}
          source={require('../../../assets/secure.png')}
        />
        <Text style={styles.recoveryTitle}>Réinitialiser le mot de passe</Text>

        {/* Password Input with Eye Toggle */}
        <View style={{position: 'relative', width: '100%', marginBottom: 10}}>
          <Input
            onChangeText={setPassword}
            value={password}
            variant={'underlined'}
            placeholder="Nouveau mot de passe"
            secureTextEntry={!showPassword}
            pr={10} // padding right to avoid text under icon
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 10,
              top: '15%',
              height: '100%',
              justifyContent: 'center',
            }}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#8391A1"
            />
          </TouchableOpacity>
        </View>
        {validPassword() && (
          <Text style={{color: 'red'}}>{validPassword()}</Text>
        )}

        {/* Confirm Password Input with Eye Toggle */}
        <View style={{position: 'relative', width: '100%', marginBottom: 10}}>
          <Input
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            variant={'underlined'}
            placeholder="Confirmez le mot de passe"
            secureTextEntry={!showConfirmPassword}
            pr={10}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: 'absolute',
              right: 10,
              top: '15%',
              height: '100%',
              justifyContent: 'center',
            }}>
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#8391A1"
            />
          </TouchableOpacity>
        </View>
        {passwordsMatch() && (
          <Text style={{color: 'red'}}>{passwordsMatch()}</Text>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={handleResetPassword}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.btnText}>Réinitialiser</Text>
          )}
        </TouchableOpacity>
      </View>
      {!sent && (
        <Text style={styles.sentMessage}>{t('email.reset_failed')}</Text>
      )}
    </>
  );
};

export default ResetPassword;
