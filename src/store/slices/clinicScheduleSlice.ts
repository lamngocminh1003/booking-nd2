import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getClinicSchedules,
  getClinicScheduleById,
  createClinicSchedules,
  updateClinicSchedule,
  deleteClinicSchedule,
  CreateClinicScheduleDto,
  ClinicScheduleQueryParams,
} from "@/services/ClinicScheduleService";

export interface ClinicSchedule {
  id: number;
  roomId?: number;
  examTypeId?: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  maxAppointments?: number;
  appointmentDuration?: number;
  holdSlot?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ClinicScheduleState {
  list: ClinicSchedule[];
  currentSchedule: ClinicSchedule | null;
  loading: boolean;
  error: string | null;
  filters: ClinicScheduleQueryParams;
}

const initialState: ClinicScheduleState = {
  list: [],
  currentSchedule: null,
  loading: false,
  error: null,
  filters: {},
};

export const fetchClinicSchedules = createAsyncThunk(
  "clinicSchedule/fetchClinicSchedules",
  async (
    params: ClinicScheduleQueryParams | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await getClinicSchedules(params);
      return response?.data?.data;
    } catch (err: any) {
      return rejectWithValue(
        err.message || "Lỗi lấy danh sách lịch phòng khám"
      );
    }
  }
);

export const fetchClinicScheduleById = createAsyncThunk(
  "clinicSchedule/fetchClinicScheduleById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getClinicScheduleById(id);
      return response?.data?.data;
    } catch (err: any) {
      return rejectWithValue(
        err.message || "Lỗi lấy thông tin lịch phòng khám"
      );
    }
  }
);

export const addClinicSchedules = createAsyncThunk(
  "clinicSchedule/addClinicSchedules",
  async (data: CreateClinicScheduleDto[], { rejectWithValue }) => {
    try {
      const response = await createClinicSchedules(data);
      return response?.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi tạo lịch phòng khám");
    }
  }
);

// ✅ Thunk mới: Thêm clinic schedules và fetch lại data
export const addClinicSchedulesAndRefresh = createAsyncThunk(
  "clinicSchedule/addClinicSchedulesAndRefresh",
  async (
    {
      data,
      refreshParams,
    }: {
      data: CreateClinicScheduleDto[];
      refreshParams?: ClinicScheduleQueryParams;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // 1. Thêm clinic schedules
      const createResponse = await createClinicSchedules(data);

      // 2. Fetch lại data với params mới
      const fetchResult = await dispatch(fetchClinicSchedules(refreshParams));

      if (fetchClinicSchedules.fulfilled.match(fetchResult)) {
        return {
          created: createResponse?.data,
          refreshed: fetchResult.payload,
        };
      } else {
        throw new Error("Failed to refresh clinic schedules after creation");
      }
    } catch (err: any) {
      return rejectWithValue(
        err.message || "Lỗi tạo và làm mới lịch phòng khám"
      );
    }
  }
);

export const updateClinicScheduleThunk = createAsyncThunk(
  "clinicSchedule/updateClinicSchedule",
  async (
    { id, data }: { id: number; data: CreateClinicScheduleDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateClinicSchedule(id, data);
      return response?.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi cập nhật lịch phòng khám");
    }
  }
);

export const deleteClinicScheduleThunk = createAsyncThunk(
  "clinicSchedule/deleteClinicSchedule",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteClinicSchedule(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi xóa lịch phòng khám");
    }
  }
);

const clinicScheduleSlice = createSlice({
  name: "clinicSchedule",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ClinicScheduleQueryParams>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentSchedule: (state) => {
      state.currentSchedule = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch clinic schedules
      .addCase(fetchClinicSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchClinicSchedules.fulfilled,
        (state, action: PayloadAction<ClinicSchedule[]>) => {
          state.loading = false;
          state.list = action.payload || [];
        }
      )
      .addCase(fetchClinicSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch clinic schedule by ID
      .addCase(fetchClinicScheduleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchClinicScheduleById.fulfilled,
        (state, action: PayloadAction<ClinicSchedule>) => {
          state.loading = false;
          state.currentSchedule = action.payload;
        }
      )
      .addCase(fetchClinicScheduleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add clinic schedules
      .addCase(addClinicSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addClinicSchedules.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          // ✅ Không cần thêm vào state.list vì sẽ fetch lại toàn bộ data
          // Chỉ log success để debug
          console.log(
            "✅ Clinic schedules added successfully:",
            action.payload
          );
        }
      )
      .addCase(addClinicSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add clinic schedules and refresh
      .addCase(addClinicSchedulesAndRefresh.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addClinicSchedulesAndRefresh.fulfilled,
        (
          state,
          action: PayloadAction<{ created: any; refreshed: ClinicSchedule[] }>
        ) => {
          state.loading = false;
          // ✅ Cập nhật list với data đã refresh
          state.list = action.payload.refreshed || [];
          console.log(
            "✅ Clinic schedules added and refreshed successfully:",
            action.payload
          );
        }
      )
      .addCase(addClinicSchedulesAndRefresh.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update clinic schedule
      .addCase(updateClinicScheduleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateClinicScheduleThunk.fulfilled,
        (state, action: PayloadAction<ClinicSchedule>) => {
          state.loading = false;
          const idx = state.list.findIndex((s) => s.id === action.payload.id);
          if (idx !== -1) {
            state.list[idx] = action.payload;
          }
          if (state.currentSchedule?.id === action.payload.id) {
            state.currentSchedule = action.payload;
          }
        }
      )
      .addCase(updateClinicScheduleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete clinic schedule
      .addCase(deleteClinicScheduleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteClinicScheduleThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.loading = false;
          state.list = state.list.filter((s) => s.id !== action.payload);
          if (state.currentSchedule?.id === action.payload) {
            state.currentSchedule = null;
          }
        }
      )
      .addCase(deleteClinicScheduleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearCurrentSchedule, clearError } =
  clinicScheduleSlice.actions;

export default clinicScheduleSlice.reducer;
