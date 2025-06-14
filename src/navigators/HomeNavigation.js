import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
 import MainScreen from '../screens/MainScreen';
 import Rating from "../screens/Rating"
import Register from '../screens/Register';

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
    
      <Stack.Screen 
        name="Rating" 
        component={Rating}
        options={{
          headerShown: false,
        }}
      />

<Stack.Screen  options={{
          headerShown: false,
        }} name="Register" component={Register} />

    </Stack.Navigator>
  );
}; 
export default HomeStackNavigator;