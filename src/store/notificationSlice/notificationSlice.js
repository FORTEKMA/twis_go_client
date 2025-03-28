import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL_ANDROID, API_URL_IOS} from '@env';
import {Platform} from 'react-native';
const API_URL = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;
export const getNotification = createAsyncThunk(
  'notification/get',
  async ({id}, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.user.token;
      const response = await axios.get(
        `${API_URL}/api/notifications?sort=createdAt:desc&filters[sendTo][contains]=${id}&populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }, 
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const isReadNotification = createAsyncThunk(
  'notification/read',
  async (id, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.user.token;
      const response = await axios.put(
        `${API_URL}/api/notifications/${id}`,
        {
          data: {
            isRead: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);
export const sendNotification = createAsyncThunk(
  'notification/send',
  async (body, thunkAPI) => {
    try {
      console.log('notif sent');
      const state = thunkAPI.getState();
      const token = state.user.token;
      const response = await axios.post(`${API_URL}/api/notify-user`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);
const initialState = {
  notifications: [],
  status: '',
  error: null,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {},
  extraReducers: {
    [getNotification.pending]: state => {
      state.status = 'pending';
    },
    [getNotification.fulfilled]: (state, action) => {
      state.status = 'success';
      state.notifications = action?.payload?.data;
    },
    [getNotification.rejected]: state => {
      state.status = 'fail';
      state.error = 'fail';
    },
    [isReadNotification.pending]: state => {
      state.status = 'pending';
    },
    [isReadNotification.fulfilled]: (state, action) => {
      state.status = 'success';
    },
    [isReadNotification.rejected]: state => {
      state.status = 'fail';
      state.error = 'fail';
    },
    [sendNotification.pending]: state => {
      state.status = 'pending';
    },
    [sendNotification.fulfilled]: (state, action) => {
      state.status = 'success';
    },
    [sendNotification.rejected]: state => {
      state.status = 'fail';
      state.error = 'fail';
    },
  },
});
export default notificationSlice.reducer;
