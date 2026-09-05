import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { InfoRow } from "../components/InfoRow";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { SectionLabel } from "../components/SectionLabel";
import { StatusPill } from "../components/StatusPill";
import { appointmentsApi } from "../../../api/appointments.api";

export default function AppointmentDetailsScreen() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "Keep Appointment", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              if (appointmentId) {
                await appointmentsApi.cancelAppointment(appointmentId, "User cancelled");
              }
              Alert.alert("Appointment Cancelled", "Your appointment has been cancelled.", [
                { text: "OK", onPress: () => router.push("/appointments" as any) },
              ]);
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to cancel appointment.");
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <BookingOrdersScreenShell>
      <BookingOrdersHeader title="Appointment Details" />
      <View className="px-5 pb-8">
        <View className="rounded-2xl border border-brand-border bg-white p-4">
          <StatusPill label="Upcoming" tone="blue" />
          <View className="mt-4 flex-row">
            <PlaceholderImage size="md" tone="coral" />
            <View className="ml-4 flex-1">
              <Text className="text-[15px] font-bold text-brand-dark">
                Rekha Tailors
              </Text>
              <View className="mt-1 flex-row items-center">
                <Ionicons name="star" size={13} color="#F4B400" />
                <Text className="ml-1 text-[12px] text-brand-dark">
                  4.8 (128)
                </Text>
              </View>
              <Text className="mt-1 text-[12px] text-brand-gray">
                C-Scheme, Jaipur, Rajasthan
              </Text>
              <View className="mt-4 flex-row gap-5">
                <TouchableOpacity onPress={() => router.push("/messages" as any)}>
                  <Text className="text-[12px] font-medium text-primary">
                    Message
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <SectionLabel title="Service Details" />
          <View className="flex-row">
            <PlaceholderImage variant="garment" size="sm" tone="coral" />
            <View className="ml-3 flex-1">
              <Text className="text-[13px] font-semibold text-brand-dark">
                Custom Tailoring Consultation
              </Text>
              <Text className="mt-1 text-[11px] leading-4 text-brand-gray">
                Full stitched outfit consultation with custom measurements
              </Text>
              <Text className="mt-2 text-[13px] font-bold text-brand-dark">
                ₹12,500
              </Text>
            </View>
          </View>

          <View className="mt-4 border-t border-brand-border pt-3">
            <InfoRow icon="calendar-outline" label="Date" value="22 Oct 2026" />
            <InfoRow icon="time-outline" label="Time" value="12:00 PM" />
            <InfoRow icon="stopwatch-outline" label="Duration" value="60 mins" />
            <InfoRow icon="receipt-outline" label="Appointment ID" value={appointmentId || "APT123456"} />
          </View>

          <SectionLabel title="Notes" />
          <Text className="text-[12px] leading-5 text-brand-dark">
            Light pastel color, minimal embroidery on dupatta. Please suggest fabric options.
          </Text>

          <SectionLabel title="Status" />
          <View className="self-start">
            <StatusPill label="Upcoming" tone="blue" />
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push(`/booking/1` as any)}
            className="h-[52px] flex-1 items-center justify-center rounded-xl border border-primary bg-white"
          >
            <Text className="text-[14px] font-semibold text-primary">
              Reschedule
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancel}
            disabled={isCancelling}
            className="h-[52px] flex-1 items-center justify-center rounded-xl bg-[#F05A57]"
          >
            {isCancelling ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[14px] font-semibold text-white">
                Cancel Appointment
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BookingOrdersScreenShell>
  );
}
