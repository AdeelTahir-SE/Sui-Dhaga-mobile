import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { InfoRow } from "../components/InfoRow";
import { ButtonTexture } from "@/components/ui/ButtonTexture";
import { useTailorDetails } from "../../tailors/hooks/useTailors";
import { useAppointments } from "../hooks/useAppointments";

const TIME_SLOT_GROUPS = [
  {
    period: "Morning",
    icon: "sunny-outline" as const,
    slots: ["09:00 AM", "10:00 AM", "11:00 AM"],
  },
  {
    period: "Afternoon",
    icon: "partly-sunny-outline" as const,
    slots: ["12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"],
  },
  {
    period: "Evening",
    icon: "moon-outline" as const,
    slots: ["05:00 PM", "06:00 PM", "07:00 PM"],
  },
];

const ALL_SLOTS = TIME_SLOT_GROUPS.flatMap((g) => g.slots);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const QUICK_TAGS = [
  "✨ Have own fabric",
  "📏 Take full measurement",
  "⚡ Express stitching needed",
  "👗 Reference design photos ready",
  "💍 Bridal / Festive wear",
  "🧵 Alteration & Restyling",
];

const STEPS = [
  { step: 1, title: "Schedule", icon: "calendar-outline" },
  { step: 2, title: "Notes", icon: "document-text-outline" },
  { step: 3, title: "Review", icon: "shield-checkmark-outline" },
] as const;

/**
 * Normalizes time strings (e.g. '02:00 PM', '14:00', '2:00PM') into '14:00'
 */
function normalizeTimeTo24h(timeStr: string): string {
  if (!timeStr) return "";
  const cleaned = timeStr.trim().toUpperCase();

  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const ampm = match12[3];
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  return cleaned;
}

/**
 * Normalizes date into YYYY-MM-DD format
 */
function normalizeDateStr(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("T")) {
    return dateStr.split("T")[0];
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return dateStr.trim();
}

export default function BookAppointmentScreen() {
  const { tailorId, date: initialDate, time: initialTime } = useLocalSearchParams<{
    tailorId?: string;
    date?: string;
    time?: string;
  }>();

  const { tailor, isLoading } = useTailorDetails(tailorId || "");
  const { appointments, createAppointment } = useAppointments();

  // Multi-step wizard state (1: Schedule, 2: Notes, 3: Review & Confirm)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");

  // Track appointments booked in the current active session
  const [sessionBookedSlots, setSessionBookedSlots] = useState<{
    tailorId: string;
    date: string;
    time: string;
  }[]>([]);

  // Dynamic calendar dates
  const now = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (initialDate) {
      const parsed = new Date(initialDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  // Displayed month in calendar header
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const [selectedTime, setSelectedTime] = useState(initialTime || "12:00 PM");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Week View: calculate 7 days surrounding the selectedDate's week (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - dayOfWeek);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  // Month View calculations
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  const startDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  }, [viewYear, viewMonth]);

  const handlePrev = () => {
    if (calendarView === "week") {
      const prevWeek = new Date(selectedDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setSelectedDate(prevWeek);
      setViewYear(prevWeek.getFullYear());
      setViewMonth(prevWeek.getMonth());
    } else {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    }
  };

  const handleNext = () => {
    if (calendarView === "week") {
      const nextWeek = new Date(selectedDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setSelectedDate(nextWeek);
      setViewYear(nextWeek.getFullYear());
      setViewMonth(nextWeek.getMonth());
    } else {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isPastDay = (d: Date) => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return target < today;
  };

  const isoDateStr = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const formattedDateStr = useMemo(() => {
    const monthShort = MONTH_NAMES[selectedDate.getMonth()].slice(0, 3);
    return `${selectedDate.getDate()} ${monthShort} ${selectedDate.getFullYear()}`;
  }, [selectedDate]);

  // Tailor attributes from backend API
  const tailorName =
    tailor?.shopName ||
    (tailor as any)?.fullName ||
    tailor?.name ||
    (tailor as any)?.businessName ||
    "Tailor";

  const tailorCity =
    tailor?.location?.city ||
    (tailor as any)?.city ||
    (tailor as any)?.address ||
    "Nearby";

  const tailorRating = tailor?.rating ? Number(tailor.rating).toFixed(1) : undefined;
  const reviewsCount =
    tailor?.reviewsCount ?? (tailor as any)?.reviews ?? (tailor as any)?.totalReviews ?? 0;

  const rawAvatarUri =
    tailor?.avatarUrl ||
    tailor?.avatar ||
    tailor?.imageUrl ||
    tailor?.image ||
    (tailor as any)?.profile?.avatar_url ||
    null;

  const avatarSource = rawAvatarUri ? { uri: rawAvatarUri } : null;
  const targetTailorId = String(tailorId || tailor?.id || "").toLowerCase();

  /**
   * Checks whether a specific time slot is already booked on a given date for this tailor
   */
  const isSlotBooked = useCallback(
    (timeSlot: string, dateStr: string): boolean => {
      const slot24 = normalizeTimeTo24h(timeSlot);

      // 1. Check in newly booked appointments from this session
      const isBookedInSession = sessionBookedSlots.some((item) => {
        const itemTailor = item.tailorId.toLowerCase();
        return (
          itemTailor === targetTailorId &&
          item.date === dateStr &&
          normalizeTimeTo24h(item.time) === slot24
        );
      });
      if (isBookedInSession) return true;

      // 2. Check in loaded appointments from API/database
      if (appointments && appointments.length > 0) {
        const found = appointments.find((appt) => {
          const status = (appt.status || "").toLowerCase();
          // Cancelled and rejected slots are reopened
          if (status === "cancelled" || status === "rejected") return false;

          const apptTailor = String(appt.tailorId || appt.tailor_id || "").toLowerCase();
          const matchesTailor = !targetTailorId || apptTailor === targetTailorId;

          const apptDate = normalizeDateStr(appt.appointmentDate || appt.date || appt.appointment_date || "");
          const apptTime = normalizeTimeTo24h(appt.appointmentTime || appt.time || appt.appointment_time || "");

          return matchesTailor && apptDate === dateStr && apptTime === slot24;
        });

        if (found) return true;
      }

      return false;
    },
    [appointments, sessionBookedSlots, targetTailorId]
  );

  // Counts of available & booked slots for currently selected date
  const { availableCount, bookedCount } = useMemo(() => {
    let booked = 0;
    let available = 0;
    ALL_SLOTS.forEach((slot) => {
      if (isSlotBooked(slot, isoDateStr)) {
        booked++;
      } else {
        available++;
      }
    });
    return { availableCount: available, bookedCount: booked };
  }, [isoDateStr, isSlotBooked]);

  // If currently selected slot is booked on the active date, switch to the first open slot
  useEffect(() => {
    if (isSlotBooked(selectedTime, isoDateStr)) {
      const firstAvailable = ALL_SLOTS.find((s) => !isSlotBooked(s, isoDateStr));
      if (firstAvailable) {
        setSelectedTime(firstAvailable);
      }
    }
  }, [isoDateStr, isSlotBooked, selectedTime]);

  const handleToggleTag = (tagText: string) => {
    const tagClean = tagText.replace(/^[^\w\s]+\s*/, "").trim();
    if (notes.includes(tagClean)) {
      const updated = notes
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== tagClean)
        .join(", ");
      setNotes(updated);
    } else {
      if (notes.trim().length === 0) {
        setNotes(tagClean);
      } else {
        setNotes((prev) => `${prev.trim()}, ${tagClean}`);
      }
    }
  };

  const handleHeaderBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as 1 | 2 | 3);
    } else {
      router.back();
    }
  };

  const handleConfirmBooking = async () => {
    // Double-check slot availability before confirming
    if (isSlotBooked(selectedTime, isoDateStr)) {
      Alert.alert(
        "Slot Unavailable",
        `Sorry, the ${selectedTime} slot on ${formattedDateStr} is already booked. Please choose an open slot.`
      );
      setCurrentStep(1);
      return;
    }

    // Convert time string to 24h format for API
    const time24 = normalizeTimeTo24h(selectedTime);

    setIsSubmitting(true);
    try {
      await createAppointment({
        tailorId: targetTailorId,
        tailor_id: targetTailorId,
        appointment_date: isoDateStr,
        appointment_time: time24,
        appointmentDate: isoDateStr,
        appointmentTime: time24,
        date: isoDateStr,
        time: time24,
        serviceType: "Tailor Consultation & Fitting",
        service_type: "Tailor Consultation & Fitting",
        notes: notes.trim() || undefined,
        location: tailorCity,
        price: 0,
        duration: "45 mins",
      });

      // Record slot as booked immediately in session state so it can never be booked again
      setSessionBookedSlots((prev) => [
        ...prev,
        { tailorId: targetTailorId, date: isoDateStr, time: selectedTime },
      ]);

      setIsSuccessModalOpen(true);
    } catch (err: any) {
      Alert.alert(
        "Booking Failed",
        err.message || "Failed to confirm appointment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentSlotBooked = isSlotBooked(selectedTime, isoDateStr);

  if (isLoading) {
    return (
      <BookingOrdersScreenShell>
        <BookingOrdersHeader
          title="Book Appointment"
          alignLeftTitle
          titleClassName="text-[22px] font-bold text-brand-dark tracking-tight"
          hideRightIcon
          onPressLeft={handleHeaderBack}
        />
        <View className="py-24 items-center justify-center">
          <ActivityIndicator size="large" color="#14919B" />
          <Text className="mt-3 text-[13px] font-medium text-brand-gray">
            Loading tailor details...
          </Text>
        </View>
      </BookingOrdersScreenShell>
    );
  }

  if (!tailor && !isLoading) {
    return (
      <BookingOrdersScreenShell>
        <BookingOrdersHeader
          title="Book Appointment"
          alignLeftTitle
          titleClassName="text-[22px] font-bold text-brand-dark tracking-tight"
          hideRightIcon
          onPressLeft={handleHeaderBack}
        />
        <View className="flex-1 items-center justify-center py-20 px-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Ionicons name="alert-circle-outline" size={32} color="#14919B" />
          </View>
          <Text className="text-[18px] font-bold text-brand-dark text-center">
            Tailor Not Found
          </Text>
          <Text className="mt-2 text-center text-[13px] font-medium text-brand-gray max-w-[280px]">
            We couldn't find the tailor you want to book an appointment with. Please select an active tailor to continue.
          </Text>
          <View className="mt-6 w-full max-w-[260px] gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/tailors" as any)}
              className="h-[48px] rounded-xl bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
            >
              <Text className="text-[13px] font-bold text-white">
                Explore Tailors
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

  return (
    <BookingOrdersScreenShell>
      {/* Top Navigation Header with prominent title */}
      <BookingOrdersHeader
        title="Book Appointment"
        alignLeftTitle
        titleClassName="text-[22px] font-bold text-brand-dark tracking-tight"
        hideRightIcon
        onPressLeft={handleHeaderBack}
      />

      <View className="px-5 pb-8">
        {/* Compact Tailor Header Banner */}
        <View className="mb-4 flex-row items-center rounded-2xl border border-brand-border bg-white p-3.5 shadow-2xs">
          <View className="overflow-hidden rounded-xl bg-primary-50 w-14 h-14 items-center justify-center">
            {avatarSource ? (
              <Image
                source={avatarSource}
                style={{ width: 56, height: 56 }}
                contentFit="cover"
              />
            ) : (
              <Ionicons name="storefront-outline" size={26} color="#14919B" />
            )}
          </View>

          <View className="ml-3 flex-1 justify-center">
            <Text className="text-[16px] font-bold text-brand-dark" numberOfLines={1}>
              {tailorName}
            </Text>

            <View className="mt-0.5 flex-row items-center">
              <Ionicons name="star" size={13} color="#F4B400" />
              <Text className="ml-1 text-[12px] font-semibold text-brand-dark">
                {tailorRating}{" "}
                <Text className="font-normal text-brand-gray">({reviewsCount})</Text>
              </Text>
              <Text className="mx-1.5 text-brand-gray">•</Text>
              <Text className="text-[12px] text-brand-gray" numberOfLines={1}>
                {tailorCity}
              </Text>
            </View>

            <View className="mt-1 self-start">
              <View className="flex-row items-center rounded-full bg-[#EAF8EE] px-2 py-0.5 border border-[#C6F0DB]">
                <Ionicons name="checkmark-circle" size={11} color="#0D9488" />
                <Text className="ml-1 text-[9px] font-semibold text-[#0D9488]">Verified Tailor</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3-Step Progress Stepper */}
        <View className="mb-5 rounded-2xl border border-brand-border/70 bg-white p-3.5 shadow-2xs">
          <View className="flex-row items-center justify-between">
            {STEPS.map((item, idx) => {
              const isActive = currentStep === item.step;
              const isCompleted = currentStep > item.step;

              return (
                <React.Fragment key={item.step}>
                  {idx > 0 && (
                    <View
                      className={`h-[2px] flex-1 mx-2.5 ${
                        currentStep >= item.step ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={!isCompleted}
                    onPress={() => setCurrentStep(item.step as 1 | 2 | 3)}
                    className="items-center"
                  >
                    <View
                      className={`h-7 w-7 items-center justify-center rounded-full ${
                        isActive
                          ? "bg-primary shadow-xs"
                          : isCompleted
                          ? "bg-primary/15 border border-primary"
                          : "bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={15} color="#14919B" />
                      ) : (
                        <Text
                          className={`text-[12px] font-bold ${
                            isActive ? "text-white" : "text-brand-gray"
                          }`}
                        >
                          {item.step}
                        </Text>
                      )}
                    </View>
                    <Text
                      className={`mt-1 text-[11px] ${
                        isActive
                          ? "font-bold text-primary"
                          : isCompleted
                          ? "font-semibold text-brand-dark"
                          : "font-medium text-brand-gray"
                      }`}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* ==================================================================== */}
        {/* STEP 1: SCHEDULE (DATE & TIME)                                       */}
        {/* ==================================================================== */}
        {currentStep === 1 && (
          <View>
            {/* Step Header */}
            <View className="mb-3">
              <Text className="text-[17px] font-bold text-brand-dark">
                Choose Date & Time
              </Text>
              <Text className="text-[12px] text-brand-gray">
                Pick an available slot for your tailoring appointment
              </Text>
            </View>

            {/* Calendar Card */}
            <View className="rounded-2xl border border-brand-border bg-white p-4 shadow-xs">
              {/* Month Navigation */}
              <View className="mb-3.5 flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={handlePrev}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-brand-surface active:bg-gray-200"
                >
                  <Ionicons name="chevron-back" size={18} color="#1A1D1F" />
                </TouchableOpacity>

                <View className="items-center">
                  <Text className="text-[15px] font-bold text-brand-dark">
                    {MONTH_NAMES[calendarView === "week" ? selectedDate.getMonth() : viewMonth]}{" "}
                    {calendarView === "week" ? selectedDate.getFullYear() : viewYear}
                  </Text>
                </View>

                <View className="flex-row items-center gap-1.5">
                  <TouchableOpacity
                    onPress={() => setCalendarView((v) => (v === "week" ? "month" : "week"))}
                    className="rounded-lg bg-brand-surface px-2.5 py-1 border border-brand-border/60 active:bg-gray-200"
                  >
                    <Text className="text-[11px] font-bold text-brand-gray">
                      {calendarView === "week" ? "Month" : "Week"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleNext}
                    className="h-8 w-8 items-center justify-center rounded-lg bg-brand-surface active:bg-gray-200"
                  >
                    <Ionicons name="chevron-forward" size={18} color="#1A1D1F" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Weekday Labels */}
              <View className="mb-2 flex-row justify-between">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                  <Text
                    key={day}
                    className="w-[14.28%] text-center text-[11px] font-bold text-brand-gray uppercase"
                  >
                    {day}
                  </Text>
                ))}
              </View>

              {/* Date Row / Grid */}
              {calendarView === "week" ? (
                /* 7-day row */
                <View className="flex-row justify-between py-1">
                  {weekDays.map((d) => {
                    const isSelected = isSameDay(d, selectedDate);
                    const isPast = isPastDay(d);
                    const isToday = isSameDay(d, now);

                    return (
                      <View key={d.toISOString()} className="h-11 w-[14.28%] items-center justify-center">
                        <TouchableOpacity
                          disabled={isPast}
                          onPress={() => {
                            setSelectedDate(d);
                            setViewYear(d.getFullYear());
                            setViewMonth(d.getMonth());
                          }}
                          className={`h-10 w-10 items-center justify-center rounded-xl ${
                            isSelected
                              ? "bg-primary shadow-xs"
                              : isPast
                              ? "opacity-35"
                              : "bg-brand-surface active:bg-gray-200"
                          }`}
                        >
                          <Text
                            className={`text-[13px] font-bold ${
                              isSelected
                                ? "text-white"
                                : isPast
                                ? "text-gray-400"
                                : "text-brand-dark"
                            }`}
                          >
                            {d.getDate()}
                          </Text>
                          {isToday && !isSelected && (
                            <View className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : (
                /* Month View */
                <View className="flex-row flex-wrap py-1">
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <View key={`empty-${i}`} className="h-11 w-[14.28%] items-center justify-center" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const d = new Date(viewYear, viewMonth, day);
                    const isSelected = isSameDay(d, selectedDate);
                    const isPast = isPastDay(d);
                    const isToday = isSameDay(d, now);

                    return (
                      <View key={day} className="h-11 w-[14.28%] items-center justify-center">
                        <TouchableOpacity
                          disabled={isPast}
                          onPress={() => {
                            setSelectedDate(d);
                          }}
                          className={`h-10 w-10 items-center justify-center rounded-xl ${
                            isSelected
                              ? "bg-primary shadow-xs"
                              : isPast
                              ? "opacity-35"
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
                          {isToday && !isSelected && (
                            <View className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Time Slot Selection with Real-time Booked Slot Protection */}
            <View className="mt-5 rounded-2xl border border-brand-border bg-white p-4 shadow-xs">
              <View className="mb-3.5 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={17} color="#14919B" />
                  <Text className="ml-2 text-[15px] font-bold text-brand-dark">Time Slots</Text>
                </View>

                {/* Availability status indicators */}
                <View className="flex-row items-center" style={{ gap: 6 }}>
                  <View className="flex-row items-center rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    <View className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                    <Text className="text-[10px] font-bold text-emerald-700">{availableCount} Open</Text>
                  </View>
                  {bookedCount > 0 && (
                    <View className="flex-row items-center rounded-full bg-gray-100 px-2 py-0.5 border border-gray-200">
                      <View className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-1" />
                      <Text className="text-[10px] font-semibold text-gray-500">{bookedCount} Booked</Text>
                    </View>
                  )}
                </View>
              </View>

              {TIME_SLOT_GROUPS.map((group, gIdx) => (
                <View key={group.period} className={gIdx > 0 ? "mt-3.5" : ""}>
                  <View className="mb-1.5 flex-row items-center">
                    <Ionicons name={group.icon} size={13} color="#6F767E" />
                    <Text className="ml-1 text-[11px] font-bold uppercase tracking-wider text-brand-gray">
                      {group.period}
                    </Text>
                  </View>

                  <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                    {group.slots.map((time) => {
                      const isBooked = isSlotBooked(time, isoDateStr);
                      const isSelected = !isBooked && time === selectedTime;

                      return (
                        <TouchableOpacity
                          key={time}
                          disabled={isBooked}
                          activeOpacity={0.75}
                          onPress={() => setSelectedTime(time)}
                          className={`h-[46px] min-w-[96px] flex-1 items-center justify-center rounded-xl border ${
                            isBooked
                              ? "border-gray-200 bg-gray-100/90 opacity-60"
                              : isSelected
                              ? "border-primary bg-primary shadow-xs"
                              : "border-brand-border bg-brand-surface active:bg-gray-100"
                          }`}
                        >
                          <View className="items-center justify-center">
                            <Text
                              className={`text-[12px] font-bold ${
                                isBooked
                                  ? "text-gray-400 line-through"
                                  : isSelected
                                  ? "text-white"
                                  : "text-brand-dark"
                              }`}
                            >
                              {time}
                            </Text>

                            {isBooked ? (
                              <View className="flex-row items-center mt-0.5">
                                <Ionicons name="lock-closed" size={9} color="#9CA3AF" />
                                <Text className="ml-0.5 text-[8px] font-bold text-gray-500 uppercase tracking-tight">
                                  Booked
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            {/* Next Step CTA with uncrushed layout */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isCurrentSlotBooked}
              onPress={() => {
                if (isCurrentSlotBooked) {
                  Alert.alert("Slot Booked", "Please select an available time slot before continuing.");
                  return;
                }
                setCurrentStep(2);
              }}
              className={`relative mt-6 h-[54px] w-full items-center justify-center overflow-hidden rounded-xl shadow-md ${
                isCurrentSlotBooked ? "opacity-50" : ""
              }`}
              style={{ borderRadius: 14 }}
            >
              <ButtonTexture variant="greenish" borderRadius={14} />
              <View className="flex-row items-center z-10">
                <Text className="text-[16px] font-bold text-white tracking-wide mr-2">
                  {isCurrentSlotBooked ? "Slot Booked — Choose Another" : "Continue to Notes"}
                </Text>
                {!isCurrentSlotBooked && (
                  <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: ADDITIONAL NOTES ONLY                                        */}
        {/* ==================================================================== */}
        {currentStep === 2 && (
          <View>
            {/* Step Header */}
            <View className="mb-4">
              <Text className="text-[18px] font-bold text-brand-dark">
                Additional Notes
              </Text>
              <Text className="mt-0.5 text-[13px] text-brand-gray">
                Share your requirements, fabric details or styling requests with the tailor
              </Text>
            </View>

            {/* Notes Textarea Card */}
            <View className="mb-4 rounded-2xl border border-brand-border bg-white px-4 py-3.5 shadow-xs">
              <TextInput
                multiline
                placeholder="Describe your design ideas, neckline/sleeves preferences, fabric type, measurements, or urgent delivery requirements..."
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                maxLength={200}
                className="min-h-[120px] text-[13px] font-medium leading-6 text-brand-dark"
                textAlignVertical="top"
              />
              <View className="mt-3 flex-row items-center justify-between border-t border-brand-border/40 pt-2.5">
                <Text className="text-[11px] text-brand-gray">Helpful context for the tailor</Text>
                <Text className="text-[11px] font-medium text-brand-gray">{notes.length}/200</Text>
              </View>
            </View>

            {/* Quick Suggestion Chips */}
            <View className="mb-6">
              <Text className="mb-2 text-[12px] font-semibold text-brand-gray">
                Tap to quickly add tags
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => {
                  const tagClean = tag.replace(/^[^\w\s]+\s*/, "").trim();
                  const isActive = notes.includes(tagClean);

                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => handleToggleTag(tag)}
                      className={`rounded-full border px-3 py-1.5 ${
                        isActive
                          ? "border-primary bg-primary/10"
                          : "border-brand-border bg-white active:bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-[12px] font-semibold ${
                          isActive ? "text-primary" : "text-brand-gray"
                        }`}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Step Navigation Buttons - Uncrushable layout with explicit spacing */}
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCurrentStep(1)}
                className="h-[52px] min-w-[96px] px-4 items-center justify-center rounded-xl border border-brand-border bg-white active:bg-gray-100 shadow-2xs"
              >
                <View className="flex-row items-center">
                  <Ionicons name="arrow-back" size={16} color="#1A1D1F" style={{ marginRight: 4 }} />
                  <Text className="text-[14px] font-bold text-brand-dark">Back</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setCurrentStep(3)}
                className="relative h-[52px] flex-1 items-center justify-center overflow-hidden rounded-xl shadow-md"
                style={{ borderRadius: 14 }}
              >
                <ButtonTexture variant="greenish" borderRadius={14} />
                <View className="flex-row items-center z-10 px-4">
                  <Text className="text-[15px] font-bold text-white tracking-wide mr-1.5">
                    Review Details
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: REVIEW & CONFIRM                                             */}
        {/* ==================================================================== */}
        {currentStep === 3 && (
          <View>
            {/* Step Header */}
            <View className="mb-3">
              <Text className="text-[18px] font-bold text-brand-dark">
                Review & Confirm
              </Text>
              <Text className="text-[12px] text-brand-gray">
                Verify your appointment details before finalizing
              </Text>
            </View>

            {/* Summary Card */}
            <View className="mb-4 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-2xs">
              <InfoRow label="Tailor" value={tailorName} />
              <InfoRow label="Appointment Type" value="Tailor Consultation & Fitting" />
              <InfoRow label="Date" value={formattedDateStr} />
              <InfoRow label="Time Slot" value={selectedTime} />
              <InfoRow label="Location" value={tailorCity} />
              <InfoRow label="Estimated Duration" value="~45 mins" />
              <InfoRow
                label="Consultation Fee"
                value="FREE"
                highlight
              />
            </View>

            {/* Notes Preview if any */}
            <View className="mb-4 rounded-2xl border border-brand-border bg-white p-4 shadow-2xs">
              <View className="flex-row items-center mb-1">
                <Ionicons name="document-text-outline" size={14} color="#6F767E" />
                <Text className="ml-1 text-[11px] font-bold uppercase tracking-wider text-brand-gray">
                  Your Notes & Requests
                </Text>
              </View>
              <Text className="text-[13px] text-brand-dark leading-5 font-medium">
                {notes.trim().length > 0
                  ? notes.trim()
                  : "None specified (you can discuss requirements directly with the tailor)"}
              </Text>
            </View>

            {/* Trust Assurance Card */}
            <View className="mb-6 rounded-2xl border border-[#C6F0DB] bg-[#F0FAF5] p-3.5">
              <View className="flex-row items-center mb-1">
                <Ionicons name="shield-checkmark" size={16} color="#0D9488" />
                <Text className="ml-1.5 text-[13px] font-bold text-[#0D9488]">
                  Sui Dhaga Appointment Guarantee
                </Text>
              </View>
              <Text className="text-[11px] text-brand-dark/80 leading-4">
                • Zero booking fees • Pay tailor directly for tailoring • Free rescheduling up to 24h prior.
              </Text>
            </View>

            {/* Step Navigation Buttons - Uncrushable layout with explicit spacing */}
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCurrentStep(2)}
                className="h-[54px] min-w-[96px] px-4 items-center justify-center rounded-xl border border-brand-border bg-white active:bg-gray-100 shadow-2xs"
              >
                <View className="flex-row items-center">
                  <Ionicons name="create-outline" size={16} color="#1A1D1F" style={{ marginRight: 4 }} />
                  <Text className="text-[14px] font-bold text-brand-dark">Edit</Text>
                </View>
              </TouchableOpacity>

              {/* Confirm Booking CTA with signature texture */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleConfirmBooking}
                disabled={isSubmitting || isCurrentSlotBooked}
                className={`relative h-[54px] flex-1 items-center justify-center overflow-hidden rounded-xl shadow-md ${
                  isCurrentSlotBooked ? "opacity-50" : ""
                }`}
                style={{ borderRadius: 14 }}
              >
                <ButtonTexture variant="greenish" borderRadius={14} />
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View className="flex-row items-center z-10 px-4">
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text className="text-[16px] font-bold text-white tracking-wide">
                      Confirm Booking
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Booking Success Celebration Modal */}
      <Modal
        visible={isSuccessModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsSuccessModalOpen(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-5">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl items-center">
            {/* Celebration Icon */}
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EAF8EE] mb-4">
              <Ionicons name="checkmark-done" size={32} color="#0D9488" />
            </View>

            <Text className="text-[19px] font-bold text-brand-dark text-center">
              Booking Confirmed! 🎉
            </Text>
            <Text className="mt-1.5 text-[13px] text-brand-gray text-center leading-5">
              Your appointment with{" "}
              <Text className="font-bold text-brand-dark">{tailorName}</Text> has been scheduled successfully.
            </Text>

            {/* Recap Card */}
            <View className="mt-4 w-full rounded-2xl border border-brand-border bg-brand-surface p-3.5">
              <View className="flex-row items-center justify-between py-1">
                <Text className="text-[12px] text-brand-gray">Type</Text>
                <Text className="text-[12px] font-bold text-brand-dark">Tailor Consultation & Fitting</Text>
              </View>
              <View className="flex-row items-center justify-between py-1">
                <Text className="text-[12px] text-brand-gray">Date & Time</Text>
                <Text className="text-[12px] font-bold text-brand-dark">{formattedDateStr} • {selectedTime}</Text>
              </View>
              <View className="flex-row items-center justify-between py-1">
                <Text className="text-[12px] text-brand-gray">Location</Text>
                <Text className="text-[12px] font-bold text-brand-dark">{tailorCity}</Text>
              </View>
            </View>

            {/* Modal Buttons */}
            <TouchableOpacity
              onPress={() => {
                setIsSuccessModalOpen(false);
                router.push("/appointments" as any);
              }}
              className="relative mt-5 h-[48px] w-full items-center justify-center overflow-hidden rounded-xl shadow-xs"
              style={{ borderRadius: 12 }}
            >
              <ButtonTexture variant="greenish" borderRadius={12} />
              <Text className="text-[14px] font-bold text-white z-10">View Appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsSuccessModalOpen(false);
                router.push("/home" as any);
              }}
              className="mt-2.5 h-[44px] w-full items-center justify-center rounded-xl border border-brand-border bg-white active:bg-gray-50"
            >
              <Text className="text-[14px] font-semibold text-brand-dark">Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </BookingOrdersScreenShell>
  );
}
