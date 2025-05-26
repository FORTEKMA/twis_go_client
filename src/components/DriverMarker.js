import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

const DriverMarker = ({ angle = 0, type = 1 }) => {
  const getIconName = () => {
    switch (type) {
      case 1:
        return require("../assets/TawsiletEcoCar.png")
      case 2:
        return require("../assets/TawsiletBerlineCar.png")
      case 3:
        return require("../assets/TawsiletVanCar.png")
     
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={getIconName()} 
        style={[
          styles.icon,
          {transform:[{rotateY:`${angle}deg`}]}
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
});

export default DriverMarker;
