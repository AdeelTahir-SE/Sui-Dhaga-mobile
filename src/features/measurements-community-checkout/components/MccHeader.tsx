import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type MccHeaderProps = {
  title: string;
  showBack?: boolean;
  rightText?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
};

export function MccHeader({
  title,
  showBack,
  rightText,
  rightIcon = "notifications-outline",
}: MccHeaderProps) {
  return (
    <View className="h-14 flex-row items-center justify-between px-4">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={showBack ? "Go back" : "Menu"}
        onPress={() => (showBack ? router.back() : undefined)}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons
          name={showBack ? "arrow-back" : "menu"}
          size={22}
          color="#1A1D1F"
        />
      </TouchableOpacity>
      <Text className="text-[15px] font-semibold text-brand-dark">{title}</Text>
      <TouchableOpacity className="h-10 min-w-10 items-center justify-center px-1">
        {rightText ? (
          <Text className="text-[12px] font-semibold text-primary">
            {rightText}
          </Text>
        ) : (
          <Ionicons name={rightIcon} size={20} color="#1A1D1F" />
        )}
      </TouchableOpacity>
    </View>
  );
}
