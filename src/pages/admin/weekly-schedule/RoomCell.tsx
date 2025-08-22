import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Search, Clock, Users } from "lucide-react";
import { RoomConfigPopover } from "./RoomConfigPopover";

interface RoomCellProps {
  deptId: string;
  slotId: string;
  rooms: any[];
  isEditing: boolean;
  hasChanges: boolean;
  roomSearchTerm: string;
  setRoomSearchTerm: (value: string) => void;
  filteredRooms: any[];
  availableSpecialties: string[];
  availableDoctors: any[];
  roomClassifications: any;
  shiftDefaults: any;
  setEditingCell: (value: string | null) => void;
  addRoomToShift: (deptId: string, slotId: string, roomId: string) => void;
  removeRoomFromShift: (
    deptId: string,
    slotId: string,
    roomIndex: number
  ) => void;
  updateRoomConfig: (
    deptId: string,
    slotId: string,
    roomIndex: number,
    updates: any
  ) => void;
  getRoomStyle: (type: string) => string;
  timeSlots: any[];
  usedRooms: Set<string>;
  allRooms: any[];
  getDoctorsBySpecialty?: (specialtyName: string) => any[];
  getDoctorsByDepartment?: (departmentId: string) => any[];
}

export const RoomCell: React.FC<RoomCellProps> = ({
  deptId,
  slotId,
  rooms,
  isEditing,
  hasChanges,
  roomSearchTerm,
  setRoomSearchTerm,
  filteredRooms,
  availableSpecialties,
  availableDoctors,
  roomClassifications,
  shiftDefaults,
  setEditingCell,
  addRoomToShift,
  removeRoomFromShift,
  updateRoomConfig,
  getRoomStyle,
  timeSlots,
  usedRooms,
  allRooms,
  getDoctorsBySpecialty,
  getDoctorsByDepartment,
}) => {
  const cellKey = `${deptId}-${slotId}`;

  // ✅ Enhanced search logic với tốt hơn performance
  const searchableRooms = React.useMemo(() => {
    // Ưu tiên sử dụng filteredRooms (đã filter theo zone), fallback về allRooms
    const roomsToSearch =
      filteredRooms && filteredRooms.length > 0
        ? filteredRooms
        : allRooms || [];

    if (!roomSearchTerm || roomSearchTerm.trim().length === 0) {
      return roomsToSearch;
    }

    const searchTerm = roomSearchTerm.toLowerCase().trim();

    return roomsToSearch.filter((room) => {
      try {
        // ✅ Tìm kiếm theo thông tin cơ bản
        const basicFields = [
          room.name,
          room.code,
          room.roomNumber,
          room.roomName,
          room.zoneName,
          room.classification,
          room.departmentName,
        ].filter(Boolean);

        const basicMatch = basicFields.some((field) =>
          field?.toString().toLowerCase().includes(searchTerm)
        );

        // ✅ Tìm kiếm theo specialties của phòng
        const specialtyMatch = room.specialties?.some((specialty: string) =>
          specialty?.toLowerCase().includes(searchTerm)
        );

        // ✅ Tìm kiếm theo available specialties (từ dropdown)
        const availableSpecialtyMatch = availableSpecialties?.some(
          (specialty) => specialty?.toLowerCase().includes(searchTerm)
        );

        // ✅ Tìm kiếm theo doctors - cải thiện performance
        let doctorMatch = false;

        // Tìm theo doctors trong department của phòng
        if (getDoctorsByDepartment && room.departmentId) {
          try {
            const deptDoctors = getDoctorsByDepartment(
              room.departmentId.toString()
            );
            doctorMatch = deptDoctors?.some(
              (doctor) =>
                doctor?.name?.toLowerCase().includes(searchTerm) ||
                doctor?.code?.toLowerCase().includes(searchTerm) ||
                doctor?.specialty?.toLowerCase().includes(searchTerm)
            );
          } catch (error) {
            console.warn("Error getting doctors by department:", error);
          }
        }

        // Fallback: tìm trong tất cả doctors nếu chưa tìm thấy
        if (!doctorMatch && availableDoctors?.length > 0) {
          doctorMatch = availableDoctors.some(
            (doctor) =>
              doctor?.name?.toLowerCase().includes(searchTerm) ||
              doctor?.code?.toLowerCase().includes(searchTerm) ||
              doctor?.specialty?.toLowerCase().includes(searchTerm)
          );
        }

        return (
          basicMatch || specialtyMatch || availableSpecialtyMatch || doctorMatch
        );
      } catch (error) {
        console.warn("Error in room search filter:", error);
        return false;
      }
    });
  }, [
    filteredRooms,
    allRooms,
    roomSearchTerm,
    availableSpecialties,
    availableDoctors,
    getDoctorsByDepartment,
  ]);

  // ✅ Debug thông tin chi tiết - chỉ trong development
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development" && isEditing) {
      console.log("🔍 RoomCell Debug:", {
        deptId,
        slotId,
        roomSearchTerm,
        filteredRoomsCount: filteredRooms?.length || 0,
        allRoomsCount: allRooms?.length || 0,
        searchableRoomsCount: searchableRooms?.length || 0,
        usedRoomsSize: usedRooms?.size || 0,
        usedRoomsArray: Array.from(usedRooms || []),
        sampleSearchableRoom: searchableRooms?.[0],
      });
    }
  }, [
    isEditing,
    roomSearchTerm,
    filteredRooms,
    allRooms,
    searchableRooms,
    usedRooms,
    deptId,
    slotId,
  ]);

  // ✅ Rendering logic cho editing mode
  if (isEditing) {
    return (
      <div className="space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <Input
            placeholder="Tìm phòng, chuyên khoa, bác sĩ..."
            value={roomSearchTerm}
            onChange={(e) => setRoomSearchTerm(e.target.value)}
            className="pl-7 h-7 text-xs"
            autoFocus
          />
        </div>

        {/* Debug info - chỉ trong development */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 p-1 bg-gray-50 rounded">
            <div>
              Phòng: {searchableRooms?.length || 0} | Tìm: "{roomSearchTerm}"
            </div>
            <div>
              Chuyên khoa: {availableSpecialties?.length || 0} | Bác sĩ:{" "}
              {availableDoctors?.length || 0}
            </div>
          </div>
        )}

        {/* Room List */}
        <div className="max-h-40 overflow-y-auto space-y-1">
          {searchableRooms && searchableRooms.length > 0 ? (
            searchableRooms.map((room) => {
              // ✅ Safe room ID extraction
              const roomId =
                room?.id?.toString() ||
                room?.roomId?.toString() ||
                room?.name ||
                `room-${Math.random()}`;

              const isUsed = usedRooms ? usedRooms.has(roomId) : false;
              const roomIdentifier =
                room?.code ||
                room?.name ||
                room?.roomNumber ||
                `Room-${roomId}`;

              // ✅ Safe doctors retrieval
              let roomDoctors: any[] = [];
              try {
                if (getDoctorsByDepartment && room?.departmentId) {
                  roomDoctors =
                    getDoctorsByDepartment(room.departmentId.toString()) || [];
                }
              } catch (error) {
                console.warn("Error getting room doctors:", error);
                roomDoctors = [];
              }

              return (
                <button
                  key={roomId}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log("🔥 Room button clicked:", {
                      roomId,
                      isUsed,
                      deptId,
                      slotId,
                      roomName: room?.name,
                    });

                    if (!isUsed && roomId && addRoomToShift) {
                      try {
                        addRoomToShift(deptId, slotId, roomId);
                        setEditingCell(null);
                        setRoomSearchTerm("");
                        console.log("✅ Room added successfully");
                      } catch (error) {
                        console.error("❌ Error adding room:", error);
                      }
                    } else {
                      console.warn("⚠️ Cannot add room:", {
                        isUsed,
                        roomId,
                        hasFunction: !!addRoomToShift,
                      });
                    }
                  }}
                  disabled={isUsed}
                  className={`w-full text-left p-2 text-xs rounded border transition-colors ${
                    isUsed
                      ? "bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-60"
                      : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                  }`}
                >
                  {/* Room Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isUsed ? "bg-red-400" : "bg-green-400"
                        }`}
                      />
                      <span className="font-medium">{roomIdentifier}</span>
                      {room?.name && room?.code && room.name !== room.code && (
                        <span className="text-gray-400">({room.name})</span>
                      )}
                    </div>
                    {isUsed && (
                      <span className="text-xs bg-red-100 text-red-600 px-1 rounded">
                        Đã dùng
                      </span>
                    )}
                  </div>

                  {/* Room Details */}
                  <div className="text-gray-500 mt-1 space-y-1">
                    {/* Zone và Department */}
                    <div className="flex gap-1 flex-wrap">
                      {room?.zoneName && (
                        <span className="text-xs bg-gray-100 px-1 rounded">
                          📍 {room.zoneName}
                        </span>
                      )}
                      {room?.departmentName && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                          🏥 {room.departmentName}
                        </span>
                      )}
                    </div>

                    {/* Available Doctors */}
                    {roomDoctors.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {roomDoctors.slice(0, 2).map((doctor, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-100 text-purple-600 px-1 rounded"
                          >
                            👨‍⚕️ {doctor?.name || "N/A"}
                          </span>
                        ))}
                        {roomDoctors.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{roomDoctors.length - 2} BS
                          </span>
                        )}
                      </div>
                    )}

                    {/* Search match highlights */}
                    {roomSearchTerm && (
                      <div className="text-xs text-blue-500">
                        {room?.specialties?.some((s: string) =>
                          s
                            ?.toLowerCase()
                            .includes(roomSearchTerm.toLowerCase())
                        ) && "🔍 Khớp chuyên khoa"}

                        {roomDoctors.some((d) =>
                          d?.name
                            ?.toLowerCase()
                            .includes(roomSearchTerm.toLowerCase())
                        ) && " 🔍 Khớp bác sĩ"}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            // Empty state
            <div className="text-center p-4 text-gray-500 text-xs">
              {roomSearchTerm ? (
                <>
                  <Search className="w-4 h-4 mx-auto mb-1 opacity-50" />
                  <p>
                    Không tìm thấy phòng, chuyên khoa, hoặc bác sĩ "
                    {roomSearchTerm}"
                  </p>
                  <p className="text-xs mt-1">
                    Thử tìm theo: tên phòng, mã phòng, chuyên khoa, tên bác sĩ
                  </p>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 mx-auto mb-1 opacity-50">🏠</div>
                  <p>Không có phòng nào trong khu vực này</p>
                  <p className="text-xs mt-1">
                    Có {allRooms?.length || 0} phòng,{" "}
                    {availableSpecialties?.length || 0} chuyên khoa,{" "}
                    {availableDoctors?.length || 0} bác sĩ
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-6 text-xs"
            onClick={() => {
              setEditingCell(null);
              setRoomSearchTerm("");
            }}
          >
            Hủy
          </Button>
          {roomSearchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setRoomSearchTerm("")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ✅ Normal display mode
  return (
    <div className="space-y-1 relative">
      {/* Existing rooms */}
      {rooms?.map((room, index) => (
        <RoomConfigPopover
          key={`${room?.id || index}-${index}`}
          room={room}
          roomIndex={index}
          deptId={deptId}
          slotId={slotId}
          availableSpecialties={availableSpecialties}
          availableDoctors={availableDoctors}
          getDoctorsBySpecialty={getDoctorsBySpecialty}
          roomClassifications={roomClassifications}
          shiftDefaults={shiftDefaults}
          timeSlots={timeSlots}
          updateRoomConfig={updateRoomConfig}
          removeRoomFromShift={removeRoomFromShift}
          getRoomStyle={getRoomStyle}
          hasChanges={hasChanges}
        />
      ))}

      {/* Add room button - empty state */}
      {(!rooms || rooms.length === 0) && (
        <div
          className="w-full h-8 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-400 cursor-pointer flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
          onClick={() => setEditingCell(cellKey)}
        >
          <Plus className="w-3 h-3 mr-1" />
          <span className="text-xs">Thêm phòng</span>
        </div>
      )}

      {/* Add room button - when rooms exist */}
      {rooms && rooms.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-6 text-xs border-dashed border-2 border-gray-300 hover:border-blue-400"
          onClick={() => setEditingCell(cellKey)}
        >
          <Plus className="w-3 h-3 mr-1" />
          Thêm phòng
        </Button>
      )}

      {/* Changes indicator */}
      {hasChanges && (
        <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-1 right-1"></div>
      )}
    </div>
  );
};
