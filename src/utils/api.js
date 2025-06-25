import axios from 'axios';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

 import { OneSignal } from "react-native-onesignal";
 
import store from '../store';
import {
 
  logOut,
 
} from "../store/userSlice/userSlice"
let api = axios.create({
  baseURL: "https://api.tawsilet.com/api",
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
 

 

api.interceptors.request.use(
  async config => {
    const state = store.getState();

  const userData = state.user
    const token = userData && userData.token ? userData.token : null;
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
    

    if (error.response && error.response.status === 401) {
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
