import React from 'react';
import {Text, View} from 'react-native';
import {styles} from '../styles';

const TimerOverlay = ({timer}) => {
  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>Refresh dans {timer} seconds</Text>
    </View>
  );
};

export default TimerOverlay; 