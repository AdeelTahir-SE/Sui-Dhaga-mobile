import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TailorHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
};

export function TailorHeader({
  title,
  subtitle,
  showBack,
  rightIcon = "notifications-outline",
}: TailorHeaderProps) {
  return (
    <View className="px-5 pb-3 pt-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {showBack ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              className="-ml-2 mr-2 h-10 w-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={22} color="#1A1D1F" />
            </TouchableOpacity>
          ) : null}
          <View>
            <Text className="text-[24px] font-bold text-brand-dark">
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-1 text-[12px] text-brand-gray">
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center">
          <Ionicons name={rightIcon} size={20} color="#1A1D1F" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
