import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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
import { SectionLabel } from "../components/SectionLabel";
import { StatusPill } from "../components/StatusPill";
import { useAppointmentDetails } from "../hooks/useAppointments";
import { useAuthStore } from "@/stores/auth.store";
import { ButtonTexture } from "@/components/ui/ButtonTexture";
import { tailorsApi } from "@/api/tailors.api";
import type { TailorItem } from "@/types/api";

export default function AppointmentDetailsScreen() {
  const { appointmentId, from } = useLocalSearchParams<{
    appointmentId?: string;
    from?: string;
  }>();

  const {
    appointment,
    isLoading,
    error,
    cancelAppointment,
    updateStatus,
  } = useAppointmentDetails(appointmentId);

  const currentUser = useAuthStore((state) => state.user);
  const [isActionLoading, setIsActionLoading] = useState<
    "accept" | "reject" | "complete" | "cancel" | null
  >(null);
  const [tailorInfo, setTailorInfo] = useState<TailorItem | null>(null);

  // Fetch complete tailor details if tailorId is known
  useEffect(() => {
    const tId =
      appointment?.tailorId ||
      appointment?.tailor_id ||
      appointment?.tailor?.id ||
      appointment?.tailor?._id;

    if (!tId) return;

    let isMounted = true;
    tailorsApi
      .getTailorById(tId)
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
                (t) => t.id === tId || t.userId === tId
              );
              if (found) setTailorInfo(found);
            }
          })
          .catch(() => {});
      });

    return () => {
      isMounted = false;
    };
  }, [
    appointment?.tailorId,
    appointment?.tailor_id,
    appointment?.tailor?.id,
    appointment?.tailor?._id,
  ]);

  if (isLoading) {
    return (
      <BookingOrdersScreenShell>
        <BookingOrdersHeader
          title="Appointment Details"
          leftIcon="arrow-back"
          onPressLeft={() => router.back()}
          hideRightIcon={true}
        />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
          <ActivityIndicator size="large" color="#14919B" />
          <Text style={{ marginTop: 12, fontSize: 13, color: "#6F767E" }}>
            Loading appointment details...
          </Text>
        </View>
      </BookingOrdersScreenShell>
    );
  }

  if (!appointment) {
    return (
      <BookingOrdersScreenShell>
        <BookingOrdersHeader
          title="Appointment Details"
          leftIcon="arrow-back"
          onPressLeft={() => router.back()}
          hideRightIcon={true}
        />
        <View className="flex-1 items-center justify-center py-8 px-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Ionicons name="calendar-outline" size={32} color="#14919B" />
          </View>
          <Text className="text-[18px] font-bold text-brand-dark text-center">
            Appointment Not Found
          </Text>
          <Text className="mt-2 text-center text-[13px] font-medium text-brand-gray max-w-[280px]">
            {error || "We couldn't retrieve the details for this appointment. It may have been moved or removed."}
          </Text>
          <View className="mt-6 w-full max-w-[260px] gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/tailors" as any)}
              className="h-[48px] rounded-xl bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
            >
              <Text className="text-[13px] font-bold text-white">
                Book An Appointment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              className="h-[48px] rounded-xl border border-brand-border bg-white items-center justify-center"
            >
              <Text className="text-[13px] font-bold text-brand-dark">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BookingOrdersScreenShell>
    );
  }

  // Determine user role and perspective
  const isTailor =
    from === "tailor" ||
    currentUser?.role === "tailor" ||
    Boolean(
      (appointment.tailorId && currentUser?.id && appointment.tailorId === currentUser.id) ||
      (appointment.tailor_id && currentUser?.id && appointment.tailor_id === currentUser.id) ||
      (appointment.tailor?.id && currentUser?.id && appointment.tailor.id === currentUser.id) ||
      (appointment.tailor?.userId && currentUser?.id && appointment.tailor.userId === currentUser.id)
    );

  const appointmentNumber =
    appointment.id && appointment.id.length > 12
      ? appointment.id.startsWith("APT-")
        ? appointment.id.slice(0, 11)
        : appointment.id.slice(0, 8).toUpperCase()
      : appointment.id || appointmentId || "—";

  const serviceName =
    appointment.serviceType ||
    appointment.service_type ||
    appointment.service?.name ||
    appointment.service?.title ||
    "Tailoring Consultation & Fitting";

  const dateStr =
    appointment.appointmentDate ||
    appointment.appointment_date ||
    appointment.date ||
    "Scheduled";

  const timeStr =
    appointment.appointmentTime ||
    appointment.appointment_time ||
    appointment.time ||
    "";

  const duration = appointment.duration || "45 - 60 mins";
  const notesStr = appointment.notes || "";

  const locationStr =
    appointment.location ||
    tailorInfo?.address ||
    tailorInfo?.city ||
    appointment.tailor?.location?.city ||
    appointment.tailor?.address ||
    "In-Shop / Tailor Studio";

  const rawPrice =
    appointment.price !== undefined && appointment.price !== null
      ? appointment.price
      : appointment.service?.price !== undefined && appointment.service?.price !== null
      ? appointment.service.price
      : null;

  const priceStr =
    rawPrice !== null && rawPrice !== undefined && Number(rawPrice) > 0
      ? `Rs. ${Number(rawPrice).toLocaleString("en-IN")}`
      : "Consultation";

  // Status mapping
  const status = appointment.status || "Pending";
  const statusLower = status.toLowerCase();
  const isPending =
    statusLower === "pending" || statusLower === "requests" || statusLower === "new";
  const isUpcoming =
    statusLower === "upcoming" || statusLower === "confirmed";
  const isCompleted = statusLower === "completed";
  const isCancelled =
    statusLower === "cancelled" ||
    statusLower === "canceled" ||
    statusLower === "declined" ||
    statusLower === "rejected";

  const statusLabel = isCompleted
    ? "Completed"
    : isCancelled
    ? "Cancelled"
    : isUpcoming
    ? "Upcoming"
    : "New Request";

  const statusTone: "blue" | "green" | "red" | "gold" = isCompleted
    ? "green"
    : isCancelled
    ? "red"
    : isUpcoming
    ? "blue"
    : "gold";

  // Tailor details
  const displayTailorName =
    tailorInfo?.name ||
    tailorInfo?.shopName ||
    appointment.tailorName ||
    appointment.tailor?.shopName ||
    appointment.tailor?.fullName ||
    appointment.tailor?.name ||
    "Master Tailor";

  const displayShopName =
    tailorInfo?.shopName ||
    tailorInfo?.businessName ||
    appointment.tailor?.shopName ||
    appointment.tailor?.businessName ||
    (displayTailorName.includes("Tailor") ? displayTailorName : `${displayTailorName}'s Studio`);

  const displayTailorAvatar =
    tailorInfo?.avatar ||
    tailorInfo?.avatarUrl ||
    tailorInfo?.imageUrl ||
    tailorInfo?.image ||
    appointment.tailorAvatar ||
    appointment.tailor_avatar ||
    appointment.tailor?.avatar ||
    appointment.tailor?.avatarUrl ||
    null;

  const displayRating = tailorInfo?.rating
    ? Number(tailorInfo.rating).toFixed(1)
    : appointment.tailor?.rating
    ? Number(appointment.tailor.rating).toFixed(1)
    : "4.9";

  const displayReviews =
    tailorInfo?.reviewsCount ?? tailorInfo?.reviews ?? appointment.tailor?.reviewsCount ?? 28;

  const displaySpecialty =
    tailorInfo?.specialty ||
    (tailorInfo?.specialties && tailorInfo.specialties[0]) ||
    "Bespoke Fitting & Stitching";

  const displayLocation =
    tailorInfo?.city ||
    tailorInfo?.address ||
    locationStr ||
    "Available for fittings";

  const displayTailorId =
    tailorInfo?.id ||
    appointment.tailorId ||
    appointment.tailor_id ||
    appointment.tailor?.id ||
    "";

  const displayTailorPhone =
    tailorInfo?.phone ||
    (tailorInfo as any)?.phoneNumber ||
    appointment.tailor?.phone ||
    appointment.tailor?.phoneNumber ||
    appointment.tailor?.contactNumber ||
    "";

  // Customer details
  const displayCustomerName =
    appointment.customerName ||
    appointment.customer_name ||
    appointment.clientName ||
    appointment.userName ||
    appointment.customer?.fullName ||
    appointment.customer?.full_name ||
    appointment.customer?.name ||
    "Client";

  const displayCustomerAvatar =
    appointment.customerAvatar ||
    appointment.customer_avatar ||
    appointment.clientAvatar ||
    appointment.customer?.avatar ||
    appointment.customer?.avatarUrl ||
    appointment.customer?.avatar_url ||
    null;

  const displayCustomerPhone =
    appointment.customer?.phone ||
    appointment.customer?.phoneNumber ||
    appointment.customer?.phone_number ||
    (appointment as any)?.phone ||
    (appointment as any)?.customerPhone ||
    "";

  const displayCustomerId =
    appointment.customerId ||
    appointment.customer_id ||
    appointment.customer?.id ||
    appointment.customer?._id ||
    "";

  // Actions
  const handleMessageCustomer = () => {
    const clientId = displayCustomerId;
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

  const handleMessageTailor = () => {
    const targetUserId = displayTailorId;
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

  const handleCallTailor = () => {
    if (displayTailorPhone) {
      Alert.alert("Call Tailor", `Call ${displayTailorName} at ${displayTailorPhone}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => Linking.openURL(`tel:${displayTailorPhone}`).catch(() => {}),
        },
      ]);
    } else {
      Alert.alert("Contact Info", `Direct phone number for ${displayTailorName} is currently unavailable.`);
    }
  };

  const handleCallCustomer = () => {
    if (displayCustomerPhone) {
      Alert.alert("Call Client", `Call ${displayCustomerName} at ${displayCustomerPhone}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => Linking.openURL(`tel:${displayCustomerPhone}`).catch(() => {}),
        },
      ]);
    } else {
      Alert.alert("Contact Info", `Phone number for ${displayCustomerName} is currently not listed.`);
    }
  };

  const handleAcceptAppointment = async () => {
    setIsActionLoading("accept");
    try {
      await updateStatus("confirmed");
      Alert.alert("Appointment Confirmed", `Appointment with ${displayCustomerName} has been confirmed.`);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not confirm appointment. Please try again.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleRejectAppointment = () => {
    Alert.alert(
      "Decline Appointment",
      `Are you sure you want to decline this appointment request with ${displayCustomerName}?`,
      [
        { text: "Keep Request", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            setIsActionLoading("reject");
            try {
              await cancelAppointment("Declined by tailor");
              Alert.alert("Appointment Declined", "The appointment request has been declined.");
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Could not decline appointment. Please try again.");
            } finally {
              setIsActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleCompleteAppointment = async () => {
    Alert.alert(
      "Complete Appointment",
      `Mark this consultation/fitting with ${displayCustomerName} as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Completed",
          onPress: async () => {
            setIsActionLoading("complete");
            try {
              await updateStatus("completed");
              Alert.alert("Appointment Completed", "Consultation has been successfully marked as completed.");
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Could not mark appointment as completed.");
            } finally {
              setIsActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    if (displayTailorId) {
      router.push({
        pathname: "/booking/[tailorId]",
        params: {
          tailorId: displayTailorId,
          service: serviceName,
          date: dateStr,
          time: timeStr,
        },
      } as any);
    } else {
      router.push("/tailors" as any);
    }
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      "Cancel Appointment",
      `Are you sure you want to cancel your appointment with ${displayTailorName}?`,
      [
        { text: "Keep Appointment", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setIsActionLoading("cancel");
            try {
              await cancelAppointment("Cancelled by client");
              Alert.alert(
                "Appointment Cancelled",
                "Your appointment has been cancelled successfully."
              );
            } catch (err: any) {
              Alert.alert("Notice", err?.message || "Failed to cancel appointment.");
            } finally {
              setIsActionLoading(null);
            }
          },
        },
      ]
    );
  };

  return (
    <BookingOrdersScreenShell>
      <BookingOrdersHeader
        title="Appointment Details"
        leftIcon="arrow-back"
        onPressLeft={() => router.back()}
        hideRightIcon={true}
        titleClassName="text-[22px] font-black text-brand-dark tracking-tight"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Prominent Appointment Heading Block */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 mr-2">
                <Text className="text-[11px] font-black text-primary">APPOINTMENT</Text>
              </View>
              <Text className="text-[23px] font-black text-brand-dark tracking-tight flex-shrink" numberOfLines={1}>
                #{appointmentNumber}
              </Text>
            </View>
            <StatusPill label={statusLabel} tone={statusTone} />
          </View>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
            <Text className="text-[12px] font-medium text-brand-gray">
              Booked for {dateStr} {timeStr ? `• ${timeStr}` : ""}
            </Text>
          </View>
        </View>

        {/* Main Consultation / Service Card */}
        <View className="flex-row rounded-2xl border border-brand-border bg-white p-3.5 shadow-2xs mb-4">
          <View className="w-[68px] h-[68px] rounded-xl border border-primary/20 bg-primary-50 items-center justify-center p-1">
            <View className="w-9 h-9 rounded-full bg-primary/15 items-center justify-center mb-0.5">
              <Ionicons name="cut-outline" size={18} color="#14919B" />
            </View>
            <Text className="text-[9px] font-extrabold text-primary">FITTING</Text>
          </View>
          <View className="ml-3.5 flex-1 justify-center">
            <Text className="text-[15px] font-bold text-brand-dark" numberOfLines={1}>
              {serviceName}
            </Text>
            <Text className="mt-1 text-[12px] font-medium text-brand-gray" numberOfLines={1}>
              {isTailor ? `Client: ${displayCustomerName}` : `Tailor: ${displayTailorName}`}
            </Text>
            <View className="mt-1.5 flex-row items-center gap-2">
              <View className="bg-[#E0F7F7] px-2 py-0.5 rounded-md">
                <Text className="text-[11px] font-bold text-[#0D7377]">{priceStr}</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="stopwatch-outline" size={12} color="#64748B" style={{ marginRight: 2 }} />
                <Text className="text-[11px] font-medium text-brand-gray">{duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Role-Specific Card: Client Info (Tailor View) vs Tailor Info (Customer View) */}
        {isTailor ? (
          // TAILOR VIEW: SHOW CLIENT DETAILS
          <>
            <SectionLabel title="Client Information" />
            <View className="rounded-xl border border-brand-border p-3.5 bg-white shadow-2xs mb-4">
              <View className="flex-row items-center">
                {displayCustomerAvatar ? (
                  <Image
                    source={{ uri: displayCustomerAvatar }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 items-center justify-center">
                    <Ionicons name="person-outline" size={20} color="#14919B" />
                  </View>
                )}
                <View className="ml-2.5 flex-1">
                  <Text className="text-[14px] font-bold text-brand-dark" numberOfLines={1}>
                    {displayCustomerName}
                  </Text>
                  <Text className="text-[11px] font-medium text-brand-gray" numberOfLines={1}>
                    Verified Sui Dhaga Client
                  </Text>
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

              <View className="mt-1.5 flex-row items-center">
                <Ionicons name="location-outline" size={12} color="#64748B" />
                <Text className="ml-1.5 text-[11px] font-medium text-brand-gray" numberOfLines={1}>
                  {locationStr}
                </Text>
              </View>

              {/* Action Buttons for Tailor */}
              <View className="mt-3 flex-row gap-2">
                <TouchableOpacity
                  onPress={handleMessageCustomer}
                  activeOpacity={0.8}
                  className="flex-1 h-9 rounded-lg bg-primary items-center justify-center flex-row overflow-hidden relative shadow-xs"
                >
                  <ButtonTexture variant="greenish" borderRadius={8} />
                  <Ionicons name="chatbubble-ellipses" size={13} color="#FFFFFF" style={{ marginRight: 5, zIndex: 1 }} />
                  <Text className="text-[11px] font-bold text-white" style={{ zIndex: 1 }}>
                    Message Client
                  </Text>
                </TouchableOpacity>

                {displayCustomerPhone ? (
                  <TouchableOpacity
                    onPress={handleCallCustomer}
                    activeOpacity={0.8}
                    className="h-9 px-3 rounded-lg border border-brand-border bg-white items-center justify-center flex-row"
                  >
                    <Ionicons name="call-outline" size={13} color="#0D7377" style={{ marginRight: 4 }} />
                    <Text className="text-[11px] font-bold text-[#0D7377]">Call</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </>
        ) : (
          // CUSTOMER VIEW: SHOW TAILOR DETAILS
          <>
            <SectionLabel title="Tailor Information" />
            <View className="rounded-xl border border-brand-border p-3.5 bg-white shadow-2xs mb-4">
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
                  <Text className="text-[14px] font-bold text-brand-dark" numberOfLines={1}>
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
                  onPress={handleMessageTailor}
                  className="flex-1 h-8 rounded-lg bg-[#E0F7F7] items-center justify-center flex-row"
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={12} color="#0D7377" style={{ marginRight: 3 }} />
                  <Text className="text-[11px] font-bold text-[#0D7377]">Message</Text>
                </TouchableOpacity>

                {displayTailorPhone ? (
                  <TouchableOpacity
                    onPress={handleCallTailor}
                    className="h-8 px-3 rounded-lg border border-brand-border bg-white items-center justify-center flex-row"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call-outline" size={12} color="#0D7377" style={{ marginRight: 3 }} />
                    <Text className="text-[11px] font-bold text-[#0D7377]">Call</Text>
                  </TouchableOpacity>
                ) : null}

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

        {/* Schedule & Timing Details */}
        <SectionLabel title="Schedule & Timing" />
        <View className="rounded-xl bg-brand-surface p-3.5 mb-4">
          <InfoRow icon="calendar-outline" label="Appointment Date" value={dateStr} />
          {timeStr ? <InfoRow icon="time-outline" label="Time Slot" value={timeStr} /> : null}
          <InfoRow icon="stopwatch-outline" label="Estimated Duration" value={duration} />
          <InfoRow icon="location-outline" label="Meeting Location" value={locationStr} />
          <InfoRow icon="receipt-outline" label="Reference ID" value={appointment.id || appointmentId || "—"} />
        </View>

        {/* Client Notes / Instructions if any */}
        {notesStr ? (
          <>
            <SectionLabel title="Notes & Special Requests" />
            <View className="rounded-xl border border-brand-border bg-white p-3.5 mb-4 shadow-2xs">
              <View className="flex-row items-start">
                <Ionicons name="document-text-outline" size={16} color="#0D7377" style={{ marginTop: 2, marginRight: 6 }} />
                <Text className="text-[13px] font-medium leading-5 text-brand-dark flex-1">
                  {notesStr}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        {/* Tailor Action Controls */}
        {isTailor && isPending && (
          <View className="mt-2 rounded-2xl bg-white border border-brand-border p-4 shadow-sm mb-4">
            <Text className="text-[14px] font-bold text-brand-dark mb-1">
              New Appointment Request
            </Text>
            <Text className="text-[12px] text-brand-gray mb-3.5 leading-4">
              Confirm this booking to add it to your schedule or decline if unavailable at this time slot.
            </Text>
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={handleRejectAppointment}
                disabled={Boolean(isActionLoading)}
                activeOpacity={0.8}
                className="flex-1 h-11 rounded-xl border border-red-200 bg-red-50 items-center justify-center flex-row"
              >
                {isActionLoading === "reject" ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={15} color="#DC2626" style={{ marginRight: 4 }} />
                    <Text className="text-[13px] font-bold text-red-600">Decline</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAcceptAppointment}
                disabled={Boolean(isActionLoading)}
                activeOpacity={0.85}
                className="flex-1 h-11 rounded-xl bg-primary items-center justify-center flex-row overflow-hidden relative shadow-xs"
              >
                <ButtonTexture variant="greenish" borderRadius={12} />
                {isActionLoading === "accept" ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ zIndex: 1 }} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={15} color="#FFFFFF" style={{ marginRight: 4, zIndex: 1 }} />
                    <Text className="text-[13px] font-bold text-white" style={{ zIndex: 1 }}>
                      Confirm Booking
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isTailor && isUpcoming && (
          <View className="mt-2 rounded-2xl bg-white border border-brand-border p-4 shadow-sm mb-4">
            <Text className="text-[14px] font-bold text-brand-dark mb-1">
              Confirmed Appointment
            </Text>
            <Text className="text-[12px] text-brand-gray mb-3.5 leading-4">
              Once the consultation and measurements are finished, mark this appointment as completed.
            </Text>
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={handleRejectAppointment}
                disabled={Boolean(isActionLoading)}
                activeOpacity={0.8}
                className="h-11 px-4 rounded-xl border border-slate-200 bg-white items-center justify-center"
              >
                <Text className="text-[12px] font-bold text-slate-600">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCompleteAppointment}
                disabled={Boolean(isActionLoading)}
                activeOpacity={0.85}
                className="flex-1 h-11 rounded-xl bg-[#078B87] items-center justify-center flex-row overflow-hidden relative shadow-xs"
              >
                <ButtonTexture variant="greenish" borderRadius={12} />
                {isActionLoading === "complete" ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ zIndex: 1 }} />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={16} color="#FFFFFF" style={{ marginRight: 5, zIndex: 1 }} />
                    <Text className="text-[13px] font-bold text-white" style={{ zIndex: 1 }}>
                      Mark as Completed
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Customer Action Controls */}
        {!isTailor && (isPending || isUpcoming) && (
          <View className="mt-2 flex-row gap-3 mb-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleReschedule}
              className="h-[48px] flex-1 items-center justify-center rounded-xl border border-primary bg-white shadow-xs active:bg-primary/5"
            >
              <Text className="text-[13px] font-bold text-primary">
                Reschedule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCancelAppointment}
              disabled={Boolean(isActionLoading)}
              className="h-[48px] flex-1 items-center justify-center rounded-xl bg-[#F05A57] shadow-xs active:bg-red-600"
            >
              {isActionLoading === "cancel" ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-[13px] font-bold text-white">
                  Cancel Booking
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!isTailor && (isCompleted || isCancelled) && (
          <View className="mt-2 mb-4">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/tailors" as any)}
              className="h-[48px] items-center justify-center rounded-xl bg-primary shadow-xs active:bg-primary-dark overflow-hidden relative"
            >
              <ButtonTexture variant="greenish" borderRadius={12} />
              <Text className="text-[14px] font-bold text-white" style={{ zIndex: 1 }}>
                Book Another Appointment
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Need Help Box */}
        <View className="rounded-xl bg-brand-surface p-4">
          <View className="flex-row">
            <Ionicons name="headset-outline" size={22} color="#1A1D1F" />
            <View className="ml-3 flex-1">
              <Text className="text-[13px] font-semibold text-brand-dark">
                Need Help with this Appointment?
              </Text>
              <Text className="mt-1 text-[11px] text-brand-gray">
                Our customer care and tailor concierge team are here to assist.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/contact" as any)}
            className="mt-3.5 h-[40px] items-center justify-center rounded-xl bg-white border border-brand-border shadow-2xs"
          >
            <Text className="text-[12px] font-semibold text-primary">
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BookingOrdersScreenShell>
  );
}
