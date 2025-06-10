
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f92d1cde3ef14bc0b1e95fe15f22c7ad',
  appName: 'nhi-khang-app-portal',
  webDir: 'dist',
  server: {
    url: "https://f92d1cde-3ef1-4bc0-b1e9-5fe15f22c7ad.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    StatusBar: {
      style: "DEFAULT",
      backgroundColor: "#10b981"
    }
  }
};

export default config;
