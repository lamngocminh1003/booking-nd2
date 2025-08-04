import { ReactNode } from "react";
import logo from "../../assets/imgs/logo.png"; // Adjust the path as necessary

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <img
              alt="Logo Bệnh Viện Nhi Đồng 2"
              src={logo}
              className="w-16 h-16text-white absolute"
            />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">{title}</h1>
          <p className="text-emerald-700">{subtitle}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-emerald-600">
          © 2024 Hệ thống quản lý khám bệnh
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
