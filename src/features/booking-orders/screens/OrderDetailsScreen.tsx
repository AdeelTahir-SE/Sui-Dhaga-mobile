import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { ordersApi } from "@/api/orders.api";
import { apiClient } from "@/api/client";
import type { TailorItem } from "@/types/api";

export default function OrderDetailsScreen() {
  const { orderId, from } = useLocalSearchParams<{ orderId?: string; from?: string }>();
  const { order, isLoading, updateOrderStatus } = useOrderDetails(orderId || "");
  const currentUser = useAuthStore((state) => state.user);
  const [isActionLoading, setIsActionLoading] = useState<"accept" | "reject" | "complete" | null>(null);
  const [tailorInfo, setTailorInfo] = useState<TailorItem | null>(null);
  const [customerInfo, setCustomerInfo] = useState<{
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    avatarUrl?: string;
  } | null>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const currentOrderId = orderId || order?.id;

    // 1. Fetch parties from dedicated backend endpoint if orderId exists
    if (currentOrderId) {
      ordersApi
        .getOrderParties(currentOrderId)
        .then((res) => {
          if (!isMounted || !res.data) return;
          if (res.data.customer) {
            setCustomerInfo((prev) => ({
              ...prev,
              fullName: res.data?.customer?.fullName || prev?.fullName,
              phone: res.data?.customer?.phone || prev?.phone,
              address: res.data?.customer?.address || prev?.address,
              city: res.data?.customer?.city || prev?.city,
              avatarUrl: res.data?.customer?.avatarUrl || prev?.avatarUrl,
            }));
          }
          if (res.data.tailor) {
            const t = res.data.tailor;
            setTailorInfo((prev) => {
              const baseId = t.id || prev?.id || "";
              return {
                ...(prev || {}),
                id: baseId,
                name: t.name || prev?.name || t.shopName || "Tailor",
                shopName: t.shopName || prev?.shopName || "",
                rating: t.rating ?? prev?.rating ?? 0,
                reviewsCount: t.reviewCount ?? prev?.reviewsCount ?? 0,
                city: t.city || prev?.city || "",
                address: t.address || prev?.address || "",
                verified: t.verified ?? prev?.verified ?? false,
                specialties: t.specialties || prev?.specialties || [],
                phone: t.phone || prev?.phone || "",
              } as TailorItem;
            });
          }
        })
        .catch(() => {});
    }

    // 2. Resolve Customer details directly if customerId exists
    const clientId = order?.customerId || order?.customer_id || order?.customer?.id;
    if (clientId) {
      apiClient<any>(`/users/${clientId}`, { method: "GET" })
        .then((res) => {
          if (!isMounted || !res.data) return;
          const u = res.data;
          setCustomerInfo((prev) => ({
            ...prev,
            fullName: u.full_name || u.fullName || prev?.fullName,
            phone: u.phone || prev?.phone,
            address: u.address || prev?.address,
            city: u.city || (u.address ? u.address.split(",")[0].trim() : prev?.city),
            avatarUrl: u.avatar_url || u.avatarUrl || prev?.avatarUrl,
          }));
        })
        .catch(() => {});
    }

    // 3. Resolve Tailor details directly
    const tailorId = order?.tailorId || (order as any)?.tailor_id || (order?.tailor as any)?.id;
    if (tailorId) {
      tailorsApi
        .getTailorById(tailorId)
        .then((res) => {
          if (isMounted && res.data) {
            setTailorInfo((prev) => ({
              ...(prev || {}),
              ...res.data,
            }));
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
                if (found) {
                  setTailorInfo((prev) => ({
                    ...(prev || {}),
                    ...found,
                  }));
                }
              }
            })
            .catch(() => {});
        });
    }

    return () => {
      isMounted = false;
    };
  }, [orderId, order?.id, order?.tailorId, (order as any)?.tailor_id, order?.customerId, (order as any)?.customer_id]);

  if (isLoading) {
    return (
      <BookingOrdersScreenShell>
        <BookingOrdersHeader
          title="Order Details"
          titleClassName="text-[20px] font-black text-brand-dark tracking-tight"
        />
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
          titleClassName="text-[20px] font-black text-brand-dark tracking-tight"
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

  // Real Tailor Information
  const displayTailorName =
    (tailorInfo as any)?.profile?.full_name ||
    (tailorInfo as any)?.profile?.name ||
    tailorInfo?.name ||
    order?.tailor?.name ||
    (order?.tailor as any)?.profile?.full_name ||
    order?.tailorName ||
    (order as any)?.tailor_name ||
    tailorInfo?.shopName ||
    "Master Tailor";

  const displayShopName =
    tailorInfo?.shopName ||
    order?.tailor?.shopName ||
    (order?.tailor as any)?.shop_name ||
    tailorInfo?.businessName ||
    (order as any)?.tailorShopName ||
    (order as any)?.tailor_shop_name ||
    (displayTailorName.includes("Tailor") ? displayTailorName : `${displayTailorName}'s Studio`);

  const displayTailorAvatar =
    (tailorInfo as any)?.profile?.avatar_url ||
    (tailorInfo as any)?.profile?.avatarUrl ||
    tailorInfo?.bannerUrl ||
    (tailorInfo as any)?.banner_url ||
    tailorInfo?.avatar ||
    tailorInfo?.avatarUrl ||
    tailorInfo?.imageUrl ||
    tailorInfo?.image ||
    (order?.tailor as any)?.avatarUrl ||
    (order?.tailor as any)?.avatar_url ||
    (order as any)?.tailorAvatar ||
    (order as any)?.tailor_avatar ||
    null;

  const displayTailorPhone =
    (tailorInfo as any)?.profile?.phone ||
    tailorInfo?.phone ||
    (order?.tailor as any)?.phone ||
    (order?.tailor as any)?.profile?.phone ||
    (order as any)?.tailorPhone ||
    (order as any)?.tailor_phone ||
    "";

  const rawRating =
    tailorInfo?.rating ??
    (order?.tailor as any)?.rating ??
    (order as any)?.tailorRating ??
    (order as any)?.tailor_rating;
  const displayRating =
    rawRating !== undefined && rawRating !== null
      ? Number(rawRating).toFixed(1)
      : null;

  const rawReviews =
    tailorInfo?.reviewsCount ??
    (tailorInfo as any)?.review_count ??
    tailorInfo?.reviews ??
    (order?.tailor as any)?.reviewCount ??
    (order?.tailor as any)?.review_count ??
    (order as any)?.tailorReviewCount ??
    (order as any)?.tailor_review_count;
  const displayReviews =
    rawReviews !== undefined && rawReviews !== null
      ? Number(rawReviews)
      : null;

  const displaySpecialty =
    (tailorInfo?.specialties && tailorInfo.specialties.length > 0 && tailorInfo.specialties[0]) ||
    tailorInfo?.specialty ||
    ((order?.tailor as any)?.specialties && (order?.tailor as any).specialties.length > 0 && (order?.tailor as any).specialties[0]) ||
    (order as any)?.tailorSpecialty ||
    (order as any)?.tailor_specialty ||
    null;

  const displayLocation =
    tailorInfo?.city ||
    tailorInfo?.address ||
    (tailorInfo as any)?.profile?.address ||
    (order?.tailor as any)?.city ||
    (order?.tailor as any)?.address ||
    (order as any)?.tailorCity ||
    (order as any)?.tailor_city ||
    null;

  const isVerifiedTailor = Boolean(
    tailorInfo?.verified ||
    (tailorInfo as any)?.verification_status === "verified" ||
    (order?.tailor as any)?.verified ||
    (order as any)?.tailorVerified ||
    (order as any)?.tailor_verified
  );

  const displayTailorId =
    tailorInfo?.id || order?.tailorId || (order as any)?.tailor_id || "";

  // Real Customer Information
  const displayCustomerName =
    customerInfo?.fullName ||
    order?.customer?.fullName ||
    order?.customer?.full_name ||
    order?.customerName ||
    (order as any)?.customer_name ||
    (order as any)?.customer?.name ||
    "Client";

  const displayCustomerAvatar =
    customerInfo?.avatarUrl ||
    order?.customer?.avatarUrl ||
    order?.customer?.avatar_url ||
    order?.customerAvatar ||
    (order as any)?.customer_avatar ||
    null;

  const displayCustomerPhone =
    customerInfo?.phone ||
    order?.customer?.phone ||
    order?.customerPhone ||
    (order as any)?.customer_phone ||
    (order as any)?.phone ||
    "";

  const displayCustomerAddress =
    customerInfo?.address ||
    order?.customer?.address ||
    order?.customerAddress ||
    (order as any)?.customer_address ||
    (order as any)?.deliveryAddress ||
    (order as any)?.delivery_address ||
    "";

  const displayCustomerCity =
    customerInfo?.city ||
    order?.customer?.city ||
    order?.customerCity ||
    (order as any)?.customer_city ||
    (order as any)?.city ||
    (displayCustomerAddress ? displayCustomerAddress.split(",")[0].trim() : "");

  const handleMessageCustomer = () => {
    const clientId = order?.customerId || (order as any)?.customer_id || "";
    router.push({
      pathname: "/messages/[conversationId]",
      params: {
        conversationId: "new",
        tailorId: currentUser?.id,
        clientId: clientId,
        recipientId: clientId,
        name: displayCustomerName,
      },
    } as any);
  };

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
        titleClassName="text-[22px] font-black text-brand-dark tracking-tight"
      />
      <View className="px-5 pb-8">
        {/* Prominent Order Heading Block */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 mr-2">
                <Text className="text-[11px] font-black text-primary">ORDER</Text>
              </View>
              <Text className="text-[25px] font-black text-brand-dark tracking-tight flex-shrink" numberOfLines={1}>
                #{orderNumber}
              </Text>
            </View>
            <StatusPill
              label={status}
              tone={status === "Completed" ? "green" : status === "Cancelled" ? "red" : "gold"}
            />
          </View>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
            <Text className="text-[12px] font-medium text-brand-gray">
              Placed on {order?.createdAt || order?.created_at || "Recently"}
            </Text>
          </View>
        </View>

        {/* Main Garment Card (Clickable Preview) */}
        {(() => {
          const garmentImgUri = (designImages && designImages.length > 0 ? designImages[0] : (order?.imageUrl || order?.image));
          return (
            <View className="flex-row rounded-2xl border border-brand-border bg-white p-3.5 shadow-2xs">
              {garmentImgUri ? (
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => setPreviewImageUri(garmentImgUri)}
                  style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", position: "relative" }}
                >
                  <Image
                    source={{ uri: garmentImgUri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <View style={{ position: "absolute", bottom: 3, right: 3, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 8, padding: 2.5 }}>
                    <Ionicons name="expand" size={11} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ) : (
                <View className="w-[72px] h-[72px] rounded-xl border border-primary/20 bg-primary-50 items-center justify-center p-1">
                  <View className="w-8 h-8 rounded-full bg-primary/15 items-center justify-center mb-1">
                    <Ionicons name="shirt-outline" size={17} color="#14919B" />
                  </View>
                  <Text className="text-[10px] font-extrabold text-primary">
                    {(itemName || "O").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="ml-3.5 flex-1 justify-center">
                <Text className="text-[15px] font-bold text-brand-dark" numberOfLines={1}>
                  {itemName}
                </Text>
                <Text className="mt-1 text-[12px] font-medium text-brand-gray" numberOfLines={1}>
                  {isTailor ? `Client: ${displayCustomerName}` : `Tailor: ${displayTailorName}`}
                </Text>
                <Text className="mt-1.5 text-[15px] font-black text-primary">
                  {price}
                </Text>
              </View>
            </View>
          );
        })()}

        <Text className="mt-3 text-[11px] text-brand-gray">
          Est. Delivery: {delivery}
        </Text>

        {/* Attached Design Images Gallery (Clickable Previews) */}
        {designImages && designImages.length > 0 && (
          <View className="mt-5">
            <View className="flex-row items-center justify-between mb-2">
              <SectionLabel title={`Attached Design Images (${designImages.length})`} />
              <Text className="text-[11px] text-primary font-medium">Tap to view full</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {designImages.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.85}
                  onPress={() => setPreviewImageUri(uri)}
                  style={{
                    width: 95,
                    height: 95,
                    borderRadius: 14,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    position: "relative",
                  }}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      backgroundColor: "rgba(15, 23, 42, 0.65)",
                      borderRadius: 10,
                      padding: 4,
                    }}
                  >
                    <Ionicons name="expand" size={12} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
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
            {isTailor ? (
              // TAILOR VIEW: SHOW CUSTOMER DETAILS
              <>
                <SectionLabel title="Customer Details" />
                <View className="rounded-xl border border-brand-border p-3.5 bg-white shadow-2xs">
                  <View className="flex-row items-center">
                    {displayCustomerAvatar ? (
                      <Image
                        source={{ uri: displayCustomerAvatar }}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 items-center justify-center">
                        <Ionicons name="person" size={20} color="#2563EB" />
                      </View>
                    )}
                    <View className="ml-2.5 flex-1">
                      <Text className="text-[13px] font-bold text-brand-dark" numberOfLines={1}>
                        {displayCustomerName}
                      </Text>
                      <View className="flex-row items-center mt-0.5">
                        <View className="bg-blue-50 px-1.5 py-0.5 rounded">
                          <Text className="text-[10px] font-bold text-blue-700">Client</Text>
                        </View>
                        {displayCustomerCity ? (
                          <Text className="text-[10px] text-brand-gray ml-1.5 flex-1" numberOfLines={1}>
                            • {displayCustomerCity}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  {displayCustomerPhone ? (
                    <View className="mt-2.5 flex-row items-center border-t border-slate-100 pt-2">
                      <Ionicons name="call-outline" size={12} color="#64748B" />
                      <Text className="ml-1.5 text-[11px] font-medium text-brand-gray">
                        {displayCustomerPhone}
                      </Text>
                    </View>
                  ) : null}

                  {displayCustomerAddress ? (
                    <View className="mt-1.5 flex-row items-center">
                      <Ionicons name="location-outline" size={12} color="#64748B" />
                      <Text className="ml-1.5 text-[11px] font-medium text-brand-gray" numberOfLines={1}>
                        {displayCustomerAddress}
                      </Text>
                    </View>
                  ) : null}

                  {/* Message Button for Tailor */}
                  <TouchableOpacity
                    onPress={handleMessageCustomer}
                    activeOpacity={0.8}
                    className="mt-3 h-9 rounded-lg bg-primary items-center justify-center flex-row overflow-hidden relative shadow-xs"
                  >
                    <ButtonTexture variant="greenish" borderRadius={8} />
                    <Ionicons name="chatbubble-ellipses" size={13} color="#FFFFFF" style={{ marginRight: 5, zIndex: 1 }} />
                    <Text className="text-[11px] font-bold text-white" style={{ zIndex: 1 }}>
                      Message Customer
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // CUSTOMER VIEW: SHOW TAILOR DETAILS
              <>
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

                  {(displayRating !== null || isVerifiedTailor) ? (
                    <View className="mt-2.5 flex-row items-center justify-between border-t border-slate-100 pt-2">
                      {displayRating !== null ? (
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={13} color="#F59E0B" />
                          <Text className="ml-1 text-[11px] font-bold text-brand-dark">
                            {displayRating}
                          </Text>
                          {displayReviews !== null ? (
                            <Text className="ml-0.5 text-[10px] text-brand-gray">
                              ({displayReviews})
                            </Text>
                          ) : null}
                        </View>
                      ) : (
                        <View className="flex-row items-center">
                          <Text className="text-[11px] font-medium text-brand-gray">New Tailor</Text>
                        </View>
                      )}

                      {isVerifiedTailor ? (
                        <View className="flex-row items-center bg-[#E0F7F7] px-1.5 py-0.5 rounded">
                          <Ionicons name="shield-checkmark" size={11} color="#0D7377" />
                          <Text className="ml-1 text-[10px] font-bold text-[#0D7377]">
                            Verified
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

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

                  {displayTailorPhone ? (
                    <View className="mt-1 flex-row items-center">
                      <Ionicons name="call-outline" size={11} color="#64748B" />
                      <Text className="ml-1 text-[11px] font-medium text-brand-gray" numberOfLines={1}>
                        {displayTailorPhone}
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
              </>
            )}

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

        {/* Fullscreen Image Preview Modal */}
        <Modal
          visible={Boolean(previewImageUri)}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPreviewImageUri(null)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.92)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => setPreviewImageUri(null)}
              activeOpacity={0.8}
              style={{
                position: "absolute",
                top: 48,
                right: 20,
                zIndex: 10,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            {previewImageUri && (
              <Image
                source={{ uri: previewImageUri }}
                style={{ width: "92%", height: "75%" }}
                contentFit="contain"
                transition={200}
              />
            )}
          </View>
        </Modal>
      </View>
    </BookingOrdersScreenShell>
  );
}
