import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Notifications from '../screens/Notifications';
import HisoryStackNavigator from './HisoryStackNavigator';
import ProfileStack from './ProfileStack';
import MainScreen from '../screens/MainScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={'Home'}
       screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#F9DC76',
       
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
      })}
      >
      <Tab.Screen
        name="Home"
        component={MainScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Historique"
        component={HisoryStackNavigator}
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
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 