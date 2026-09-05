import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { InfoRow } from "../components/InfoRow";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { SectionLabel } from "../components/SectionLabel";
import { StatusPill } from "../components/StatusPill";
import { appointmentsApi } from "../../../api/appointments.api";
import { useTailorDetails } from "../../tailors/hooks/useTailors";

const dates = ["19", "20", "21", "22", "23", "24", "25"];
const times = ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "07:00 PM"];

function StepTitle({ number, title }: { number: number; title: string }) {
  return (
    <View className="mb-3 mt-5 flex-row items-center">
      <View className="mr-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
        <Text className="text-[10px] font-bold text-white">{number}</Text>
      </View>
      <Text className="text-[13px] font-semibold text-brand-dark">{title}</Text>
    </View>
  );
}

export default function BookAppointmentScreen() {
  const { tailorId } = useLocalSearchParams<{ tailorId?: string }>();
  const { tailor } = useTailorDetails(tailorId || "1");

  const [selectedDate, setSelectedDate] = useState("22");
  const [selectedTime, setSelectedTime] = useState("12:00 PM");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tailorName = tailor?.name || tailor?.businessName || "Rekha Tailors";
  const serviceName = "Custom Tailoring Consultation";
  const estimatedPrice = tailor?.startingPrice ? `₹${tailor.startingPrice}` : "₹12,500";

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    try {
      await appointmentsApi.createAppointment({
        tailorId: tailorId || tailor?.id || "1",
        serviceType: serviceName,
        appointmentDate: `2026-10-${selectedDate}`,
        appointmentTime: selectedTime,
        notes: notes.trim() || undefined,
        location: tailor?.location?.address || "Studio Visit",
      });

      Alert.alert(
        "Booking Confirmed! 🎉",
        `Your appointment with ${tailorName} on Oct ${selectedDate} at ${selectedTime} is reserved.`,
        [
          {
            text: "View Appointments",
            onPress: () => router.push("/appointments" as any),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Booking Notice", err.message || "Failed to confirm appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookingOrdersScreenShell>
      <BookingOrdersHeader
        title="Book Appointment"
        rightIcon="heart-outline"
        rightLabel="Save tailor"
      />
      <View className="px-5 pb-8">
        <View className="flex-row items-center">
          <PlaceholderImage size="md" tone="coral" />
          <View className="ml-4 flex-1">
            <Text className="text-[16px] font-bold text-brand-dark">
              {tailorName}
            </Text>
            <View className="mt-1 flex-row items-center">
              <Ionicons name="star" size={13} color="#F4B400" />
              <Text className="ml-1 text-[12px] font-medium text-brand-dark">
                {tailor?.rating || "4.8"} ({tailor?.reviews || tailor?.reviewsCount || "128"})
              </Text>
            </View>
            <Text className="mt-1 text-[12px] text-brand-gray">
              {tailor?.location?.city || "C-Scheme, Jaipur"}
            </Text>
            <View className="mt-2 self-start">
              <StatusPill label="Verified" tone="green" />
            </View>
          </View>
        </View>

        <StepTitle number={1} title="Select Service" />
        <View className="h-[48px] flex-row items-center justify-between rounded-xl border border-brand-border px-4">
          <Text className="text-[12px] text-brand-dark">
            {serviceName}
          </Text>
          <View className="flex-row items-center">
            <Text className="mr-2 text-[12px] font-semibold text-brand-dark">
              {estimatedPrice}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#1A1D1F" />
          </View>
        </View>

        <StepTitle number={2} title="Select Date" />
        <View className="rounded-xl border border-brand-border p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Ionicons name="chevron-back" size={18} color="#1A1D1F" />
            <Text className="text-[13px] font-semibold text-brand-dark">
              October 2026
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#1A1D1F" />
          </View>
          <View className="mb-3 flex-row justify-between">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <Text key={day} className="w-8 text-center text-[9px] text-brand-gray">
                {day}
              </Text>
            ))}
          </View>
          <View className="flex-row justify-between">
            {dates.map((date) => {
              const selected = date === selectedDate;

              return (
                <TouchableOpacity
                  key={date}
                  onPress={() => setSelectedDate(date)}
                  className={`h-9 w-8 items-center justify-center rounded-lg ${
                    selected ? "bg-primary" : "bg-white"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-medium ${
                      selected ? "text-white" : "text-brand-dark"
                    }`}
                  >
                    {date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <StepTitle number={3} title="Select Time" />
        <View className="flex-row flex-wrap gap-2">
          {times.map((time) => {
            const selected = time === selectedTime;

            return (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                className={`rounded-lg border px-4 py-3 ${
                  selected
                    ? "border-primary bg-primary"
                    : "border-brand-border bg-white"
                }`}
              >
                <Text
                  className={`text-[11px] font-medium ${
                    selected ? "text-white" : "text-brand-dark"
                  }`}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <StepTitle number={4} title="Add Notes (Optional)" />
        <View className="rounded-xl border border-brand-border px-4 py-3">
          <TextInput
            multiline
            placeholder="Share your preferences, design ideas, fabric details, etc."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            maxLength={200}
            className="min-h-[62px] text-[12px] text-brand-dark"
            textAlignVertical="top"
          />
          <Text className="self-end text-[10px] text-brand-gray">{notes.length}/200</Text>
        </View>

        <SectionLabel title="Appointment Summary" />
        <View className="rounded-xl bg-brand-surface p-4">
          <InfoRow label="Service" value={serviceName} />
          <InfoRow label="Date" value={`${selectedDate} Oct 2026`} />
          <InfoRow label="Time" value={selectedTime} />
          <InfoRow label="Duration" value="60 mins" />
          <InfoRow label="Estimated Price" value={estimatedPrice} />
        </View>

        <TouchableOpacity
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
          className="mt-5 h-[52px] items-center justify-center rounded-xl bg-primary"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-semibold text-white">
              Confirm Booking
            </Text>
          )}
        </TouchableOpacity>
        <Text className="mt-2 text-center text-[10px] text-brand-gray">
          You won't be charged now
        </Text>
      </View>
    </BookingOrdersScreenShell>
  );
}
