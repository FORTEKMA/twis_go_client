import React, {memo} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Pagination = memo(({data, scrollX}) => {
  return (
    <View style={styles.container}>
      {data.map((_, idx) => {
        const inputRange = [
          (idx - 1) * wp(100),
          idx * wp(100),
          (idx + 1) * wp(100),
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={idx.toString()}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0c0c0c',
    marginHorizontal: 8,
  },
});

export default Pagination; 