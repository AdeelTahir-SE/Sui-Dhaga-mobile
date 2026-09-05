import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MainOrderCard } from "../components/MainOrderCard";
import { useOrders } from "../../booking-orders/hooks/useOrders";

const defaultImages = [
  require("@/assets/illustrations/customer-tabs/orders/order-anarkali.png"),
  require("@/assets/illustrations/customer-tabs/orders/order-kurta.png"),
  require("@/assets/illustrations/customer-tabs/orders/order-lehenga.png"),
];

export default function MainOrdersScreen() {
  const { orders, isLoading } = useOrders();

  const getTone = (index: number): "cream" | "mint" | "coral" | "blue" => {
    const tones: ("cream" | "mint" | "coral" | "blue")[] = ["cream", "mint", "coral", "blue"];
    return tones[index % tones.length];
  };

  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Orders" />}>
      <CustomerHeader title="My Orders" rightIcon="notifications-outline" />
      <View className="px-5 pb-6">
        <View className="mb-4 flex-row gap-5 border-b border-brand-border">
          {[`Active (${orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length})`, "Completed (12)", "Cancelled (2)"].map(
            (tab, index) => (
              <View
                key={tab}
                className={`pb-3 ${
                  index === 0 ? "border-b-2 border-primary" : ""
                }`}
              >
                <Text
                  className={`text-[12px] font-medium ${
                    index === 0 ? "text-primary" : "text-brand-dark"
                  }`}
                >
                  {tab}
                </Text>
              </View>
            ),
          )}
        </View>

        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        ) : (
          orders.map((order, index) => (
            <MainOrderCard
              key={order.id || index}
              id={order.orderNumber || `SD${1200 + index}`}
              item={order.itemName || "Custom Garment"}
              tailor={order.tailorName || "Tailor"}
              delivery={order.deliveryDate || "Expected Soon"}
              price={`Rs ${order.price?.toLocaleString?.() || order.price || 0}`}
              status={order.status === "Completed" ? "Completed" : order.status === "Confirmed" ? "Confirmed" : "In Progress"}
              image={order.image || defaultImages[index % defaultImages.length]}
              tone={getTone(index)}
              button={index === 1 ? "View Details" : undefined}
            />
          ))
        )}
      </View>
    </CustomerTabShell>
  );
}
