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
  roomCount?: number;
  zone_Id_Postgresql?: number;
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
      // ✅ Consistent error handling như specialty
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Lỗi lấy danh sách khu vực";
      return rejectWithValue(errorMessage);
    }
  }
);

export const addZone = createAsyncThunk(
  "zone/addZone",
  async (
    data: {
      zoneCode: string;
      name: string;
      address: string;
      zone_Id_Postgresql?: number;
      enable?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      return await createZone(data);
    } catch (err: any) {
      // ✅ Consistent error handling như specialty
      const errorMessage =
        typeof err === "string" ? err : err.message || "Lỗi thêm khu vực";
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Interface riêng cho update data giống specialty
interface ZoneUpdateData {
  zoneCode: string;
  name: string;
  address: string;
  zone_Id_Postgresql?: number;
  enable: boolean;
}

export const updateZoneThunk = createAsyncThunk(
  "zone/updateZone",
  async (
    { id, data }: { id: number; data: ZoneUpdateData },
    { rejectWithValue }
  ) => {
    try {
      return await updateZone(id, data);
    } catch (err: any) {
      // ✅ Consistent error handling như specialty
      const errorMessage =
        typeof err === "string" ? err : err.message || "Lỗi cập nhật khu vực";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteZoneThunk = createAsyncThunk(
  "zone/deleteZone",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteZone(id);
      return id; // ✅ Return ID để remove khỏi state
    } catch (err: any) {
      // ✅ Xử lý error message đúng cách giống specialty
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.message || err?.toString() || "Lỗi xóa khu vực";
      return rejectWithValue(errorMessage);
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
        state.error = null; // ✅ Clear any previous errors
      })
      .addCase(addZone.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(
        updateZoneThunk.fulfilled,
        (state, action: PayloadAction<Zone>) => {
          const idx = state.list.findIndex((z) => z.id === action.payload.id);
          if (idx !== -1) state.list[idx] = action.payload;
          state.error = null; // ✅ Clear any previous errors
        }
      )
      .addCase(updateZoneThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(
        deleteZoneThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          // ✅ Remove zone khỏi list dựa trên ID
          state.list = state.list.filter((zone) => zone.id !== action.payload);
          state.error = null; // ✅ Clear any previous errors
        }
      )
      .addCase(deleteZoneThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default zoneSlice.reducer;
