import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner"; // ✅ Import toast for error handling
import {
  getZones,
  getSpecialtiesByExamType,
  getGroupedSpecialty,
  addStartHold,
  createOrUpdatePatient,
  getPatientInfo,
  getListPatientInfo,
} from "@/services/BookingCatalogService";

// ✅ Interface cho Zone
export interface Zone {
  id: number;
  name: string;
  address?: string; // ✅ Add address field
  enable: boolean; // ✅ Change from isEnable to enable
  examTypes?: ExamType[]; // ✅ Keep examTypes array
  // Keep for compatibility
  code?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Interface cho ExamType
export interface ExamType {
  id: number;
  name: string;
  description?: string;
  enable: boolean; // ✅ Change from isEnable to enable
  zoneId: number;
  zoneName: string; // ✅ Add zoneName field
  appointmentFormId: number; // ✅ Add appointmentFormId
  appointmentFormKey: string; // ✅ Add appointmentFormKey
  appointmentFormName: string; // ✅ Add appointmentFormName
  servicePrice?: ServicePrice; // Single object, not array
  code?: string;
  specialties?: Specialty[];
}

// ✅ Interface cho Specialty
export interface Specialty {
  id: number;
  name: string;
  code?: string;
  examTypeId: number;
  description?: string;
  isEnable: boolean;
  createdAt?: string;
  updatedAt?: string;
  slots: AppointmentSlot[];
}

// ✅ Interface cho Grouped Specialty (lịch khám)
export interface GroupedSpecialty {
  date: string;
  dayOfWeek: number;
  dayName: string;
  specialties: SpecialtySchedule[];
}

// ✅ Interface cho Specialty Schedule
export interface SpecialtySchedule {
  specialtyId: number;
  specialtyName: string;
  slots: AppointmentSlot[];
  totalSlots: number;
  availableSlots: number;
}

// ✅ Interface cho Appointment Slot
export interface AppointmentSlot {
  id: number;
  timeStart: string;
  timeEnd: string;
  roomName: string;
  roomCode?: string;
  doctorName?: string;
  doctorCode?: string;
  maxAppointments: number;
  currentAppointments: number;
  availableSlots: number;
  isAvailable: boolean;
  holdSlots: number;
  examTypeId: number;
  specialtyId: number;
  departmentName?: string;
}

// ✅ Interface cho Patient Info
export interface PatientInfo {
  id: number;
  patientId?: number | null;
  fullName: string;
  dateOfBirth: string;
  genderId: number;
  genderName: string;
  nationalId: string;
  jobId: string;
  provinceCode: string;
  wardCode: string;
  address: string;
  bhytId: string;
  licenseDate: string;

  // Additional fields from API
  noiDKKCBId?: number | null;
  cccd: string;
  motherName: string;
  motherPhone: string;
  motherCCCD: string;
  fatherName: string;
  fatherPhone: string;
  fatherCCCD: string;
  isGuardian: boolean;
  age: number;
  yearOfBirth: number;
  provinceName: string;
  districtName?: string | null;
  wardName: string;
  nationalName: string;
  jobName: string;

  // Optional fields for backward compatibility
  phoneNumber?: string;
  email?: string;
  identityNumber?: string;
  guardianName?: string;
  guardianPhone?: string;
  notes?: string;
  emergencyContact?: string;
  allergies?: string;
  medicalHistory?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Interface cho Hold Result
export interface HoldResult {
  success: boolean;
  holdId?: number;
  expiredAt?: string;
  remainingTime?: number;
  appointmentSlotId?: number;
  patientId?: number;
  message?: string;
}

// ✅ Interface mới cho Grouped Specialty Response (single object, not array)
export interface GroupedSpecialtyResponse {
  servicePrices: ServicePrice[];
  date: string;
  dayOfWeek: string;
  dayName: string;
  examinationId: number;
  examinationName: string;
  id: number;
  doctorId: number;
  doctorName: string;
  roomId: number;
  roomName: string;
  timeStart: string;
  timeEnd: string;
  spaceSlot: number;
  spaceMinutes: number;
  total: number;
  totalAvailableSlot: number;
  totalBookedSlot: number;
  isAvailable: boolean;
  appointmentSlots: AppointmentSlotSimple[];
  specialties?: Specialty[];
}

// ✅ Interface cho Service Price
export interface ServicePrice {
  id: number;
  name: string;
  regularPrice: number; // ✅ Change from regularPrice to price
  price: number; // ✅ Change from regularPrice to price
  enable: boolean; // ✅ Add enable field
}

// ✅ Interface cho Appointment Slot (simplified)
export interface AppointmentSlotSimple {
  slotId: number;
  startSlot: string;
  endSlot: string;
  totalSlot: number;
  availableSlot: number;
  bookedSlot: number;
  isAvailable: boolean;
}

// ✅ State interface
interface BookingCatalogState {
  zones: Zone[];
  specialties: Specialty[];
  groupedSpecialty: GroupedSpecialtyResponse[];
  patientInfo: PatientInfo | null; // Single patient (for backward compatibility)
  patientList: PatientInfo[]; // ✅ NEW: List of patients from user login
  holdResult: HoldResult | null;
  loading: boolean;
  error: string | null;

  // ✅ Loading states for specific actions
  loadingZones: boolean;
  loadingSpecialties: boolean;
  loadingSchedules: boolean;
  loadingHold: boolean;
  loadingPatient: boolean;
  loadingPatientList: boolean; // ✅ NEW: Loading state for patient list
}

// ✅ Initial state
const initialState: BookingCatalogState = {
  zones: [],
  specialties: [],
  groupedSpecialty: [],
  patientInfo: null,
  patientList: [], // ✅ NEW: Initialize empty array
  holdResult: null,
  loading: false,
  error: null,

  loadingZones: false,
  loadingSpecialties: false,
  loadingSchedules: false,
  loadingHold: false,
  loadingPatient: false,
  loadingPatientList: false, // ✅ NEW: Initialize loading state
};

// ✅ 1. Fetch zones
export const fetchZones = createAsyncThunk(
  "bookingCatalog/fetchZones",
  async (isEnable: boolean, { rejectWithValue }) => {
    try {
      const response = await getZones(isEnable);

      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi lấy danh sách khu khám";
      console.error("❌ fetchZones error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 2. Fetch specialties by exam type
export const fetchSpecialtiesByExamType = createAsyncThunk(
  "bookingCatalog/fetchSpecialtiesByExamType",
  async (examTypeId: number, { rejectWithValue }) => {
    try {
      const response = await getSpecialtiesByExamType(examTypeId);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi lấy danh sách chuyên khoa";
      console.error("❌ fetchSpecialtiesByExamType error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 3. Fetch grouped specialty (lịch khám trong 14 ngày)
export const fetchGroupedSpecialty = createAsyncThunk(
  "bookingCatalog/fetchGroupedSpecialty",
  async (
    { examTypeId, specialtyId }: { examTypeId: number; specialtyId?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getGroupedSpecialty(examTypeId, specialtyId);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi lấy danh sách lịch khám";
      console.error("❌ fetchGroupedSpecialty error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 4. Add start hold (đặt giữ chỗ)
export const addStartHoldThunk = createAsyncThunk(
  "bookingCatalog/addStartHold",
  async (
    {
      patientId,
      appointmentSlotId,
    }: { patientId: number; appointmentSlotId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await addStartHold(patientId, appointmentSlotId);

      toast.success("✅ Đặt giữ chỗ khám thành công!");
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi đặt giữ chỗ khám";
      console.error("❌ addStartHold error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 5. Create or update patient
export const createOrUpdatePatientThunk = createAsyncThunk(
  "bookingCatalog/createOrUpdatePatient",
  async (payload: YouMed_PatientCreateDto, { rejectWithValue }) => {
    try {
      const response = await createOrUpdatePatient(payload);

      const successMessage = payload.id
        ? "✅ Cập nhật thông tin bệnh nhân thành công!"
        : "✅ Tạo mới bệnh nhân thành công!";
      toast.success(successMessage);

      return response;
    } catch (error: any) {
      const errorMessage =
        error.message || "Lỗi tạo/cập nhật thông tin bệnh nhân";
      console.error("❌ createOrUpdatePatient error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ 6. Fetch patient info
export const fetchPatientInfo = createAsyncThunk(
  "bookingCatalog/fetchPatientInfo",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getPatientInfo(id);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Lỗi lấy thông tin bệnh nhân";
      console.error("❌ fetchPatientInfo error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
// ✅ 6. Fetch patient info
export const fetchPatientInfoByUserLogin = createAsyncThunk(
  "bookingCatalog/fetchPatientInfoByUserLogin",
  async (_, { rejectWithValue }) => {
    // ✅ Fix parameter - use underscore for unused param
    try {
      const response = await getListPatientInfo();

      return response || []; // Ensure we return an array
    } catch (error: any) {
      const errorMessage =
        error.message || "Lỗi lấy danh sách thông tin bệnh nhân";
      console.error("❌ fetchPatientInfoByUserLogin error:", errorMessage);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ Update state interface để hỗ trợ multiple patients
interface BookingCatalogState {
  zones: Zone[];
  specialties: Specialty[];
  groupedSpecialty: GroupedSpecialtyResponse[];
  patientInfo: PatientInfo | null; // Single patient (for backward compatibility)
  patientList: PatientInfo[]; // ✅ NEW: List of patients from user login
  holdResult: HoldResult | null;
  loading: boolean;
  error: string | null;

  // ✅ Loading states for specific actions
  loadingZones: boolean;
  loadingSpecialties: boolean;
  loadingSchedules: boolean;
  loadingHold: boolean;
  loadingPatient: boolean;
  loadingPatientList: boolean; // ✅ NEW: Loading state for patient list
}

// ✅ Create slice
const bookingCatalogSlice = createSlice({
  name: "bookingCatalog",
  initialState,
  reducers: {
    // ✅ Clear error
    clearError: (state) => {
      state.error = null;
    },

    // ✅ Clear patient info
    clearPatientInfo: (state) => {
      state.patientInfo = null;
    },

    // ✅ NEW: Clear patient list
    clearPatientList: (state) => {
      state.patientList = [];
    },

    // ✅ Clear hold result
    clearHoldResult: (state) => {
      state.holdResult = null;
    },

    // ✅ Clear specialties (khi đổi exam type)
    clearSpecialties: (state) => {
      state.specialties = [];
    },

    // ✅ Clear grouped specialty (khi đổi specialty)
    clearGroupedSpecialty: (state) => {
      state.groupedSpecialty = [];
    },

    // ✅ Reset all data
    resetBookingCatalog: (state) => {
      state.zones = [];
      state.specialties = [];
      state.groupedSpecialty = [];
      state.patientInfo = null;
      state.patientList = []; // ✅ NEW: Reset patient list
      state.holdResult = null;
      state.error = null;
      state.loading = false;
      state.loadingZones = false;
      state.loadingSpecialties = false;
      state.loadingSchedules = false;
      state.loadingHold = false;
      state.loadingPatient = false;
      state.loadingPatientList = false; // ✅ NEW: Reset loading state
    },

    // ✅ Set patient info manually (for form prefill)
    setPatientInfo: (state, action: PayloadAction<PatientInfo>) => {
      state.patientInfo = action.payload;
    },

    // ✅ NEW: Set selected patient from list
    setSelectedPatientFromList: (state, action: PayloadAction<number>) => {
      const selectedPatient = state.patientList.find(
        (patient) => patient.id === action.payload
      );
      if (selectedPatient) {
        state.patientInfo = selectedPatient;
      }
    },

    // ✅ NEW: Update patient in list after edit
    updatePatientInList: (state, action: PayloadAction<PatientInfo>) => {
      const index = state.patientList.findIndex(
        (patient) => patient.id === action.payload.id
      );
      if (index !== -1) {
        state.patientList[index] = action.payload;
        // Update selected patient if it's the same one
        if (state.patientInfo?.id === action.payload.id) {
          state.patientInfo = action.payload;
        }
      }
    },

    // ✅ NEW: Add new patient to list
    addPatientToList: (state, action: PayloadAction<PatientInfo>) => {
      // Check if patient already exists
      const existingIndex = state.patientList.findIndex(
        (patient) => patient.id === action.payload.id
      );

      if (existingIndex === -1) {
        // Add new patient
        state.patientList.push(action.payload);
      } else {
        // Update existing patient
        state.patientList[existingIndex] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch zones
      .addCase(fetchZones.pending, (state) => {
        state.loadingZones = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchZones.fulfilled, (state, action: PayloadAction<Zone[]>) => {
        state.loadingZones = false;
        state.loading = false;
        state.zones = action.payload || [];
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.loadingZones = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Fetch specialties by exam type
      .addCase(fetchSpecialtiesByExamType.pending, (state) => {
        state.loadingSpecialties = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSpecialtiesByExamType.fulfilled,
        (state, action: PayloadAction<Specialty[]>) => {
          state.loadingSpecialties = false;
          state.loading = false;
          state.specialties = action.payload || [];
        }
      )
      .addCase(fetchSpecialtiesByExamType.rejected, (state, action) => {
        state.loadingSpecialties = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Fetch grouped specialty
      .addCase(fetchGroupedSpecialty.pending, (state) => {
        state.loadingSchedules = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGroupedSpecialty.fulfilled,
        (state, action: PayloadAction<GroupedSpecialtyResponse[]>) => {
          state.loadingSchedules = false;
          state.loading = false;
          state.groupedSpecialty = action.payload || [];
        }
      )
      .addCase(fetchGroupedSpecialty.rejected, (state, action) => {
        state.loadingSchedules = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Add start hold
      .addCase(addStartHoldThunk.pending, (state) => {
        state.loadingHold = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addStartHoldThunk.fulfilled,
        (state, action: PayloadAction<HoldResult>) => {
          state.loadingHold = false;
          state.loading = false;
          state.holdResult = action.payload;
        }
      )
      .addCase(addStartHoldThunk.rejected, (state, action) => {
        state.loadingHold = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Create or update patient
      .addCase(createOrUpdatePatientThunk.pending, (state) => {
        state.loadingPatient = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createOrUpdatePatientThunk.fulfilled,
        (state, action: PayloadAction<PatientInfo>) => {
          state.loadingPatient = false;
          state.loading = false;
          state.patientInfo = action.payload;

          // ✅ Auto-update patient list if patient exists in list
          const existingIndex = state.patientList.findIndex(
            (patient) => patient.id === action.payload.id
          );
          if (existingIndex !== -1) {
            state.patientList[existingIndex] = action.payload;
          } else {
            // Add new patient to list
            state.patientList.push(action.payload);
          }
        }
      )
      .addCase(createOrUpdatePatientThunk.rejected, (state, action) => {
        state.loadingPatient = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Fetch patient info
      .addCase(fetchPatientInfo.pending, (state) => {
        state.loadingPatient = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPatientInfo.fulfilled,
        (state, action: PayloadAction<PatientInfo>) => {
          state.loadingPatient = false;
          state.loading = false;
          state.patientInfo = action.payload;
        }
      )
      .addCase(fetchPatientInfo.rejected, (state, action) => {
        state.loadingPatient = false;
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ NEW: Add cases for fetchPatientInfoByUserLogin
      .addCase(fetchPatientInfoByUserLogin.pending, (state) => {
        state.loadingPatientList = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPatientInfoByUserLogin.fulfilled,
        (state, action: PayloadAction<PatientInfo[]>) => {
          state.loadingPatientList = false;
          state.loading = false;
          state.patientList = action.payload || [];

          // ✅ Auto-select first patient if available and no patient currently selected
          if (state.patientList.length > 0 && !state.patientInfo) {
            state.patientInfo = state.patientList[0];
          }
        }
      )
      .addCase(fetchPatientInfoByUserLogin.rejected, (state, action) => {
        state.loadingPatientList = false;
        state.loading = false;
        state.error = action.payload as string;
        console.error("❌ Redux: Failed to load patient list:", action.payload);
      });
  },
});

// ✅ Export actions
export const {
  clearError,
  clearPatientInfo,
  clearPatientList, // ✅ NEW
  clearHoldResult,
  clearSpecialties,
  clearGroupedSpecialty,
  resetBookingCatalog,
  setPatientInfo,
  setSelectedPatientFromList, // ✅ NEW
  updatePatientInList, // ✅ NEW
  addPatientToList, // ✅ NEW
} = bookingCatalogSlice.actions;

// ✅ Export reducer
export default bookingCatalogSlice.reducer;

// ✅ Fixed YouMed_PatientCreateDto to match API requirements exactly
export interface YouMed_PatientCreateDto {
  id?: number; // For update operations (0 for new, existing id for update)
  patientId?: string | null; // Keep for API compatibility
  fullName: string;
  dateOfBirth: string; // ISO string format: "2025-10-22T02:28:54.389Z"
  genderId: number; // 0=Nam, 1=Nữ, 2=Khác (API field)
  nationalId?: string;
  jobId?: string;
  provinceCode?: string;
  wardCode?: string;
  address?: string;
  bhytId?: string;
  licenseDate?: string; // ISO string format
  noiDKKCBId?: number;
  cccd?: string;
  phoneNumber?: string;

  motherName?: string;
  motherPhone?: string;
  motherCCCD?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherCCCD?: string;
  isGuardian: boolean; // Required API field
}
