import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
 import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
 import { useSelector } from 'react-redux';
const { width } = Dimensions.get('window');
import Ring from './Ring';

const avatarUrls = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
];

const Step4 = ({ goBack }) => {
  const { t } = useTranslation();
  const user = useSelector(state => state.user.currentUser);
  const [drivers, setDrivers] = useState([]);

  const generateCenteredPositions = (avatarUrls) => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
    const verticalMin = screenHeight * 0.3;
    const verticalMax = screenHeight * 0.6;
    const horizontalMin = screenWidth * 0.25;
    const horizontalMax = screenWidth * 0.75;
  
    return avatarUrls.map((url, i) => {
      const top = Math.floor(Math.random() * (verticalMax - verticalMin)) + verticalMin;
      const left = Math.floor(Math.random() * (horizontalMax - horizontalMin)) + horizontalMin;
  
      return {
        top,
        left,
        avatar: url,
        key: i,
      };
    });
  };
  

  
  
  useEffect(() => {
    setDrivers(generateCenteredPositions(avatarUrls));
    
  }, []);

  // Swipe overlay logic
  const panX = useRef(new Animated.Value(0)).current;
  const maxSwipe = width * 0.6;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dx > 10 && Math.abs(gesture.dy) < 20,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0 && gesture.dx <= maxSwipe) panX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > maxSwipe * 0.6) {
          goBack();
        } else {
          Animated.spring(panX, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const backgroundWidth = panX.interpolate({
    inputRange: [0, maxSwipe],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={localStyles.container}>
    {/* Status Header */}
    <View style={{ alignItems: 'center', marginTop: hp(2) }}>
      <View style={localStyles.statusIconWrapper}>
        <MaterialCommunityIcons name="progress-clock" size={32} color="#F9DC76" />
      </View>
      <Text style={localStyles.statusTitle}>{t("booking.step3.searching_ride")}</Text>
      <Text style={localStyles.statusSubtitle}>{t("booking.step3.it_may_take_some_time")}</Text>
    </View>

    {/* Waves */}
    <View style={localStyles.animationWrapper}>
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
     <Ring delay={0} />
      <Ring delay={1000} />
      <Ring delay={2000} />
      <Ring delay={2500} />
      <Ring delay={3000} />
      
    </View>

     
      
    </View>

    {/* Swipe to Cancel - fixed button, animated background */}
    <View style={localStyles.cancelWrapper} {...panResponder.panHandlers}>
      <View style={localStyles.cancelButton}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'red',
              borderRadius: 30,
              width: backgroundWidth,
            },
          ]}
        />
        <MaterialCommunityIcons name="close" size={24} color="#19191C" />
        <Text style={localStyles.cancelText}>{t('booking.step3.slide_to_cancel')}</Text>
      </View>
      <Text style={localStyles.swipeHint}>{t('booking.step3.swipe_right_to_cancel')}</Text>
    </View>

    {/* Add 4 fake drivers with avatars in random positions */}
    <View style={{ position: 'absolute', width: '100%', height: '100%', }}>
      {drivers.map(driver => (
        <View key={driver.key} style={[localStyles.driverAvatar, driver]}>
          <Image source={{ uri: driver.avatar }} style={localStyles.avatarImg} />
        </View>
      ))}
    </View>
  </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    margin: 16,
     flex:1,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    
  },
  statusIconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 8,
    marginBottom: 8,
  },
  statusTitle: {
    fontWeight: '700',
    fontSize: hp(2.5),
    color: '#19191C',
    marginTop: 4,
  },
  statusSubtitle: {
    color: '#BDBDBD',
    fontSize: hp(1.7),
    marginTop: 2,
    marginBottom: 10,
  },
  animationWrapper: {
    flex: 1.5, // Make animation area bigger
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2),
    minHeight: 350,
  },
  circle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#000',
    borderStyle: 'dashed',
    borderRadius: 200,
  },
  circleLarge: {
    width: 260,
    height: 260,
    top: '10%',
    left: '50%',
    marginLeft: -130,
  },
  circleMedium: {
    width: 180,
    height: 180,
    top: '22%',
    left: '50%',
    marginLeft: -90,
  },
  circleSmall: {
    width: 110,
    height: 110,
    top: '30%',
    left: '50%',
    marginLeft: -55,
  },
  carWrapper: {
    position: 'absolute',
    top: '48%',
    left: '50%',
    marginLeft: -24,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 12,
    zIndex: 2,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'absolute',
    zIndex: 3,
    alignItems: 'center',
  },
  driverBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    position: 'absolute',
    top: 50,
    left: -30,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  driverName: {
    fontWeight: '700',
    color: '#19191C',
    fontSize: hp(1.7),
  },
  driverDistance: {
    color: '#BDBDBD',
    fontSize: hp(1.5),
  },
  cancelWrapper: {
    alignItems: 'center',
    marginBottom: hp(4),
    zIndex:1000,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 220,
  },
  cancelText: {
    color: '#BDBDBD',
    fontWeight: '600',
    fontSize: hp(2),
    marginLeft: 8,
  },
  swipeHint: {
    color: '#BDBDBD',
    fontSize: hp(1.5),
    marginTop: 8,
  },
  driverAvatar: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 2,
    elevation: 3,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
});

export default Step4; 