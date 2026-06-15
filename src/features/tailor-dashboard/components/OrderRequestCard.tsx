import { Text, View } from "react-native";

import { DashActionButton } from "./DashActionButton";
import { StatusPill } from "./StatusPill";
import { TailorDashPlaceholder } from "./TailorDashPlaceholder";

type OrderRequestCardProps = {
  id: string;
  item: string;
  price: string;
  customer: string;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
};

export function OrderRequestCard({
  id,
  item,
  price,
  customer,
  tone = "coral",
}: OrderRequestCardProps) {
  return (
    <View className="mb-3 rounded-xl border border-brand-border bg-white p-3">
      <View className="flex-row">
        <TailorDashPlaceholder variant="garment" size="md" tone={tone} />
        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-[13px] font-bold text-brand-dark">#{id}</Text>
            <StatusPill label="New" tone="gold" />
          </View>
          <Text className="mt-2 text-[12px] font-medium text-brand-dark">
            {item}
          </Text>
          <Text className="mt-1 text-[13px] font-bold text-brand-dark">
            {price}
          </Text>
          <Text className="mt-1 text-[11px] text-brand-gray">
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
