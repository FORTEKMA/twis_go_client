import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Profile from '../screens/Profile';
import PersonalInfo from '../screens/Profile/sections/PersonalInfo';
 import Security from '../screens/Profile/sections/Security';
import Help from '../screens/Profile/sections/Help';
 
const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={Profile} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
       <Stack.Screen name="Security" component={Security} />
      <Stack.Screen name="Help" component={Help} />
  
    </Stack.Navigator>
  );
};

export default ProfileStack; 