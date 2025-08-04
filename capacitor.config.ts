import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "Booking ND 2",
  server: {
    cleartext: true, // Cho phép gọi HTTP (rất quan trọng trên Android)
  },
  webDir: "dist",
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"], // ✅ BẮT BUỘC
      forceCodeForRefreshToken: true, // ✅ Khuyến khích nếu bạn dùng backend
      // serverClientId: 'XXX.apps.googleusercontent.com', // ✅ Nếu dùng xác thực server, thêm vào đây
    },
  },
};

export default config;
