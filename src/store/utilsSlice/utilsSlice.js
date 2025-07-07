import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL_ANDROID, API_URL_IOS} from '@env';
import {Platform} from 'react-native';
const API_URL = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;

// --- SETTINGS THUNK ---
import api from '../../utils/api';
export const fetchSettingsWithMapIcons = createAsyncThunk(
  'utils/fetchSettingsWithMapIcons',
  async (_, thunkAPI) => {
    const response = await api.get('/settings?populate[0]=map_icon');
    return response.data?.data || [];
  }
);

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
  declinedRide: null,
  mainScreenStep: 1,
  settingsList: [],
  settingsLoading: false,
  settingsError: null,
};

export const utilsSlice = createSlice({
  name: 'variables',
  initialState,
  reducers: {
    setMainScreenStep: (state, action) => {
      state.mainScreenStep = action.payload;
    },
    resetMainScreenStep: (state) => {
      state.mainScreenStep = 1;
    },
  },
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
    // --- SETTINGS HANDLERS ---
    [fetchSettingsWithMapIcons.pending]: (state) => {
      state.settingsLoading = true;
      state.settingsError = null;
    },
    [fetchSettingsWithMapIcons.fulfilled]: (state, action) => {
      state.settingsLoading = false;
      state.settingsList = action.payload;
    },
    [fetchSettingsWithMapIcons.rejected]: (state, action) => {
      state.settingsLoading = false;
      state.settingsError = action.error?.message || 'Failed to fetch settings';
    },
  },
});

export const { setMainScreenStep, resetMainScreenStep } = utilsSlice.actions;

export const selectSettingsList = (state) => state.utilsSlice.settingsList;
export const selectSettingsLoading = (state) => state.utilsSlice.settingsLoading;
export const selectSettingsError = (state) => state.utilsSlice.settingsError;

export default utilsSlice.reducer;
