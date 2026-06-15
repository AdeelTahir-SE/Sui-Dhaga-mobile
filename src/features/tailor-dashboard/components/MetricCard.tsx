import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type MetricCardProps = {
  title: string;
  value: string;
  action: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: "teal" | "coral" | "gold" | "blue";
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
}: MetricCardProps) {
  return (
    <View className="w-[48%] rounded-xl border border-brand-border bg-white p-3">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] text-brand-gray">{title}</Text>
          <Text className="mt-2 text-[22px] font-bold text-brand-dark">
            {value}
          </Text>
        </View>
        <Ionicons name={icon} size={24} color={toneColors[tone]} />
      </View>
      <Text className="mt-3 text-[11px] font-medium text-primary">{action}</Text>
    </View>
  );
}
