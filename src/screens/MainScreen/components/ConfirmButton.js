import React from 'react';
import {Pressable, Text} from 'react-native';
import {styles} from '../styles';

const ConfirmButton = ({onPress, text, disabled}) => {
  return (
    <Pressable
      disabled={disabled}
      style={({pressed}) => [
        styles.confirmButton,
        { opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
      android_ripple={{ color: '#18365A30' }}
      onPress={onPress}
    >
      <Text style={styles.confirmButtonText}>{text}</Text>
    </Pressable>
  );
};

export default ConfirmButton; 