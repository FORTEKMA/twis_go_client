import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL_ANDROID, API_URL_IOS} from '@env';
import {Platform} from 'react-native';
const API_URL = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;
console.log(API_URL_IOS, API_URL_ANDROID, API_URL);

export const userRegister = createAsyncThunk('user/register', async user => {
  try {
    let response = await axios.post(
      `${API_URL}/api/auth/local/register?populate=deep,4`,
      user,
    );

    return response;
  } catch (error) {
    console.log(error);
  }
});

export const userLogin = createAsyncThunk('user/login', async login => {
  try {
    console.log(login, '==========', API_URL);
    let response = await axios.post(`${API_URL}/api/auth/local`, login);

    return response.data;
  } catch (error) {
    console.log(error, 'login');
    throw error;
  }
});

export const getCurrentUser = createAsyncThunk(
  'user/current',
  async (_, thunkAPI) => {
    // Removed the 'thunkAPI' parameter
    try {
      const state = thunkAPI.getState();
      const jwt = state.user.token; // Access the token from the 'user' slice
      console.log(jwt);
      if (jwt) {
        const response = await axios.get(`${API_URL}/api/users/me?populate=*`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        console.log(response);
        return response.data;
      }
    } catch (error) {
      console.error('current user error:', error);
      throw error;
    }
  },
);
export const logOut = createAsyncThunk('user/logout', async thunkApi => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.log(error);
  }
});
export const sendVerify = createAsyncThunk(
  'user/sendverify',
  async (phoneNumber, code) => {
    try {
      let response = await axios.post(`${API_URL}/api/send-sms`, {
        phoneNumber: phoneNumber,
      });
      console.log(response, 'verif');
      return response.data;
    } catch (error) {
      console.log(error, 'send');
    }
  },
);

export const verify = createAsyncThunk(
  'user/verify',
  async ({phoneNumber, code}) => {
    try {
      let response = await axios.post(`${API_URL}/api/verify-code`, {
        phoneNumber: phoneNumber,
        code: code,
      });

      return response.data;
    } catch (error) {
      console.log(error);
    }
  },
);

export const uplaodImage = createAsyncThunk(
  'user/upload',
  async (data, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const jwt = state.user.token;
      let response = await axios.post(`${API_URL}/api/upload`, data, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      return response.data;
    } catch (error) {}
  },
);
export const updateUser = createAsyncThunk(
  'user/update',
  async (newUser, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const jwt = state.user.token;
      let response = await axios.put(
        `${API_URL}/api/users/${newUser.id}`,
        newUser,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      console.log(response.data, 'update');
      return await response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const changePassword = createAsyncThunk(
  'user/changepassword',
  async (credentials, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.user.token;

    console.log('Sending credentials:', credentials); // Debugging: Log the credentials
    console.log('Using token:', token); // Debugging: Log the token

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/change-password`,
        credentials,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('API Response:', response.data); // Debugging: Log the API response
      return response.data;
    } catch (error) {
      console.error('Change password error:', error); // Debugging: Log the error
      throw error;
    }
  },
);
// export const forgetPassword = createAsyncThunk(
//   'user/forgetPassword',
//   async email => {
//     try {
//       const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
//         email: email,
//       });

//       console.log(response);

//       return response;
//     } catch (error) {
//       console.log(error);
//       throw error; // Add this line to propagate the error up to the component
//     }
//   },
// );
export const forgetPassword = createAsyncThunk(
  'user/forgetPassword',
  async email => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: email,
      });

      return response.data;
    } catch (error) {
      throw error; // Add this line to propagate the error up to the component
    }
  },
);

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async data => {
    try {
      let response = axios.post(`${API_URL}/api/auth/reset-password`, data);

      return response.data.user;
    } catch (error) {
      console.log(error);
    }
  },
);

const initialState = {
  user: null,
  currentUser: null,
  code: null,
  token: null,
  waitingToken: null,
  status: null,
  message: '',
  forgetPsw: null,
  refresh: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.user.token = action.payload;
    },
  },
  extraReducers: {
    [changePassword.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [changePassword.fulfilled]: (state, action) => {
      state.status = 'success';
      if (action.payload.user.user_role === 'client') {
        // state.currentUser = action.payload.user;
        state.token = action.payload.jwt;
      }
      state.isLoading = false;
    },
    [changePassword.rejected]: (state, action) => {
      state.status = 'fail';
      state.isLoading = false;
      console.log(action);
    },
    [forgetPassword.pending]: state => {
      state.status = 'pending';
      // state.isLoading = true;
    },
    [forgetPassword.fulfilled]: (state, action) => {
      state.status = 'success';
      state.forgetPsw = action.payload.data;
      // state.isLoading = false;
    },
    [forgetPassword.rejected]: state => {
      state.status = 'fail';
      // state.isLoading = false;
    },
    [resetPassword.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [resetPassword.fulfilled]: (state, action) => {
      state.status = 'success';
      state.currentUser = action.payload;

      state.isLoading = false;
    },
    [resetPassword.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
    [userRegister.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [userRegister.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      state.token = action.payload.data.jwt;
    },
    [userRegister.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
    [updateUser.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [updateUser.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
    },
    [updateUser.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
    [userLogin.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [userLogin.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      if (action.payload.user.user_role === 'client') {
        state.token = action.payload.jwt;
      }
    },
    [userLogin.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
    [verify.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [verify.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;

      state.user = action.payload.user;

      if (action.payload.authToken && action.payload.user_role === 'client') {
        state.token = action.payload.authToken;
        state.user = action.payload;
      }
      state.status = action.payload.status;
    },
    [verify.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
    [sendVerify.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [sendVerify.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      console.log(action.payload);
    },
    [sendVerify.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
    [getCurrentUser.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [getCurrentUser.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      state.currentUser = action.payload;
    },
    [getCurrentUser.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
    [logOut.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [logOut.fulfilled]: state => {
      state.status = 'success';
      state.isLoading = false;
      state.currentUser = null;
      state.token = null;
    },
    [logOut.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
  },
});

export default userSlice.reducer;
