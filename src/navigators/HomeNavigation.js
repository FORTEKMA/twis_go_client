import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
 import MainScreen from '../screens/MainScreen';
 import Rating from "../screens/Rating"
import Register from '../screens/Register';
import Otp from '../screens/Otp/index';
import ResetPassword from '../screens/Login/components/ResetPassword';
import ResetCodeScreen from '../screens/Login/components/ResetCodeScreen';
import ForgotPassword from '../screens/Login/components/ForgotPassword';
 

const Stack = createStackNavigator();

  const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackVisible: true,
        headerTitle: "",
        headerTransparent: true,
      }}
    >
      <Stack.Screen 
        name="MainScreen" 
        component={MainScreen}
        options={{
          headerShown: false,
        }}
      />
          <Stack.Screen name="confirmation"  options={{
          headerShown: false,
        }} component={Otp} />

      <Stack.Screen 
        name="Rating" 
        component={Rating}
        options={{headerShown: false,}}
      />

<Stack.Screen  options={{
          headerShown: false,
        }} name="Register" component={Register} />
              <Stack.Screen name="ResetPassword" component={ResetPassword}   options={{headerShown: false,}} />
      <Stack.Screen name="ResetCodeScreen" component={ResetCodeScreen}   options={{headerShown: false,}}/>
      <Stack.Screen name="ForgotPassword" component={ForgotPassword}   options={{headerShown: false,}}/>


    </Stack.Navigator>
  );
}; 
export default HomeStackNavigator;