import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getRooms,
  getRoomsByZone,
  createRoom,
  updateRoom,
  // deleteRoom,
} from "@/services/RoomServices";

export interface Room {
  enable: any;
  zoneName: ReactNode;
  id: number;
  name: string;
  code?: string;
  zoneId?: number;
}

interface RoomState {
  list: Room[];
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk(
  "room/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRooms();
      return response?.data?.data as Room[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi lấy danh sách phòng");
    }
  }
);

export const fetchRoomsByZone = createAsyncThunk(
  "room/fetchRoomsByZone",
  async (zoneId: number, { rejectWithValue }) => {
    try {
      const response = await getRoomsByZone(zoneId);
      return response?.data?.data as Room[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi lấy phòng theo khu");
    }
  }
);

export const addRoom = createAsyncThunk(
  "room/addRoom",
  async (
    data: { name: string; code?: string; zoneId?: number },
    { rejectWithValue }
  ) => {
    try {
      return await createRoom(data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi thêm phòng");
    }
  }
);

export const updateRoomThunk = createAsyncThunk(
  "room/updateRoom",
  async (
    {
      id,
      data,
    }: { id: number; data: { name: string; code?: string; zoneId?: number } },
    { rejectWithValue }
  ) => {
    try {
      return await updateRoom(id, data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi cập nhật phòng");
    }
  }
);

// Nếu có API xóa phòng, thêm asyncThunk deleteRoomThunk

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action: PayloadAction<Room[]>) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addRoom.fulfilled, (state, action: PayloadAction<Room>) => {
        state.list.push(action.payload);
      })
      .addCase(
        updateRoomThunk.fulfilled,
        (state, action: PayloadAction<Room>) => {
          const idx = state.list.findIndex((r) => r.id === action.payload.id);
          if (idx !== -1) state.list[idx] = action.payload;
        }
      );
    // Nếu có xóa phòng, thêm .addCase(deleteRoomThunk.fulfilled, ...)
  },
});

export default roomSlice.reducer;
