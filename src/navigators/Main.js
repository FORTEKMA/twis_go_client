import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {getCurrentUser} from '../store/userSlice/userSlice';
import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';

const MainNavigator = () => {
  const userIsLoggedIn = useSelector(state => state.user.token);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch, userIsLoggedIn]);

  return (
    <NavigationContainer>
      {userIsLoggedIn ? <TabNavigator /> : <AuthStack />}
      
    </NavigationContainer>
  );
};

export default MainNavigator;
