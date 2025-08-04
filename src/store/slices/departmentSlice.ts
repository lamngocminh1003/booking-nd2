import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/services/DepartmentService";

export interface Department {
  id: number;
  name: string;
  enable: boolean;
}

interface DepartmentState {
  list: Department[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDepartments();

      return response?.data?.data as Department[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi lấy danh sách khoa");
    }
  }
);

export const addDepartment = createAsyncThunk(
  "department/addDepartment",
  async (data: { name: string }, { rejectWithValue }) => {
    try {
      return await createDepartment(data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi thêm khoa");
    }
  }
);

export const updateDepartmentThunk = createAsyncThunk(
  "department/updateDepartment",
  async (
    { id, data }: { id: number; data: { name: string } },
    { rejectWithValue }
  ) => {
    try {
      return await updateDepartment(id, data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi cập nhật khoa");
    }
  }
);

export const deleteDepartmentThunk = createAsyncThunk(
  "department/deleteDepartment",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteDepartment(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi xóa khoa");
    }
  }
);

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDepartments.fulfilled,
        (state, action: PayloadAction<Department[]>) => {
          state.loading = false;
          state.list = action.payload || [];
        }
      )
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        addDepartment.fulfilled,
        (state, action: PayloadAction<Department>) => {
          state.list.push(action.payload);
        }
      )
      .addCase(
        updateDepartmentThunk.fulfilled,
        (state, action: PayloadAction<Department>) => {
          const idx = state.list.findIndex((d) => d.id === action.payload.id);
          if (idx !== -1) state.list[idx] = action.payload;
        }
      )
      .addCase(
        deleteDepartmentThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.list = state.list.filter((d) => d.id !== action.payload);
        }
      );
  },
});

export default departmentSlice.reducer;
