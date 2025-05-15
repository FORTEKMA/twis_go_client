import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Login from '../screens/Login/index';
import Register from '../screens/Register';
import Otp from '../screens/Otp/index';
 
const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerBackVisible: false,
        headerTitle: '',
        headerTransparent: true,
      }}>
      
      <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="confirmation" component={Otp} />
     
    </Stack.Navigator>
  );
};

export default AuthStack; 