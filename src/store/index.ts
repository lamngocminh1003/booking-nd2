import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/userSlice";
import appointmentSlice from "./slices/appointmentSlice";
import notificationSlice from "./slices/notificationSlice";
import childrenSlice from "./slices/childrenSlice";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import locationReducer from "./slices/locationSlice";
import doctorReducer from "./slices/doctorSlice";
import examinationReducer from "./slices/examinationSlice";
import departmentSlice from "./slices/departmentSlice";
import zoneSlice from "./slices/zoneSlice"; // Ensure zoneSlice is imported
import specialtySlice from "./slices/specialtySlice";
import servicePriceSlice from "./slices/servicePriceSlice";
import roomSlice from "./slices/roomSlice";
import examTypeSlice from "./slices/examTypeSlice"; // ✅ Thêm import
import clinicScheduleSlice from "./slices/clinicScheduleSlice"; // ✅ Thêm import clinic schedule
import bookingCatalogSlice from "./slices/bookingCatalogSlice";
import hospitalDirectorySlice from "./slices/hospitalDirectorySlice";
import bannerReducer from "./slices/bannerSlice"; // ✅ Add banner reducer

export const store = configureStore({
  reducer: {
    user: userSlice,
    appointments: appointmentSlice,
    notifications: notificationSlice,
    children: childrenSlice,
    auth: authReducer,
    admin: adminReducer,
    location: locationReducer,
    doctor: doctorReducer,
    examination: examinationReducer,
    department: departmentSlice,
    specialty: specialtySlice,
    servicePrice: servicePriceSlice,
    room: roomSlice,
    bookingCatalog: bookingCatalogSlice,
    hospitalDirectory: hospitalDirectorySlice,
    examType: examTypeSlice, // ✅ Thêm vào reducer
    clinicSchedule: clinicScheduleSlice, // ✅ Thêm clinic schedule reducer
    zone: zoneSlice, // Ensure zoneSlice is imported and added here
    banner: bannerReducer, // ✅ Add banner reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
