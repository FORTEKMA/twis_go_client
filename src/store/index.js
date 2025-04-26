import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import thunk from 'redux-thunk';
import userSlice from './userSlice/userSlice';
import objectSlice from './objectSlice/objectSlice';
import commandeSlice from './commandeSlice/commandeSlice';
import notificationSlice from './notificationSlice/notificationSlice';
import reviewSlice from './reviewSlice/reviewSlice';
import newCommandSlice from './newCommandSlice/newCommandSlice';
import driverSlice  from './driverSlice/driverSlice';

// Combine all reducers
const reducers = combineReducers({
  user: userSlice,
  driver: driverSlice,
  objects: objectSlice,
  commandes: commandeSlice,
  notifications: notificationSlice,
  review: reviewSlice,
  newCommand: newCommandSlice,
});

// Redux Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'objects', 'commandes', 'notifications', 'review'],
  timeout: 5000, // Increase the timeout to avoid rehydration timeout errors
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, reducers);

// Configure the Redux store
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: false,
    }).concat(thunk),
  devTools: true, // Enable Redux DevTools
});

// Create the persistor
export const persistor = persistStore(store);

export default store;
