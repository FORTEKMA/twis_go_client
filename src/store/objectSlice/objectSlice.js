import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL_ANDROID, API_URL_IOS} from '@env';
import {Platform} from 'react-native';
const API_URL = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;
export const getObjetAll = createAsyncThunk('objet/allobj', async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/objets?populate=deep,3&?pagination[start]=0&pagination[limit]=9999`,
    );

    return response.data;
  } catch (error) {}
});

const initialState = {
  objects: null,
};

export const objectSlice = createSlice({
  name: 'objet',
  initialState,
  reducers: {},
  extraReducers: {
    [getObjetAll.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [getObjetAll.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      state.objects = action.payload;
    },
    [getObjetAll.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
  },
});

export default objectSlice.reducer;
