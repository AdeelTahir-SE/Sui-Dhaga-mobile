import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export type MetricTone = "teal" | "coral" | "gold" | "blue" | "green";

type MetricCardProps = {
  title: string;
  value: string;
  action?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  image?: ImageSource | any;
  tone?: MetricTone;
  onPress?: () => void;
};

const toneColors: Record<MetricTone, string> = {
  teal: "#14919B",
  coral: "#F05A57",
  gold: "#D79A00",
  blue: "#3B77C9",
  green: "#059669",
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
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="w-[48%] rounded-md border border-brand-border bg-white p-3.5 shadow-xs"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-1.5">
          <Text
            className="text-[11px] font-bold uppercase tracking-wider text-brand-gray"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            className="mt-1.5 text-[22px] font-black tracking-tight text-brand-dark"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {value}
          </Text>
        </View>
        {image ? (
          <Image
            source={image}
            contentFit="contain"
            style={{ width: 44, height: 44 }}
          />
        ) : icon ? (
          <Ionicons
            name={icon}
            size={28}
            color={toneColors[tone] || toneColors.teal}
          />
        ) : null}
      </View>
      {action ? (
        <Text className="mt-2.5 text-[12px] font-bold text-primary">{action}</Text>
      ) : null}
    </TouchableOpacity>
  );
}
