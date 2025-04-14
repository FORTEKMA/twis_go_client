import React, {useEffect, useRef} from 'react';
import {Animated, View, Image, StyleSheet, Easing} from 'react-native';

const WaveCircle = () => {
  const rippleCount = 3;
  const ripples = useRef(
    [...Array(rippleCount)].map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    ripples.forEach((anim, index) => {
      const delay = index * 1000; // delay each ripple by 1s
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, []);

  return (
    <View style={[styles.markerContainer,{pointerEvents:"none"}]}>
      {ripples.map((anim, idx) => {
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 3],
        });

        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 0],
        });

        return (
          <Animated.View
            key={idx}
            style={[
              styles.waveCircle,
              {
                transform: [{scale}],
                opacity,
              },
            ]}
          />
        );
      })}

      <Image
        source={require('../assets/A_Tawsilet.png')}
        style={{width: 40, height: 40}}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveCircle: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 1)',
  },
});

export default WaveCircle;
