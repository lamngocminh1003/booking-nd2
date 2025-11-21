import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as ExamTypeService from "@/services/ExamTypeService";

// ✅ New interfaces based on actual API response - Added isSelectDoctor
export interface ZoneExamType {
  id: number;
  zoneId: number;
  zoneName: string;
  name: string;
  description: string;
  enable: boolean;
  isSelectDoctor?: boolean; // ✅ Thêm trường isSelectDoctor
  appointmentFormId: number;
  appointmentFormKey: string;
  appointmentFormName: string;
  departmentHospitals: ZoneDepartment[];
}

export interface ZoneDepartment {
  id: number;
  name: string;
  enable: boolean;
  isSelectDoctor?: boolean; // ✅ Thêm trường isSelectDoctor
  departmentHospital_Id_Postgresql: number;
  sepicalties?: ZoneSpecialty[];
}

export interface ZoneSpecialty {
  id: number;
  name: string;
  description: string | null;
  listType: string | null;
  enable: boolean;
  isSelectDoctor?: boolean; // ✅ Thêm trường isSelectDoctor
}

export interface DepartmentByZone {
  departmentHospitalId: number;
  departmentHospitalName: string;
  examTypes: DepartmentExamType[];
  hasSelectDoctorExams?: boolean; // ✅ Aggregate field để check if có exam nào cần select doctor
}

export interface DepartmentExamType {
  id: number;
  name: string;
  description: string;
  enable: boolean;
  isSelectDoctor?: boolean; // ✅ Thêm trường isSelectDoctor
  zoneId: number;
  zoneName: string;
  appointmentFormId: number;
  sepicalties: ZoneSpecialty[];
}

// ✅ Existing interfaces - Added isSelectDoctor
export interface ExamType {
  id: number;
  name: string;
  code: string;
  description?: string;
  zoneId: number;
  enable: boolean;
  isSelectDoctor?: boolean; // ✅ Thêm trường isSelectDoctor
  createdDate?: string;
  updatedDate?: string;
}

// ✅ Updated state interface
interface ExamTypeState {
  list: ExamType[];
  specialtyDetails: ExamTypeService.ExamTypeSpecialtyDetail[];
  specialtyDepartmentList: any[];
  servicePriceDetails: ExamTypeService.ExamTypeServicePriceDetail[];

  // ✅ New zone-related data
  examsByZone: Record<string, ZoneExamType[]>;
  departmentsByZone: Record<string, DepartmentByZone[]>;
  zoneDataLoading: Record<string, boolean>;
  zoneDataErrors: Record<string, string | null>;

  loading: boolean;
  specialtyLoading: boolean;
  servicePriceLoading: boolean;
  error: string | null;
}

const initialState: ExamTypeState = {
  list: [],
  specialtyDetails: [],
  specialtyDepartmentList: [],
  servicePriceDetails: [],

  // ✅ New zone data
  examsByZone: {},
  departmentsByZone: {},
  zoneDataLoading: {},
  zoneDataErrors: {},

  loading: false,
  specialtyLoading: false,
  servicePriceLoading: false,
  error: null,
};

// ✅ Existing async thunks
export const createExamType = createAsyncThunk(
  "examType/createExamType",
  async (data: ExamTypeService.ExamTypeDto) => {
    const response = await ExamTypeService.createOrUpdateExamType(data);
    return response.data;
  }
);

export const updateExamType = createAsyncThunk(
  "examType/updateExamType",
  async (data: ExamTypeService.ExamTypeDto) => {
    const response = await ExamTypeService.createOrUpdateExamType(data);
    return response.data;
  }
);

export const fetchExamTypes = createAsyncThunk(
  "examType/fetchExamTypes",
  async (enable?: boolean) => {
    const response = await ExamTypeService.getExamTypes(enable);
    return response?.data?.data;
  }
);

export const fetchExamTypeSpecialtyDetails = createAsyncThunk(
  "examType/fetchExamTypeSpecialtyDetails",
  async (enable?: boolean) => {
    const response = await ExamTypeService.getExamTypeSpecialtyDetails(enable);
    return response?.data?.data;
  }
);

export const fetchExamTypeSpecialtyDepartmentList = createAsyncThunk(
  "examType/fetchExamTypeSpecialtyDepartmentList",
  async () => {
    const response = await ExamTypeService.getExamTypeSpecialtyDepartmentList();
    return response?.data?.data;
  }
);

export const fetchExamTypeServicePriceDetails = createAsyncThunk(
  "examType/fetchExamTypeServicePriceDetails",
  async (enable?: boolean) => {
    const response = await ExamTypeService.getExamTypeServicePriceDetails(
      enable
    );
    return response?.data?.data;
  }
);

// ✅ New async thunks for zone-based data - Enhanced with isSelectDoctor
export const fetchExamsByZone = createAsyncThunk(
  "examType/fetchExamsByZone",
  async (zoneId: number | string, { rejectWithValue }) => {
    try {
      const response = await ExamTypeService.getExamsByZoneId(zoneId);

      const rawExams = response?.data?.data || response?.data || [];

      // ✅ Parse and ensure isSelectDoctor field
      const exams = rawExams.map((exam: any) => ({
        ...exam,
        isSelectDoctor: exam.isSelectDoctor ?? false, // Default to false if not provided
      }));

      return { zoneId: zoneId.toString(), exams };
    } catch (err: any) {
      console.error(`❌ Error fetching exams for zone ${zoneId}:`, err);
      return rejectWithValue({
        zoneId: zoneId.toString(),
        error: err.message || `Lỗi lấy loại khám cho zone ${zoneId}`,
      });
    }
  }
);

export const fetchDepartmentsByZone = createAsyncThunk(
  "examType/fetchDepartmentsByZone",
  async (zoneId: number | string, { rejectWithValue }) => {
    try {
      const response = await ExamTypeService.getDepartmentsByZoneId(zoneId);

      // ✅ Updated to handle new response structure with departments and examTypes
      const responseData = response?.data?.data || response?.data || {};

      const departments = (responseData.departments || []).map((dept: any) => ({
        ...dept,
        // ✅ Add hasSelectDoctorExams aggregate field
        hasSelectDoctorExams:
          dept.examTypes?.some((et: any) => et.isSelectDoctor) || false,
        examTypes: (dept.examTypes || []).map((et: any) => ({
          ...et,
          isSelectDoctor: et.isSelectDoctor ?? false, // Default to false
        })),
      }));

      const examTypes = (responseData.examTypes || []).map((exam: any) => ({
        ...exam,
        isSelectDoctor: exam.isSelectDoctor ?? false, // Default to false
      }));

      return { zoneId: zoneId.toString(), departments, examTypes };
    } catch (err: any) {
      console.error(`❌ Error fetching departments for zone ${zoneId}:`, err);
      return rejectWithValue({
        zoneId: zoneId.toString(),
        error: err.message || `Lỗi lấy khoa phòng cho zone ${zoneId}`,
      });
    }
  }
);

// ✅ Combined zone data fetch - Enhanced with isSelectDoctor
export const fetchZoneRelatedData = createAsyncThunk(
  "examType/fetchZoneRelatedData",
  async (zoneId: number | string, { rejectWithValue }) => {
    try {
      const response = await ExamTypeService.getZoneRelatedData(zoneId);

      // ✅ Parse and ensure isSelectDoctor field for departments
      const departments = (response.departments || []).map((dept: any) => ({
        ...dept,
        hasSelectDoctorExams:
          dept.examTypes?.some((et: any) => et.isSelectDoctor) || false,
        examTypes: (dept.examTypes || []).map((et: any) => ({
          ...et,
          isSelectDoctor: et.isSelectDoctor ?? false,
        })),
      }));

      // ✅ Parse and ensure isSelectDoctor field for exams
      const exams = (response.exams || []).map((exam: any) => ({
        ...exam,
        isSelectDoctor: exam.isSelectDoctor ?? false,
      }));

      return {
        zoneId: zoneId.toString(),
        departments,
        exams,
      };
    } catch (err: any) {
      console.error(`❌ Error fetching zone ${zoneId} related data:`, err);
      return rejectWithValue({
        zoneId: zoneId.toString(),
        error: err.message || `Lỗi lấy dữ liệu cho zone ${zoneId}`,
      });
    }
  }
);

// ✅ Existing thunks
export const createExamTypeSpecialty = createAsyncThunk(
  "examType/createExamTypeSpecialty",
  async (data: ExamTypeService.CreateUpdateExamTypeSpecialty) => {
    const response = await ExamTypeService.createOrUpdateExamTypeSpecialty(
      data
    );
    return response.data;
  }
);

export const deleteExamTypeSpecialty = createAsyncThunk(
  "examType/deleteExamTypeSpecialty",
  async ({
    examTypeId,
    specialtyId,
    departmentId,
  }: {
    examTypeId: number;
    specialtyId?: number;
    departmentId?: number;
  }) => {
    await ExamTypeService.deleteExamTypeSpecialty(
      examTypeId,
      specialtyId,
      departmentId
    );
    return { examTypeId, specialtyId, departmentId };
  }
);

export const createExamTypeServicePrice = createAsyncThunk(
  "examType/createExamTypeServicePrice",
  async (data: ExamTypeService.CreateUpdateExamTypeServicePrice) => {
    const response = await ExamTypeService.createOrUpdateExamTypeServicePrice(
      data
    );
    return response.data;
  }
);

export const deleteExamTypeServicePrice = createAsyncThunk(
  "examType/deleteExamTypeServicePrice",
  async ({
    examTypeId,
    servicePriceId,
  }: {
    examTypeId: number;
    servicePriceId?: number;
  }) => {
    await ExamTypeService.deleteExamTypeServicePrice(
      examTypeId,
      servicePriceId
    );
    return { examTypeId, servicePriceId };
  }
);

// ✅ New action creators for isSelectDoctor management
const examTypeSlice = createSlice({
  name: "examType",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetExamTypeState: (state) => {
      return initialState;
    },
    clearZoneError: (state, action) => {
      const zoneId = action.payload;
      delete state.zoneDataErrors[zoneId];
    },
    clearAllZoneData: (state) => {
      state.examsByZone = {};
      state.departmentsByZone = {};
      state.zoneDataLoading = {};
      state.zoneDataErrors = {};
    },
    // ✅ New reducer to toggle isSelectDoctor for specific exam type
    toggleExamTypeSelectDoctor: (
      state,
      action: PayloadAction<{ examTypeId: number; zoneId: string }>
    ) => {
      const { examTypeId, zoneId } = action.payload;

      // Update in examsByZone
      if (state.examsByZone[zoneId]) {
        const examIndex = state.examsByZone[zoneId].findIndex(
          (e) => e.id === examTypeId
        );
        if (examIndex !== -1) {
          state.examsByZone[zoneId][examIndex].isSelectDoctor =
            !state.examsByZone[zoneId][examIndex].isSelectDoctor;
        }
      }

      // Update in departmentsByZone
      if (state.departmentsByZone[zoneId]) {
        state.departmentsByZone[zoneId].forEach((dept) => {
          const examIndex = dept.examTypes.findIndex(
            (e) => e.id === examTypeId
          );
          if (examIndex !== -1) {
            dept.examTypes[examIndex].isSelectDoctor =
              !dept.examTypes[examIndex].isSelectDoctor;

            // Update aggregate field
            dept.hasSelectDoctorExams = dept.examTypes.some(
              (et) => et.isSelectDoctor
            );
          }
        });
      }

      // Update in main list if exists
      const mainListIndex = state.list.findIndex((e) => e.id === examTypeId);
      if (mainListIndex !== -1) {
        state.list[mainListIndex].isSelectDoctor =
          !state.list[mainListIndex].isSelectDoctor;
      }
    },
    // ✅ New reducer to update isSelectDoctor for specific exam type
    updateExamTypeSelectDoctor: (
      state,
      action: PayloadAction<{
        examTypeId: number;
        zoneId: string;
        isSelectDoctor: boolean;
      }>
    ) => {
      const { examTypeId, zoneId, isSelectDoctor } = action.payload;

      // Update in examsByZone
      if (state.examsByZone[zoneId]) {
        const examIndex = state.examsByZone[zoneId].findIndex(
          (e) => e.id === examTypeId
        );
        if (examIndex !== -1) {
          state.examsByZone[zoneId][examIndex].isSelectDoctor = isSelectDoctor;
        }
      }

      // Update in departmentsByZone
      if (state.departmentsByZone[zoneId]) {
        state.departmentsByZone[zoneId].forEach((dept) => {
          const examIndex = dept.examTypes.findIndex(
            (e) => e.id === examTypeId
          );
          if (examIndex !== -1) {
            dept.examTypes[examIndex].isSelectDoctor = isSelectDoctor;

            // Update aggregate field
            dept.hasSelectDoctorExams = dept.examTypes.some(
              (et) => et.isSelectDoctor
            );
          }
        });
      }

      // Update in main list if exists
      const mainListIndex = state.list.findIndex((e) => e.id === examTypeId);
      if (mainListIndex !== -1) {
        state.list[mainListIndex].isSelectDoctor = isSelectDoctor;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Existing exam types - Enhanced with isSelectDoctor
      .addCase(fetchExamTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamTypes.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Ensure isSelectDoctor field exists
        state.list = (action.payload || []).map((exam: any) => ({
          ...exam,
          isSelectDoctor: exam.isSelectDoctor ?? false,
        }));
      })
      .addCase(fetchExamTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch exam types";
      })

      // ✅ Create ExamType - Enhanced with isSelectDoctor
      .addCase(createExamType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExamType.fulfilled, (state, action) => {
        state.loading = false;
        const newExamType = {
          ...action.payload,
          isSelectDoctor: action.payload.isSelectDoctor ?? false,
        };
        const exists = state.list.find((item) => item.id === newExamType.id);
        if (!exists) {
          state.list.unshift(newExamType);
        }
      })
      .addCase(createExamType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create exam type";
      })

      // ✅ Update ExamType - Enhanced with isSelectDoctor
      .addCase(updateExamType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExamType.fulfilled, (state, action) => {
        state.loading = false;
        const updatedExamType = {
          ...action.payload,
          isSelectDoctor: action.payload.isSelectDoctor ?? false,
        };
        const index = state.list.findIndex(
          (item) => item.id === updatedExamType.id
        );
        if (index !== -1) {
          state.list[index] = updatedExamType;
        }
      })
      .addCase(updateExamType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update exam type";
      })

      // ✅ Fetch Specialty Details
      .addCase(fetchExamTypeSpecialtyDetails.pending, (state) => {
        state.specialtyLoading = true;
        state.error = null;
      })
      .addCase(fetchExamTypeSpecialtyDetails.fulfilled, (state, action) => {
        state.specialtyLoading = false;
        state.specialtyDetails = action.payload;
      })
      .addCase(fetchExamTypeSpecialtyDetails.rejected, (state, action) => {
        state.specialtyLoading = false;
        state.error =
          action.error.message || "Failed to fetch specialty details";
      })

      // ✅ Fetch Specialty Department List
      .addCase(fetchExamTypeSpecialtyDepartmentList.pending, (state) => {
        state.specialtyLoading = true;
        state.error = null;
      })
      .addCase(
        fetchExamTypeSpecialtyDepartmentList.fulfilled,
        (state, action) => {
          state.specialtyLoading = false;
          state.specialtyDepartmentList = action.payload;
        }
      )
      .addCase(
        fetchExamTypeSpecialtyDepartmentList.rejected,
        (state, action) => {
          state.specialtyLoading = false;
          state.error =
            action.error.message || "Failed to fetch specialty department list";
        }
      )

      // ✅ NEW: Exams by zone - Enhanced with isSelectDoctor
      .addCase(fetchExamsByZone.pending, (state, action) => {
        const zoneId = action.meta.arg.toString();
        state.zoneDataLoading[zoneId] = true;
        state.zoneDataErrors[zoneId] = null;
      })
      .addCase(fetchExamsByZone.fulfilled, (state, action) => {
        const { zoneId, exams } = action.payload;
        state.zoneDataLoading[zoneId] = false;
        state.examsByZone[zoneId] = exams;
        state.zoneDataErrors[zoneId] = null;
      })
      .addCase(fetchExamsByZone.rejected, (state, action) => {
        const { zoneId, error } = action.payload as any;
        state.zoneDataLoading[zoneId] = false;
        state.zoneDataErrors[zoneId] = error;
        state.examsByZone[zoneId] = [];
      })

      // ✅ NEW: Departments by zone - Enhanced with isSelectDoctor
      .addCase(fetchDepartmentsByZone.pending, (state, action) => {
        const zoneId = action.meta.arg.toString();
        state.zoneDataLoading[zoneId] = true;
        state.zoneDataErrors[zoneId] = null;
      })
      .addCase(fetchDepartmentsByZone.fulfilled, (state, action) => {
        const { zoneId, departments, examTypes } = action.payload;
        state.zoneDataLoading[zoneId] = false;
        state.departmentsByZone[zoneId] = departments;
        // ✅ Also update examTypes if provided
        if (examTypes && examTypes.length > 0) {
          state.examsByZone[zoneId] = examTypes;
        }
        state.zoneDataErrors[zoneId] = null;
      })
      .addCase(fetchDepartmentsByZone.rejected, (state, action) => {
        const { zoneId, error } = action.payload as any;
        state.zoneDataLoading[zoneId] = false;
        state.zoneDataErrors[zoneId] = error;
        state.departmentsByZone[zoneId] = [];
      })

      // ✅ NEW: Zone related data (combined) - Enhanced with isSelectDoctor
      .addCase(fetchZoneRelatedData.pending, (state, action) => {
        const zoneId = action.meta.arg.toString();
        state.zoneDataLoading[zoneId] = true;
        state.zoneDataErrors[zoneId] = null;
      })
      .addCase(fetchZoneRelatedData.fulfilled, (state, action) => {
        const { zoneId, departments, exams } = action.payload;
        state.zoneDataLoading[zoneId] = false;
        state.departmentsByZone[zoneId] = departments;
        state.examsByZone[zoneId] = exams;
        state.zoneDataErrors[zoneId] = null;
      })
      .addCase(fetchZoneRelatedData.rejected, (state, action) => {
        const { zoneId, error } = action.payload as any;
        state.zoneDataLoading[zoneId] = false;
        state.zoneDataErrors[zoneId] = error;
        state.departmentsByZone[zoneId] = [];
        state.examsByZone[zoneId] = [];
      })

      // ✅ Other existing cases...
      .addCase(createExamTypeSpecialty.pending, (state) => {
        state.specialtyLoading = true;
        state.error = null;
      })
      .addCase(createExamTypeSpecialty.fulfilled, (state, action) => {
        state.specialtyLoading = false;
      })
      .addCase(createExamTypeSpecialty.rejected, (state, action) => {
        state.specialtyLoading = false;
        state.error =
          action.error.message || "Failed to create exam type specialty";
      })

      .addCase(deleteExamTypeSpecialty.pending, (state) => {
        state.specialtyLoading = true;
        state.error = null;
      })
      .addCase(deleteExamTypeSpecialty.fulfilled, (state, action) => {
        state.specialtyLoading = false;
        state.specialtyDetails = state.specialtyDetails.filter(
          (item) =>
            !(
              item.examTypeId === action.payload.examTypeId &&
              (action.payload.specialtyId === undefined ||
                item.specialtyId === action.payload.specialtyId) &&
              (action.payload.departmentId === undefined ||
                item.departmentId === action.payload.departmentId)
            )
        );
      })
      .addCase(deleteExamTypeSpecialty.rejected, (state, action) => {
        state.specialtyLoading = false;
        state.error =
          action.error.message || "Failed to delete exam type specialty";
      })

      .addCase(fetchExamTypeServicePriceDetails.pending, (state) => {
        state.servicePriceLoading = true;
        state.error = null;
      })
      .addCase(fetchExamTypeServicePriceDetails.fulfilled, (state, action) => {
        state.servicePriceLoading = false;
        state.servicePriceDetails = action.payload;
      })
      .addCase(fetchExamTypeServicePriceDetails.rejected, (state, action) => {
        state.servicePriceLoading = false;
        state.error =
          action.error.message || "Failed to fetch service price details";
      })

      .addCase(createExamTypeServicePrice.pending, (state) => {
        state.servicePriceLoading = true;
        state.error = null;
      })
      .addCase(createExamTypeServicePrice.fulfilled, (state, action) => {
        state.servicePriceLoading = false;
      })
      .addCase(createExamTypeServicePrice.rejected, (state, action) => {
        state.servicePriceLoading = false;
        state.error =
          action.error.message || "Failed to create exam type service price";
      })

      .addCase(deleteExamTypeServicePrice.pending, (state) => {
        state.servicePriceLoading = true;
        state.error = null;
      })
      .addCase(deleteExamTypeServicePrice.fulfilled, (state, action) => {
        state.servicePriceLoading = false;
        state.servicePriceDetails = state.servicePriceDetails.filter(
          (item) =>
            !(
              item.examTypeId === action.payload.examTypeId &&
              (action.payload.servicePriceId === undefined ||
                item.servicePriceId === action.payload.servicePriceId)
            )
        );
      })
      .addCase(deleteExamTypeServicePrice.rejected, (state, action) => {
        state.servicePriceLoading = false;
        state.error =
          action.error.message || "Failed to delete exam type service price";
      });
  },
});

export const {
  clearError,
  resetExamTypeState,
  clearZoneError,
  clearAllZoneData,
  toggleExamTypeSelectDoctor,
  updateExamTypeSelectDoctor,
} = examTypeSlice.actions;
export default examTypeSlice.reducer;
