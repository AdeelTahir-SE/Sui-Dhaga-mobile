import { Text, TouchableOpacity, View } from "react-native";

import { PlaceholderImage } from "./PlaceholderImage";
import { StatusPill } from "./StatusPill";

type OrderCardProps = {
  id: string;
  item: string;
  tailor: string;
  placedOn: string;
  price: string;
  delivery: string;
  status: string;
  statusTone?: "gold" | "blue" | "green" | "red";
  buttonLabel?: string;
  placeholderTone?: "teal" | "coral" | "gold" | "blue";
};

export function OrderCard({
  id,
  item,
  tailor,
  placedOn,
  price,
  delivery,
  status,
  statusTone = "gold",
  buttonLabel = "Track Order",
  placeholderTone = "coral",
}: OrderCardProps) {
  return (
    <View className="mb-3 rounded-xl border border-brand-border bg-white p-3">
      <View className="flex-row">
        <PlaceholderImage variant="garment" size="md" tone={placeholderTone} />
        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-[13px] font-semibold text-brand-dark">
              Order #{id}
            </Text>
            <StatusPill label={status} tone={statusTone} />
          </View>
          <Text className="mt-2 text-[12px] font-semibold text-brand-dark">
            {item}
          </Text>
          <Text className="mt-1 text-[11px] text-brand-gray">{tailor}</Text>
          <Text className="mt-1 text-[11px] text-brand-gray">
            Order Placed: {placedOn}
          </Text>
          <Text className="mt-2 text-[13px] font-bold text-brand-dark">
            {price}
          </Text>
        </View>
      </View>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-[11px] text-brand-gray">
          Est. Delivery: {delivery}
        </Text>
        <TouchableOpacity className="rounded-lg border border-primary px-4 py-2">
          <Text className="text-[11px] font-semibold text-primary">
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
