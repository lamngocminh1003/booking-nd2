import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getExaminations,
  createExamination,
  updateExamination,
  deleteExamination,
} from "@/services/ExaminationService";

export interface Examination {
  id: number;
  name: string;
  workSession: string;
  startTime: string;
  endTime: string;
  enable: boolean;
}

interface ExaminationState {
  list: Examination[];
  loading: boolean;
  error: string | null;
}

const initialState: ExaminationState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchExaminations = createAsyncThunk(
  "examination/fetchExaminations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getExaminations();
      return response?.data?.data as Examination[];
    } catch (err: any) {
      // ✅ Consistent error handling như specialty
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Lỗi lấy danh sách ca khám";
      return rejectWithValue(errorMessage);
    }
  }
);

export const addExamination = createAsyncThunk(
  "examination/addExamination",
  async (
    data: {
      name: string;
      workSession: string;
      startTime: string;
      endTime: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await createExamination(data);
    } catch (err: any) {
      // ✅ Consistent error handling như specialty
      const errorMessage =
        typeof err === "string" ? err : err.message || "Lỗi thêm ca khám";
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Interface riêng cho update data giống specialty
interface ExaminationUpdateData {
  name: string;
  workSession: string;
  startTime: string;
  endTime: string;
  enable: boolean;
}

export const updateExaminationThunk = createAsyncThunk(
  "examination/updateExamination",
  async (
    { id, data }: { id: number; data: ExaminationUpdateData },
    { rejectWithValue }
  ) => {
    try {
      return await updateExamination(id, data);
    } catch (err: any) {
      // ✅ Consistent error handling như specialty
      const errorMessage =
        typeof err === "string" ? err : err.message || "Lỗi cập nhật ca khám";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteExaminationThunk = createAsyncThunk(
  "examination/deleteExamination",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteExamination(id);
      return id; // ✅ Return ID để remove khỏi state
    } catch (err: any) {
      // ✅ Xử lý error message đúng cách giống specialty
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.message || err?.toString() || "Lỗi xóa ca khám";
      return rejectWithValue(errorMessage);
    }
  }
);

const examinationSlice = createSlice({
  name: "examination",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExaminations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchExaminations.fulfilled,
        (state, action: PayloadAction<Examination[]>) => {
          state.loading = false;
          state.list = action.payload || [];
        }
      )
      .addCase(fetchExaminations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        addExamination.fulfilled,
        (state, action: PayloadAction<Examination>) => {
          state.list.push(action.payload);
          state.error = null; // ✅ Clear any previous errors
        }
      )
      .addCase(addExamination.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(
        updateExaminationThunk.fulfilled,
        (state, action: PayloadAction<Examination>) => {
          const idx = state.list.findIndex((e) => e.id === action.payload.id);
          if (idx !== -1) state.list[idx] = action.payload;
          state.error = null; // ✅ Clear any previous errors
        }
      )
      .addCase(updateExaminationThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(
        deleteExaminationThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          // ✅ Remove examination khỏi list dựa trên ID
          state.list = state.list.filter(
            (examination) => examination.id !== action.payload
          );
          state.error = null; // ✅ Clear any previous errors
        }
      )
      .addCase(deleteExaminationThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default examinationSlice.reducer;
