import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from "@/services/SpecialtyServices";

export interface Specialty {
  description: any;
  listType: any;
  enable: any;
  id: number;
  name: string;
}

interface SpecialtyState {
  list: Specialty[];
  loading: boolean;
  error: string | null;
}

const initialState: SpecialtyState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchSpecialties = createAsyncThunk(
  "specialty/fetchSpecialties",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSpecialties();
      return response?.data?.data as Specialty[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi lấy danh sách chuyên khoa");
    }
  }
);

export const addSpecialty = createAsyncThunk(
  "specialty/addSpecialty",
  async (data: { name: string }, { rejectWithValue }) => {
    try {
      return await createSpecialty(data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi thêm chuyên khoa");
    }
  }
);

interface SpecialtyUpdateData {
  name: string;
  description: string;
  listType: string;
  enable: boolean;
  // add other fields as needed
}

export const updateSpecialtyThunk = createAsyncThunk(
  "specialty/updateSpecialty",
  async (
    { id, data }: { id: number; data: SpecialtyUpdateData },
    { rejectWithValue }
  ) => {
    try {
      return await updateSpecialty(id, data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi cập nhật chuyên khoa");
    }
  }
);

export const deleteSpecialtyThunk = createAsyncThunk(
  "specialty/deleteSpecialty",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteSpecialty(id);
      return id;
    } catch (err: any) {
      const errorMessage =
        err || // HTTP status text
        "Lỗi xóa chuyên khoa"; // Default
      return rejectWithValue(errorMessage);
    }
  }
);

const specialtySlice = createSlice({
  name: "specialty",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpecialties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSpecialties.fulfilled,
        (state, action: PayloadAction<Specialty[]>) => {
          state.loading = false;
          state.list = action.payload || [];
        }
      )
      .addCase(fetchSpecialties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        addSpecialty.fulfilled,
        (state, action: PayloadAction<Specialty>) => {
          state.list.push(action.payload);
        }
      )
      .addCase(
        updateSpecialtyThunk.fulfilled,
        (state, action: PayloadAction<Specialty>) => {
          const idx = state.list.findIndex((s) => s.id === action.payload.id);
          if (idx !== -1) state.list[idx] = action.payload;
        }
      )
      .addCase(
        deleteSpecialtyThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.list = state.list.filter((s) => s.id !== action.payload);
        }
      );
  },
});

export default specialtySlice.reducer;
