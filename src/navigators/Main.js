import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {getCurrentUser} from '../store/userSlice/userSlice';
import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';
import {createStackNavigator} from '@react-navigation/stack';
import Onboarding from '../screens/Onboarding';

const Stack = createStackNavigator();

const MainNavigator = () => {
  const userIsLoggedIn = useSelector(state => state.user.token);
  const dispatch = useDispatch();
  const isFirstTime = useSelector(state => state.user.isFirstTime);
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch, userIsLoggedIn]);

  return (
    <NavigationContainer>
        <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerBackVisible: false,
        headerTitle: '',
        headerTransparent: true,
      }}>

 
      
    {isFirstTime==true&&(  <Stack.Screen name="onboarding" component={Onboarding} />)}
      
      <Stack.Screen name="Main" component={userIsLoggedIn ? TabNavigator : AuthStack} />
 
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
