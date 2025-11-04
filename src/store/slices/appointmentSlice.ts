import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Appointment {
  id: string;
  childId: string;
  childName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  location?: string;
  childWeight?: string;
  childHeight?: string;
  childStatus?: string;
  childSymptom?: string;
  childRequiredInformation?: string;
}

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (
      state,
      action: PayloadAction<Partial<Appointment> & { id: string }>
    ) => {
      const index = state.appointments.findIndex(
        (apt) => apt.id === action.payload.id
      );
      if (index !== -1) {
        state.appointments[index] = {
          ...state.appointments[index],
          ...action.payload,
        };
      }
    },
    removeAppointment: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter(
        (apt) => apt.id !== action.payload
      );
    },
  },
});

export const {
  setLoading,
  setError,
  addAppointment,
  updateAppointment,
  removeAppointment,
} = appointmentSlice.actions;
export default appointmentSlice.reducer;
