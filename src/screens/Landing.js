import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';

import {Image} from 'native-base';
import {colors} from '../utils/colors';

const LandingPage = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar
        hidden={false} // Ensure the status bar is always visible
        backgroundColor="transparent" // Make the status bar background transparent
        barStyle="dark-content" // You can change the text color to light or dark
        translucent={true} // Make the status bar translucent
      />

      <Image
        style={styles.image}
        source={require('../assets/tawsiletYellow.png')}
        alt="logo"
      />
      {isLoading && <ActivityIndicator size="large" color={'#F0C777'} />}
    </View>
  );
};

export default LandingPage;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '40%',
    objectFit: 'contain',
  },
});
