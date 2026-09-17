import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TailorHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap | null;
  onPressRight?: () => void;
  floating?: boolean;
};

export function TailorHeader({
  title,
  subtitle,
  showBack,
  rightIcon = "notifications-outline",
  onPressRight,
  floating = false,
}: TailorHeaderProps) {
  return (
    <View className={`px-5 pb-3 pt-2 ${floating ? "pt-4" : ""}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {showBack ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              className={`h-10 w-10 items-center justify-center ${
                floating ? "rounded-full bg-white/90 shadow-sm" : "-ml-2 mr-2"
              }`}
            >
              <Ionicons name="arrow-back" size={22} color="#1A1D1F" />
            </TouchableOpacity>
          ) : null}
          <View className={floating && showBack ? "ml-3" : ""}>
            {title ? (
              <Text className="text-[24px] font-bold text-brand-dark">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text className="mt-1 text-[12px] text-brand-gray">
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {rightIcon ? (
          <TouchableOpacity
            onPress={onPressRight}
            className={`h-10 w-10 items-center justify-center ${
              floating ? "rounded-full bg-white/90 shadow-sm" : ""
            }`}
          >
            <Ionicons name={rightIcon} size={20} color="#1A1D1F" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
