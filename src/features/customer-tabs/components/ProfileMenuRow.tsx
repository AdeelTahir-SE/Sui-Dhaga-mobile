import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ProfileMenuRowProps = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  badge?: string | number;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  danger?: boolean;
};

export function ProfileMenuRow({
  title,
  subtitle,
  icon,
  iconColor = "#1A1D1F",
  badge,
  onPress,
  showChevron = true,
  isLast = false,
  danger = false,
}: ProfileMenuRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row items-center px-4 py-3.5 ${
        !isLast ? "border-b border-brand-border/60" : ""
      }`}
    >
      {/* Icon */}
      <View className="w-8 items-center justify-center">
        <Ionicons
          name={icon}
          size={22}
          color={danger ? "#EF4444" : iconColor}
        />
      </View>

      {/* Content */}
      <View className="ml-3 flex-1 pr-2">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-[15px] font-bold tracking-tight ${
              danger ? "text-red-500" : "text-brand-dark"
            }`}
          >
            {title}
          </Text>
          {badge !== undefined && badge !== null && (
            <View className="rounded-full bg-primary/10 px-2 py-0.5 border border-primary/20">
              <Text className="text-[11px] font-bold text-primary">
                {badge}
              </Text>
            </View>
          )}
        </View>
        {subtitle ? (
          <Text
            className="mt-0.5 text-[12px] font-medium text-brand-gray"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Chevron */}
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={danger ? "#EF4444" : "#9CA3AF"}
        />
      )}
    </TouchableOpacity>
  );
}


