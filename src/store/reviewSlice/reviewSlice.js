import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL_ANDROID, API_URL_IOS} from '@env';
import {Platform} from 'react-native';
const API_URL = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;
// getreviewbyDriver                    $$=> Dash
// getreviewbyClient                    $$=> Dash
// checkcommandReviewExisting       *****
// getreviewByCommandId             *****
// createReview                     *****       then -> update driver rating
// updateExistingReview             *****       then -> update driver rating
// pagination[pageSize]=99999

export const getRviewByCommandId = createAsyncThunk(
  'review/command/get',
  async ({id}, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.user.token;
    try {
      const response = await axios.get(
        `${API_URL}/api/reviews?filters[command][id][$eq]=${id}`,
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

export const createReview = createAsyncThunk(
  'review/create',
  async ({id, body}, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.user.token;
    console.log(body);
    try {
      const response = await axios.post(`${API_URL}/api/reviews/${id}`, body, {
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

export const updateReview = createAsyncThunk(
  'review/update',
  async ({id, body}, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.user.token;

    try {
      const response = await axios.put(`${API_URL}/api/reviews/${id}`, body, {
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
  currentReview: [],
  status: null,
  error: null,
  isLoading: false,
  updatedReservation: null,
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {},
  extraReducers: {
    [getRviewByCommandId.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [getRviewByCommandId.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      state.currentReview = action.payload;
    },
    [getRviewByCommandId.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
      state.error = 'fail';
    },
    [createReview.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [createReview.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
    },
    [createReview.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
      state.error = 'fail';
    },
    [updateReview.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [updateReview.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      state.updatedReservation = action.payload;
    },
    [updateReview.failed]: state => {
      state.status = 'fail';
      state.isLoading = false;
      state.error = 'fail';
    },
  },
});

export default reviewSlice.reducer;
