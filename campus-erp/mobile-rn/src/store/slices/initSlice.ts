import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {tokenStorage} from '../../services/storage';

interface InitState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: InitState = {
  isInitialized: false,
  isLoading: false,
  error: null,
};

export const initializeApp = createAsyncThunk(
  'init/initialize',
  async () => {
    // Hydrate persisted prefs/cache; tokens come from keychain.
    await AsyncStorage.getItem('app_initialized');

    const accessToken = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();

    return {accessToken, refreshToken};
  },
);

const initSlice = createSlice({
  name: 'init',
  initialState,
  reducers: {
    resetInit: state => {
      state.isInitialized = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initializeApp.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeApp.fulfilled, state => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Initialization failed';
      });
  },
});

export const {resetInit} = initSlice.actions;
export default initSlice.reducer;
