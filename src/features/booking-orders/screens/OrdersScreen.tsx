import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { BottomTabsPreview } from "../components/BottomTabsPreview";
import { OrderCard } from "../components/OrderCard";
import { SectionLabel } from "../components/SectionLabel";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { useOrders } from "../hooks/useOrders";

export default function OrdersScreen() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { orders, isLoading } = useOrders();

  const getTone = (index: number): "coral" | "teal" | "gold" | "blue" => {
    const tones: ("coral" | "teal" | "gold" | "blue")[] = [
      "coral",
      "teal",
      "gold",
      "blue",
    ];
    return tones[index % tones.length];
  };

  const isCompleted = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "completed" || s === "delivered";
  };

  const isCancelled = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "cancelled" || s === "canceled";
  };

  const activeOrders = useMemo(
    () =>
      orders.filter((o) => !isCompleted(o.status) && !isCancelled(o.status)),
    [orders],
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => isCompleted(o.status)),
    [orders],
  );

  const cancelledOrders = useMemo(
    () => orders.filter((o) => isCancelled(o.status)),
    [orders],
  );

  const currentList =
    selectedTab === 0
      ? activeOrders
      : selectedTab === 1
        ? completedOrders
        : cancelledOrders;

  const currentLabel =
    selectedTab === 0
      ? "Active Orders"
      : selectedTab === 1
        ? "Completed Orders"
        : "Cancelled Orders";

  return (
    <BookingOrdersScreenShell
      bottomTabs={<BottomTabsPreview active="Orders" />}
    >
      <BookingOrdersHeader
        title="My Orders"
        leftIcon="menu"
        rightIcon="notifications-outline"
        rightLabel="Notifications"
      />
      <View className="px-5 pb-8">
        <SegmentedTabs
          activeIndex={selectedTab}
          onSelectTab={setSelectedTab}
          tabs={[
            `Active (${activeOrders.length})`,
            `Completed (${completedOrders.length})`,
            `Cancelled (${cancelledOrders.length})`,
          ]}
        />

        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="small" color="#14919B" />
          </View>
        ) : (
          <View className="mt-4">
            <SectionLabel title={currentLabel} />
            {currentList.length === 0 ? (
              <View
                className="py-14 items-center justify-center px-6 rounded-2xl border border-brand-border bg-brand-surface/30 my-4"
                style={{ minHeight: 320 }}
              >
                <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <Ionicons
                    name={
                      selectedTab === 1
                        ? "checkmark-circle-outline"
                        : selectedTab === 2
                          ? "close-circle-outline"
                          : "bag-handle-outline"
                    }
                    size={32}
                    color="#14919B"
                  />
                </View>
                <Text className="text-[16px] font-bold text-brand-dark text-center">
                  {selectedTab === 1
                    ? "No completed orders"
                    : selectedTab === 2
                      ? "No cancelled orders"
                      : "No active orders"}
                </Text>
                <Text className="mt-1.5 text-[13px] text-brand-gray text-center max-w-[260px] mb-5 leading-[19px]">
                  {selectedTab === 0
                    ? "Start a new tailoring order with an expert tailor."
                    : selectedTab === 1
                      ? "Delivered and completed orders will appear here."
                      : "You do not have any cancelled orders."}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push("/tailors" as never)}
                  className="h-[56px] px-12 rounded-xl bg-primary items-center justify-center shadow-md active:bg-primary-dark"
                >
                  <Text className="text-[16px] font-semibold text-white tracking-wide">
                    Explore Tailors
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              currentList.map((order, index) => {
                const isDeliv = isCompleted(order.status);
                const isCancel = isCancelled(order.status);

                return (
                  <OrderCard
                    key={order.id || index}
                    id={order.orderNumber || order.id || `ORD${index + 1000}`}
                    item={order.itemName || "Custom Outfit"}
                    tailor={order.tailorName || "Tailor"}
                    placedOn={
                      order.createdAt ||
                      (isDeliv
                        ? "Completed"
                        : isCancel
                          ? "Cancelled"
                          : "Recent")
                    }
                    price={`Rs ${order.price?.toLocaleString?.() || order.price || 0}`}
                    delivery={
                      isDeliv
                        ? "Delivered"
                        : isCancel
                          ? "Cancelled"
                          : order.deliveryDate || "In Progress"
                    }
                    status={
                      isDeliv
                        ? "Delivered"
                        : isCancel
                          ? "Cancelled"
                          : order.status === "Confirmed"
                            ? "Confirmed"
                            : "In Progress"
                    }
                    statusTone={
                      isDeliv
                        ? "green"
                        : isCancel
                          ? "red"
                          : order.status === "Confirmed"
                            ? "blue"
                            : undefined
                    }
                    placeholderTone={getTone(index)}
                    buttonLabel={
                      isDeliv
                        ? "View Details"
                        : isCancel
                          ? "Order Details"
                          : "Track Order"
                    }
                  />
                );
              })
            )}
          </View>
        )}
      </View>
    </BookingOrdersScreenShell>
  );
}
