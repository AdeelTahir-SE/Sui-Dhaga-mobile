import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { InfoRow } from "../components/InfoRow";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { SectionLabel } from "../components/SectionLabel";
import { StatusPill } from "../components/StatusPill";
import { TimelineItem } from "../components/TimelineItem";
import { useOrderDetails } from "../hooks/useOrders";
import { conversationsApi } from "@/api/conversations.api";
import { useAuthStore } from "@/stores/auth.store";

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { order, isLoading } = useOrderDetails(orderId || "1");
  const currentUser = useAuthStore((state) => state.user);

  const orderNumber = order?.orderNumber || orderId || "#ORD12345";
  const itemName = order?.itemName || "Custom Lehenga";
  const tailorName = order?.tailorName || "Rekha Tailors";
  const price = order?.price ? `₹${order.price.toLocaleString()}` : "₹18,900";
  const delivery = order?.deliveryDate || "Expected Soon";
  const status = order?.status || "In Progress";

  const handleMessage = () => {
    const targetUserId = order?.tailorId || "";
    router.push({
      pathname: "/messages/[conversationId]",
      params: {
        conversationId: "new",
        tailorId: targetUserId,
        clientId: currentUser?.id,
        recipientId: targetUserId,
        name: tailorName,
      },
    } as any);
  };

  return (
    <BookingOrdersScreenShell>
      <BookingOrdersHeader title="Order Details" />
      <View className="px-5 pb-8">
        <View className="mb-4 flex-row items-start justify-between">
          <View>
            <Text className="text-[17px] font-bold text-brand-dark">
              Order {orderNumber}
            </Text>
            <Text className="mt-1 text-[11px] text-brand-gray">
              {order?.createdAt || "Placed Recently"}
            </Text>
          </View>
          <StatusPill label={status} tone={status === "Completed" ? "green" : "gold"} />
        </View>

        <View className="flex-row rounded-xl border border-brand-border bg-white p-3">
          <PlaceholderImage image={order?.image || order?.imageUrl} variant="garment" size="md" tone="coral" />
          <View className="ml-3 flex-1">
            <Text className="text-[13px] font-semibold text-brand-dark">
              {itemName}
            </Text>
            <Text className="mt-1 text-[11px] text-brand-gray">
              {tailorName}
            </Text>
            <Text className="mt-2 text-[13px] font-bold text-brand-dark">
              {price}
            </Text>
          </View>
        </View>
        <Text className="mt-3 text-[11px] text-brand-gray">
          Est. Delivery: {delivery}
        </Text>

        <View className="mt-5 flex-row gap-4">
          <View className="flex-1">
            <SectionLabel title="Tracking Timeline" />
            <TimelineItem
              title="Order Confirmed"
              subtitle="Confirmed by tailor"
              complete
            />
            <TimelineItem
              title="Fabric Received"
              subtitle="Material ready"
              complete
            />
            <TimelineItem
              title="Stitching in Progress"
              subtitle="Master tailoring"
              complete={status === "In Progress" || status === "Completed"}
            />
            <TimelineItem
              title="Quality Check"
              subtitle={status === "Completed" ? "Passed" : "Pending"}
              complete={status === "Completed"}
            />
            <TimelineItem
              title="Ready for Delivery"
              subtitle={status === "Completed" ? "Delivered" : "Pending"}
              complete={status === "Completed"}
            />
          </View>

          <View className="flex-1">
            <SectionLabel title="Tailor Information" />
            <View className="rounded-xl border border-brand-border p-3 bg-white">
              <PlaceholderImage size="sm" tone="coral" />
              <Text className="mt-3 text-[13px] font-semibold text-brand-dark">
                {tailorName}
              </Text>
              <View className="mt-1 flex-row items-center">
                <Ionicons name="star" size={12} color="#F4B400" />
                <Text className="ml-1 text-[11px] text-brand-dark">
                  4.8 (128)
                </Text>
              </View>
              <Text className="mt-1 text-[11px] text-brand-gray">
                C-Scheme, Jaipur
              </Text>
              <View className="mt-3 flex-row justify-between">
                <TouchableOpacity onPress={handleMessage}>
                  <Text className="text-[11px] font-medium text-primary">Message</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push(`/tailors/${order?.tailorId || "1"}` as any)}>
                  <Text className="text-[11px] font-medium text-primary">Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            <SectionLabel title="Payment Summary" />
            <View className="rounded-xl bg-brand-surface p-3">
              <InfoRow label="Item Total" value={price} />
              <InfoRow label="Customization" value="Included" />
              <InfoRow label="Delivery Charges" value="Free" />
              <View className="mt-2 border-t border-brand-border pt-2">
                <InfoRow label="Total Paid" value={price} highlight />
              </View>
              <View className="mt-1 self-start">
                <StatusPill label="Paid" tone="green" />
              </View>
            </View>
          </View>
        </View>

        <SectionLabel title="Order Details" />
        <View className="rounded-xl border border-brand-border px-4 py-2 bg-white">
          <InfoRow label="Fabric" value="Silk & Georgette" />
          <InfoRow label="Color" value="Pastel Peach" />
          <InfoRow label="Size" value="Custom Measurement" />
          <InfoRow label="Work" value="Hand Embroidery" />
        </View>

        <View className="mt-5 rounded-xl bg-brand-surface p-4">
          <View className="flex-row">
            <Ionicons name="headset-outline" size={22} color="#1A1D1F" />
            <View className="ml-3 flex-1">
              <Text className="text-[13px] font-semibold text-brand-dark">
                Need Help?
              </Text>
              <Text className="mt-1 text-[11px] text-brand-gray">
                Our support team is here for you.
              </Text>
            </View>
          </View>
          <TouchableOpacity className="mt-4 h-[42px] items-center justify-center rounded-xl bg-white border border-brand-border">
            <Text className="text-[13px] font-semibold text-primary">
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BookingOrdersScreenShell>
  );
}
