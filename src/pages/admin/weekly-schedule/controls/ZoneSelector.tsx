import React, { useEffect } from "react";
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
  // ✅ Auto-select first zone when zoneOptions change
  useEffect(() => {
    const validZones = zoneOptions?.filter((zone) => zone.id !== "all") || [];

    // If no zone is selected or selected zone is "all", select first valid zone
    if (validZones.length > 0 && (!selectedZone || selectedZone === "all")) {
      setSelectedZone(validZones[0].id);
    }

    // If selected zone no longer exists in the list, select first valid zone
    if (
      validZones.length > 0 &&
      selectedZone &&
      !validZones.find((z) => z.id === selectedZone)
    ) {
      setSelectedZone(validZones[0].id);
    }
  }, [zoneOptions, selectedZone, setSelectedZone]);

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
          {zoneOptions
            ?.filter((zone) => zone.id !== "all") // ✅ Filter out "all" option
            ?.map((zone) => {
              const roomCount =
                allRooms?.filter((room) => room.zoneId?.toString() === zone.id)
                  .length || 0;

              return (
                <SelectItem key={zone.id} value={zone.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{zone.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({roomCount} phòng)
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
