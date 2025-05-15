import axios from 'axios';

 

let userData = {};

import  store  from '../store';
 
 

 

let api = axios.create({
  baseURL: "https://api.tawsilet.com/api",
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
store.subscribe(listener);

function select(state) {
  return state.user;
}

function listener() {
  userData = select(store.getState());
}

 

 
listener();

api.interceptors.request.use(
  async config => {
    const token = userData && userData.token&&userData.token!=-1 ? userData.token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }




    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
 


export default api;
