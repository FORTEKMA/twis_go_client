// http://16.16.75.66:1337/api/drivers-in-radius?radius=1&latitude=36.8481&longitude=10.1793
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL_ANDROID, API_URL_IOS} from '@env';
import {Platform} from 'react-native';
const API_URL = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;
console.log(API_URL_IOS, API_URL_ANDROID, API_URL);

export const findDriver = createAsyncThunk(
  'driver/find',
  async ({radius, latitude, longitude}, thunkAPI) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/drivers-in-radius?radius=${radius}&latitude=${latitude}&longitude=${longitude}`,
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(
        error.response?.data || 'Something went wrong',
      );
    }
  },
);

const initialState = {
  drivers: [],
  status: null,
  isLoading: false,
};

export const driverSlice = createSlice({
  name: 'driver',
  initialState,
  extraReducers: {
    [findDriver.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [findDriver.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      state.drivers = action.payload;
    },
    [findDriver.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
  },
});

export default driverSlice.reducer;