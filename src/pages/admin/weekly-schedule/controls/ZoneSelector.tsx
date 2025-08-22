import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ZoneOption {
  id: string;
  name: string;
  roomCount?: number;
}

interface ZoneSelectorProps {
  selectedZone: string;
  setSelectedZone: (value: string) => void;
  zoneOptions: ZoneOption[];
  allRooms: Array<any>;
}

export const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  selectedZone,
  setSelectedZone,
  zoneOptions,
  allRooms,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Label
        htmlFor="zone-select"
        className="text-sm font-medium whitespace-nowrap"
      >
        Khu khám:
      </Label>
      <Select value={selectedZone} onValueChange={setSelectedZone}>
        <SelectTrigger id="zone-select" className="w-60 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {zoneOptions?.map((zone) => {
            const roomCount =
              zone.id === "all"
                ? allRooms?.length || 0
                : allRooms?.filter(
                    (room) => room.zoneId?.toString() === zone.id
                  ).length || 0;

            return (
              <SelectItem key={zone.id} value={zone.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{zone.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({zone.id === "all" ? "Tất cả" : `${roomCount} phòng`})
                  </span>
                </div>
              </SelectItem>
            );
          }) || []}
        </SelectContent>
      </Select>
    </div>
  );
};

export type { ZoneOption };
