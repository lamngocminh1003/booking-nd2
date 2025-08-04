import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getZones,
  createZone,
  updateZone,
  deleteZone,
} from "@/services/ZoneServices";

export interface Zone {
  id: number;
  zoneCode?: string;
  name: string;
  address: string;
  enable: boolean;
}

interface ZoneState {
  list: Zone[];
  loading: boolean;
  error: string | null;
}

const initialState: ZoneState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchZones = createAsyncThunk(
  "zone/fetchZones",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getZones();
      return response?.data?.data as Zone[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi lấy danh sách khu");
    }
  }
);

export const addZone = createAsyncThunk(
  "zone/addZone",
  async (data: Omit<Zone, "id">, { rejectWithValue }) => {
    try {
      return await createZone(data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi thêm khu");
    }
  }
);

export const updateZoneThunk = createAsyncThunk(
  "zone/updateZone",
  async (
    { id, data }: { id: number; data: Omit<Zone, "id"> },
    { rejectWithValue }
  ) => {
    try {
      return await updateZone(id, data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi cập nhật khu");
    }
  }
);

export const deleteZoneThunk = createAsyncThunk(
  "zone/deleteZone",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteZone(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi xóa khu");
    }
  }
);

const zoneSlice = createSlice({
  name: "zone",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchZones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchZones.fulfilled, (state, action: PayloadAction<Zone[]>) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addZone.fulfilled, (state, action: PayloadAction<Zone>) => {
        state.list.push(action.payload);
      })
      .addCase(
        updateZoneThunk.fulfilled,
        (state, action: PayloadAction<Zone>) => {
          const idx = state.list.findIndex((z) => z.id === action.payload.id);
          if (idx !== -1) state.list[idx] = action.payload;
        }
      )
      .addCase(
        deleteZoneThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.list = state.list.filter((z) => z.id !== action.payload);
        }
      );
  },
});

export default zoneSlice.reducer;
