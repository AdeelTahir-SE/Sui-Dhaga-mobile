import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { StatusPill } from "./StatusPill";

type TimeSlotRowProps = {
  time: string;
  booked?: boolean;
};

export function TimeSlotRow({ time, booked }: TimeSlotRowProps) {
  return (
    <View className="h-[52px] flex-row items-center border-b border-brand-border">
      <Text className="flex-1 text-[12px] font-medium text-brand-dark">{time}</Text>
      <StatusPill label={booked ? "Booked" : "Available"} tone={booked ? "red" : "green"} />
      <Ionicons
        name="ellipsis-vertical"
        size={18}
        color="#1A1D1F"
        style={{ marginLeft: 14 }}
      />
    </View>
  );
}
