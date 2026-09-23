import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export type MetricTone = "teal" | "coral" | "gold" | "blue" | "green";

type MetricCardProps = {
  title: string;
  value: string;
  action: string;
  icon?: keyof typeof Ionicons.glyphMap;
  image?: ImageSource | any;
  tone?: MetricTone;
  onPress?: () => void;
};

const toneConfig: Record<
  MetricTone,
  {
    iconColor: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  }
> = {
  coral: {
    iconColor: "#E11D48",
    bgColor: "#FFF1F2",
    borderColor: "#FFE4E6",
    textColor: "#E11D48",
  },
  gold: {
    iconColor: "#D97706",
    bgColor: "#FFFBEB",
    borderColor: "#FEF3C7",
    textColor: "#B45309",
  },
  teal: {
    iconColor: "#14919B",
    bgColor: "#F0FAFA",
    borderColor: "#CCFBF1",
    textColor: "#0D7377",
  },
  blue: {
    iconColor: "#2563EB",
    bgColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    textColor: "#1D4ED8",
  },
  green: {
    iconColor: "#059669",
    bgColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    textColor: "#047857",
  },
};

export function MetricCard({
  title,
  value,
  action,
  icon,
  image,
  tone = "teal",
  onPress,
}: MetricCardProps) {
  const currentTone = toneConfig[tone] || toneConfig.teal;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.card}
      className="w-[48%] rounded-2xl border border-brand-border/80 bg-white p-3.5 justify-between"
    >
      <View>
        {/* Top Row: Illustrated Icon / Badge & Forward Affordance */}
        <View className="flex-row items-center justify-between">
          <View
            style={{
              backgroundColor: currentTone.bgColor,
              borderColor: currentTone.borderColor,
              borderWidth: 1,
            }}
            className="h-11 w-11 items-center justify-center rounded-xl shadow-xs overflow-hidden"
          >
            {image ? (
              <Image
                source={image}
                contentFit="contain"
                style={{ width: 34, height: 34 }}
              />
            ) : icon ? (
              <Ionicons name={icon} size={22} color={currentTone.iconColor} />
            ) : null}
          </View>

          <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-surface border border-brand-border/40">
            <Ionicons name="arrow-forward" size={11} color="#6F767E" />
          </View>
        </View>

        {/* Content: Title & Metric Value */}
        <View className="mt-3">
          <Text
            className="text-[11px] font-bold uppercase tracking-wider text-brand-gray"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          <Text
            className="mt-1 text-[21px] font-black text-brand-dark tracking-tight"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {value}
          </Text>
        </View>
      </View>

      {/* Footer: Action Link with Chevron */}
      <View className="mt-3 pt-2.5 border-t border-brand-border/50 flex-row items-center justify-between">
        <Text
          className="text-[11.5px] font-bold tracking-wide"
          style={{ color: currentTone.textColor }}
          numberOfLines={1}
        >
          {action}
        </Text>
        <Ionicons name="chevron-forward" size={12} color={currentTone.textColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 138,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
