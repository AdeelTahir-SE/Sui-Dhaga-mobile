import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import type { StudioRoute } from "../types";

type StudioOptionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  href: StudioRoute;
};

export function StudioOptionCard({
  icon,
  title,
  subtitle,
  href,
}: StudioOptionCardProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      activeOpacity={0.8}
      onPress={() => router.push(href as never)}
      className="w-[48%] flex-row items-center rounded-xl border border-brand-border bg-white p-3"
    >
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
        <Ionicons name={icon} size={19} color="#14919B" />
      </View>
      <View className="flex-1">
        <Text className="text-[12px] font-semibold text-brand-dark">
          {title}
        </Text>
        <Text className="mt-0.5 text-[10px] leading-3 text-brand-gray">
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
