import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { OrderRequestCard } from "../components/OrderRequestCard";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { useOrders } from "../../booking-orders/hooks/useOrders";

const orderImages = {
  anarkali: require("@/assets/illustrations/tailor-dashboard/orders/anarkali-suit.png"),
  sherwani: require("@/assets/illustrations/tailor-dashboard/orders/sherwani-set.png"),
  lehenga: require("@/assets/illustrations/tailor-dashboard/orders/lehenga-choli.png"),
};

type TailorOrderTab = "requests" | "in_progress" | "completed" | "cancelled";

export default function TailorOrdersScreen() {
  const { orders, isLoading, isRefreshing, refresh } = useOrders();
  const [selectedTab, setSelectedTab] = useState<TailorOrderTab>("requests");

  const pendingRequests = useMemo(
    () => orders.filter((o) => (o.status || "").toLowerCase() === "pending"),
    [orders]
  );

  const inProgressOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          (o.status || "").toLowerCase() === "in progress" ||
          (o.status || "").toLowerCase() === "confirmed"
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          (o.status || "").toLowerCase() === "completed" ||
          (o.status || "").toLowerCase() === "delivered"
      ),
    [orders]
  );

  const cancelledOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          (o.status || "").toLowerCase() === "cancelled" ||
          (o.status || "").toLowerCase() === "canceled"
      ),
    [orders]
  );

  const tabs: { key: TailorOrderTab; label: string; count: number }[] = [
    { key: "requests", label: "Requests", count: pendingRequests.length },
    { key: "in_progress", label: "In Progress", count: inProgressOrders.length },
    { key: "completed", label: "Completed", count: completedOrders.length },
    { key: "cancelled", label: "Cancelled", count: cancelledOrders.length },
  ];

  const currentList =
    selectedTab === "requests"
      ? pendingRequests
      : selectedTab === "in_progress"
      ? inProgressOrders
      : selectedTab === "completed"
      ? completedOrders
      : cancelledOrders;

  const tones: ("teal" | "coral" | "gold" | "blue" | "mint")[] = [
    "coral",
    "teal",
    "gold",
    "blue",
    "mint",
  ];

  return (
    <TailorDashboardShell bottomTabs={<TailorDashboardTabs active="Orders" />}>
      <TailorDashboardHeader title="Orders" showBack rightIcon="cube-outline" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#14919B"
            colors={["#14919B"]}
          />
        }
      >
        {/* Interactive Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 -mx-1"
        >
          <View className="flex-row gap-2 px-1">
            {tabs.map((tab) => {
              const isActive = selectedTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setSelectedTab(tab.key)}
                  activeOpacity={0.7}
                  className={`rounded-xl px-3.5 py-2 border ${
                    isActive
                      ? "bg-primary border-primary"
                      : "bg-white border-brand-border"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      isActive ? "text-white" : "text-brand-dark"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {isLoading && !isRefreshing ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#14919B" />
          </View>
        ) : currentList.length === 0 ? (
          <View className="py-16 items-center justify-center px-4 rounded-2xl border border-brand-border bg-brand-surface/30">
            <Ionicons name="cube-outline" size={36} color="#9CA3AF" />
            <Text className="mt-3 text-[15px] font-bold text-brand-dark text-center">
              {selectedTab === "requests"
                ? "No New Requests"
                : selectedTab === "in_progress"
                ? "No Orders in Progress"
                : selectedTab === "completed"
                ? "No Completed Orders"
                : "No Cancelled Orders"}
            </Text>
            <Text className="mt-1 text-[12px] text-brand-gray text-center leading-[18px]">
              {selectedTab === "requests"
                ? "New order requests from customers will show up here."
                : selectedTab === "in_progress"
                ? "Active orders you are currently working on will appear here."
                : selectedTab === "completed"
                ? "Your completed tailoring orders will be listed here."
                : "You do not have any cancelled orders."}
            </Text>
          </View>
        ) : (
          currentList.map((order, index) => {
            const fallbackImages = [orderImages.anarkali, orderImages.sherwani, orderImages.lehenga];
            const img = order.imageUrl ? { uri: order.imageUrl } : fallbackImages[index % fallbackImages.length];

            return (
              <OrderRequestCard
                key={order.id || index}
                image={img}
                id={order.orderNumber || order.id || `ORD${index + 1000}`}
                item={order.itemName || "Custom Garment"}
                price={`Rs ${order.price?.toLocaleString?.() || order.price || 0}`}
                customer={order.customerName || "Customer"}
                tone={tones[index % tones.length]}
              />
            );
          })
        )}
      </ScrollView>
    </TailorDashboardShell>
  );
}
