import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { StatusPill } from "./StatusPill";
import { TailorDashPlaceholder } from "./TailorDashPlaceholder";

type ServiceCardProps = {
  title: string;
  price: string;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
};

export function ServiceCard({ title, price, tone = "coral" }: ServiceCardProps) {
  return (
    <View className="mb-3 flex-row items-center rounded-xl border border-brand-border bg-white p-3">
      <TailorDashPlaceholder variant="garment" size="sm" tone={tone} />
      <View className="ml-3 flex-1">
        <Text className="text-[13px] font-bold text-brand-dark">{title}</Text>
        <Text className="mt-1 text-[11px] text-brand-gray">
          Starting from {price}
        </Text>
        <View className="mt-2 self-start">
          <StatusPill label="Active" />
        </View>
      </View>
      <View className="flex-row gap-4">
        <Ionicons name="pencil-outline" size={18} color="#1A1D1F" />
        <Ionicons name="trash-outline" size={18} color="#F05A57" />
      </View>
    </View>
  );
}
