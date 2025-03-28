import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const CustomDrawerContent = props => {
  const handleCall = () => {
    const phoneNumber = `tel:+1234567890`; // Replace with the correct phone number
    Linking.openURL(phoneNumber).catch(err => {
      console.error('Failed to open phone call:', err);
      Alert.alert('Erreur', 'Impossible de passer un appel téléphonique.');
    });
  };

  const openWebsite = () => {
    const websiteURL = 'https://sheelni.dev'; // Replace with the actual website URL
    Linking.openURL(websiteURL).catch(err => {
      console.error('Failed to open website:', err);
      Alert.alert('Erreur', "Impossible d'ouvrir le site web.");
    });
  };

  const openFacebook = () => {
    const facebookPageURL = 'https://www.facebook.com/sheelni.tn'; // Replace with the actual Facebook page URL
    Linking.canOpenURL(facebookPageURL)
      .then(supported => {
        if (supported) {
          Linking.openURL(facebookPageURL);
        } else {
          // If the Facebook app is not installed, open in the browser
          const browserURL = 'https://www.facebook.com/sheelni.tn';
          Linking.openURL(browserURL);
        }
      })
      .catch(err => {
        console.error('Failed to open Facebook:', err);
        Alert.alert('Erreur', "Impossible d'ouvrir Facebook.");
      });
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Add Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/tawsiletYellow.png')} // Replace with your logo path
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <DrawerItemList {...props} />
      <View style={styles.socialMediaContainer}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={handleCall}
          accessibilityLabel="Call us">
          <Image style={styles.icon} source={require('../assets/wats.png')} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={openWebsite}
          accessibilityLabel="Visit our website">
          <Image style={styles.icon} source={require('../assets/web.png')} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={openFacebook}
          accessibilityLabel="Visit our Facebook page">
          <Image style={styles.icon} source={require('../assets/fb.png')} />
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logo: {
    width: 110,
    height: 110,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: hp(50),
    padding: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hp(1.7),
    padding: 10,
  },
  icon: {
    width: 25,
    height: 25,
  },
});

export default CustomDrawerContent;
