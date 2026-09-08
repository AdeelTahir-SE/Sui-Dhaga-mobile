import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type MetricCardProps = {
  title: string;
  value: string;
  action: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: "teal" | "coral" | "gold" | "blue";
  onPress?: () => void;
};

const toneColors = {
  teal: "#14919B",
  coral: "#F05A57",
  gold: "#D79A00",
  blue: "#3B77C9",
};

export function MetricCard({
  title,
  value,
  action,
  icon,
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
        <View className="flex-1 pr-1">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-brand-gray" numberOfLines={1}>{title}</Text>
          <Text className="mt-1.5 text-[22px] font-black text-brand-dark tracking-tight">
            {value}
          </Text>
        </View>
        <Ionicons name={icon} size={24} color={toneColors[tone]} />
      </View>
      <Text className="mt-2.5 text-[12px] font-bold text-primary">{action}</Text>
    </TouchableOpacity>
  );
}
