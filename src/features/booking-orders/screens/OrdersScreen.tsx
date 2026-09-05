import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";

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

  const getTone = (index: number) => {
    const tones: ("coral" | "teal" | "gold" | "blue")[] = ["coral", "teal", "gold", "blue"];
    return tones[index % tones.length];
  };

  const activeOrders = orders.filter((o) => o.status === "In Progress" || o.status === "Confirmed" || o.status === "Pending");
  const completedOrders = orders.filter((o) => o.status === "Completed");
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled");

  return (
    <BookingOrdersScreenShell bottomTabs={<BottomTabsPreview active="Orders" />}>
      <BookingOrdersHeader
        title="My Orders"
        leftIcon="menu"
        rightIcon="notifications-outline"
        rightLabel="Notifications"
      />
      <View className="px-5 pb-8">
        <SegmentedTabs
          tabs={[
            `Active (${activeOrders.length})`,
            `Completed (${completedOrders.length})`,
            `Cancelled (${cancelledOrders.length})`,
          ]}
        />

        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        ) : (
          <>
            <SectionLabel title="Active Orders" />
            {activeOrders.map((order, index) => (
              <OrderCard
                key={order.id || index}
                id={order.orderNumber || order.id || `ORD${index + 1000}`}
                item={order.itemName || "Custom Outfit"}
                tailor={order.tailorName || "Tailor"}
                placedOn={order.createdAt || "Recent"}
                price={`₹${order.price?.toLocaleString?.() || order.price || 0}`}
                delivery={order.deliveryDate || "In Progress"}
                status={order.status === "Confirmed" ? "Confirmed" : "In Progress"}
                statusTone={order.status === "Confirmed" ? "blue" : undefined}
                placeholderTone={getTone(index)}
              />
            ))}

            <SectionLabel title="Completed Orders" />
            {completedOrders.length > 0 ? (
              completedOrders.map((order, index) => (
                <OrderCard
                  key={order.id || index}
                  id={order.orderNumber || order.id}
                  item={order.itemName}
                  tailor={order.tailorName || "Tailor"}
                  placedOn={order.createdAt || "Completed"}
                  price={`₹${order.price?.toLocaleString?.() || order.price || 0}`}
                  delivery="Delivered"
                  status="Delivered"
                  statusTone="green"
                  buttonLabel="View Details"
                  placeholderTone={getTone(index + 2)}
                />
              ))
            ) : (
              <OrderCard
                id="ORD12320"
                item="Saree Stitching"
                tailor="Noor & Thread"
                placedOn="10 May 2024"
                price="₹4,200"
                delivery="Delivered"
                status="Delivered"
                statusTone="green"
                buttonLabel="View Details"
                placeholderTone="gold"
              />
            )}

            <SectionLabel title="Cancelled Orders" />
            {cancelledOrders.length > 0 ? (
              cancelledOrders.map((order, index) => (
                <OrderCard
                  key={order.id || index}
                  id={order.orderNumber || order.id}
                  item={order.itemName}
                  tailor={order.tailorName || "Tailor"}
                  placedOn={order.createdAt || "Cancelled"}
                  price={`₹${order.price?.toLocaleString?.() || order.price || 0}`}
                  delivery="Cancelled"
                  status="Cancelled"
                  statusTone="red"
                  buttonLabel="View Details"
                  placeholderTone="blue"
                />
              ))
            ) : (
              <OrderCard
                id="ORD12310"
                item="Blouse Stitching"
                tailor="Ethnic Weaves"
                placedOn="08 May 2024"
                price="₹1,200"
                delivery="Cancelled"
                status="Cancelled"
                statusTone="red"
                buttonLabel="View Details"
                placeholderTone="blue"
              />
            )}
          </>
        )}
      </View>
    </BookingOrdersScreenShell>
  );
}
