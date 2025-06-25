import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../utils/api';
 
  
export const getRviewByCommandId = createAsyncThunk(
  'review/command/get',
  async ({id}, thunkAPI) => {
 
    try {
      const response = await api.get(
        `/reviews?filters[command][id][$eq]=${id}` );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const createReview = createAsyncThunk(
  'review/create',
  async ({id, body}, thunkAPI) => {
 
 
    try {
      const response = await api.post(`/reviews/${id}`, body);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const updateReview = createAsyncThunk(
  'review/update',
  async ({id, body}, thunkAPI) => {
   

    try {
      const response = await api.put(`/reviews/${id}`, body);

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
