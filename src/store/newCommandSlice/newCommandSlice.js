import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  command: {
    departDate: null,
    SpecificNote: '',
    payType: 'Livraison',
    pickUpAddress: {Address: '', coordonne: {latitude: null, longitude: null}},
    dropOfAddress: {Address: '', coordonne: {latitude: null, longitude: null}},
    totalPrice: null,
    distance: 0,
    items: [],
    deparTime: '10:49',
    dropAcces: {options: 'Camion', floor: 0},
    pickUpAcces: {options: 'Camion', floor: 0},
    duration: '',
    client_id: null,
  },
  unsynced: false, // Track if the command is unsynced
};

const newCommandSlice = createSlice({
  name: 'newCommand',
  initialState,
  reducers: {
    // Set the entire command object
    setCommand(state, action) {
      state.command = action.payload;
      state.unsynced = true;
    },

    // Clear the command
    clearCommand(state) {
      state.command = initialState.command;
      state.unsynced = false;
    },

    // Actions for updating individual fields
    updateDepartDate(state, action) {
      state.command.departDate = action.payload;
      state.unsynced = true;
    },
    updateSpecificNote(state, action) {
      state.command.SpecificNote = action.payload;
      state.unsynced = true;
    },
    updatePayType(state, action) {
      state.command.payType = action.payload;
      state.unsynced = true;
    },
    updatePickUpAddress(state, action) {
      state.command.pickUpAddress = action.payload;
      state.unsynced = true;
    },
    updateDropOfAddress(state, action) {
      state.command.dropOfAddress = action.payload;
      state.unsynced = true;
    },
    updateTotalPrice(state, action) {
      state.command.totalPrice = action.payload;
      state.unsynced = true;
    },
    updateDistance(state, action) {
      state.command.distance = action.payload;
      state.unsynced = true;
    },
    updateItems(state, action) {
      state.command.items = action.payload;
      state.unsynced = true;
    },
    updateDeparTime(state, action) {
      state.command.deparTime = action.payload;
      state.unsynced = true;
    },
    updateDropAcces(state, action) {
      state.command.dropAcces = action.payload;
      state.unsynced = true;
    },
    updatePickUpAcces(state, action) {
      state.command.pickUpAcces = action.payload;
      state.unsynced = true;
    },
    updateDuration(state, action) {
      state.command.duration = action.payload;
      state.unsynced = true;
    },
    updateClient(state, action) {
      state.command.client_id = action.payload;
      state.unsynced = true;
    },
    // Synchronize the command
    synchronizeCommand(state) {
      state.unsynced = false;
    },
  },
});

// Export actions
export const {
  setCommand,
  clearCommand,
  synchronizeCommand,
  updateDepartDate,
  updateSpecificNote,
  updatePayType,
  updatePickUpAddress,
  updateDropOfAddress,
  updateTotalPrice,
  updateDistance,
  updateItems,
  updateDeparTime,
  updateDropAcces,
  updatePickUpAcces,
  updateDuration,
  updateClient,
} = newCommandSlice.actions;

// Export reducer
export default newCommandSlice.reducer;
