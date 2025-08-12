import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllProvinces,
  fetchAllWards, // Bỏ fetchAllDistricts
} from "@/services/LocationServices";
import { userInfo } from "@/services/UsersServices";

// Async thunks
export const getProvinces = createAsyncThunk(
  "location/getProvinces",
  async () => {
    return await fetchAllProvinces();
  }
); // Async thunks
export const getUserInfo = createAsyncThunk(
  "location/getUserInfo",
  async () => {
    return await userInfo();
  }
);

// Cập nhật getWards để nhận provinceId thay vì districtId
export const getWards = createAsyncThunk(
  "location/getWards",
  async (provinceId: string) => {
    return await fetchAllWards(provinceId);
  }
);

// Initial state type
interface LocationState {
  provinces: any[];
  wards: any[]; // Bỏ districts
  userInfo: any | null;
  loading: {
    provinces: boolean;
    wards: boolean; // Bỏ districts
    userInfo: boolean;
  };
  error: {
    provinces: string | null;
    wards: string | null; // Bỏ districts
    userInfo: string | null;
  };
}

// Initial state
const initialState: LocationState = {
  provinces: [],
  wards: [], // Bỏ districts
  userInfo: null,
  loading: {
    provinces: false,
    wards: false, // Bỏ districts
    userInfo: false,
  },
  error: {
    provinces: null,
    wards: null, // Bỏ districts
    userInfo: null,
  },
};

// Slice
const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    resetLocation: (state, action: PayloadAction<"wards" | "all">) => {
      if (action?.payload === "wards") {
        state.wards = [];
        state.loading.wards = false;
        state.error.wards = null;
      } else {
        state.wards = [];
        state.loading.wards = false;
        state.error.wards = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Provinces
      .addCase(getProvinces.pending, (state) => {
        state.loading.provinces = true;
        state.error.provinces = null;
      })
      .addCase(getProvinces.fulfilled, (state, action) => {
        state.loading.provinces = false;
        state.provinces = action?.payload?.data?.data;
      })
      .addCase(getProvinces.rejected, (state) => {
        state.loading.provinces = false;
        state.error.provinces = "Failed to load provinces";
      })

      // User Info
      .addCase(getUserInfo.pending, (state) => {
        state.loading.userInfo = true;
        state.error.userInfo = null;
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.loading.userInfo = false;
        state.userInfo = action?.payload?.data?.data;
      })
      .addCase(getUserInfo.rejected, (state) => {
        state.loading.userInfo = false;
        state.error.userInfo = "Failed to load user info";
      })

      // Wards (bỏ Districts)
      .addCase(getWards.pending, (state) => {
        state.loading.wards = true;
        state.error.wards = null;
      })
      .addCase(getWards.fulfilled, (state, action) => {
        state.loading.wards = false;
        state.wards = action?.payload?.data?.data || [];
      })
      .addCase(getWards.rejected, (state) => {
        state.loading.wards = false;
        state.error.wards = "Failed to load wards";
      });
  },
});

export const { resetLocation } = locationSlice.actions;
export default locationSlice.reducer;
