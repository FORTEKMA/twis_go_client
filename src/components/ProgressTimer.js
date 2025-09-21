import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ProgressTimer = ({ onTimeEnd }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const progressAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onTimeEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: timeLeft / 300,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  timerText: {
    fontSize: hp(2),
    fontWeight: 'bold',
    color: '#18365A',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F37A1D',
  },
});

export default ProgressTimer; 