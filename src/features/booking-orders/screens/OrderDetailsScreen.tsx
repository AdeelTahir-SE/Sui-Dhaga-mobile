import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
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

  const orderNumber = order?.orderNumber || order?.id || orderId || "#ORD12345";
  const itemName = order?.itemName || order?.item_name || "Custom Tailored Outfit";
  const tailorName = order?.tailorName || "Master Tailor";
  const rawPrice = order?.totalAmount ?? order?.total_amount ?? order?.price ?? 0;
  const price = rawPrice ? `₹${rawPrice.toLocaleString("en-IN")}` : "₹18,900";
  const delivery = order?.deliveryDate || order?.delivery_date || "Expected Soon";
  const status = order?.status || "Pending";
  const designImages = order?.designImages || order?.design_images || [];
  const measurements = order?.measurements || {};
  const additionalNotes = order?.additionalNotes || order?.additional_notes || "";
  const notes = order?.notes || "";

  const hasMeasurements =
    measurements &&
    typeof measurements === "object" &&
    Object.keys(measurements).length > 0 &&
    (measurements.chest || measurements.waist || measurements.hips || measurements.shoulder);

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

  if (isLoading) {
    return (
      <BookingOrdersScreenShell>
        <BookingOrdersHeader title="Order Details" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
          <ActivityIndicator size="large" color="#14919B" />
          <Text style={{ marginTop: 12, fontSize: 13, color: "#6F767E" }}>Loading order details...</Text>
        </View>
      </BookingOrdersScreenShell>
    );
  }

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
              {order?.createdAt || order?.created_at || "Placed Recently"}
            </Text>
          </View>
          <StatusPill
            label={status}
            tone={status === "Completed" ? "green" : status === "Cancelled" ? "red" : "gold"}
          />
        </View>

        {/* Main Garment Card */}
        <View className="flex-row rounded-xl border border-brand-border bg-white p-3">
          {(designImages && designImages.length > 0 ? designImages[0] : (order?.imageUrl || order?.image)) ? (
            <Image
              source={{ uri: (designImages && designImages.length > 0 ? designImages[0] : (order?.imageUrl || order?.image)) }}
              style={{ width: 70, height: 70, borderRadius: 10 }}
              contentFit="cover"
            />
          ) : (
            <View className="w-[70px] h-[70px] rounded-xl border border-primary/20 bg-primary-50 items-center justify-center p-1">
              <View className="w-8 h-8 rounded-full bg-primary/15 items-center justify-center mb-1">
                <Ionicons name="shirt-outline" size={17} color="#14919B" />
              </View>
              <Text className="text-[10px] font-extrabold text-primary">
                {(itemName || "O").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-[14px] font-bold text-brand-dark">
              {itemName}
            </Text>
            <Text className="mt-1 text-[11px] text-brand-gray">
              {tailorName}
            </Text>
            <Text className="mt-2 text-[14px] font-extrabold text-primary">
              {price}
            </Text>
          </View>
        </View>

        <Text className="mt-3 text-[11px] text-brand-gray">
          Est. Delivery: {delivery}
        </Text>

        {/* Attached Design Images Gallery */}
        {designImages && designImages.length > 0 && (
          <View className="mt-5">
            <SectionLabel title={`Attached Design Images (${designImages.length})`} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {designImages.map((uri, idx) => (
                <View key={idx} style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#EAE5DD" }}>
                  <Image
                    source={{ uri }}
                    style={{ width: 95, height: 95 }}
                    contentFit="cover"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Custom Measurements Card */}
        {hasMeasurements && (
          <View className="mt-5">
            <View className="flex-row items-center justify-between mb-2">
              <SectionLabel title="Custom Garment Measurements" />
              <View style={{ backgroundColor: "#E0F7F7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#14919B" }}>
                  Unit: {measurements.unit || "in"}
                </Text>
              </View>
            </View>
            <View className="rounded-xl border border-brand-border bg-white p-3">
              <View className="flex-row flex-wrap">
                {measurements.chest != null && (
                  <View style={{ width: "50%", marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, color: "#6F767E", fontWeight: "600" }}>CHEST / BUST</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>{measurements.chest} {measurements.unit || "in"}</Text>
                  </View>
                )}
                {measurements.waist != null && (
                  <View style={{ width: "50%", marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, color: "#6F767E", fontWeight: "600" }}>WAIST</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>{measurements.waist} {measurements.unit || "in"}</Text>
                  </View>
                )}
                {measurements.hips != null && (
                  <View style={{ width: "50%", marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, color: "#6F767E", fontWeight: "600" }}>HIPS</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>{measurements.hips} {measurements.unit || "in"}</Text>
                  </View>
                )}
                {measurements.shoulder != null && (
                  <View style={{ width: "50%", marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, color: "#6F767E", fontWeight: "600" }}>SHOULDER</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>{measurements.shoulder} {measurements.unit || "in"}</Text>
                  </View>
                )}
                {measurements.sleeveLength != null && (
                  <View style={{ width: "50%", marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, color: "#6F767E", fontWeight: "600" }}>SLEEVE LENGTH</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>{measurements.sleeveLength} {measurements.unit || "in"}</Text>
                  </View>
                )}
                {measurements.inseam != null && (
                  <View style={{ width: "50%", marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, color: "#6F767E", fontWeight: "600" }}>INSEAM</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>{measurements.inseam} {measurements.unit || "in"}</Text>
                  </View>
                )}
                {measurements.neck != null && (
                  <View style={{ width: "50%", marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, color: "#6F767E", fontWeight: "600" }}>NECK</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>{measurements.neck} {measurements.unit || "in"}</Text>
                  </View>
                )}
                {measurements.shirtLength != null && (
                  <View style={{ width: "50%", marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, color: "#6F767E", fontWeight: "600" }}>SHIRT LENGTH</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>{measurements.shirtLength} {measurements.unit || "in"}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <View className="mt-5 flex-row gap-4">
          <View className="flex-1">
            <SectionLabel title="Tracking Timeline" />
            <TimelineItem
              title="Order Placed"
              subtitle="Received by tailor"
              complete
            />
            <TimelineItem
              title="Measurements Confirmed"
              subtitle={hasMeasurements ? "Custom fit recorded" : "Pending confirmation"}
              complete={Boolean(hasMeasurements)}
            />
            <TimelineItem
              title="Stitching in Progress"
              subtitle="Master tailoring"
              complete={status === "In Progress" || status === "Completed"}
            />
            <TimelineItem
              title="Quality Check & Finish"
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
              <InfoRow label="Garment Total" value={price} />
              <InfoRow label="Custom Fit" value="Included" />
              <InfoRow label="Protection Fee" value="Included" />
              <View className="mt-2 border-t border-brand-border pt-2">
                <InfoRow label="Total Amount" value={price} highlight />
              </View>
              <View className="mt-1 self-start">
                <StatusPill label="Confirmed" tone="green" />
              </View>
            </View>
          </View>
        </View>

        {/* Additional Notes & Instructions */}
        {(additionalNotes || notes) && (
          <View className="mt-5">
            <SectionLabel title="Order Notes & Special Instructions" />
            <View className="rounded-xl border border-brand-border p-4 bg-white">
              {additionalNotes ? (
                <Text className="text-[12px] text-brand-dark leading-relaxed">
                  {additionalNotes}
                </Text>
              ) : null}
              {notes && notes !== additionalNotes ? (
                <Text className="mt-2 text-[11px] text-brand-gray whitespace-pre-line leading-relaxed">
                  {notes}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        <View className="mt-5 rounded-xl bg-brand-surface p-4">
          <View className="flex-row">
            <Ionicons name="headset-outline" size={22} color="#1A1D1F" />
            <View className="ml-3 flex-1">
              <Text className="text-[13px] font-semibold text-brand-dark">
                Need Help with Your Order?
              </Text>
              <Text className="mt-1 text-[11px] text-brand-gray">
                Our support team and master tailors are here for you.
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
