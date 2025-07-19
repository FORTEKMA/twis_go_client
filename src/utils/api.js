import axios from 'axios';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { API_URL,IN_DEV,DEV_API_URL } from '@env';

 import { OneSignal } from "react-native-onesignal";
 
import store from '../store';
import {
 
  logOut,
 
} from "../store/userSlice/userSlice"
let api = axios.create({
  baseURL:IN_DEV?DEV_API_URL: API_URL,

  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
 

 

api.interceptors.request.use(
  async config => {
    const state = store.getState();

  const userData = state.user
    const token = userData && userData.token&& userData.token!==-1 ? userData.token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle 401 unauthorized responses
api.interceptors.response.use(
  response => response,
  error => {
    const state = store.getState();

    const userData = state.user
    const token = userData && userData.token ? userData.token : null;
   

    if (error.response && error.response.status === 401&&token!==-1) {
      try {
        GoogleSignin.signOut();
     } catch (error) {
       console.log(error)
     }
   
     store.dispatch(logOut()).then(() => {
       OneSignal.logout();
       
     });

     
    }
    return Promise.reject(error);
  }
);

export default api;
