import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TimelineItemProps = {
  title: string;
  subtitle: string;
  complete?: boolean;
};

export function TimelineItem({ title, subtitle, complete }: TimelineItemProps) {
  return (
    <View className="flex-row">
      <View className="items-center">
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${
            complete ? "bg-primary" : "border border-brand-border bg-white"
          }`}
        >
          {complete ? (
            <Ionicons name="checkmark" size={13} color="#FFFFFF" />
          ) : null}
        </View>
        <View className="h-9 w-px bg-brand-border" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[12px] font-semibold text-brand-dark">
          {title}
        </Text>
        <Text className="mt-1 text-[10px] text-brand-gray">{subtitle}</Text>
      </View>
    </View>
  );
}
