import React, {useRef, useState, useEffect} from 'react';
import {View, Text, Image, TouchableOpacity, SafeAreaView, Animated, Easing} from 'react-native';
import {useTranslation} from 'react-i18next';
import {styles} from './styles';
import { updateIsFirstTime } from '../../store/userSlice/userSlice';
import { useDispatch } from 'react-redux';
import { 
  trackScreenView, 
  trackOnboardingStarted,
  trackOnboardingCompleted,
  trackOnboardingSkipped 
} from '../../utils/analytics';

const slides = [
  {
    id: 1,
    image: require('../../assets/step1.png'),
    titleKey: 'onboarding.slide1.title',
    textKey: 'onboarding.slide1.text',
  },
  {
    id: 2,
    image: require('../../assets/step2.png'),
    titleKey: 'onboarding.slide2.title',
    textKey: 'onboarding.slide2.text',
  },
  {
    id: 3,
    image: require('../../assets/step3.png'),
    titleKey: 'onboarding.slide3.title',
    textKey: 'onboarding.slide3.text',
  },
];

const OnboardingScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  
  // Track onboarding started on mount
  useEffect(() => {
    trackScreenView('Onboarding');
    trackOnboardingStarted();
  }, []);
  
  useEffect(() => {
    // Reset animation values
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      trackOnboardingCompleted({ total_slides: slides.length });
      dispatch(updateIsFirstTime(false));
      navigation.replace('Main');
    }
  };

  const handleSkip = () => {
    trackOnboardingSkipped({ 
      current_slide: currentIndex + 1,
      total_slides: slides.length 
    });
    dispatch(updateIsFirstTime(false));
    navigation.replace('Main');
  };

  const slide = slides[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[styles.contentWrapper, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}
      >
        <Image source={slide.image} style={styles.illustration} resizeMode="contain" />
        <View style={styles.paginationDots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex ? styles.activeDot : styles.inactiveDot]}
            />
          ))}
        </View>
        <Text style={styles.title}>{t(slide.titleKey)}</Text>
        <Text style={styles.subtitle}>{t(slide.textKey)}</Text>
      </Animated.View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>{t('onboarding.next')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen; 