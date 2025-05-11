import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Input } from 'native-base';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';

const ForgotPasswordForm = React.memo(({ email, setEmail, Errors, onSend, sent }) => {
  const { t } = useTranslation();
  return (
    <>
      <View style={{ width: '90%', gap: 30 }}>
        <View style={{ width: '100%' }}>
          <View
            style={{
              gap: 30,
              backgroundColor: '#23252F',
              padding: 30,
              width: '90%',
              alignSelf: 'center',
             //height: 400,
              shadowColor: '#4d6685',
              shadowOffset: { width: 1, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 1.84,
              elevation: 5,
              borderRadius: 10,
              marginTop: 100,
            }}>
            <Text style={styles.headerTitlee}>{t('login.enterRecoveryEmail')}</Text>
            <Image
              style={{ width: 150, height: 150, alignSelf: 'center', marginBottom: -40 }}
              source={require('../../../assets/secure.png')}
            />
            <Text style={{ color: 'white', fontWeight: '700', marginBottom: -30, fontSize: 16 }}>
              {t('login.recoveryEmail')}
            </Text>
            <Input
              onChangeText={setEmail}
              variant={'underlined'}
              placeholder={t('login.emailPlaceholder')}
              color="white"
              value={email}
            />
            {Errors.email && (
              <Text style={{ color: 'red' }}>{Errors.email}</Text>
            )}
            <TouchableOpacity style={styles.btn} onPress={onSend}>
              <Text style={styles.btnText}>{t('login.send')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {sent && (
        <Text style={{ color: 'white', alignSelf: 'center' }}>
          {t('login.recoverySent')}
        </Text>
      )}
    </>
  );
});

export default ForgotPasswordForm; 