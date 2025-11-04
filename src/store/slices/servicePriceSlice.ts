import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getServicePrices,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
  // ✅ Import new function
  getExamTypeServicePricesByExamTypeId,
  createOrUpdateExamTypeServicePrice,
  deleteExamTypeServicePrice,
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

// ✅ Interface cho service price detail từ API mới
export interface ServicePriceDetail {
  id: number;
  price: number;
  name: string;
  enable: boolean;
}

// ✅ Interface cho exam type với servicePrices nested
export interface ExamTypeWithServicePrices {
  servicePrices: ServicePriceDetail[];
  id: number;
  zoneId: number;
  zoneName: string | null;
  name: string;
  description: string;
  enable: boolean;
  appointmentFormId: number;
  appointmentFormKey: string;
  appointmentFormName: string;
}

// ✅ Old interface (keep for backward compatibility)
export interface ExamTypeServicePrice {
  id: number;
  examTypeId: number;
  examTypeName: string;
  servicePriceId: number;
  servicePriceName: string;
  regularPrice: number;
  insurancePrice: number;
  vipPrice: number;
  enable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Interface for Create/Update payload
export interface CreateUpdateExamTypeServicePrice {
  examTypeId: number;
  servicePriceId: number;
  regularPrice?: number;
  insurancePrice?: number;
  vipPrice?: number;
  enable: boolean;
}

// ✅ Update interface để match với API response
export interface ExamTypeServicePriceResponse {
  id: number;
  name: string;
  description: string;
  enable: boolean;
  zoneId: number;
  appointmentFormId: number;
  servicePrice: ServicePriceDetail[]; // ✅ Array of service prices
}

interface ServicePriceState {
  list: ServicePrice[];
  loading: boolean;
  error: string | null;

  // ✅ Updated state structure để lưu full exam type data
  examTypeServicePrices: ExamTypeServicePriceResponse | null;
  examTypeServicePricesLoading: boolean;
  examTypeServicePricesError: string | null;
  currentExamTypeId: number | null;
}

const initialState: ServicePriceState = {
  list: [],
  loading: false,
  error: null,

  // ✅ Initialize với null thay vì empty array
  examTypeServicePrices: null,
  examTypeServicePricesLoading: false,
  examTypeServicePricesError: null,
  currentExamTypeId: null,
};

// ✅ Existing async thunks
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

// ✅ NEW: Fetch service prices by examTypeId
export const fetchExamTypeServicePricesByExamTypeId = createAsyncThunk(
  "servicePrice/fetchExamTypeServicePricesByExamTypeId",
  async (examTypeId: number, { rejectWithValue }) => {
    try {
      const response = await getExamTypeServicePricesByExamTypeId(examTypeId);

      // ✅ Extract data from nested response structure
      const data = response?.data?.data || response?.data;

      if (!data) {
        throw new Error("No data received from API");
      }

      return {
        examTypeId,
        examTypeData: data, // Full exam type data including servicePrice array
      };
    } catch (err: any) {
      console.error("❌ Error fetching exam type service prices:", err);
      return rejectWithValue(
        err.message || "Lỗi lấy danh sách dịch vụ theo khu khám"
      );
    }
  }
);

export const createOrUpdateExamTypeServicePriceThunk = createAsyncThunk(
  "servicePrice/createOrUpdateExamTypeServicePrice",
  async (data: CreateUpdateExamTypeServicePrice, { rejectWithValue }) => {
    try {
      const response = await createOrUpdateExamTypeServicePrice(data);
      return response?.data as ExamTypeServicePrice;
    } catch (err: any) {
      return rejectWithValue(
        err.message || "Lỗi tạo/cập nhật dịch vụ khu khám"
      );
    }
  }
);

export const deleteExamTypeServicePriceThunk = createAsyncThunk(
  "servicePrice/deleteExamTypeServicePrice",
  async (
    {
      examTypeId,
      servicePriceId,
    }: { examTypeId: number; servicePriceId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await deleteExamTypeServicePrice(
        examTypeId,
        servicePriceId
      );

      // ✅ Double check success flag in response
      if (response?.success === false || response?.data?.success === false) {
        const errorMessage =
          response?.message || response?.data?.message || "Lỗi khi xóa dịch vụ";
        return rejectWithValue(errorMessage);
      }

      return { examTypeId, servicePriceId };
    } catch (err: any) {
      console.error("❌ Delete error:", err);
      return rejectWithValue(err.message || "Lỗi xóa dịch vụ khu khám");
    }
  }
);

const servicePriceSlice = createSlice({
  name: "servicePrice",
  initialState,
  reducers: {
    // ✅ Clear exam type service prices
    clearExamTypeServicePrices: (state) => {
      state.examTypeServicePrices = null;
      state.examTypeServicePricesError = null;
      state.currentExamTypeId = null;
    },

    // ✅ Add action để toggle service price enable/disable
    toggleServicePriceEnable: (
      state,
      action: PayloadAction<{ servicePriceId: number }>
    ) => {
      if (state.examTypeServicePrices?.servicePrice) {
        const servicePrice = state.examTypeServicePrices.servicePrice.find(
          (sp) => sp.id === action.payload.servicePriceId
        );
        if (servicePrice) {
          servicePrice.enable = !servicePrice.enable;
        }
      }
    },

    // ✅ Add action để update service price
    updateServicePriceInExamType: (
      state,
      action: PayloadAction<{
        servicePriceId: number;
        updates: Partial<ServicePriceDetail>;
      }>
    ) => {
      if (state.examTypeServicePrices?.servicePrice) {
        const index = state.examTypeServicePrices.servicePrice.findIndex(
          (sp) => sp.id === action.payload.servicePriceId
        );
        if (index !== -1) {
          state.examTypeServicePrices.servicePrice[index] = {
            ...state.examTypeServicePrices.servicePrice[index],
            ...action.payload.updates,
          };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Existing cases
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
      )

      // ✅ NEW: Cases for fetch by examTypeId
      .addCase(fetchExamTypeServicePricesByExamTypeId.pending, (state) => {
        state.examTypeServicePricesLoading = true;
        state.examTypeServicePricesError = null;
      })
      .addCase(
        fetchExamTypeServicePricesByExamTypeId.fulfilled,
        (
          state,
          action: PayloadAction<{
            examTypeId: number;
            examTypeData: ExamTypeServicePriceResponse;
          }>
        ) => {
          state.examTypeServicePricesLoading = false;
          state.examTypeServicePrices = action.payload.examTypeData;
          state.currentExamTypeId = action.payload.examTypeId;
        }
      )
      .addCase(
        fetchExamTypeServicePricesByExamTypeId.rejected,
        (state, action) => {
          console.error(
            "❌ Redux: Failed to load exam type service prices:",
            action.payload
          );

          state.examTypeServicePricesLoading = false;
          state.examTypeServicePricesError = action.payload as string;
          state.examTypeServicePrices = null;
        }
      )

      // ✅ Handle delete success
      .addCase(
        deleteExamTypeServicePriceThunk.fulfilled,
        (
          state,
          action: PayloadAction<{ examTypeId: number; servicePriceId: number }>
        ) => {
          // ✅ Remove from local state
          if (state.examTypeServicePrices?.servicePrice) {
            state.examTypeServicePrices.servicePrice =
              state.examTypeServicePrices.servicePrice.filter(
                (item) => item.id !== action.payload.servicePriceId
              );
          }
        }
      );
  },
});

export const {
  clearExamTypeServicePrices,
  toggleServicePriceEnable,
  updateServicePriceInExamType,
} = servicePriceSlice.actions;

export default servicePriceSlice.reducer;
