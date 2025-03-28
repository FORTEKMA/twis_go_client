import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL_ANDROID, API_URL_IOS} from '@env';
import {Platform} from 'react-native';
const API_URL = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;
export const createOrder = createAsyncThunk(
  'commande/create',
  async (data, thunkAPI) => {
    console.log(data, 'data');
    try {
      const state = thunkAPI.getState();
      const token = state.user.token;

      let response = await axios.post(`${API_URL}/api/commands`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(token);
      console.log(response, 'create');
      return response;
    } catch (error) {
      console.log(error);
    }
  },
);
export const updateReservation = createAsyncThunk(
  'order/update',
  async ({id, body}, thunkAPI) => {
    console.log(body, 'fdfdfdfdfd');
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
  'order/get',
  async (
    {id, currentPage = 1, pageSize = 10, filter = '', status = null},
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState();
      const token = state.user.token;

      let response;

      if (status === null) {
        const ongoingStatuses = [
          'Driver_on_route_to_pickup',
          'Arrived_at_pickup',
          'Picked_up',
          'On_route_to_delivery',
          'Arrived_at_delivery',
          'Delivered',
        ];
        // Case 1: Use ongoing logic (prioritize ongoing commands)
        // Fetch ongoing commands
        const ongoingResponse = await axios.get(
          `${API_URL}/api/commands?filters[client_id]=${id}&${ongoingStatuses
            .map((el, i) => `filters[commandStatus][$in][${i}]=${el}`)
            .join(
              '&',
            )}&filters[refNumber][$containsi]=${filter}&populate[0]=driver_id&populate[1]=items&populate[2]=pickUpAddress&populate[3]=dropOfAddress&populate[4]=dropAcces&populate[5]=pickUpAcces&populate[6]=pickUpAddress.coordonne&populate[7]=dropOfAddress.coordonne&populate[8]=client_id&populate[9]=items.item&populate[10]=driver_id.location&populate[11]=driver_id.profilePicture&sort=createdAt:desc&pagination[pageSize]=${pageSize}&pagination[page]=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Calculate the number of ongoing commands fetched
        // const ongoingCount = ongoingResponse.data.data.length;

        // Calculate the remaining page size for other commands
        const remainingPageSize = pageSize;
        // - ongoingCount;
        let otherResponse = {data: {data: [], meta: {pagination: {total: 0}}}};

        // Fetch other commands only if there's space left in the page
        if (remainingPageSize > 0) {
          const otherStatuses = [
            'Pending',
            'Dispatched_to_partner',
            'Assigned_to_driver',
            'Canceled_by_client',
            'Failed_pickup',
            'Failed_delivery',
            'Completed',
          ];
          // Fetch commands with statuses that are not ongoing
          otherResponse = await axios.get(
            `${API_URL}/api/commands?filters[client_id]=${id}&${otherStatuses
              .map((el, i) => `filters[commandStatus][$in][${i}]=${el}`)
              .join(
                '&',
              )}&filters[refNumber][$containsi]=${filter}&populate[0]=driver_id&populate[1]=items&populate[2]=pickUpAddress&populate[3]=dropOfAddress&populate[4]=dropAcces&populate[5]=pickUpAcces&populate[6]=pickUpAddress.coordonne&populate[7]=dropOfAddress.coordonne&populate[8]=client_id&populate[9]=items.item&populate[10]=driver_id.location&populate[11]=driver_id.profilePicture&sort=createdAt:desc&pagination[pageSize]=${remainingPageSize}&pagination[page]=${currentPage}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        }

        // Combine the results
        const combinedData = [
          ...ongoingResponse.data.data,
          ...otherResponse.data.data,
        ];
        const combinedMeta = {
          ...ongoingResponse.data.meta,
          pagination: {
            ...otherResponse.data.meta.pagination,
            total: otherResponse.data.meta.pagination.total,
          },
        };

        response = {data: {data: combinedData, meta: combinedMeta}};
      } else {
        // Case 2: Use the provided status as-is (no ongoing logic)
        response = await axios.get(
          `${API_URL}/api/commands?filters[client_id]=${id}&${status
            .map((el, i) => `filters[commandStatus][$in][${i}]=${el}`)
            .join(
              '&',
            )}&filters[refNumber][$containsi]=${filter}&populate[0]=driver_id&populate[1]=items&populate[2]=pickUpAddress&populate[3]=dropOfAddress&populate[4]=dropAcces&populate[5]=pickUpAcces&populate[6]=pickUpAddress.coordonne&populate[7]=dropOfAddress.coordonne&populate[8]=client_id&populate[9]=items.item&populate[10]=driver_id.location&populate[11]=driver_id.profilePicture&sort=createdAt:desc&pagination[pageSize]=${pageSize}&pagination[page]=${currentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      return {data: response.data.data, meta: response.data.meta};
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);

export const getOrderById = createAsyncThunk(
  'order/getById',
  async ({id}, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.user.token;
      console.log(id, '===============================');

      const response = await axios.get(
        `${API_URL}/api/commands/${id}?populate[0]=driver_id&populate[1]=items&populate[2]=pickUpAddress&populate[3]=dropOfAddress&populate[4]=dropAcces&populate[5]=pickUpAcces&populate[6]=pickUpAddress.coordonne&populate[7]=dropOfAddress.coordonne&populate[8]=client_id&populate[9]=items.item&populate[10]=driver_id.location&populate[11]=driver_id.profilePicture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('🚀🚀🚀🚀🚀 ~ getcurrent commande !!!!!!:', response);
      return response.data;
    } catch (error) {
      console.error(error);
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
        `${API_URL}api/commands?filters[client_id]=${id}&populate=*&sort=createdAt:desc&pagination[pageSize]=${pageSize}&pagination[page]=${currentPage}${
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
      console.log('🚀 ~ response***$:', response);
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
        `${API_URL}/api/commands?filters[driver_id][documentId]=${id}&populate[0]=driver_id&populate[1]=items&populate[2]=pickUpAddress&populate[3]=dropOfAddress&populate[4]=dropAcces&populate[5]=pickUpAcces&populate[6]=pickUpAddress.coordonne&populate[7]=dropOfAddress.coordonne&populate[8]=client_id&populate[9]=items.item`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('🚀 ~ response:', response);
      return response.data;
    } catch (error) {
      console.log(error);

      throw error;
    }
  },
);
// export const getCurrentCommande = createAsyncThunk(
//   'order/currentCommande',
//   async (id, thunkAPI) => {
//     const state = thunkAPI.getState();
//     const token = state.user.token;

//     try {
//       const response = await axios.get(
//         `${API_URL}/api/commands?filters[driver_id][documentId]=${id}&populate[0]=driver_id&populate[1]=items&populate[2]=pickUpAddress&populate[3]=dropOfAddress&populate[4]=dropAcces&populate[5]=pickUpAcces&populate[6]=pickUpAddress.coordonne&populate[7]=dropOfAddress.coordonne&populate[8]=client_id&populate[9]=items.item`,

//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       console.log('🚀 ~ response:', response);
//       return response.data;
//     } catch (error) {
//       console.log(error);

//       throw error;
//     }
//   },
// );
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
    client_id: null,
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
      client_id: null,
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
