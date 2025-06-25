
 import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from "../../utils/api"
 
  
export const findDriver = createAsyncThunk(
  'driver/find',
  async ({radius, latitude, longitude}, thunkAPI) => {
    try {
      const response = await api.get(`/drivers-in-radius?radius=${radius}&latitude=${latitude}&longitude=${longitude}`);
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(
        error.response?.data || 'Something went wrong',
      );
    }
  },
);
export const calculatePriceAndDistance = createAsyncThunk(
  'driver/calculatePriceAndDistance',
  async ({driverLocation, pickupLocation, dropoffLocation}, thunkAPI) => {
    try {
      
      const response = await api.post(`/calcul`, {
        driverLocation: {
          lat: driverLocation.latitude,
          lng: driverLocation.longitude,
        },
        accessDepart: {
          lat: pickupLocation.latitude,
          lng: pickupLocation.longitude,
        },
        accessArrivee: {
          lat: dropoffLocation.latitude,
          lng: dropoffLocation.longitude,
        },
        id:1
      });

      const {price, distance} = response.data;
  
      return {price, distance};
    } catch (error) {
      console.error(
        '❌ Error calculating price:',
        error.response?.data || error.message,
      );
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

const initialState = {
  drivers: [],
  status: null,
  price: null,
  distance: null,
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
    [calculatePriceAndDistance.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
    [calculatePriceAndDistance.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [calculatePriceAndDistance.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
     state.price = action.payload.price;
     state.distance = action.payload.distance;
    },
    [findDriver.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
  },
});

export default driverSlice.reducer;