import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { router } from "expo-router";

const orderItems = require("@/assets/illustrations/customer-tabs/order-items.png");

type MainOrderCardProps = {
  id: string;
  item: string;
  tailor: string;
  delivery: string;
  price: string;
  status: string;
  image?: ImageSource | string;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  button?: string;
  orderId?: string;
  onPress?: () => void;
};

export function MainOrderCard({
  id,
  item,
  tailor,
  delivery,
  price,
  status,
  image,
  button = "Track Order",
  orderId,
  onPress,
}: MainOrderCardProps) {
  const normalizedStatus = (status || "").toLowerCase();
  const isCompleted = normalizedStatus === "completed" || normalizedStatus === "delivered";
  const isCancelled = normalizedStatus === "cancelled" || normalizedStatus === "canceled";

  const statusBadge = isCompleted ? {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  } : isCancelled ? {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  } : {
    bg: "bg-[#FFF6DA]",
    text: "text-[#C08300]",
    border: "border-amber-200",
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (orderId || id) {
      router.push(`/orders/${orderId || id}` as any);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleCardPress}
      className="mb-4 rounded-md border border-brand-border bg-white p-3.5 shadow-sm"
    >
      <View className="flex-row">
        <View className="h-24 w-20 overflow-hidden rounded-md bg-brand-surface border border-brand-border">
          <Image
            source={image ?? orderItems}
            contentFit="contain"
            style={{ height: "100%", width: "100%" }}
          />
        </View>
        <View className="ml-3.5 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-[12px] font-bold text-brand-dark">Order #{id}</Text>
            <View className={`rounded-md px-2 py-0.5 border ${statusBadge.bg} ${statusBadge.border}`}>
              <Text className={`text-[10px] font-bold ${statusBadge.text}`}>
                {status}
              </Text>
            </View>
          </View>
          <Text numberOfLines={1} className="mt-1.5 text-[14px] font-bold text-brand-dark">{item}</Text>
          <Text numberOfLines={1} className="mt-0.5 text-[12px] font-medium text-brand-gray">{tailor}</Text>
          <Text className="mt-0.5 text-[12px] font-medium text-brand-gray">{delivery}</Text>
          <Text className="mt-1.5 text-[15px] font-bold text-primary">{price}</Text>
        </View>
      </View>

      <View className="mt-3 pt-2.5 border-t border-brand-border/60 flex-row justify-end">
        <TouchableOpacity
          onPress={handleCardPress}
          className="rounded-md border border-primary px-4 py-2 bg-primary/5 active:bg-primary/10"
        >
          <Text className="text-[12px] font-bold text-primary tracking-wide">
            {isCompleted ? "View Invoice" : isCancelled ? "Order Details" : button}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
