import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {AuthState, User} from '../../types/auth';
import {authApi} from '../../api/auth';
import {tokenStorage} from '../../services/storage';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: {email: string; password: string}, {rejectWithValue}) => {
    try {
      const response = await authApi.login(payload);
      const data = response.data.data ?? response.data;
      const {accessToken, refreshToken, user} = data;

      await tokenStorage.setAccessToken(accessToken);
      await tokenStorage.setRefreshToken(refreshToken);

      return {accessToken, refreshToken, user: user as User};
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed. Please try again.',
      );
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch {
    // ignore
  } finally {
    await tokenStorage.clear();
  }
});

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, {rejectWithValue}) => {
    try {
      const accessToken = await tokenStorage.getAccessToken();
      if (!accessToken) {
        return rejectWithValue('No access token');
      }
      const response = await authApi.getProfile();
      return (response.data.data ?? response.data) as User;
    } catch (err: any) {
      await tokenStorage.clear();
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch profile',
      );
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Login failed';
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchProfile.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, state => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const {clearError, setUser} = authSlice.actions;
export default authSlice.reducer;
