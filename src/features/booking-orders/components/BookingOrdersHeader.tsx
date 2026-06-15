import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type BookingOrdersHeaderProps = {
  title: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightLabel?: string;
};

export function BookingOrdersHeader({
  title,
  leftIcon = "arrow-back",
  rightIcon = "ellipsis-vertical",
  rightLabel = "More options",
}: BookingOrdersHeaderProps) {
  return (
    <View className="h-14 flex-row items-center justify-between px-4">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={leftIcon === "arrow-back" ? "Go back" : "Menu"}
        onPress={() => (leftIcon === "arrow-back" ? router.back() : undefined)}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name={leftIcon} size={22} color="#1A1D1F" />
      </TouchableOpacity>
      <Text className="text-[15px] font-semibold text-brand-dark">
        {title}
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={rightLabel}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name={rightIcon} size={20} color="#1A1D1F" />
      </TouchableOpacity>
    </View>
  );
}
