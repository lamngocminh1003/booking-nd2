import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { useTokenRefresher } from "@/hooks/useTokenRefresher";

import {
  fetchAllProvinces,
  fetchAllDistricts,
  fetchAllWards,
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

export const getDistricts = createAsyncThunk(
  "location/getDistricts",
  async (provinceId: string) => {
    return await fetchAllDistricts(provinceId);
  }
);

export const getWards = createAsyncThunk(
  "location/getWards",
  async (districtId: string) => {
    return await fetchAllWards(districtId);
  }
);

// Initial state type
interface LocationState {
  provinces: any[];
  districts: any[];
  wards: any[];
  userInfo: any | null;
  loading: {
    provinces: boolean;
    districts: boolean;
    wards: boolean;
    userInfo: boolean;
  };
  error: {
    provinces: string | null;
    districts: string | null;
    wards: string | null;
    userInfo: string | null;
  };
}

// Initial state
const initialState: LocationState = {
  provinces: [],
  districts: [],
  wards: [],
  userInfo: null,
  loading: {
    provinces: false,
    districts: false,
    wards: false,
    userInfo: false,
  },
  error: {
    provinces: null,
    districts: null,
    wards: null,
    userInfo: null,
  },
};

// Slice
const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    resetLocation: (
      state,
      action: PayloadAction<"districts" | "wards" | "all">
    ) => {
      if (action?.payload === "districts") {
        state.districts = [];
        state.loading.districts = false;
        state.error.districts = null;
      } else if (action?.payload === "wards") {
        state.wards = [];
        state.loading.wards = false;
        state.error.wards = null;
      } else {
        state.districts = [];
        state.wards = [];
        state.loading.districts = false;
        state.loading.wards = false;
        state.error.districts = null;
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
      // Districts
      .addCase(getDistricts.pending, (state) => {
        state.loading.districts = true;
        state.error.districts = null;
      })
      .addCase(getDistricts.fulfilled, (state, action) => {
        state.loading.districts = false;
        state.districts = action?.payload?.data?.data;
      })
      .addCase(getDistricts.rejected, (state) => {
        state.loading.districts = false;
        state.error.districts = "Failed to load districts";
      })

      // Wards
      .addCase(getWards.pending, (state) => {
        state.loading.wards = true;
        state.error.wards = null;
      })
      .addCase(getWards.fulfilled, (state, action) => {
        state.loading.wards = false;
        state.wards = action?.payload?.data?.data;
      })
      .addCase(getWards.rejected, (state) => {
        state.loading.wards = false;
        state.error.wards = "Failed to load wards";
      });
  },
});

export const { resetLocation } = locationSlice.actions;
export default locationSlice.reducer;
