import {
  fetchData,
  postJSONAuth,
  putJSONAuth,
  deleteJSONAuth,
} from "@/lib/utils";

export const getRooms = () => fetchData("/api/room/list");

export const getRoomsByZone = (zoneId: number) =>
  fetchData(`/api/room/${zoneId}`);

export const createRoom = (data: {
  name: string;
  code?: string;
  zoneId?: number;
}) => postJSONAuth("/api/room/create", data);

export const updateRoom = (
  id: number,
  data: { name: string; code?: string; zoneId?: number }
) => putJSONAuth(`/api/room/${id}`, data);

// Nếu có API xóa phòng, thêm hàm này:
// export const deleteRoom = (id: number) => deleteJSONAuth(`/api/room/${id}`);
