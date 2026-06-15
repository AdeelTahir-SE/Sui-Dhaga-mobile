import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type StudioHeaderProps = {
  title: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightLabel?: string;
};

export function StudioHeader({
  title,
  rightIcon = "information-circle-outline",
  rightLabel,
}: StudioHeaderProps) {
  return (
    <View className="h-14 flex-row items-center justify-between px-4">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name="arrow-back" size={22} color="#1A1D1F" />
      </TouchableOpacity>
      <Text className="text-[15px] font-semibold text-brand-dark">
        {title}
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={rightLabel ?? "More information"}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name={rightIcon} size={19} color="#1A1D1F" />
      </TouchableOpacity>
    </View>
  );
}
