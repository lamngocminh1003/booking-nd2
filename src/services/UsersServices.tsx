import axios from "axios";
import { backendURL, createConfig } from "@/lib/utils";
const loginWithFirebaseToken = async (idToken: string) => {
  try {
    const response = await axios
      .post(
        `${backendURL}/api/auth/firebase-login`,
        {
          idToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        return response?.data;
      })
      .catch(function (error) {
        return error?.response;
      });

    // Trả về dữ liệu sau khi login thành công
    return response.data;
  } catch (error: any) {
    console.error("Login Firebase failed:", error);
    throw error.response?.data || error;
  }
};
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios
      .post(
        `${backendURL}/api/auth/refresh-token`,
        {
          refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        return response?.data;
      })
      .catch(function (error) {
        return error?.response;
      });

    // Trả về dữ liệu sau khi login thành công
    return response.data;
  } catch (error: any) {
    console.error("Refresh failed:", error);
    throw error.response?.data || error;
  }
};
export { loginWithFirebaseToken, refreshAccessToken };
