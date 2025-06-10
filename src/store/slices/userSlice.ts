
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  } | null;
  insurance: {
    cardNumber: string;
    expiryDate: string;
    isActive: boolean;
  } | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  profile: null,
  insurance: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserState['profile']>) => {
      state.isAuthenticated = true;
      state.profile = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.profile = null;
      state.insurance = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserState['profile']>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    updateInsurance: (state, action: PayloadAction<UserState['insurance']>) => {
      state.insurance = action.payload;
    },
  },
});

export const { login, logout, updateProfile, updateInsurance } = userSlice.actions;
export default userSlice.reducer;
