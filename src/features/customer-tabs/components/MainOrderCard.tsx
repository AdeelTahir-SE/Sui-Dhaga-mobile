import { Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";

const orderItems = require("@/assets/illustrations/customer-tabs/order-items.png");

type MainOrderCardProps = {
  id: string;
  item: string;
  tailor: string;
  delivery: string;
  price: string;
  status: string;
  image?: ImageSource;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  button?: string;
};

export function MainOrderCard({
  id,
  item,
  tailor,
  delivery,
  price,
  status,
  image,
  tone = "coral",
  button = "Track Order",
}: MainOrderCardProps) {
  return (
    <View className="mb-4 rounded-xl border border-brand-border p-3">
      <View className="flex-row">
        <View className="h-24 w-20 overflow-hidden rounded-xl bg-brand-surface">
          <Image
            source={image ?? orderItems}
            contentFit="contain"
            style={{ height: "100%", width: "100%" }}
          />
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-[12px] font-bold text-brand-dark">Order #{id}</Text>
            <Text className="rounded bg-[#FFF6DA] px-2 py-1 text-[9px] font-medium text-[#C08300]">
              {status}
            </Text>
          </View>
          <Text className="mt-3 text-[12px] font-semibold text-brand-dark">{item}</Text>
          <Text className="mt-1 text-[11px] text-brand-gray">{tailor}</Text>
          <Text className="mt-1 text-[11px] text-brand-gray">Delivery by {delivery}</Text>
          <Text className="mt-2 text-[13px] font-bold text-brand-dark">{price}</Text>
        </View>
      </View>
      <TouchableOpacity className="mt-3 self-end rounded-lg border border-primary px-5 py-2">
        <Text className="text-[11px] font-semibold text-primary">{button}</Text>
      </TouchableOpacity>
    </View>
  );
}
