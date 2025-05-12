import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
 import MainScreen from '../screens/MainScreen';
import LocationMap from '../screens/MainScreen/LocationMap';
import Rating from "../screens/Rating"
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
        name="LocationMap" 
        component={LocationMap}
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
    </Stack.Navigator>
  );
}; 
export default HomeStackNavigator;