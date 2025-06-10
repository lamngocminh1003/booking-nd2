import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/userSlice";
import appointmentSlice from "./slices/appointmentSlice";
import notificationSlice from "./slices/notificationSlice";
import childrenSlice from "./slices/childrenSlice";
import authReducer from "./slices/authSlice";
export const store = configureStore({
  reducer: {
    user: userSlice,
    appointments: appointmentSlice,
    notifications: notificationSlice,
    children: childrenSlice,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
