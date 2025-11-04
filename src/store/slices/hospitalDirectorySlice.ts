import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchListNation,
  fetchListJob,
  fetchListGender,
} from "@/services/HospitalDircetoryServices";

// Async thunks
export const getListNation = createAsyncThunk(
  "hospitalDirectory/getListNation",
  async () => {
    const data = await fetchListNation();
    return data;
  }
);

export const getListJob = createAsyncThunk(
  "hospitalDirectory/getListJob",
  async () => {
    const data = await fetchListJob();
    return data;
  }
);

export const getListGender = createAsyncThunk(
  "hospitalDirectory/getListGender",
  async () => {
    const data = await fetchListGender();
    return data;
  }
);

// Slice
const hospitalDirectorySlice = createSlice({
  name: "hospitalDirectory",
  initialState: {
    nations: [],
    jobs: [],
    genders: [],
    loading: {
      nation: false,
      job: false,
      gender: false,
    },
    error: {
      nation: null,
      job: null,
      gender: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Nation
      .addCase(getListNation.pending, (state) => {
        state.loading.nation = true;
        state.error.nation = null;
      })
      .addCase(getListNation.fulfilled, (state, action) => {
        state.loading.nation = false;
        state.nations = action?.payload?.data?.data || [];
      })
      .addCase(getListNation.rejected, (state, action) => {
        state.loading.nation = false;
        state.error.nation = action.error.message;
      })

      // Job
      .addCase(getListJob.pending, (state) => {
        state.loading.job = true;
        state.error.job = null;
      })
      .addCase(getListJob.fulfilled, (state, action) => {
        state.loading.job = false;
        state.jobs = action?.payload?.data?.data || [];
      })
      .addCase(getListJob.rejected, (state, action) => {
        state.loading.job = false;
        state.error.job = action.error.message;
      })

      // Gender
      .addCase(getListGender.pending, (state) => {
        state.loading.gender = true;
        state.error.gender = null;
      })
      .addCase(getListGender.fulfilled, (state, action) => {
        state.loading.gender = false;
        state.genders = action?.payload?.data?.data || [];
      })
      .addCase(getListGender.rejected, (state, action) => {
        state.loading.gender = false;
        state.error.gender = action.error.message;
      });
  },
});

export default hospitalDirectorySlice.reducer;
