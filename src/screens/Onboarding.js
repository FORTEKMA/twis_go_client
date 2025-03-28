import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../utils/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import OnboardingCard from '../components/OnboardingCard';
import Pagination from '../components/Pagination';
const Onboarding = ({navigation}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const ref = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewItemChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;
  const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;
  const slides = [
    {
      id: 1,
      title: 'Book Your Ride',
      text: 'Use our app or website to easily book your ride in just a few taps.',
      image: require('../assets/pic1.png'),
    },
    {
      id: 2,
      title: 'Ride With Confidence',
      text: 'Our experienced drivers and reliable vehicles ensure a smooth and secure journey .',
      image: require('../assets/pic2.png'),
    },
    {
      id: 3,
      title: 'Arrive on Time',
      text: 'Enjoy fast, efficient, and stress-free travel, tailored to your schedule.',
      image: require('../assets/pic3.png'),
    },
  ];
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={{flex: 0.5, backgroundColor: "#000"}}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => <OnboardingCard item={item} />}
        keyExtractor={item => item.id}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewItemChanged}
        viewabilityConfig={viewConfig}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        ref={ref}
      />
      <Pagination data={slides} scrollX={scrollX} />
      <View style={styles.btnWrapper}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.text}>Login</Text>
        </TouchableOpacity>
        <View style={{flexDirection: 'row', gap: 5, marginTop: 10}}>
          <Text style={{color: '#8E92A8'}}>New user ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{color: 'white'}}>Register here</Text>
          </TouchableOpacity>
        </View>
       
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingTop: hp(5),
  },
  btnWrapper: {
    flex: 0.3,
    backgroundColor: '#000',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 15,
  },

  btn: {
    padding: 20,
    backgroundColor: '#F0C877',
    width: '100%',
    borderRadius: 5,
    // Add borders using negative margin trick
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  text: {
    color: "black",
    textAlign: 'center',
    fontSize: hp(1.5),
  },
});
