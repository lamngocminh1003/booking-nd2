import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDoctorsList } from "@/services/UsersServices";

export interface Doctor {
  id: number;
  name: string;
  fullName?: string;
  doctor_IdEmployee_Postgresql: string;
  code?: string;
  enable?: boolean;
  specialtyName?: string;
  specialtyId?: number;
  departmentId?: number;
  departmentName?: string;
  email?: string;
  phone?: string;
}

interface DoctorState {
  list: Doctor[]; // ✅ Đổi từ 'doctors' thành 'list' để consistent với các slice khác
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  list: [], // ✅ Đổi từ 'doctors' thành 'list'
  loading: false,
  error: null,
};

export const fetchDoctors = createAsyncThunk(
  "doctor/fetchDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDoctorsList();

      // ✅ Kiểm tra cấu trúc response
      if (response?.data?.data) {
        return response.data.data as Doctor[];
      } else if (response?.data) {
        return response.data as Doctor[];
      } else if (Array.isArray(response)) {
        return response as Doctor[];
      } else {
        console.warn("⚠️ Unexpected doctor response structure:", response);
        return [];
      }
    } catch (err: any) {
      console.error("❌ Error fetching doctors:", err);
      return rejectWithValue(err.message || "Lỗi lấy danh sách bác sĩ");
    }
  }
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDoctors: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload; // ✅ Đổi từ 'doctors' thành 'list'
        state.error = null;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.list = []; // ✅ Reset list khi có lỗi
      });
  },
});

export const { clearError, clearDoctors } = doctorSlice.actions;
export default doctorSlice.reducer;
