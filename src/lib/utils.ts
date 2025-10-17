import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Capacitor } from "@capacitor/core";
import axios from "axios";

import { getSecureItem } from "./storage"; // wrapper bạn đã có
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const backendURL = import.meta.env.VITE_BACKEND_URL;

// Lấy token từ localStorage hoặc từ nơi bạn lưu trữ token
// Thiết lập tiêu đề "Authorization" trong yêu cầu Axios
export const createConfig = async () => {
  let token: string | null;
  if (Capacitor.isNativePlatform()) {
    token = await getSecureItem("accessToken");
  } else {
    token = localStorage.getItem("accessToken");
  }
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return config;
};
export const fetchData = async (endpoint: string) => {
  try {
    const config = await createConfig();
    const url = `${backendURL}${endpoint}`;
    const response = await axios.get(url, config);
    return response;
  } catch (error: any) {
    return error.response;
  }
};
export const postJSON = async (endpoint: string, data: any) => {
  try {
    const response = await axios.post(`${backendURL}${endpoint}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};
export const postJSONAuth = async (endpoint: string, data: any) => {
  try {
    const config = await createConfig();

    const url = `${backendURL}${endpoint}`;
    const response = await axios.post(url, data, config);
    return response.data;
  } catch (error: any) {
    // Cẩn thận khi dùng optional chaining
    throw error?.response?.data ?? error;
  }
};
export const putJSONAuth = async (endpoint: string, data: any) => {
  try {
    const config = await createConfig();
    const url = `${backendURL}${endpoint}`;

    const response = await axios.put(url, data, config);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
};
export const deleteJSONAuth = async (endpoint: string) => {
  try {
    const config = await createConfig();
    const url = `${backendURL}${endpoint}`;
    const response = await axios.delete(url, config);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? error;
  }
};
