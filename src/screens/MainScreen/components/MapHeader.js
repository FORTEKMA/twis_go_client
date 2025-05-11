import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import {styles} from '../styles';

const PREVIOUS = require('../../../assets/prev.png');

const MapHeader = ({title, onBackPress}) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        padding: 5,
      }}>
      <Pressable onPress={onBackPress}>
        <Image
          source={PREVIOUS}
          style={{
            width: 22,
            height: 22,
            resizeMode: 'contain',
            alignSelf: 'baseline',
          }}
        />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default MapHeader; 