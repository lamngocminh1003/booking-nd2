import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

export const getServicePrices = () => fetchData("/api/service-price/list");

export const createServicePrice = (data: {
  name: string;
  regularPrice: number;
  insurancePrice: number;
  vipPrice: number;
}) => postJSONAuth("/api/service-price/create", data);

export const updateServicePrice = (
  id: number,
  data: {
    name: string;
    regularPrice: number;
    insurancePrice: number;
    vipPrice: number;
  }
) => putJSONAuth(`/api/service-price/${id}`, data);

export const deleteServicePrice = (id: number) =>
  deleteJSONAuth(`/api/service-price/${id}`);
