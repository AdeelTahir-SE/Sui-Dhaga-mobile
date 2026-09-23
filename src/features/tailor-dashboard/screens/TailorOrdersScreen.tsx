import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

export default function TailorOrdersScreen() {
  const { orders, isLoading, isRefreshing, refresh } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filterOptions = [
    {
      label: "All Orders",
      value: null,
      desc: "Show all client orders",
      icon: "receipt-outline",
      badge: "All",
    },
    {
      label: "New Requests",
      value: "requests",
      desc: "Incoming orders awaiting your review",
      icon: "alert-circle-outline",
      badge: "Requests",
    },
    {
      label: "In Progress",
      value: "in_progress",
      desc: "Orders currently being tailored or processed",
      icon: "time-outline",
      badge: "In Progress",
    },
    {
      label: "Completed",
      value: "completed",
      desc: "Finished garments delivered or ready",
      icon: "checkmark-done-circle-outline",
      badge: "Completed",
    },
    {
      label: "Cancelled",
      value: "cancelled",
      desc: "Cancelled or declined orders",
      icon: "close-circle-outline",
      badge: "Cancelled",
    },
  ];

  const isPending = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "pending" || s === "new" || s === "requested";
  };

  const isInProgress = (status?: string) => {
    const s = (status || "").toLowerCase();
    return (
      s === "in progress" ||
      s === "confirmed" ||
      s === "processing" ||
      s === "accepted"
    );
  };

  const isCompleted = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "completed" || s === "delivered";
  };

  const isCancelled = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "cancelled" || s === "canceled" || s === "rejected";
  };

  const getOrderCount = (filterVal: string | null) => {
    if (filterVal === null) return orders.length;
    if (filterVal === "requests") {
      return orders.filter((o) => isPending(o.status)).length;
    }
    if (filterVal === "in_progress") {
      return orders.filter((o) => isInProgress(o.status)).length;
    }
    if (filterVal === "completed") {
      return orders.filter((o) => isCompleted(o.status)).length;
    }
    if (filterVal === "cancelled") {
      return orders.filter((o) => isCancelled(o.status)).length;
    }
    return orders.length;
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // 1. Status Filter
    if (activeFilter === "requests") {
      result = result.filter((o) => isPending(o.status));
    } else if (activeFilter === "in_progress") {
      result = result.filter((o) => isInProgress(o.status));
    } else if (activeFilter === "completed") {
      result = result.filter((o) => isCompleted(o.status));
    } else if (activeFilter === "cancelled") {
      result = result.filter((o) => isCancelled(o.status));
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => {
        const item = (o.itemName || "").toLowerCase();
        const customer = (o.customerName || "").toLowerCase();
        const num = (o.orderNumber || o.id || "").toLowerCase();
        const status = (o.status || "").toLowerCase();
        return (
          item.includes(q) ||
          customer.includes(q) ||
          num.includes(q) ||
          status.includes(q)
        );
      });
    }

    return result;
  }, [orders, activeFilter, searchQuery]);

  const modalFilteredCount = useMemo(() => {
    let result = [...orders];
    if (selectedFilter === "requests") {
      result = result.filter((o) => isPending(o.status));
    } else if (selectedFilter === "in_progress") {
      result = result.filter((o) => isInProgress(o.status));
    } else if (selectedFilter === "completed") {
      result = result.filter((o) => isCompleted(o.status));
    } else if (selectedFilter === "cancelled") {
      result = result.filter((o) => isCancelled(o.status));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => {
        const item = (o.itemName || "").toLowerCase();
        const customer = (o.customerName || "").toLowerCase();
        const num = (o.orderNumber || o.id || "").toLowerCase();
        const status = (o.status || "").toLowerCase();
        return (
          item.includes(q) ||
          customer.includes(q) ||
          num.includes(q) ||
          status.includes(q)
        );
      });
    }
    return result.length;
  }, [orders, selectedFilter, searchQuery]);

  const activeFilterOption = filterOptions.find((f) => f.value === activeFilter);

  const tones: ("teal" | "coral" | "gold" | "blue" | "mint")[] = [
    "coral",
    "teal",
    "gold",
    "blue",
    "mint",
  ];

  return (
    <TailorDashboardShell
      bottomTabs={<TailorDashboardTabs active="Orders" />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor="#14919B"
          colors={["#14919B"]}
        />
      }
    >
      <TailorDashboardHeader title="Orders" rightIcon="cube-outline" />

      <View className="flex-1 px-5 pb-6">
        {/* Search Bar & Dedicated Filter Button (Customer Pages Style) */}
        <View className="flex-row items-center gap-2.5 mb-3.5">
          <View
            className="flex-1 flex-row items-center px-3.5 bg-[#F8FAFC] shadow-xs"
            style={{
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <Ionicons name="search" size={19} color="#14919B" />
            <TextInput
              style={{ paddingVertical: 0 }}
              className="ml-2.5 flex-1 text-[13px] font-medium text-brand-dark"
              placeholder="Search by customer, garment, ID..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="p-1"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={17} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => {
              setSelectedFilter(activeFilter);
              setIsFilterModalVisible(true);
            }}
            activeOpacity={0.8}
            className="items-center justify-center shadow-xs"
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
            accessibilityLabel="Filter orders"
          >
            <Ionicons name="filter" size={21} color="#14919B" />
            {activeFilter !== null && (
              <View
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor: "#14919B",
                }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Pill if Filter Applied */}
        {activeFilter !== null && (
          <View className="flex-row items-center mb-3">
            <View className="flex-row items-center bg-[#E0F7F7] px-3 py-1.5 rounded-full">
              <Text className="text-[12px] font-semibold text-[#0D7377] mr-1.5">
                Status: {activeFilterOption?.badge || activeFilter}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setActiveFilter(null);
                  setSelectedFilter(null);
                }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close-circle" size={16} color="#0D7377" />
              </TouchableOpacity>
            </View>
          </View>
        )}


        {/* Modal: Order Filter (Customer Pages Design) */}
        <Modal
          visible={isFilterModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsFilterModalVisible(false)}
        >
          <View
            className="flex-1 justify-end"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
          >
            <View className="rounded-t-[36px] bg-white px-5 pb-8 pt-3 shadow-2xl max-h-[88%]">
              {/* Drag handle indicator */}
              <View className="h-1.5 w-12 rounded-full bg-slate-200 self-center mb-3 mt-1" />

              {/* Header */}
              <View className="flex-row items-center justify-between pb-3">
                <View className="flex-row items-center flex-1">
                  <View className="h-10 w-10 items-center justify-center rounded-md bg-[#E0F7F7] mr-3">
                    <Ionicons name="filter" size={20} color="#14919B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-bold text-brand-dark">
                      Filter Orders
                    </Text>
                    <Text className="text-[12px] font-medium text-brand-gray">
                      Filter orders by pipeline status
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsFilterModalVisible(false)}
                  className="h-8 w-8 items-center justify-center rounded-md bg-slate-100 active:bg-slate-200"
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Subtle hairline divider */}
              <View className="h-[1px] bg-slate-100 mb-3.5" />

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Order Status
                </Text>

                <View className="gap-2.5 mb-4">
                  {filterOptions.map((opt) => {
                    const isSelected = selectedFilter === opt.value;
                    const count = getOrderCount(opt.value);
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() => setSelectedFilter(opt.value)}
                        activeOpacity={0.75}
                        className="flex-row items-center rounded-md p-3.5"
                        style={{
                          backgroundColor: isSelected ? "#F0FAFA" : "#FFFFFF",
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? "#14919B" : "#E2E8F0",
                        }}
                      >
                        <View
                          className="h-10 w-10 items-center justify-center rounded-md mr-3"
                          style={{
                            backgroundColor: isSelected ? "#14919B" : "#F0FAFA",
                          }}
                        >
                          <Ionicons
                            name={opt.icon as any}
                            size={20}
                            color={isSelected ? "#FFFFFF" : "#14919B"}
                          />
                        </View>
                        <View className="flex-1 mr-2">
                          <View className="flex-row items-center">
                            <Text
                              className={`text-[14px] font-bold ${
                                isSelected
                                  ? "text-[#14919B]"
                                  : "text-brand-dark"
                              }`}
                            >
                              {opt.label}
                            </Text>
                            <View
                              className="ml-2 px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: isSelected
                                  ? "#E0F7F7"
                                  : "#F1F5F9",
                              }}
                            >
                              <Text
                                className={`text-[10px] font-bold ${
                                  isSelected
                                    ? "text-[#0D7377]"
                                    : "text-slate-500"
                                }`}
                              >
                                {opt.badge}
                              </Text>
                            </View>
                          </View>
                          <Text
                            className={`text-[12px] mt-0.5 ${
                              isSelected ? "text-[#0D7377]" : "text-brand-gray"
                            }`}
                          >
                            {opt.desc}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text
                            className={`mr-2 text-[11px] font-bold ${
                              isSelected ? "text-[#14919B]" : "text-slate-400"
                            }`}
                          >
                            {count} {count === 1 ? "order" : "orders"}
                          </Text>
                          <View
                            className="h-5 w-5 rounded-md items-center justify-center"
                            style={{
                              backgroundColor: isSelected
                                ? "#14919B"
                                : "#FFFFFF",
                              borderWidth: isSelected ? 0 : 1.5,
                              borderColor: "#CBD5E1",
                            }}
                          >
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={13}
                                color="#FFFFFF"
                              />
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Fixed Bottom Action Buttons */}
              <View
                className="mt-3.5 pt-3 pb-1 flex flex-row items-center justify-center gap-3"
                style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0" }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFilter(null);
                    setActiveFilter(null);
                  }}
                  activeOpacity={0.7}
                  className="h-[50px] px-5 flex-1 items-center justify-center rounded-md bg-white shadow-xs"
                  style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
                >
                  <Text className="text-[13px] font-bold text-brand-gray">
                    Reset
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsFilterModalVisible(false);
                    setActiveFilter(selectedFilter);
                  }}
                  activeOpacity={0.85}
                  className="h-[50px] flex-1 items-center justify-center rounded-md bg-primary active:bg-primary-dark shadow-sm px-4"
                >
                  <Text className="text-[14px] font-bold text-white">
                    Show Results ({modalFilteredCount})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Content Section */}
        {isLoading && !isRefreshing ? (
          <View
            className="py-20 items-center justify-center"
            style={{ minHeight: 380 }}
          >
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] font-medium text-brand-gray">
              Loading orders...
            </Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View
            className="flex-1 items-center justify-center py-12 px-4"
            style={{ minHeight: 400 }}
          >
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons
                name={
                  activeFilter === "completed"
                    ? "checkmark-done-circle-outline"
                    : activeFilter === "in_progress"
                    ? "hourglass-outline"
                    : activeFilter === "cancelled"
                    ? "close-circle-outline"
                    : "bag-handle-outline"
                }
                size={38}
                color="#14919B"
              />
            </View>
            <Text className="text-[18px] font-bold text-brand-dark text-center tracking-tight">
              {searchQuery.trim()
                ? "No Matching Orders"
                : activeFilter === "requests"
                ? "No New Requests"
                : activeFilter === "in_progress"
                ? "No Orders in Progress"
                : activeFilter === "completed"
                ? "No Completed Orders"
                : activeFilter === "cancelled"
                ? "No Cancelled Orders"
                : "No Orders Yet"}
            </Text>
            <Text className="mt-2 text-[13px] font-medium text-brand-gray text-center leading-[20px] max-w-[290px] mb-6">
              {searchQuery.trim()
                ? `We couldn't find any orders matching "${searchQuery}". Try searching by customer name, order number, or garment.`
                : activeFilter === "requests"
                ? "You're all caught up! New order requests from customers will appear here."
                : activeFilter === "in_progress"
                ? "Active orders you are currently working on will be displayed here."
                : activeFilter === "completed"
                ? "Your completed tailoring orders will be listed here."
                : activeFilter === "cancelled"
                ? "Cancelled or rejected orders will be listed here."
                : "Customer orders placed with your shop will appear here."}
            </Text>
            {searchQuery.trim() || activeFilter !== null ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery("");
                  setActiveFilter(null);
                  setSelectedFilter(null);
                }}
                className="h-[44px] px-6 rounded-md bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
              >
                <Text className="text-[13px] font-bold text-white tracking-wide">
                  {searchQuery.trim() ? "Clear Search" : "Show All Orders"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          filteredOrders.map((order, index) => {
            const fallbackImages = [
              orderImages.anarkali,
              orderImages.sherwani,
              orderImages.lehenga,
            ];
            const img = order.imageUrl
              ? { uri: order.imageUrl }
              : fallbackImages[index % fallbackImages.length];

            return (
              <OrderRequestCard
                key={order.id || index}
                image={img}
                id={order.orderNumber || order.id || `ORD${index + 1000}`}
                item={order.itemName || "Custom Garment"}
                price={`Rs ${order.price?.toLocaleString?.() || order.price || 0}`}
                customer={order.customerName || "Customer"}
                status={order.status}
                tone={tones[index % tones.length]}
              />
            );
          })
        )}
      </View>
    </TailorDashboardShell>
  );
}
