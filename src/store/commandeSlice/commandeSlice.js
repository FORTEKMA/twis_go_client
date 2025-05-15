import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL_ANDROID, API_URL_IOS} from '@env';
import {Platform} from 'react-native';
const API_URL = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;
export const createOrder = createAsyncThunk(
  'commande/create',
  async (data, thunkAPI) => {
     try {
      const state = thunkAPI.getState();
      const token = state.user.token;

      let response = await axios.post(`${API_URL}/api/commands`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     
      return response;
    } catch (error) {
      console.log(error);
    }
  },
);
export const updateReservation = createAsyncThunk(
  'order/update',
  async ({id, body}, thunkAPI) => {
  
    try {
      const state = thunkAPI.getState();
      const token = state.user.token;
      const response = await axios.put(`${API_URL}/api/commands/${id}`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);

export const getUserOrdersById = createAsyncThunk(
  "order/get",
  async (
    {
      id,
      currentPage = 1,
      pageSize = 10,
      filter = "",
      status = [  ],
    },
    thunkAPI
  ) => {

    const commandStatuses = status.length
      ? "&" +
        status.filter(x=>x!=null)
          .map((el, i) => `filters[commandStatus][$in][${i}]=${el}`)
          .join("&") +
        "&"
      : "";

    try {
      const state = thunkAPI.getState();
      const token = state.user.token;
       const response = await axios.get(
        `${API_URL}/api/commands?filters[client][documentId]=${id}${commandStatuses}&filters[refNumber][$containsi]=${filter}&populate[0]=driver&populate[1]=pickUpAddress&populate[2]=dropOfAddress&populate[3]=pickUpAddress.coordonne&populate[4]=dropOfAddress.coordonne&populate[5]=client&sort=createdAt:desc&pagination[pageSize]=${pageSize}&pagination[page]=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
       
      return { data: response.data.data, meta: response.data.meta };
    } catch (error) {
      throw error;
    }
  }
);

export const getOrderById = createAsyncThunk(
  'order/getById',
  async ({id}, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.user.token;
    
       const response = await axios.get(
        `${API_URL}/api/commands/${id}?populate[0]=driver&populate[1]=pickUpAddress&populate[2]=dropOfAddress&populate[3]=pickUpAddress.coordonne&populate[4]=dropOfAddress.coordonne&populate[5]=driver.profilePicture&populate[6]=review&populate[7]=driver.vehicule`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      ;
      return response.data;
    } catch (error) {
      console.error(error.response.data);
      throw error;
    }
  },
);

export const getOrdersById = createAsyncThunk(
  'order/get',
  async ({id, currentPage = 1, pageSize = 10, text = ''}, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.user.token;
      const response = await axios.get(
        `${API_URL}api/commands?filters[client]=${id}&populate=*&sort=createdAt:desc&pagination[pageSize]=${pageSize}&pagination[page]=${currentPage}${
          text !== ''
            ? `&filters[$or][0][pickUpAddress][Address][$contains]=${text}&filters[$or][1][dropOfAddress][Address][$contains]=${text}&filters[$or][2][id][$eq]=${text}&filters[$or][3][refNumber][$contains]=${text}&filters[$or][4][commandStatus][$contains]=${text}&filters[$or][5][departDate][$contains]=${text}`
            : ''
        }`,
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
export const getCurrentCommande = createAsyncThunk(
  'order/currentCommande',
  async (id, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.user.token;

    try {
      const response = await axios.get(
        `${API_URL}/api/commands?filters[driver][documentId]=${id}&populate[0]=driver&populate[1]=items&populate[2]=pickUpAddress&populate[3]=dropOfAddress&populate[4]=dropAcces&populate[5]=pickUpAcces&populate[6]=pickUpAddress.coordonne&populate[7]=dropOfAddress.coordonne&populate[8]=client&populate[9]=items.item`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

  
      return response.data;
    } catch (error) {
      console.log(error);

      throw error;
    }
  },
);
 
export const init = {
  data: {
    departDate: '',
    payType: null,
    totalPrice: null,
    distance: null,
    deparTime: '',
    SpecificNote: '',
    duration: '',
    pickUpAddress: {
      Address: 'Votre adresse de départ',
      coordonne: {
        latitude: null,
        longitude: null,
      },
    },
    dropOfAddress: {
      Address: "Votre adresse d'arrivée",
      coordonne: {
        latitude: null,
        longitude: null,
      },
    },
    items: [],
    client: null,
    TansportType: {
      Type: '',
      Quantity: 1,
    },
    dropAcces: {
      options: 'Camion',
      floor: 0,
    },
    pickUpAcces: {
      options: 'Camion',
      floor: 0,
    },
  },
};
const initialState = {
  commande: null,
  OrderById: null,
  isLoading: false,
  status: null,
  currentCommand: null,
  message: '',
  newCommande: {
    data: {
      departDate: '',
      payType: null,
      totalPrice: null,
      distance: null,
      deparTime: '',
      SpecificNote: '',
      duration: '',
      pickUpAddress: {
        Address: 'Votre adresse de départ',
        coordonne: {
          latitude: null,
          longitude: null,
        },
      },
      dropOfAddress: {
        Address: "Votre adresse d'arrivée",
        coordonne: {
          latitude: null,
          longitude: null,
        },
      },
      items: [],
      client: null,
      TansportType: {
        Type: '',
        Quantity: 1,
      },
      dropAcces: {
        options: 'Camion',
        floor: 0,
      },
      pickUpAcces: {
        options: 'Camion',
        floor: 0,
      },
    },
  },
  currentStep: 1,
};

export const commandeSlice = createSlice({
  name: 'commande',
  initialState,
  reducers: {
    setNewCommande: (state, action) => {
      state.newCommande = action.payload;
    },
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    initCommandeState: (state, action) => {
      state.newCommande = init;
      state.currentStep = 1;
    },
  },
  extraReducers: {
    [getCurrentCommande.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [getCurrentCommande.fulfilled]: (state, action) => {
      state.status = 'success';
      state.currentCommand = action.payload.data[0];

      state.isLoading = false;
    },
    [getCurrentCommande.rejected]: (state, action) => {
      state.status = 'fail';
      state.isLoading = false;
    },
    [getOrderById.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [getOrderById.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      state.OrderById = action.payload.data;
    },
    [getOrderById.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
      state.error = 'fail';
    },
    [getUserOrdersById.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [getUserOrdersById.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
      state.commande = action.payload;
    },
    [getUserOrdersById.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
      state.error = 'fail';
    },
    [createOrder.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [createOrder.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;

      state.commande = action.payload.data;
    },
    [createOrder.rejected]: state => {
      state.status = 'fail';
    },
    [updateReservation.pending]: state => {
      state.status = 'pending';
      state.isLoading = true;
    },
    [updateReservation.fulfilled]: (state, action) => {
      state.status = 'success';
      state.isLoading = false;
    },
    [updateReservation.rejected]: state => {
      state.status = 'fail';
      state.isLoading = false;
    },
  },
});
export const {setNewCommande, setStep, initCommandeState} =
  commandeSlice.actions;
export default commandeSlice.reducer;
