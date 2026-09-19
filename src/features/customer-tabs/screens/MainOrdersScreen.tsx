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

export default function MainOrdersScreen() {
  const { orders, isLoading, isRefreshing, error, refresh } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filterOptions = [
    {
      label: "All Orders",
      value: null,
      desc: "Show all your orders",
      icon: "receipt-outline",
      badge: "All",
    },
    {
      label: "Active",
      value: "active",
      desc: "Orders currently in progress or confirmed",
      icon: "time-outline",
      badge: "Active",
    },
    {
      label: "Completed",
      value: "completed",
      desc: "Finished and delivered garments",
      icon: "checkmark-done-circle-outline",
      badge: "Delivered",
    },
    {
      label: "Cancelled",
      value: "cancelled",
      desc: "Orders that were cancelled",
      icon: "close-circle-outline",
      badge: "Cancelled",
    },
  ];

  const isCompleted = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "completed" || s === "delivered";
  };

  const isCancelled = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "cancelled" || s === "canceled";
  };

  const getOrderCount = (filterVal: string | null) => {
    if (filterVal === null) return orders.length;
    if (filterVal === "active") {
      return orders.filter((o) => !isCompleted(o.status) && !isCancelled(o.status)).length;
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
    if (activeFilter === "active") {
      result = result.filter((o) => !isCompleted(o.status) && !isCancelled(o.status));
    } else if (activeFilter === "completed") {
      result = result.filter((o) => isCompleted(o.status));
    } else if (activeFilter === "cancelled") {
      result = result.filter((o) => isCancelled(o.status));
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((order) => {
        const orderId = (order.orderNumber || order.id || "").toLowerCase();
        const item = (order.itemName || (order as any).item_name || "").toLowerCase();
        const tailor = (order.tailorName || "").toLowerCase();
        const status = (order.status || "").toLowerCase();
        return (
          orderId.includes(q) ||
          item.includes(q) ||
          tailor.includes(q) ||
          status.includes(q)
        );
      });
    }

    return result;
  }, [orders, activeFilter, searchQuery]);

  const modalFilteredCount = useMemo(() => {
    let result = [...orders];
    if (selectedFilter === "active") {
      result = result.filter((o) => !isCompleted(o.status) && !isCancelled(o.status));
    } else if (selectedFilter === "completed") {
      result = result.filter((o) => isCompleted(o.status));
    } else if (selectedFilter === "cancelled") {
      result = result.filter((o) => isCancelled(o.status));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((order) => {
        const orderId = (order.orderNumber || order.id || "").toLowerCase();
        const item = (order.itemName || (order as any).item_name || "").toLowerCase();
        const tailor = (order.tailorName || "").toLowerCase();
        const status = (order.status || "").toLowerCase();
        return (
          orderId.includes(q) ||
          item.includes(q) ||
          tailor.includes(q) ||
          status.includes(q)
        );
      });
    }
    return result.length;
  }, [orders, selectedFilter, searchQuery]);

  const getTone = (index: number): "cream" | "mint" | "coral" | "blue" => {
    const tones: ("cream" | "mint" | "coral" | "blue")[] = ["cream", "mint", "coral", "blue"];
    return tones[index % tones.length];
  };

  const activeFilterOption = filterOptions.find((f) => f.value === activeFilter);

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
      <CustomerHeader title="My Orders" hideRightIcon={true} />

      <View className="flex-1 px-5 pb-6">
        {/* Search Bar & Dedicated Filter Button */}
        <View className="flex-row items-center gap-2.5 mb-4">
          <View
            className="flex-1 flex-row items-center px-3.5 bg-[#F8FAFC] shadow-xs"
            style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
          >
            <Ionicons name="search" size={19} color="#14919B" />
            <TextInput
              style={{ paddingVertical: 0 }}
              className="ml-2.5 flex-1 text-[13px] font-medium text-brand-dark"
              placeholder="Search by order ID, garment, tailor..."
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
            <Ionicons
              name="filter"
              size={21}
              color="#14919B"
            />
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
          <View className="flex-row items-center mb-3.5">
            <View className="flex-row items-center bg-[#E0F7F7] px-3 py-1.5 rounded-full">
              <Text className="text-[12px] font-semibold text-[#0D7377] mr-1.5">
                Status: {activeFilterOption?.badge || activeFilter}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveFilter(null)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close-circle" size={16} color="#0D7377" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Modal: Order Filter */}
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
                      Filter your orders by status
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
          <View className="flex-1 items-center justify-center py-20" style={{ minHeight: 380 }}>
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] font-medium text-brand-gray">
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
            <Text className="mt-1 text-[13px] font-medium text-brand-gray text-center mb-4">
              {error}
            </Text>
            <TouchableOpacity
              onPress={refresh}
              activeOpacity={0.7}
              className="px-5 py-2.5 rounded-md bg-primary"
            >
              <Text className="text-[13px] font-bold text-white tracking-wide">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12 px-4" style={{ minHeight: 420 }}>
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons
                name={searchQuery.trim() || activeFilter !== null ? "search-outline" : "bag-handle-outline"}
                size={38}
                color="#14919B"
              />
            </View>
            <Text className="text-[18px] font-bold text-brand-dark text-center tracking-tight">
              {searchQuery.trim() || activeFilter !== null
                ? "No Matching Orders"
                : "No Orders Yet"}
            </Text>
            <Text className="mt-2 text-[13px] font-medium text-brand-gray text-center leading-[20px] max-w-[280px] mb-6">
              {searchQuery.trim() || activeFilter !== null
                ? "No orders match your search or filter criteria. Try adjusting your query or resetting filters."
                : "You don't have any orders right now. Connect with expert tailors to create custom outfits!"}
            </Text>

            {searchQuery.trim() || activeFilter !== null ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery("");
                  setActiveFilter(null);
                  setSelectedFilter(null);
                }}
                className="h-[48px] px-6 rounded-md bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
              >
                <Text className="text-[13px] font-bold text-white tracking-wide">
                  Clear Filters
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/tailors" as never)}
                className="h-[48px] px-6 rounded-md bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
              >
                <Text className="text-[13px] font-bold text-white tracking-wide">
                  Explore Tailors
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="mt-1">
            {filteredOrders.map((order, index) => {
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

              const placedOnText = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })
                : undefined;

              return (
                <MainOrderCard
                  key={order.id || index}
                  id={order.orderNumber || order.id || `SD${1200 + index}`}
                  orderId={order.id}
                  item={order.itemName || "Custom Garment"}
                  tailor={order.tailorName || "Tailor"}
                  delivery={deliveryText}
                  placedOn={placedOnText}
                  price={`Rs ${order.price?.toLocaleString?.() || order.price || 0}`}
                  status={displayStatus}
                  image={order.imageUrl || order.image || defaultImages[index % defaultImages.length]}
                  tone={getTone(index)}
                  button={isDelivered ? "View Details" : isCancel ? "Order Details" : "Track Order"}
                />
              );
            })}
          </View>
        )}
      </View>
    </CustomerTabShell>
  );
}
