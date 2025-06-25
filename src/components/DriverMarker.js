import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

const DriverMarker = ({ angle = 0, type = 1 }) => {
  const getIconName = () => {
    switch (type) {
      case 1:
        return require("../assets/eco.png")
      case 3:
        return require("../assets/van.png")
      case 2:
        return require("../assets/Berline.png")
     
    }
  };

  return (
    <Image source={getIconName()} style={[styles.icon,{transform:[{rotate:`${angle}deg`}]}]} />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});

export default DriverMarker;
