import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/userSlice";
import appointmentSlice from "./slices/appointmentSlice";
import notificationSlice from "./slices/notificationSlice";
import childrenSlice from "./slices/childrenSlice";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import locationReducer from "./slices/locationSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    appointments: appointmentSlice,
    notifications: notificationSlice,
    children: childrenSlice,
    auth: authReducer,
    admin: adminReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
