import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CustomerHeaderProps = {
  title: string;
  subtitle?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  centered?: boolean;
};

export function CustomerHeader({
  title,
  subtitle,
  rightIcon = "notifications-outline",
  centered,
}: CustomerHeaderProps) {
  return (
    <View className={`px-5 pb-3 pt-2 ${centered ? "items-center" : ""}`}>
      <View className="w-full flex-row items-start justify-between">
        <View className={centered ? "flex-1 items-center" : "flex-1"}>
          <Text className="text-[20px] font-black text-brand-dark tracking-tight">
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-0.5 text-[13px] font-medium text-brand-gray">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center">
          <Ionicons name={rightIcon} size={20} color="#1A1D1F" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
