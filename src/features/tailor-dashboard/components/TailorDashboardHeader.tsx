import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TailorDashboardHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightText?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

export function TailorDashboardHeader({
  title,
  subtitle,
  showBack,
  rightText,
  rightIcon = "notifications-outline",
  onRightPress,
}: TailorDashboardHeaderProps) {
  return (
    <View className="px-5 pb-3 pt-2">
      <View className="w-full flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          {showBack && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              className="mr-3 h-10 w-10 items-center justify-center -ml-2 rounded-md active:bg-brand-surface"
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#1A1D1F"
              />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text className="text-[20px] font-black text-brand-dark tracking-tight">
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-0.5 text-[13px] font-medium text-brand-gray">
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          onPress={onRightPress}
          className="h-10 min-w-10 items-center justify-center px-1"
        >
          {rightText ? (
            <Text className="text-[13px] font-bold text-primary">
              {rightText}
            </Text>
          ) : rightIcon ? (
            <Ionicons name={rightIcon} size={22} color="#1A1D1F" />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}
