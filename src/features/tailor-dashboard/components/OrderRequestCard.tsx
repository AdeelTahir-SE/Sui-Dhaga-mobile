import { Text, View } from "react-native";
import type { ImageSource } from "expo-image";

import { DashActionButton } from "./DashActionButton";
import { StatusPill } from "./StatusPill";
import { TailorDashPlaceholder } from "./TailorDashPlaceholder";

type OrderRequestCardProps = {
  image?: ImageSource;
  id: string;
  item: string;
  price: string;
  customer: string;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
};

export function OrderRequestCard({
  image,
  id,
  item,
  price,
  customer,
  tone = "coral",
}: OrderRequestCardProps) {
  return (
    <View className="mb-3.5 rounded-md border border-brand-border bg-white p-3.5 shadow-xs">
      <View className="flex-row">
        <TailorDashPlaceholder image={image} variant="garment" size="md" tone={tone} />
        <View className="ml-3.5 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-[14px] font-black text-brand-dark">#{id}</Text>
            <StatusPill label="New" tone="gold" />
          </View>
          <Text className="mt-1 text-[13px] font-bold text-brand-dark">
            {item}
          </Text>
          <Text className="mt-1 text-[14px] font-black text-brand-dark">
            {price}
          </Text>
          <Text className="mt-1 text-[12px] font-medium text-brand-gray">
            Customer: {customer}
          </Text>
        </View>
      </View>
      <View className="mt-3 flex-row gap-3">
        <DashActionButton title="Reject" variant="outline" />
        <DashActionButton title="Accept" />
      </View>
    </View>
  );
}
