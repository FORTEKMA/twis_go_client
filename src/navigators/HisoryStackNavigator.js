import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
 import Historique from "../screens/Historique";
import Order from "../screens/Order";
import Rating from "../screens/Rating";
const Stack = createStackNavigator();

  const HisoryStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackVisible: true,
        headerTitle: "",
        headerTransparent: true,
      }}
    >
      <Stack.Screen 
        name="Historique" 
        component={Historique}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="OrderDetails" 
        component={Order}
        options={{
          headerShown: false,
          
 
        }}
      />
      <Stack.Screen 
        name="Rating" 
        component={Rating}
        options={{
          headerShown: false,
          gestureEnabled: false 
        }}
      />
      
    </Stack.Navigator>
  );
}; 
export default HisoryStackNavigator;