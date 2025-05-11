import React, {memo} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const OnboardingCard = memo(({item}) => {
  const {t} = useTranslation();
  const slideKey = `onboarding.slide${item.id}`;

  return (
    <View style={styles.cardContainer}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{t(`${slideKey}.title`)}</Text>
      <Text style={styles.text}>{t(`${slideKey}.text`)}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    width: wp(100),
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: wp(80),
    height: "70%",
  },
  title: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: 'white',
    marginTop: hp(2),
    textAlign: 'center',
  },
  text: {
    fontSize: hp(2),
    color: 'white',
    marginTop: hp(1),
    textAlign: 'center',
    paddingHorizontal: wp(5),
  },
});

export default OnboardingCard; 