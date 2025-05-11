import React from 'react';
import {Pressable, Text} from 'react-native';
import {styles} from '../styles';

const ConfirmButton = ({onPress, text,disabled}) => {
  return (
    <Pressable disabled={disabled} style={[styles.confirmButton,{opacity:disabled?0.5:1}]} onPress={onPress}>
      <Text style={styles.confirmButtonText}>{text}</Text>
    </Pressable>
  );
};

export default ConfirmButton; 