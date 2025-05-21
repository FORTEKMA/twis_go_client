import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import styles from './styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import CustomAlert from '../../../components/CustomAlert';

const ResetCodeScreen = () => {
  const forgetpasswordCode = useSelector(state => state?.user?.forgetPsw);
  const navigation = useNavigation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]);
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);
  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const handleChange = (text, index) => {
    if (/^\d$/.test(text) || text === '') {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      if (text && index < 5) {
        inputsRef.current[index + 1].focus();
      } else if (!text && index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = () => {
    const isComplete = code.every(digit => digit.trim() !== '');
    if (!isComplete) {
      setAlertTitle(t('email.code.code_incomplete'));
      setAlertMessage(''); // Optional: add a more detailed message if needed
      setShowAlert(true);
      return;
    }

    setLoading(true);

    const finalCode = code.join('');
    setTimeout(() => {
      // Simulate verification delay
      if (forgetpasswordCode?.code === finalCode) {
        setLoading(false);
        navigation.navigate('ResetPassword');
      } else {
        setLoading(false);
        setAlertTitle(t('email.code.code_invalid'));
        setAlertMessage(''); // Optional
        setShowAlert(true);
      }
    }, 1000);
  };

  return (
    <>
      <TouchableOpacity
        style={{position: 'absolute', top: '5%', left: '5%'}}
        onPress={() => {
          navigation.goBack();
        }}>
        <Ionicons name={'arrow-back-outline'} size={25} color={'black'} />
      </TouchableOpacity>

      <View style={styles.recoveryContainer}>
        <Image
          style={styles.recoveryImage}
          source={require('../../../assets/secure.png')}
        />
        <Text style={styles.recoveryTitle}>Entrez le code de vérification</Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
          }}>
          {code?.map((digit, index) => (
            <TextInput
              key={index}
              ref={el => (inputsRef.current[index] = el)}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading}
              style={{
                width: 40,
                height: 50,
                borderBottomWidth: 2,
                borderColor: 'gray',
                textAlign: 'center',
                fontSize: 20,
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.btnText}>Vérifier</Text>
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={showAlert}
        onClose={handleAlertClose}
        title={alertTitle}
        message={alertMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => handleAlertClose(),
            style: 'confirm',
          },
        ]}
      />
    </>
  );
};

export default ResetCodeScreen;
