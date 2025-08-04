import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

export const getZones = () => fetchData("/api/zone/list");

export const createZone = (data: {
  zoneCode: string;
  name: string;
  address: string;
  zone_Id_Postgresql?: number;
  enable?: boolean;
}) => postJSONAuth("/api/zone/create", data);

export const updateZone = (
  id: number,
  data: {
    zoneCode: string;
    name: string;
    address: string;
    zone_Id_Postgresql?: number;
    enable?: boolean;
  }
) => putJSONAuth(`/api/zone/${id}`, data);

export const deleteZone = (id: number) => deleteJSONAuth(`/api/zone/${id}`);
