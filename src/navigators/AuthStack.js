import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Login from '../screens/Login/index';
import Register from '../screens/Register';
import Otp from '../screens/Otp/index';
import ResetPassword from '../screens/Login/components/ResetPassword';
import ResetCodeScreen from '../screens/Login/components/ResetCodeScreen';
import ForgotPassword from '../screens/Login/components/ForgotPassword';
 
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
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="ResetCodeScreen" component={ResetCodeScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
};

export default AuthStack; 