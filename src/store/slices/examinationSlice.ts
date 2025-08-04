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
      return response?.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi lấy danh sách ca khám");
    }
  }
);

export const addExamination = createAsyncThunk(
  "examination/addExamination",
  async (data: Omit<Examination, "id" | "enable">, { rejectWithValue }) => {
    try {
      const response = await createExamination(data);

      return response?.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi thêm ca khám");
    }
  }
);

export const updateExaminationThunk = createAsyncThunk(
  "examination/updateExamination",
  async (
    { id, data }: { id: number; data: Omit<Examination, "id"> },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateExamination(id, data);
      return response?.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi cập nhật ca khám");
    }
  }
);

export const deleteExaminationThunk = createAsyncThunk(
  "examination/deleteExamination",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteExamination(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi xóa ca khám");
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
          state.list = action.payload;
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
        }
      )
      .addCase(
        updateExaminationThunk.fulfilled,
        (state, action: PayloadAction<Examination>) => {
          const idx = state.list.findIndex((e) => e.id === action.payload.id);
          if (idx !== -1) state.list[idx] = action.payload;
        }
      )
      .addCase(
        deleteExaminationThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.list = state.list.filter((e) => e.id !== action.payload);
        }
      );
  },
});

export default examinationSlice.reducer;
