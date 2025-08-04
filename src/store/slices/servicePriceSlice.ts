import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getServicePrices,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
} from "@/services/ServicePriceServices";
import { ReactNode } from "react";

export interface ServicePrice {
  enable: any;
  hide_Orcale: any;
  servicePrice_Type_Postgresql: ReactNode;
  servicePrice_IdPK_Orcale: ReactNode;
  servicePrice_IdVP_Orcale: ReactNode;
  vipPrice: any;
  insurancePrice: any;
  regularPrice: any;
  id: number;
  name: string;
  price: number;
}

interface ServicePriceState {
  list: ServicePrice[];
  loading: boolean;
  error: string | null;
}

const initialState: ServicePriceState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchServicePrices = createAsyncThunk(
  "servicePrice/fetchServicePrices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getServicePrices();
      return response?.data?.data as ServicePrice[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi lấy danh sách dịch vụ");
    }
  }
);

export const addServicePrice = createAsyncThunk(
  "servicePrice/addServicePrice",
  async (
    data: {
      name: string;
      regularPrice: number;
      insurancePrice: number;
      vipPrice: number;
    },
    { rejectWithValue }
  ) => {
    try {
      return await createServicePrice(data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi thêm dịch vụ");
    }
  }
);

export const updateServicePriceThunk = createAsyncThunk(
  "servicePrice/updateServicePrice",
  async (
    {
      id,
      data,
    }: {
      id: number;
      data: {
        name: string;
        regularPrice: number;
        insurancePrice: number;
        vipPrice: number;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      return await updateServicePrice(id, data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi cập nhật dịch vụ");
    }
  }
);

export const deleteServicePriceThunk = createAsyncThunk(
  "servicePrice/deleteServicePrice",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteServicePrice(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi xóa dịch vụ");
    }
  }
);

const servicePriceSlice = createSlice({
  name: "servicePrice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServicePrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchServicePrices.fulfilled,
        (state, action: PayloadAction<ServicePrice[]>) => {
          state.loading = false;
          state.list = action.payload || [];
        }
      )
      .addCase(fetchServicePrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        addServicePrice.fulfilled,
        (state, action: PayloadAction<ServicePrice>) => {
          state.list.push(action.payload);
        }
      )
      .addCase(
        updateServicePriceThunk.fulfilled,
        (state, action: PayloadAction<ServicePrice>) => {
          const idx = state.list.findIndex((s) => s.id === action.payload.id);
          if (idx !== -1) state.list[idx] = action.payload;
        }
      )
      .addCase(
        deleteServicePriceThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.list = state.list.filter((s) => s.id !== action.payload);
        }
      );
  },
});

export default servicePriceSlice.reducer;
