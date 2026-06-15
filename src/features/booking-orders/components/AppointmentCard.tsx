import { Text, TouchableOpacity, View } from "react-native";

import { PlaceholderImage } from "./PlaceholderImage";
import { StatusPill } from "./StatusPill";

type AppointmentCardProps = {
  tailor: string;
  service: string;
  date: string;
  time: string;
  status: string;
  tone?: "teal" | "green" | "red";
  placeholderTone?: "teal" | "coral" | "gold" | "blue";
};

export function AppointmentCard({
  tailor,
  service,
  date,
  time,
  status,
  tone = "teal",
  placeholderTone = "teal",
}: AppointmentCardProps) {
  return (
    <TouchableOpacity className="mb-3 flex-row items-center rounded-xl border border-brand-border bg-white p-3">
      <PlaceholderImage size="sm" tone={placeholderTone} />
      <View className="ml-3 flex-1">
        <Text className="text-[13px] font-semibold text-brand-dark">
          {tailor}
        </Text>
        <Text className="mt-1 text-[11px] text-brand-dark">{service}</Text>
        <Text className="mt-2 text-[11px] text-brand-gray">
          {date}  •  {time}
        </Text>
      </View>
      <StatusPill label={status} tone={tone} />
    </TouchableOpacity>
  );
}
