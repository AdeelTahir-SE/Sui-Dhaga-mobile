import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
import { ButtonTexture } from "@/components/ui/ButtonTexture";
import { tailorsApi } from "@/api/tailors.api";
import type { TailorItem } from "@/types/api";

export default function OrderDetailsScreen() {
  const { orderId, from } = useLocalSearchParams<{ orderId?: string; from?: string }>();
  const { order, isLoading, updateOrderStatus } = useOrderDetails(orderId || "");
  const currentUser = useAuthStore((state) => state.user);
  const [isActionLoading, setIsActionLoading] = useState<"accept" | "reject" | "complete" | null>(null);
  const [tailorInfo, setTailorInfo] = useState<TailorItem | null>(null);

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

  if (!order) {
    return (
      <BookingOrdersScreenShell>
        <BookingOrdersHeader
          title="Order Details"
          leftIcon="arrow-back"
          onPressLeft={() => router.back()}
        />
        <View className="flex-1 items-center justify-center py-8 px-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Ionicons name="receipt-outline" size={32} color="#14919B" />
          </View>
          <Text className="text-[18px] font-bold text-brand-dark text-center">
            Order Not Found
          </Text>
          <Text className="mt-2 text-center text-[13px] font-medium text-brand-gray max-w-[280px]">
            No orders found with this reference. Start a new custom tailoring order with an expert tailor.
          </Text>
          <View className="mt-6 w-full max-w-[260px] gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/tailors" as any)}
              className="h-[48px] rounded-xl bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
            >
              <Text className="text-[13px] font-bold text-white">
                Create New Order
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/orders" as any)}
              className="h-[48px] rounded-xl border border-brand-border bg-white items-center justify-center"
            >
              <Text className="text-[13px] font-bold text-brand-dark">
                Back to Orders
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BookingOrdersScreenShell>
    );
  }

  const orderNumber = order?.orderNumber || order?.id || orderId || "—";
  const itemName = order?.itemName || order?.item_name || "Custom Tailored Outfit";
  const tailorName = order?.tailorName || "Tailor";
  const rawPrice = order?.totalAmount ?? order?.total_amount ?? order?.price ?? 0;
  const price = rawPrice ? `₹${rawPrice.toLocaleString("en-IN")}` : "₹0";
  const delivery = order?.deliveryDate || order?.delivery_date || "Pending Confirmation";
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

  useEffect(() => {
    const tailorId = order?.tailorId || order?.tailor_id;
    if (!tailorId) return;

    let isMounted = true;
    tailorsApi
      .getTailorById(tailorId)
      .then((res) => {
        if (isMounted && res.data) {
          setTailorInfo(res.data);
        }
      })
      .catch(() => {
        tailorsApi
          .getTailors({ limit: 50 })
          .then((allRes) => {
            if (isMounted && allRes.data) {
              const found = allRes.data.find(
                (t) => t.id === tailorId || t.userId === tailorId
              );
              if (found) setTailorInfo(found);
            }
          })
          .catch(() => {});
      });

    return () => {
      isMounted = false;
    };
  }, [order?.tailorId, order?.tailor_id]);

  const displayTailorName =
    tailorInfo?.name || tailorInfo?.shopName || order?.tailorName || "Master Tailor";
  const displayShopName =
    tailorInfo?.shopName ||
    tailorInfo?.businessName ||
    (displayTailorName.includes("Tailor") ? displayTailorName : `${displayTailorName}'s Studio`);
  const displayTailorAvatar =
    tailorInfo?.avatar || tailorInfo?.avatarUrl || tailorInfo?.imageUrl || tailorInfo?.image || null;
  const displayRating =
    tailorInfo?.rating ? Number(tailorInfo.rating).toFixed(1) : "4.9";
  const displayReviews =
    tailorInfo?.reviewsCount ?? tailorInfo?.reviews ?? 28;
  const displaySpecialty =
    tailorInfo?.specialty || (tailorInfo?.specialties && tailorInfo.specialties[0]) || "Custom Tailoring";
  const displayLocation =
    tailorInfo?.city || tailorInfo?.address || "Available for fittings";
  const displayTailorId =
    tailorInfo?.id || order?.tailorId || order?.tailor_id || "";

  const handleMessage = () => {
    const targetUserId = order?.tailorId || order?.tailor_id || "";
    router.push({
      pathname: "/messages/[conversationId]",
      params: {
        conversationId: "new",
        tailorId: targetUserId,
        clientId: currentUser?.id,
        recipientId: targetUserId,
        name: displayTailorName,
      },
    } as any);
  };

  const isTailor =
    from === "tailor" ||
    currentUser?.role === "tailor" ||
    Boolean(order?.tailorId && currentUser?.id && order.tailorId === currentUser.id);

  const normStatus = (status || "pending").toLowerCase();
  const isPending =
    normStatus === "pending" || normStatus === "new" || normStatus === "requested";
  const isInProgress =
    normStatus === "in progress" ||
    normStatus === "in_progress" ||
    normStatus === "confirmed" ||
    normStatus === "accepted" ||
    normStatus === "processing";

  const handleAcceptOrder = async () => {
    setIsActionLoading("accept");
    try {
      await updateOrderStatus("In Progress");
      Alert.alert("Order Accepted", `"${itemName}" is now in progress.`);
    } catch {
      Alert.alert("Error", "Could not accept order. Please try again.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleRejectOrder = () => {
    Alert.alert(
      "Reject Order Request",
      `Are you sure you want to decline the order request for "${itemName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setIsActionLoading("reject");
            try {
              await updateOrderStatus("Cancelled");
              Alert.alert("Order Declined", `The order request for "${itemName}" was declined.`);
            } catch {
              Alert.alert("Error", "Could not decline order. Please try again.");
            } finally {
              setIsActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleCompleteOrder = async () => {
    setIsActionLoading("complete");
    try {
      await updateOrderStatus("Completed");
      Alert.alert("Order Completed", `"${itemName}" has been marked as completed.`);
    } catch {
      Alert.alert("Error", "Could not update order status. Please try again.");
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <BookingOrdersScreenShell>
      <BookingOrdersHeader
        title="Order Details"
        leftIcon="arrow-back"
        onPressLeft={() => router.back()}
        hideRightIcon={true}
        titleClassName="text-[20px] font-black text-brand-dark tracking-tight"
      />
      <View className="px-5 pb-8">
        <View className="mb-4 flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-[23px] font-black text-brand-dark tracking-tight">
              Order #{orderNumber}
            </Text>
            <View className="mt-1 flex-row items-center">
              <Ionicons name="calendar-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
              <Text className="text-[12px] font-medium text-brand-gray">
                {order?.createdAt || order?.created_at || "Placed Recently"}
              </Text>
            </View>
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
            <View className="rounded-xl border border-brand-border p-3.5 bg-white shadow-2xs">
              <View className="flex-row items-center">
                {displayTailorAvatar ? (
                  <Image
                    source={{ uri: displayTailorAvatar }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 items-center justify-center">
                    <Ionicons name="cut-outline" size={20} color="#14919B" />
                  </View>
                )}
                <View className="ml-2.5 flex-1">
                  <Text className="text-[13px] font-bold text-brand-dark" numberOfLines={1}>
                    {displayTailorName}
                  </Text>
                  <Text className="text-[11px] font-medium text-brand-gray" numberOfLines={1}>
                    {displayShopName}
                  </Text>
                </View>
              </View>

              <View className="mt-2.5 flex-row items-center justify-between border-t border-slate-100 pt-2">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text className="ml-1 text-[11px] font-bold text-brand-dark">
                    {displayRating}
                  </Text>
                  <Text className="ml-0.5 text-[10px] text-brand-gray">
                    ({displayReviews})
                  </Text>
                </View>
                <View className="flex-row items-center bg-[#E0F7F7] px-1.5 py-0.5 rounded">
                  <Ionicons name="shield-checkmark" size={11} color="#0D7377" />
                  <Text className="ml-1 text-[10px] font-bold text-[#0D7377]">
                    Verified
                  </Text>
                </View>
              </View>

              {displaySpecialty ? (
                <View className="mt-2 flex-row items-center">
                  <Ionicons name="sparkles-outline" size={11} color="#64748B" />
                  <Text className="ml-1 text-[11px] font-medium text-brand-gray" numberOfLines={1}>
                    {displaySpecialty}
                  </Text>
                </View>
              ) : null}

              {displayLocation ? (
                <View className="mt-1 flex-row items-center">
                  <Ionicons name="location-outline" size={11} color="#64748B" />
                  <Text className="ml-1 text-[11px] font-medium text-brand-gray" numberOfLines={1}>
                    {displayLocation}
                  </Text>
                </View>
              ) : null}

              <View className="mt-3 flex-row gap-2">
                <TouchableOpacity
                  onPress={handleMessage}
                  className="flex-1 h-8 rounded-lg bg-[#E0F7F7] items-center justify-center flex-row"
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={12} color="#0D7377" style={{ marginRight: 3 }} />
                  <Text className="text-[11px] font-bold text-[#0D7377]">Message</Text>
                </TouchableOpacity>

                {displayTailorId ? (
                  <TouchableOpacity
                    onPress={() => router.push(`/tailors/${displayTailorId}` as any)}
                    className="flex-1 h-8 rounded-lg border border-brand-border bg-white items-center justify-center flex-row"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-outline" size={12} color="#334155" style={{ marginRight: 3 }} />
                    <Text className="text-[11px] font-bold text-brand-dark">Profile</Text>
                  </TouchableOpacity>
                ) : null}
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

        {/* Tailor Action Section */}
        {isTailor && isPending && (
          <View className="mt-5 rounded-2xl bg-white border border-brand-border p-4 shadow-sm">
            <Text className="text-[14px] font-bold text-brand-dark mb-1">
              Order Request Action
            </Text>
            <Text className="text-[12px] text-brand-gray mb-3.5">
              Review garment specifications, measurements, and customer notes before accepting or declining this order.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleRejectOrder}
                disabled={Boolean(isActionLoading)}
                activeOpacity={0.8}
                style={{
                  height: 46,
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isActionLoading ? 0.6 : 1,
                }}
              >
                {isActionLoading === "reject" ? (
                  <ActivityIndicator size="small" color="#1A1D1F" />
                ) : (
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>
                    Reject Order
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAcceptOrder}
                disabled={Boolean(isActionLoading)}
                activeOpacity={0.8}
                style={{
                  height: 46,
                  flex: 1,
                  backgroundColor: "#078B87",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                  opacity: isActionLoading ? 0.6 : 1,
                }}
              >
                <ButtonTexture variant="greenish" borderRadius={12} />
                {isActionLoading === "accept" ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ zIndex: 1 }} />
                ) : (
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF", zIndex: 1 }}>
                    Accept Order
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isTailor && isInProgress && (
          <View className="mt-5 rounded-2xl bg-white border border-brand-border p-4 shadow-sm">
            <Text className="text-[14px] font-bold text-brand-dark mb-1">
              Order in Progress
            </Text>
            <Text className="text-[12px] text-brand-gray mb-3.5">
              Once tailoring and finishing are complete, mark this order as finished for the client.
            </Text>
            <TouchableOpacity
              onPress={handleCompleteOrder}
              disabled={Boolean(isActionLoading)}
              activeOpacity={0.8}
              style={{
                height: 46,
                backgroundColor: "#078B87",
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
                opacity: isActionLoading ? 0.6 : 1,
              }}
            >
              <ButtonTexture variant="greenish" borderRadius={12} />
              {isActionLoading === "complete" ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ zIndex: 1 }} />
              ) : (
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF", zIndex: 1 }}>
                  Mark as Completed
                </Text>
              )}
            </TouchableOpacity>
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
