 import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import  {colors}  from "../utils/colors"
import { useSelector,useDispatch } from 'react-redux';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
 
    logOut,
 
  } from "../store/userSlice/userSlice";
  const screenHideTabs = ["OrderDetails","Rating","PersonalInfo","Security","Help"];

const CustomTabBar = ({state, descriptors, navigation}) => {

    const currentUser = useSelector(state => state?.user);
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const animatedValues = useRef(
    state.routes.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    state.routes.forEach((_, index) => {
      Animated.spring(animatedValues[index], {
        toValue: state.index === index ? 1 : 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    });
  }, [state.index]);
  const currentIndex = state.index;

  const currentRoute = state.routes[currentIndex];

  const getTabBarVisible = route => {
     const routeName = getFocusedRouteNameFromRoute(route);
    if (screenHideTabs.includes(routeName)) {
      return false;
    }

    return true;
  };
 

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea} >
      {getTabBarVisible(currentRoute) && (
        <View style={styles.tabBarContainer}>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
          const label = options.tabBarLabel || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            if(currentUser.token==-1){
                dispatch(logOut())
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName;
          if (route.name === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'Historique') {
            iconName = isFocused ? 'list' : 'list-outline';
          } else if (route.name === 'Notifications') {
            iconName = isFocused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = isFocused ? 'settings' : 'settings-outline';
          }

          const scale = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          });

          const translateY = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -5],
          });

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}>
              <Animated.View
                style={[
                  styles.tabItemContainer,
                  isFocused && styles.activeTab,
                  {
                    transform: [{scale}, {translateY}],
                  },
                ]}>
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? '#F9DC76' : '#666'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {color: isFocused ? '#F9DC76' : '#666'},
                  ]}>
                  {t("common."+label)}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: Platform.OS === 'ios' ? 5 : 0,
    paddingTop: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.primary,
    width: "100%",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default CustomTabBar; 