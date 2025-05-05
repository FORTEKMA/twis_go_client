import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL_ANDROID, API_URL_IOS} from '@env';
import {Platform} from 'react-native';
const API_URL = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;
export const setAcceptRide = createAsyncThunk(
  'notification/setAcceptRide',
  async (body, thunkAPI) => {
    return body;
  },
);
export const setDeclinedRide = createAsyncThunk(
  'notification/setDeclinedRide',
  async (body, thunkAPI) => {
    return body;
  },
);

const initialState = {
  isLoading: null,
  status: null,
  acceptRide: null,
  declinedRide:null
};

export const utilsSlice = createSlice({
  name: 'variables',
  initialState,
  reducers: {},
  extraReducers: {
    [setAcceptRide.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [setAcceptRide.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      state.acceptRide = action.payload;
    },
    [setAcceptRide.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
    [setDeclinedRide.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [setDeclinedRide.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      state.acceptRide = action.payload;
    },
    [setDeclinedRide.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
  },
});

export default utilsSlice.reducer;
