import { Text, TouchableOpacity, View } from "react-native";

import { PlaceholderImage } from "./PlaceholderImage";
import { StatusPill } from "./StatusPill";

type AppointmentCardProps = {
  tailor: string;
  avatar?: string | any;
  image?: string | any;
  service: string;
  date: string;
  time: string;
  status: string;
  tone?: "teal" | "green" | "red" | "blue" | "gold";
  placeholderTone?: "teal" | "coral" | "gold" | "blue";
  onPress?: () => void;
};

export function AppointmentCard({
  tailor,
  avatar,
  image,
  service,
  date,
  time,
  status,
  tone = "teal",
  placeholderTone = "teal",
  onPress,
}: AppointmentCardProps) {
  const avatarSource = avatar || image;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-md border border-brand-border bg-white p-3.5 shadow-xs active:bg-gray-50"
    >
      <PlaceholderImage
        size="sm"
        image={avatarSource}
        tone={placeholderTone}
      />
      <View className="ml-3 flex-1">
        <Text className="text-[14px] font-bold text-brand-dark">
          {tailor}
        </Text>
        <Text className="mt-0.5 text-[12px] font-medium text-brand-dark">{service}</Text>
        <Text className="mt-2 text-[11px] font-medium text-brand-gray">
          {date}  •  {time}
        </Text>
      </View>
      <StatusPill label={status} tone={tone} />
    </TouchableOpacity>
  );
}
