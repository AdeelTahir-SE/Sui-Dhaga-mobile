import { Text, View } from "react-native";
import type { ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { DashActionButton } from "./DashActionButton";
import { StatusPill } from "./StatusPill";
import { TailorDashPlaceholder } from "./TailorDashPlaceholder";

type AppointmentRequestCardProps = {
  image?: ImageSource;
  name: string;
  service: string;
  date: string;
  time: string;
  newRequest?: boolean;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  onAccept?: () => void;
  onReject?: () => void;
  isProcessing?: boolean;
};

export function AppointmentRequestCard({
  image,
  name,
  service,
  date,
  time,
  newRequest,
  tone = "coral",
  onAccept,
  onReject,
  isProcessing,
}: AppointmentRequestCardProps) {
  return (
    <View className="mb-3.5 rounded-md border border-brand-border bg-white p-3.5 shadow-xs">
      <View className="flex-row">
        <TailorDashPlaceholder image={image} variant="person" size="sm" tone={tone} />
        <View className="ml-3.5 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-[14px] font-bold text-brand-dark">{name}</Text>
            <StatusPill
              label={newRequest ? "New Request" : "Upcoming"}
              tone={newRequest ? "gold" : "blue"}
            />
          </View>
          <Text className="mt-1 text-[13px] font-semibold text-brand-dark">{service}</Text>
          <View className="mt-2.5 flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6F767E" />
            <Text className="ml-1 mr-4 text-[12px] font-medium text-brand-gray">{date}</Text>
            <Ionicons name="time-outline" size={14} color="#6F767E" />
            <Text className="ml-1 text-[12px] font-medium text-brand-gray">{time}</Text>
          </View>
        </View>
      </View>
      {newRequest ? (
        <View className="mt-3 flex-row gap-3">
          <DashActionButton
            title="Reject"
            variant="outline"
            onPress={onReject}
            disabled={isProcessing}
          />
          <DashActionButton
            title="Accept"
            variant="primary"
            onPress={onAccept}
            disabled={isProcessing}
          />
        </View>
      ) : null}
    </View>
  );
}
