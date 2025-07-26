import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from "../../utils/api"
 
 export const getNotification = createAsyncThunk(
  'notification/get',
  async ({id}, thunkAPI) => {
    try {
  
      const response = await api.get(
        `/notifications?sort=createdAt:desc&filters[sendTo][documentId][$eq]=${id}&populate=*`);
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
     
      const response = await api.put(
        `/notifications/${id}`);
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
   
      
      
      const response = await api.post(`/notify-user`, body);
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
