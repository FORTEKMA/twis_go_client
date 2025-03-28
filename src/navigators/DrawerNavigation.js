import React, {useEffect} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
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
import Rating from '../screens/Rating';
import Tracking from '../screens/Tracking';
import NotifDetails from '../screens/NotifDetails';
import {Text, View} from 'native-base';
import {Image} from 'react-native-svg';
import CustomDrawerContent from './CustomDrawerContent';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {getCurrentUser} from '../store/userSlice/userSlice';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const MainNavigator = () => {
  const dispatch = useDispatch();
  const userIsLoggedIn = useSelector(state => state.user.token);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]); // Auth Navigation for Non-Logged-In Users
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

  // Drawer Navigation for Logged-In Users
  const DrawerNavigation = () => {
    return (
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={({navigation}) => ({
          drawerActiveTintColor: "white",
          drawerStyle: {
            backgroundColor: '#19191C',
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: '#19191C',
          },
          headerTitleStyle: {
            color: 'white',
            fontSize: 20,
            fontWeight: '500',
            textAlign: 'center',
          },
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.toggleDrawer()}>
              <Ionicons name="menu" size={26} color="white" />
            </TouchableOpacity>
          ),
        })}>
        <Drawer.Screen
          name="Accueil"
          component={MainScreen}
          options={{
            drawerIcon: ({color, size}) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Historique"
          component={Historique}
          options={{
            drawerIcon: ({color, size}) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Notifications"
          component={Notifications}
          options={{
            drawerIcon: ({color, size}) => (
              <Ionicons
                name="notifications-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Compte"
          component={Profile}
          options={{
            drawerIcon: ({color, size}) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    );
  };

  // Stack Navigation for Screens with Additional Pages
  const dashboardNavigation = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          headerBackVisible: true,
          headerTitle: '',
          headerTransparent: true,
        }}>
        <Stack.Screen name="Main" component={DrawerNavigation} />
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

const styles = StyleSheet.create({
  menuButton: {
    backgroundColor: '#19191C', // Background color of the button
    padding: 5, // Padding for the button
    borderRadius: 8, // Border radius for rounded corners
    marginLeft: 20, // Margin to align the button with the header
  },
});
