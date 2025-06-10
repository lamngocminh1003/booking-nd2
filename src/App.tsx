import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useDispatch } from "react-redux";
import {
  setAuthUser,
  clearAuthUser,
  setAuthLoading,
  setAuth,
} from "@/store/slices/authSlice";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Insurance from "./pages/Insurance";
import Children from "./pages/Children";
import ChildForm from "./pages/ChildForm";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import Payment from "./pages/Payment";
import Notifications from "./pages/Notifications";
import History from "./pages/History";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorManagement from "./pages/DoctorManagement";
import AdminAppointments from "./pages/AdminAppointments";
import PatientManagement from "./pages/PatientManagement";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Footer from "./components/ui/Footer";
import Navigation from "./components/Navigation";
import { getSecureItem } from "@/lib/storage";
import { Capacitor } from "@capacitor/core";

const queryClient = new QueryClient();

function AppWrapper() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <App />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

// Đây mới là component có chứa useEffect theo dõi đăng nhập
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let expiration: string | null = null;

      if (Capacitor.isNativePlatform()) {
        accessToken = await getSecureItem("accessToken");
        refreshToken = await getSecureItem("refreshToken");
        expiration = await getSecureItem("expiration");
      } else {
        accessToken = localStorage.getItem("accessToken");
        refreshToken = localStorage.getItem("refreshToken");
        expiration = localStorage.getItem("expiration");
      }

      if (accessToken && refreshToken && expiration) {
        dispatch(setAuth({ accessToken, refreshToken, expiration }));
      }
    };

    initAuth();
  }, [dispatch]);
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const expiration = localStorage.getItem("expiration");

    if (accessToken && refreshToken && expiration) {
      dispatch(setAuth({ accessToken, refreshToken, expiration }));
    }
  }, [dispatch]);
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/children" element={<Children />} />
        <Route path="/children/:childId/edit" element={<ChildForm />} />
        <Route path="/children/new" element={<ChildForm />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/history" element={<History />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/doctors" element={<DoctorManagement />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/patients" element={<PatientManagement />} />
        <Route path="/admin/reports" element={<Reports />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default AppWrapper;
