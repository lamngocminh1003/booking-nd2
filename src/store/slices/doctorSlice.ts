import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchDoctorsList } from "@/services/UsersServices";

export interface Doctor {
  id: number;
  name: string;
  doctor_IdEmployee_Postgresql: string;
}

interface DoctorState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  doctors: [],
  loading: false,
  error: null,
};

export const fetchDoctors = createAsyncThunk(
  "doctor/fetchDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDoctorsList();
      return response.data.data as Doctor[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi lấy danh sách bác sĩ");
    }
  }
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default doctorSlice.reducer;
