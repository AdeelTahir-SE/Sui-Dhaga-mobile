import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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

type OrderTab = "active" | "completed" | "cancelled";

export default function MainOrdersScreen() {
  const { orders, isLoading, isRefreshing, error, refresh } = useOrders();
  const [selectedTab, setSelectedTab] = useState<OrderTab>("active");

  const isCompleted = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "completed" || s === "delivered";
  };

  const isCancelled = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "cancelled" || s === "canceled";
  };

  const activeOrders = useMemo(
    () => orders.filter((o) => !isCompleted(o.status) && !isCancelled(o.status)),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => isCompleted(o.status)),
    [orders]
  );

  const cancelledOrders = useMemo(
    () => orders.filter((o) => isCancelled(o.status)),
    [orders]
  );

  const tabs: { key: OrderTab; label: string; count: number }[] = [
    { key: "active", label: "Active", count: activeOrders.length },
    { key: "completed", label: "Completed", count: completedOrders.length },
    { key: "cancelled", label: "Cancelled", count: cancelledOrders.length },
  ];

  const displayedOrders =
    selectedTab === "active"
      ? activeOrders
      : selectedTab === "completed"
      ? completedOrders
      : cancelledOrders;

  const getTone = (index: number): "cream" | "mint" | "coral" | "blue" => {
    const tones: ("cream" | "mint" | "coral" | "blue")[] = ["cream", "mint", "coral", "blue"];
    return tones[index % tones.length];
  };

  return (
    <CustomerTabShell
      bottomTabs={<CustomerTabsPreview active="Orders" />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor="#14919B"
          colors={["#14919B"]}
        />
      }
    >
      <CustomerHeader title="My Orders" rightIcon="notifications-outline" />

      <View className="flex-1 px-5 pb-6">
        {/* Interactive Tabs with Real Counts */}
        <View className="mb-5 flex-row border-b border-brand-border">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setSelectedTab(tab.key)}
                activeOpacity={0.7}
                className={`mr-6 pb-3 ${
                  isActive ? "border-b-2 border-primary" : ""
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    isActive ? "text-primary" : "text-brand-gray"
                  }`}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content Section */}
        {isLoading && !isRefreshing ? (
          <View className="flex-1 items-center justify-center py-20" style={{ minHeight: 380 }}>
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] text-brand-gray">
              Loading your orders...
            </Text>
          </View>
        ) : error && orders.length === 0 ? (
          <View className="flex-1 items-center justify-center py-16 px-4" style={{ minHeight: 380 }}>
            <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center mb-3">
              <Ionicons name="cloud-offline-outline" size={26} color="#DC2626" />
            </View>
            <Text className="text-[15px] font-bold text-brand-dark text-center">
              Unable to load orders
            </Text>
            <Text className="mt-1 text-[13px] text-brand-gray text-center mb-4">
              {error}
            </Text>
            <TouchableOpacity
              onPress={refresh}
              activeOpacity={0.7}
              className="px-5 py-2.5 rounded-xl bg-primary"
            >
              <Text className="text-[13px] font-semibold text-white">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : displayedOrders.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12 px-4" style={{ minHeight: 420 }}>
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons
                name={
                  selectedTab === "completed"
                    ? "checkmark-done-circle-outline"
                    : selectedTab === "cancelled"
                    ? "close-circle-outline"
                    : "bag-handle-outline"
                }
                size={38}
                color="#14919B"
              />
            </View>
            <Text className="text-[18px] font-bold text-brand-dark text-center">
              {selectedTab === "completed"
                ? "No Completed Orders"
                : selectedTab === "cancelled"
                ? "No Cancelled Orders"
                : "No Active Orders"}
            </Text>
            <Text className="mt-2 text-[13px] text-brand-gray text-center leading-[20px] max-w-[280px] mb-6">
              {selectedTab === "completed"
                ? "When your tailoring orders are finished and delivered, they will appear here."
                : selectedTab === "cancelled"
                ? "You do not have any cancelled orders."
                : "You don't have any orders in progress right now. Connect with expert tailors to create custom outfits!"}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/tailors" as never)}
              className="h-[48px] px-6 rounded-xl bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
              style={{
                height: 48,
                paddingHorizontal: 24,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#14919B",
              }}
            >
              <Text
                className="text-[14px] font-semibold text-white"
                style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}
              >
                Explore Tailors
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayedOrders.map((order, index) => {
            const orderStatus = order.status || "In Progress";
            const isDelivered =
              orderStatus.toLowerCase() === "completed" ||
              orderStatus.toLowerCase() === "delivered";
            const isCancel =
              orderStatus.toLowerCase() === "cancelled" ||
              orderStatus.toLowerCase() === "canceled";

            const displayStatus = isDelivered
              ? "Completed"
              : isCancel
              ? "Cancelled"
              : orderStatus === "Confirmed"
              ? "Confirmed"
              : "In Progress";

            const deliveryText = isDelivered
              ? `Delivered on ${order.deliveryDate || "Recent"}`
              : isCancel
              ? "Order Cancelled"
              : `Delivery by ${order.deliveryDate || order.dueDate || "Expected Soon"}`;

            return (
              <MainOrderCard
                key={order.id || index}
                id={order.orderNumber || order.id || `SD${1200 + index}`}
                orderId={order.id}
                item={order.itemName || "Custom Garment"}
                tailor={order.tailorName || "Tailor"}
                delivery={deliveryText}
                price={`Rs ${order.price?.toLocaleString?.() || order.price || 0}`}
                status={displayStatus}
                image={order.imageUrl || order.image || defaultImages[index % defaultImages.length]}
                tone={getTone(index)}
                button={isDelivered ? "View Details" : "Track Order"}
              />
            );
          })
        )}
      </View>
    </CustomerTabShell>
  );
}
