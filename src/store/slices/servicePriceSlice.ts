import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getServicePrices,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
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

export interface ServicePriceDetail {
  id: number;
  price: number;
  name: string;
  enable: boolean;
}

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

export interface CreateUpdateExamTypeServicePrice {
  examTypeId: number;
  servicePriceId: number;
  regularPrice?: number;
  insurancePrice?: number;
  vipPrice?: number;
  enable: boolean;
}

export interface ExamTypeServicePriceResponse {
  id: number;
  name: string;
  description: string;
  enable: boolean;
  zoneId: number;
  appointmentFormId: number;
  servicePrice: ServicePriceDetail[];
}

interface ServicePriceState {
  list: ServicePrice[];
  loading: boolean;
  error: string | null;
  examTypeServicePrices: ExamTypeServicePriceResponse | null;
  examTypeServicePricesLoading: boolean;
  examTypeServicePricesError: string | null;
  currentExamTypeId: number | null;
}

const initialState: ServicePriceState = {
  list: [],
  loading: false,
  error: null,
  examTypeServicePrices: null,
  examTypeServicePricesLoading: false,
  examTypeServicePricesError: null,
  currentExamTypeId: null,
};

// ✅ Fetch service prices - consistent with specialtySlice
export const fetchServicePrices = createAsyncThunk(
  "servicePrice/fetchServicePrices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getServicePrices();
      return response?.data?.data as ServicePrice[];
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Lỗi lấy danh sách dịch vụ";
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Add service price - consistent with specialtySlice
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
      const errorMessage =
        typeof err === "string" ? err : err.message || "Lỗi thêm dịch vụ";
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Update service price - consistent with specialtySlice
interface ServicePriceUpdateData {
  name: string;
  regularPrice: number;
  insurancePrice: number;
  vipPrice: number;
  enable?: boolean;
}

export const updateServicePriceThunk = createAsyncThunk(
  "servicePrice/updateServicePrice",
  async (
    { id, data }: { id: number; data: ServicePriceUpdateData },
    { rejectWithValue }
  ) => {
    try {
      return await updateServicePrice(id, data);
    } catch (err: any) {
      const errorMessage =
        typeof err === "string" ? err : err.message || "Lỗi cập nhật dịch vụ";
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Delete service price - consistent with specialtySlice
export const deleteServicePriceThunk = createAsyncThunk(
  "servicePrice/deleteServicePrice",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteServicePrice(id);
      return id; // ✅ Return ID để remove khỏi state
    } catch (err: any) {
      // ✅ Xử lý error message đúng cách
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.message || err?.toString() || "Lỗi xóa dịch vụ";
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Fetch exam type service prices
export const fetchExamTypeServicePricesByExamTypeId = createAsyncThunk(
  "servicePrice/fetchExamTypeServicePricesByExamTypeId",
  async (examTypeId: number, { rejectWithValue }) => {
    try {
      const response = await getExamTypeServicePricesByExamTypeId(examTypeId);
      const data = response?.data?.data || response?.data;

      if (!data) {
        throw new Error("No data received from API");
      }

      return {
        examTypeId,
        examTypeData: data,
      };
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Lỗi lấy danh sách dịch vụ theo khu khám";
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Create or update exam type service price
export const createOrUpdateExamTypeServicePriceThunk = createAsyncThunk(
  "servicePrice/createOrUpdateExamTypeServicePrice",
  async (data: CreateUpdateExamTypeServicePrice, { rejectWithValue }) => {
    try {
      return await createOrUpdateExamTypeServicePrice(data);
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Lỗi tạo/cập nhật dịch vụ khu khám";
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Delete exam type service price - consistent with specialtySlice
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
      await deleteExamTypeServicePrice(examTypeId, servicePriceId);
      return { examTypeId, servicePriceId }; // ✅ Return IDs để remove khỏi state
    } catch (err: any) {
      // ✅ Xử lý error message đúng cách
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.message || err?.toString() || "Lỗi xóa dịch vụ khu khám";
      return rejectWithValue(errorMessage);
    }
  }
);

const servicePriceSlice = createSlice({
  name: "servicePrice",
  initialState,
  reducers: {
    clearExamTypeServicePrices: (state) => {
      state.examTypeServicePrices = null;
      state.examTypeServicePricesError = null;
      state.currentExamTypeId = null;
    },
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
      // ✅ Service prices CRUD - consistent with specialtySlice
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
          state.error = null; // Clear any previous errors
        }
      )
      .addCase(addServicePrice.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(
        updateServicePriceThunk.fulfilled,
        (state, action: PayloadAction<ServicePrice>) => {
          const idx = state.list.findIndex((s) => s.id === action.payload.id);
          if (idx !== -1) state.list[idx] = action.payload;
          state.error = null; // Clear any previous errors
        }
      )
      .addCase(updateServicePriceThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(
        deleteServicePriceThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          // ✅ Remove item khỏi list dựa trên ID
          state.list = state.list.filter(
            (servicePrice) => servicePrice.id !== action.payload
          );
          state.error = null; // Clear any previous errors
        }
      )
      .addCase(deleteServicePriceThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ✅ Exam type service prices operations
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
          state.examTypeServicePricesError = null; // Clear any previous errors
        }
      )
      .addCase(
        fetchExamTypeServicePricesByExamTypeId.rejected,
        (state, action) => {
          state.examTypeServicePricesLoading = false;
          state.examTypeServicePricesError = action.payload as string;
          state.examTypeServicePrices = null;
        }
      )
      .addCase(
        createOrUpdateExamTypeServicePriceThunk.fulfilled,
        (state, action) => {
          state.examTypeServicePricesError = null; // Clear any previous errors
        }
      )
      .addCase(
        createOrUpdateExamTypeServicePriceThunk.rejected,
        (state, action) => {
          state.examTypeServicePricesError = action.payload as string;
        }
      )
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
          state.examTypeServicePricesError = null; // Clear any previous errors
        }
      )
      .addCase(deleteExamTypeServicePriceThunk.rejected, (state, action) => {
        state.examTypeServicePricesError = action.payload as string;
      });
  },
});

export const {
  clearExamTypeServicePrices,
  toggleServicePriceEnable,
  updateServicePriceInExamType,
} = servicePriceSlice.actions;

export default servicePriceSlice.reducer;
