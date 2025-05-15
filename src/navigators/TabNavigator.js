import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Notifications from '../screens/Notifications';
import HisoryStackNavigator from './HisoryStackNavigator';
import ProfileStack from './ProfileStack';
import HomeStackNavigator from './HomeNavigation';
import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={'Home'}
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
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