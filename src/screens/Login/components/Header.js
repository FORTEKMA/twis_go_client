import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';

const Header = React.memo(({ loginWithEmail, forgotPsw, onClose, onBack, onToggleEmail, onToggleForgetPassword }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      <Image
        source={require('../../../assets/tawsiletYellow.png')}
        style={{ width: 150, height: 30, marginLeft: 20 }}
      />
      {(loginWithEmail && !forgotPsw) && (
        <TouchableOpacity onPress={onToggleEmail}>
          <Ionicons name={'close'} size={24} color={'white'} />
          </TouchableOpacity>
      )}
      {!loginWithEmail && !forgotPsw && (
        <TouchableOpacity onPress={onClose}>
          <Ionicons name={'close'} size={24} color={'white'} />
        </TouchableOpacity>
      )}
      {forgotPsw && (
       <TouchableOpacity onPress={onToggleForgetPassword}>
       <Ionicons name={'close'} size={24} color={'white'} />
       </TouchableOpacity>
      )}
    </View>
  );
});

export default Header; 