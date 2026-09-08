import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  ScrollView,
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter((o) => {
      const item = (o.itemName || "").toLowerCase();
      const customer = (o.customerName || "").toLowerCase();
      const num = (o.orderNumber || o.id || "").toLowerCase();
      return item.includes(q) || customer.includes(q) || num.includes(q);
    });
  }, [currentList, searchQuery]);

  const tones: ("teal" | "coral" | "gold" | "blue" | "mint")[] = [
    "coral",
    "teal",
    "gold",
    "blue",
    "mint",
  ];

  return (
    <TailorDashboardShell bottomTabs={<TailorDashboardTabs active="Orders" />}>
      <TailorDashboardHeader title="Orders" rightIcon="cube-outline" />

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
        {/* Search Field */}
        <View className="mb-3.5 h-[46px] flex-row items-center rounded-md border border-brand-border bg-white px-3.5 shadow-xs">
          <Ionicons name="search-outline" size={17} color="#6F767E" />
          <TextInput
            className="ml-2.5 flex-1 text-[13px] font-medium text-brand-dark"
            placeholder="Search orders by customer, garment, ID..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

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
                  className={`rounded-md px-4 py-2 border shadow-xs ${
                    isActive
                      ? "bg-primary border-primary"
                      : "bg-white border-brand-border"
                  }`}
                >
                  <Text
                    className={`text-[13px] font-bold ${
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
          <View className="py-20 items-center justify-center" style={{ minHeight: 380 }}>
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] font-medium text-brand-gray">
              Loading orders...
            </Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12 px-4" style={{ minHeight: 400 }}>
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons
                name={
                  selectedTab === "completed"
                    ? "checkmark-done-circle-outline"
                    : selectedTab === "cancelled"
                    ? "close-circle-outline"
                    : selectedTab === "in_progress"
                    ? "hourglass-outline"
                    : "bag-handle-outline"
                }
                size={38}
                color="#14919B"
              />
            </View>
            <Text className="text-[18px] font-bold text-brand-dark text-center tracking-tight">
              {searchQuery.trim()
                ? "No Matching Orders"
                : selectedTab === "requests"
                ? "No New Requests"
                : selectedTab === "in_progress"
                ? "No Orders in Progress"
                : selectedTab === "completed"
                ? "No Completed Orders"
                : "No Cancelled Orders"}
            </Text>
            <Text className="mt-2 text-[13px] font-medium text-brand-gray text-center leading-[20px] max-w-[290px] mb-6">
              {searchQuery.trim()
                ? `We couldn't find any orders matching "${searchQuery}". Try searching by customer name, order number, or garment.`
                : selectedTab === "requests"
                ? "You're all caught up! New order requests from customers will appear here."
                : selectedTab === "in_progress"
                ? "Active orders you are currently working on will be displayed here."
                : selectedTab === "completed"
                ? "Your completed tailoring orders will be listed here."
                : "You do not have any cancelled orders."}
            </Text>
            {searchQuery.trim() ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSearchQuery("")}
                className="h-[44px] px-6 rounded-md bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
              >
                <Text className="text-[13px] font-bold text-white tracking-wide">
                  Clear Search
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          filteredOrders.map((order, index) => {
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
