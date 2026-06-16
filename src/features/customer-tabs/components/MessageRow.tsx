import { Text, View } from "react-native";
import type { ImageSource } from "expo-image";

import { TabPlaceholder } from "./TabPlaceholder";

type MessageRowProps = {
  name: string;
  message: string;
  time: string;
  image?: ImageSource;
  unread?: string;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
};

export function MessageRow({
  name,
  message,
  time,
  image,
  unread,
  tone = "coral",
}: MessageRowProps) {
  return (
    <View className="flex-row items-center border-b border-brand-border py-3">
      <TabPlaceholder image={image} variant="person" size="xs" tone={tone} />
      <View className="ml-3 flex-1">
        <Text className="text-[13px] font-bold text-brand-dark">{name}</Text>
        <Text className="mt-1 text-[11px] text-brand-gray">{message}</Text>
      </View>
      <View className="items-end">
        <Text className="text-[10px] text-brand-gray">{time}</Text>
        {unread ? (
          <View className="mt-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
            <Text className="text-[10px] font-bold text-white">{unread}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
