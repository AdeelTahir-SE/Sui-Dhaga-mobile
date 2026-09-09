import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { InfoRow } from "../components/InfoRow";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { SectionLabel } from "../components/SectionLabel";
import { StatusPill } from "../components/StatusPill";
import { useAppointmentDetails } from "../hooks/useAppointments";

export default function AppointmentDetailsScreen() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const { appointment, isLoading, error, cancelAppointment } = useAppointmentDetails(appointmentId);
  const [isCancelling, setIsCancelling] = useState(false);

  const tailorName =
    appointment?.tailorName ||
    appointment?.tailor?.shopName ||
    appointment?.tailor?.fullName ||
    appointment?.tailor?.name ||
    "Tailor";
  const serviceName =
    appointment?.serviceType ||
    appointment?.service?.name ||
    "Tailoring Consultation";
  const dateStr = appointment?.appointmentDate || appointment?.date || "Scheduled";
  const timeStr = appointment?.appointmentTime || appointment?.time || "";
  const status = appointment?.status || "Pending";
  const statusLower = status.toLowerCase();

  const priceStr =
    appointment?.price !== undefined && appointment?.price !== null
      ? `₹${appointment.price.toLocaleString("en-IN")}`
      : appointment?.service?.price !== undefined && appointment?.service?.price !== null
      ? `₹${appointment.service.price.toLocaleString("en-IN")}`
      : null;

  const locationStr =
    appointment?.location ||
    appointment?.tailor?.location?.city ||
    appointment?.tailor?.address ||
    "";
  const notesStr = appointment?.notes || "";
  const tailorPhone =
    appointment?.tailor?.phone ||
    appointment?.tailor?.phoneNumber ||
    appointment?.tailor?.contactNumber;

  const statusTone: "blue" | "green" | "red" =
    statusLower === "completed"
      ? "green"
      : statusLower === "cancelled" || statusLower === "rejected"
      ? "red"
      : "blue";

  const tailorAvatar =
    appointment?.tailorAvatar ||
    appointment?.tailor_avatar ||
    appointment?.tailor?.avatar ||
    appointment?.tailor?.avatar_url ||
    appointment?.tailor?.avatarUrl ||
    appointment?.tailor?.imageUrl ||
    appointment?.tailor?.image_url ||
    appointment?.tailor?.image ||
    appointment?.tailor?.profilePicture ||
    appointment?.tailor?.profileImage;

  const handleCall = () => {
    if (tailorPhone) {
      Alert.alert("Call Tailor", `Call ${tailorName} at ${tailorPhone}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => Linking.openURL(`tel:${tailorPhone}`).catch(() => {}),
        },
      ]);
    } else {
      Alert.alert("Contact Info", `Contact number for ${tailorName} is not available.`);
    }
  };

  const handleReschedule = () => {
    router.push({
      pathname: "/booking/[tailorId]",
      params: {
        tailorId: appointment?.tailorId || "",
        service: serviceName,
        date: dateStr,
        time: timeStr,
      },
    } as any);
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Appointment",
      `Are you sure you want to cancel your appointment with ${tailorName}?`,
      [
        { text: "Keep Appointment", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              await cancelAppointment("Cancelled by user");
              Alert.alert(
                "Appointment Cancelled",
                "Your appointment has been cancelled successfully.",
                [{ text: "OK", onPress: () => router.push("/appointments" as any) }]
              );
            } catch (err: any) {
              Alert.alert("Notice", err.message || "Failed to cancel appointment.");
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <BookingOrdersScreenShell>
        <BookingOrdersHeader
          title="Appointment Details"
          leftIcon="arrow-back"
          onPressLeft={() => router.back()}
        />
        <View className="py-24 items-center justify-center">
          <ActivityIndicator size="large" color="#14919B" />
          <Text className="mt-3 text-[13px] font-medium text-brand-gray">
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
        />
        <View className="flex-1 items-center justify-center py-16 px-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Ionicons name="alert-circle-outline" size={32} color="#14919B" />
          </View>
          <Text className="text-[17px] font-bold text-brand-dark text-center">
            Appointment Not Found
          </Text>
          <Text className="mt-2 text-center text-[13px] font-medium text-brand-gray">
            {error || "We couldn't retrieve the details for this appointment."}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/appointments" as any)}
            className="mt-6 rounded-md bg-primary px-6 py-3 shadow-xs active:bg-primary-dark"
          >
            <Text className="text-[13px] font-bold text-white">
              Back to Appointments
            </Text>
          </TouchableOpacity>
        </View>
      </BookingOrdersScreenShell>
    );
  }

  return (
    <BookingOrdersScreenShell>
      <BookingOrdersHeader
        title="Appointment Details"
        leftIcon="arrow-back"
        onPressLeft={() => router.back()}
        rightIcon="ellipsis-horizontal"
        rightLabel="Options"
        onPressRight={() => {
          Alert.alert("Appointment Options", `Manage appointment #${appointment.id}`, [
            { text: "Reschedule", onPress: handleReschedule },
            { text: "Cancel Appointment", onPress: handleCancel, style: "destructive" },
            { text: "Dismiss", style: "cancel" },
          ]);
        }}
      />
      <View className="px-5 pb-8">
        <View className="rounded-md border border-brand-border bg-white p-4 shadow-xs">
          <View className="self-start">
            <StatusPill label={status} tone={statusTone} />
          </View>

          {/* Tailor Info */}
          <View className="mt-4 flex-row items-center">
            <PlaceholderImage size="md" image={tailorAvatar} tone="coral" />
            <View className="ml-4 flex-1">
              <Text className="text-[16px] font-bold text-brand-dark">
                {tailorName}
              </Text>
              {appointment.tailor?.rating ? (
                <View className="mt-1 flex-row items-center">
                  <Ionicons name="star" size={13} color="#F4B400" />
                  <Text className="ml-1 text-[12px] font-medium text-brand-dark">
                    {appointment.tailor.rating}
                  </Text>
                </View>
              ) : null}
              {locationStr ? (
                <Text className="mt-1 text-[12px] font-medium text-brand-gray">
                  {locationStr}
                </Text>
              ) : null}
              {tailorPhone ? (
                <View className="mt-3 flex-row gap-3">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCall}
                    className="flex-row items-center rounded-md border border-brand-border px-3.5 py-1.5 active:bg-gray-50 shadow-xs"
                  >
                    <Ionicons name="call-outline" size={13} color="#14919B" />
                    <Text className="ml-1.5 text-[12px] font-bold text-primary">
                      Call Tailor
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>

          {/* Service Details */}
          <SectionLabel title="Service Details" />
          <View className="flex-row items-center">
            <PlaceholderImage variant="garment" size="sm" tone="coral" />
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-bold text-brand-dark">
                {serviceName}
              </Text>
              {priceStr ? (
                <Text className="mt-1.5 text-[14px] font-bold text-primary">
                  {priceStr}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Appointment Meta */}
          <View className="mt-4 border-t border-brand-border pt-3">
            <InfoRow icon="calendar-outline" label="Date" value={dateStr} />
            {timeStr ? (
              <InfoRow icon="time-outline" label="Time" value={timeStr} />
            ) : null}
            {appointment.duration ? (
              <InfoRow icon="stopwatch-outline" label="Duration" value={appointment.duration} />
            ) : null}
            <InfoRow
              icon="receipt-outline"
              label="Appointment ID"
              value={appointment.id}
            />
          </View>

          {/* Notes */}
          {notesStr ? (
            <>
              <SectionLabel title="Notes" />
              <Text className="text-[12px] font-medium leading-5 text-brand-dark">
                {notesStr}
              </Text>
            </>
          ) : null}

          {/* Status */}
          <SectionLabel title="Status" />
          <View className="self-start">
            <StatusPill label={status} tone={statusTone} />
          </View>
        </View>

        {/* Action Buttons */}
        {statusLower !== "cancelled" && statusLower !== "completed" && statusLower !== "rejected" ? (
          <View className="mt-5 flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleReschedule}
              className="h-[50px] flex-1 items-center justify-center rounded-md border border-primary bg-white shadow-xs active:bg-primary/5"
            >
              <Text className="text-[14px] font-bold text-primary">
                Reschedule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCancel}
              disabled={isCancelling}
              className="h-[50px] flex-1 items-center justify-center rounded-md bg-[#F05A57] shadow-xs active:bg-red-600"
            >
              {isCancelling ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-[14px] font-bold text-white">
                  Cancel Appointment
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mt-5">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/tailors" as any)}
              className="h-[50px] items-center justify-center rounded-md bg-primary shadow-xs active:bg-primary-dark"
            >
              <Text className="text-[14px] font-bold text-white">
                Book Another Appointment
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BookingOrdersScreenShell>
  );
}
