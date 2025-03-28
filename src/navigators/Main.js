import React, {useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {getCurrentUser, setRefresh} from '../store/userSlice/userSlice';
import {colors} from '../utils/colors';
import Notifications from '../screens/Notifications';
import Historique from '../screens/Historique';
import Order from '../screens/Order';
import Landing from '../screens/Landing';
import Onboarding from '../screens/Onboarding';
import Register from '../screens/Register';
import Profile from '../screens/Profile';
import MainScreen from '../screens/MainScreen';
import Login from '../screens/Login';
import Otp from '../screens/Otp';
import {SafeAreaView} from 'react-native-safe-area-context';
import Rating from '../screens/Rating';
import Tracking from '../screens/Tracking';
import NotifDetails from '../screens/NotifDetails';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainNavigator = () => {
  const userIsLoggedIn = useSelector(state => state.user.token);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch, userIsLoggedIn]);

  const authNavigation = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerBackVisible: false,
          headerTitle: '',
          headerTransparent: true,
        }}>
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="onboarding" component={Onboarding} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="confirmation" component={Otp} />
        <Stack.Screen name="notlog" component={MainScreen} />
      </Stack.Navigator>
    );
  };

  const TabNavigation = () => {
    return (
      <Tab.Navigator
        initialRouteName={'Home'}
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarActiveTintColor: '#F9DC76',
          tabBarStyle: {
            paddingBottom: 40,
            height: 100,
            backgroundColor: '#01050D',
          },
          labelStyle: {
            fontSize: 12,
            fontWeight: 'normal',
          },
          tabBarIcon: ({focused, color, size}) => {
            let iconName;
            let rn = route.name;

            if (rn === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (rn === 'Historique') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (rn === 'Notifications') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            } else if (rn === 'Profile') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}>
        <Tab.Screen
          name="Home"
          component={MainScreen}
          options={{
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          name="Historique"
          component={Historique}
          options={{
            tabBarLabel: 'Historique',
          }}
        />
        <Tab.Screen
          name="Notifications"
          component={Notifications}
          options={{
            tabBarLabel: 'Notifications',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarLabel: 'Profile',
          }}
        />
      </Tab.Navigator>
    );
  };

  const dashboardNavigation = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          headerBackVisible: true,
          headerTitle: '',
          headerTransparent: true,
        }}>
        <Stack.Screen name="Main" component={TabNavigation} />
        <Stack.Screen
          name="order"
          component={Order}
          options={{
            headerShown: true,
            headerTransparent: false,
          }}
        />
        <Stack.Screen
          name="details"
          component={NotifDetails}
          options={{
            headerShown: true,
            headerTransparent: false,
          }}
        />
      </Stack.Navigator>
    );
  };

  return (
    <NavigationContainer>
      {userIsLoggedIn ? dashboardNavigation() : authNavigation()}
    </NavigationContainer>
  );
};

export default MainNavigator;
