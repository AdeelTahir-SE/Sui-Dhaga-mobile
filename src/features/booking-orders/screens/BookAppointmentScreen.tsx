import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
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
import { useTailorDetails } from "../../tailors/hooks/useTailors";
import { useAppointments } from "../hooks/useAppointments";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

const DEFAULT_SERVICES: ServiceOption[] = [
  {
    id: "srv-1",
    name: "Custom Anarkali Suit",
    price: 12500,
    duration: "60 mins",
    description: "Full stitched outfit consultation with custom measurements",
  },
  {
    id: "srv-2",
    name: "Bridal Lehenga Stitching",
    price: 18000,
    duration: "90 mins",
    description: "Heavy zardozi / embroidery fitting & bespoke tailoring",
  },
  {
    id: "srv-3",
    name: "Designer Sherwani Set",
    price: 15500,
    duration: "60 mins",
    description: "Royal groom / festive sherwani tailored to your fit",
  },
  {
    id: "srv-4",
    name: "Blouse Stitching & Styling",
    price: 2500,
    duration: "45 mins",
    description: "Designer neck cuts, padding, piping and latkan finishes",
  },
  {
    id: "srv-5",
    name: "Saree Fall & Pico Hem",
    price: 1200,
    duration: "30 mins",
    description: "Delicate edging and matching fall attachment",
  },
  {
    id: "srv-6",
    name: "Kurta Pajama Set",
    price: 4500,
    duration: "45 mins",
    description: "Classic ethnic kurta with tailored churidar / pajama",
  },
];

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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
  const { tailorId, service: initialService, date: initialDate, time: initialTime } = useLocalSearchParams<{
    tailorId?: string;
    service?: string;
    date?: string;
    time?: string;
  }>();

  const { tailor, isLoading: isTailorLoading } = useTailorDetails(tailorId || "1");
  const { createAppointment } = useAppointments();

  const [isSaved, setIsSaved] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Available services
  const availableServices = useMemo<ServiceOption[]>(() => {
    if (tailor?.services && Array.isArray(tailor.services) && tailor.services.length > 0) {
      return tailor.services.map((s: any, idx: number) => ({
        id: s.id || `srv-${idx}`,
        name: s.name || s.title || "Custom Tailoring",
        price: typeof s.price === "number" ? s.price : parseInt(s.price, 10) || 3500,
        duration: s.duration || "60 mins",
        description: s.description || "Custom tailoring session",
      }));
    }
    return DEFAULT_SERVICES;
  }, [tailor?.services]);

  const [selectedService, setSelectedService] = useState<ServiceOption>(() => {
    if (initialService) {
      const match = availableServices.find(
        (s) => s.name.toLowerCase() === initialService.toLowerCase()
      );
      if (match) return match;
    }
    return availableServices[0] || DEFAULT_SERVICES[0];
  });

  // Dynamic calendar date selection
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    return now.getDate() + 1 <= 28 ? now.getDate() + 1 : now.getDate();
  });

  const [selectedTime, setSelectedTime] = useState(initialTime || "12:00 PM");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate days in month and start day offset
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const startDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const isoDateStr = useMemo(() => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  }, [currentYear, currentMonth, selectedDay]);

  const formattedDateStr = useMemo(() => {
    const monthShort = MONTH_NAMES[currentMonth].slice(0, 3);
    return `${selectedDay} ${monthShort} ${currentYear}`;
  }, [selectedDay, currentMonth, currentYear]);

  const tailorName =
    (tailor as any)?.fullName ||
    tailor?.name ||
    tailor?.shopName ||
    (tailor as any)?.businessName ||
    "Tailor";

  const tailorCity =
    tailor?.location?.city ||
    (tailor as any)?.city ||
    (tailor as any)?.address ||
    "Jaipur";

  const tailorRating = tailor?.rating ? String(tailor.rating) : "5.0";
  const reviewsCount =
    tailor?.reviewsCount || (tailor as any)?.reviews || (tailor as any)?.totalReviews || 0;

  const handleConfirmBooking = async () => {
    const targetTailorId = tailorId || tailor?.id;
    if (!targetTailorId) {
      Alert.alert("Error", "Please select a valid tailor to book an appointment.");
      return;
    }

    // Convert time string like '02:00 PM' to '14:00'
    let time24 = selectedTime;
    const match = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = (match[3] || "").toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      time24 = `${String(hours).padStart(2, "0")}:${minutes}`;
    }

    setIsSubmitting(true);
    try {
      await createAppointment({
        tailorId: targetTailorId,
        tailor_id: targetTailorId,
        serviceId: selectedService.id && !selectedService.id.startsWith("srv-") ? selectedService.id : undefined,
        service_id: selectedService.id && !selectedService.id.startsWith("srv-") ? selectedService.id : undefined,
        appointment_date: isoDateStr,
        appointment_time: time24,
        appointmentDate: isoDateStr,
        appointmentTime: time24,
        date: isoDateStr,
        time: time24,
        serviceType: selectedService.name,
        service_type: selectedService.name,
        notes: notes.trim() || undefined,
        location: tailorCity,
        price: selectedService.price,
        duration: selectedService.duration,
      });

      Alert.alert(
        "Booking Confirmed! 🎉",
        `Your appointment with ${tailorName} for ${selectedService.name} on ${formattedDateStr} at ${selectedTime} is confirmed.`,
        [
          {
            text: "View Appointments",
            onPress: () => router.push("/appointments" as any),
          },
          {
            text: "Done",
            onPress: () => router.push("/home" as any),
            style: "cancel",
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        "Booking Failed",
        err.message || "Failed to confirm appointment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookingOrdersScreenShell>
      <BookingOrdersHeader
        title="Book Appointment"
        rightIcon={isSaved ? "heart" : "heart-outline"}
        rightLabel={isSaved ? "Saved" : "Save tailor"}
        onPressRight={() => {
          setIsSaved(!isSaved);
          Alert.alert(
            isSaved ? "Removed" : "Saved",
            isSaved ? "Tailor removed from saved list" : "Tailor saved to favorites"
          );
        }}
      />
      <View className="px-5 pb-8">
        {/* Tailor summary banner */}
        <View className="flex-row items-center rounded-md border border-brand-border bg-white p-3.5 shadow-xs">
          <PlaceholderImage size="md" tone="coral" />
          <View className="ml-4 flex-1">
            <Text className="text-[16px] font-bold text-brand-dark">
              {tailorName}
            </Text>
            <View className="mt-1 flex-row items-center">
              <Ionicons name="star" size={13} color="#F4B400" />
              <Text className="ml-1 text-[12px] font-medium text-brand-dark">
                {tailorRating} ({reviewsCount})
              </Text>
            </View>
            <Text className="mt-1 text-[12px] text-brand-gray">
              {tailorCity}
            </Text>
            <View className="mt-2 self-start">
              <StatusPill label="Verified" tone="green" />
            </View>
          </View>
        </View>

        {/* Step 1: Select Service */}
        <StepTitle number={1} title="Select Service" />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsServiceModalOpen(true)}
          className="h-[50px] flex-row items-center justify-between rounded-md border border-brand-border bg-white px-4 shadow-xs"
        >
          <View className="flex-1 pr-2">
            <Text className="text-[13px] font-bold text-brand-dark" numberOfLines={1}>
              {selectedService.name}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="mr-2 text-[13px] font-bold text-primary">
              ₹{selectedService.price.toLocaleString("en-IN")}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#1A1D1F" />
          </View>
        </TouchableOpacity>

        {/* Step 2: Select Date */}
        <StepTitle number={2} title="Select Date" />
        <View className="rounded-md border border-brand-border bg-white p-4 shadow-xs">
          {/* Month Header Navigation */}
          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handlePrevMonth}
              className="h-8 w-8 items-center justify-center rounded-md bg-brand-surface active:bg-gray-200"
            >
              <Ionicons name="chevron-back" size={18} color="#1A1D1F" />
            </TouchableOpacity>
            <Text className="text-[14px] font-bold text-brand-dark">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity
              onPress={handleNextMonth}
              className="h-8 w-8 items-center justify-center rounded-md bg-brand-surface active:bg-gray-200"
            >
              <Ionicons name="chevron-forward" size={18} color="#1A1D1F" />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View className="mb-3 flex-row justify-between">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <Text key={day} className="w-9 text-center text-[10px] font-bold text-brand-gray">
                {day}
              </Text>
            ))}
          </View>

          {/* Date Grid */}
          <View className="flex-row flex-wrap">
            {/* Empty slots for start day offset */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <View key={`empty-${i}`} className="h-9 w-[14.28%] items-center justify-center" />
            ))}

            {/* Month Day Buttons */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDay;
              const dateObj = new Date(currentYear, currentMonth, day);
              const isPast =
                dateObj < new Date(now.getFullYear(), now.getMonth(), now.getDate());

              return (
                <View key={day} className="h-9 w-[14.28%] items-center justify-center p-0.5">
                  <TouchableOpacity
                    disabled={isPast}
                    onPress={() => setSelectedDay(day)}
                    className={`h-8 w-8 items-center justify-center rounded-md ${
                      isSelected
                        ? "bg-primary shadow-xs"
                        : isPast
                        ? "opacity-30"
                        : "bg-brand-surface active:bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-bold ${
                        isSelected
                          ? "text-white"
                          : isPast
                          ? "text-gray-400"
                          : "text-brand-dark"
                      }`}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Step 3: Select Time */}
        <StepTitle number={3} title="Select Time" />
        <View className="flex-row flex-wrap gap-2">
          {TIME_SLOTS.map((time) => {
            const isSelected = time === selectedTime;

            return (
              <TouchableOpacity
                key={time}
                activeOpacity={0.7}
                onPress={() => setSelectedTime(time)}
                className={`rounded-md border px-3.5 py-2.5 shadow-xs ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-brand-border bg-white"
                }`}
              >
                <Text
                  className={`text-[12px] font-bold ${
                    isSelected ? "text-white" : "text-brand-dark"
                  }`}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Step 4: Add Notes */}
        <StepTitle number={4} title="Add Notes (Optional)" />
        <View className="rounded-md border border-brand-border bg-white px-4 py-3 shadow-xs">
          <TextInput
            multiline
            placeholder="Share your preferences, design ideas, fabric details, or measurements..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            maxLength={200}
            className="min-h-[64px] text-[12px] font-medium leading-5 text-brand-dark"
            textAlignVertical="top"
          />
          <Text className="mt-1 self-end text-[10px] text-brand-gray">{notes.length}/200</Text>
        </View>

        {/* Appointment Summary */}
        <SectionLabel title="Appointment Summary" />
        <View className="rounded-md border border-brand-border bg-brand-surface p-4">
          <InfoRow label="Tailor" value={tailorName} />
          <InfoRow label="Service" value={selectedService.name} />
          <InfoRow label="Date" value={formattedDateStr} />
          <InfoRow label="Time" value={selectedTime} />
          <InfoRow label="Duration" value={selectedService.duration} />
          <InfoRow
            label="Estimated Price"
            value={`₹${selectedService.price.toLocaleString("en-IN")}`}
          />
        </View>

        {/* Submit Booking Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
          className="mt-6 h-[50px] items-center justify-center rounded-md bg-primary shadow-xs active:bg-primary-dark"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-bold text-white tracking-wide">
              Confirm Booking
            </Text>
          )}
        </TouchableOpacity>
        <Text className="mt-2.5 text-center text-[11px] font-medium text-brand-gray">
          You won't be charged now • Free cancellation up to 24h prior
        </Text>
      </View>

      {/* Service Selection Modal */}
      <Modal
        visible={isServiceModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsServiceModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[80%] rounded-t-2xl bg-white p-5 pb-8 shadow-xl">
            <View className="mb-4 flex-row items-center justify-between border-b border-brand-border pb-3">
              <Text className="text-[16px] font-bold text-brand-dark">
                Choose a Service
              </Text>
              <TouchableOpacity
                onPress={() => setIsServiceModalOpen(false)}
                className="p-1"
              >
                <Ionicons name="close" size={22} color="#1A1D1F" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {availableServices.map((service) => {
                const isSelected = selectedService.id === service.id;
                return (
                  <TouchableOpacity
                    key={service.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedService(service);
                      setIsServiceModalOpen(false);
                    }}
                    className={`mb-3 rounded-md border p-3.5 shadow-xs ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-brand-border bg-white"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[14px] font-bold text-brand-dark">
                        {service.name}
                      </Text>
                      <Text className="text-[14px] font-bold text-primary">
                        ₹{service.price.toLocaleString("en-IN")}
                      </Text>
                    </View>
                    <Text className="mt-1 text-[11px] leading-4 text-brand-gray">
                      {service.description}
                    </Text>
                    <View className="mt-2 flex-row items-center">
                      <Ionicons name="time-outline" size={13} color="#6F767E" />
                      <Text className="ml-1 text-[11px] font-medium text-brand-gray">
                        Est. {service.duration}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </BookingOrdersScreenShell>
  );
}
