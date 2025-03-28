import {StyleSheet, Text, View, Image, useWindowDimensions, TouchableOpacity} from 'react-native';
import React from 'react';
import {colors} from '../utils/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
const OnboardingCard = ({item}) => {
  const {width} = useWindowDimensions();
const navigation = useNavigation();
  return (
    <View style={[styles.container, {width}]}>
      <TouchableOpacity
        style={{alignSelf: 'flex-start', marginBottom: 20}}
        onPress={() => navigation.navigate('notlog')}>
        <Text
          style={{
            color: 'white',
            fontSize: hp(2),
            marginTop: 20,
            marginLeft: 20,
            fontWeight: 400,
          }}>
          Skip
        </Text>
      </TouchableOpacity>
      <Image
        source={item?.image}
        style={[styles.image, {resizeMode: 'contain'}]}
      />
      <View style={{flex: 0.6, paddingTop: 15, width: wp('90%')}}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    </View>
  );
  
};

export default OnboardingCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 0,
    marginBottom:-100
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    width:"90%",
  },
  title: {
    fontWeight: '800',
    fontSize: hp(3),
    textAlign: 'center',
    color: "white",
    marginBottom: 15,
  },
  text: {
    fontWeight: '300',
    fontSize: hp(2),
    textAlign: 'center',
    color: "white",
  },
});
