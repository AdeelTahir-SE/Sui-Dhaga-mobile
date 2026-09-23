import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusPill } from "./StatusPill";

export type SlotStatus = "available" | "booked" | "break";

type TimeSlotRowProps = {
  time: string;
  booked?: boolean;
  status?: SlotStatus;
  clientName?: string;
  serviceName?: string;
  isLast?: boolean;
  onPressMore?: () => void;
  onToggleStatus?: () => void;
};

export function TimeSlotRow({
  time,
  booked,
  status = booked ? "booked" : "available",
  clientName,
  serviceName,
  isLast = false,
  onPressMore,
  onToggleStatus,
}: TimeSlotRowProps) {
  // Normalize status
  const effectiveStatus: SlotStatus = booked ? "booked" : status;

  const tone =
    effectiveStatus === "booked"
      ? "teal"
      : effectiveStatus === "break"
      ? "gold"
      : "green";

  const label =
    effectiveStatus === "booked"
      ? "Booked"
      : effectiveStatus === "break"
      ? "Break"
      : "Available";

  return (
    <View
      className={`py-3.5 flex-row items-center justify-between ${
        isLast ? "" : "border-b border-[#F1F5F9]"
      }`}
    >
      {/* Time & Details */}
      <View className="flex-1 mr-3">
        <View className="flex-row items-center">
          <Ionicons
            name={
              effectiveStatus === "booked"
                ? "person-outline"
                : effectiveStatus === "break"
                ? "cafe-outline"
                : "time-outline"
            }
            size={15}
            color={
              effectiveStatus === "booked"
                ? "#14919B"
                : effectiveStatus === "break"
                ? "#C08300"
                : "#64748B"
            }
            style={{ marginRight: 6 }}
          />
          <Text className="text-[13px] font-bold text-brand-dark">
            {time}
          </Text>
        </View>

        {clientName ? (
          <Text className="mt-1 text-[11px] font-medium text-brand-gray" numberOfLines={1}>
            Client: <Text className="font-semibold text-brand-dark">{clientName}</Text>
            {serviceName ? ` • ${serviceName}` : ""}
          </Text>
        ) : effectiveStatus === "break" ? (
          <Text className="mt-0.5 text-[11px] font-medium text-amber-600">
            Blocked for personal break
          </Text>
        ) : null}
      </View>

      {/* Pill & Actions */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          activeOpacity={effectiveStatus === "booked" ? 1 : 0.7}
          onPress={effectiveStatus === "booked" ? undefined : onToggleStatus}
          disabled={effectiveStatus === "booked"}
        >
          <StatusPill label={label} tone={tone} />
        </TouchableOpacity>

        {onPressMore && (
          <TouchableOpacity
            onPress={onPressMore}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-slate-100"
          >
            <Ionicons name="ellipsis-vertical" size={16} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
