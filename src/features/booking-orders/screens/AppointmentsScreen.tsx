import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppointmentCard } from "../components/AppointmentCard";
import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { BottomTabsPreview } from "../components/BottomTabsPreview";
import { SectionLabel } from "../components/SectionLabel";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { useAppointments } from "../hooks/useAppointments";

export default function AppointmentsScreen() {
  const { appointments, isLoading, isRefreshing, refresh, error } = useAppointments();
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  const getTone = (index: number): "coral" | "blue" | "gold" | "teal" => {
    const tones: ("coral" | "blue" | "gold" | "teal")[] = ["coral", "blue", "gold", "teal"];
    return tones[index % tones.length];
  };

  const upcoming = appointments.filter((a) => {
    const s = (a.status || "").toLowerCase();
    return s === "upcoming" || s === "confirmed" || s === "pending" || !s;
  });

  const completed = appointments.filter(
    (a) => (a.status || "").toLowerCase() === "completed"
  );

  const cancelled = appointments.filter((a) => {
    const s = (a.status || "").toLowerCase();
    return s === "cancelled" || s === "rejected";
  });

  const tabs = [
    `Upcoming (${upcoming.length})`,
    `Completed (${completed.length})`,
    `Cancelled (${cancelled.length})`,
  ];

  return (
    <BookingOrdersScreenShell bottomTabs={<BottomTabsPreview active="Tailors" />}>
      <BookingOrdersHeader
        title="Appointments"
        leftIcon="arrow-back"
        onPressLeft={() => router.back()}
        rightIcon="notifications-outline"
        rightLabel="Notifications"
        onPressRight={() => router.push("/home" as any)}
      />
      <ScrollView
        className="flex-1 px-5 pb-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#14919B"
            colors={["#14919B"]}
          />
        }
      >
        <SegmentedTabs
          tabs={tabs}
          activeIndex={selectedTabIndex}
          onChange={(index) => setSelectedTabIndex(index)}
        />

        {error && !isLoading ? (
          <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <View className="flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="ml-2 flex-1 text-[13px] font-semibold text-red-700">
                {error}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={refresh}
              className="mt-3 self-end rounded-md bg-red-600 px-3 py-1.5"
            >
              <Text className="text-[12px] font-bold text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isLoading && !isRefreshing ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] font-medium text-brand-gray">
              Loading appointments...
            </Text>
          </View>
        ) : selectedTabIndex === 0 ? (
          // Upcoming Tab
          <View className="mt-2">
            <SectionLabel title="Upcoming Appointments" />
            {upcoming.length > 0 ? (
              upcoming.map((appt, index) => (
                <AppointmentCard
                  key={appt.id || index}
                  tailor={appt.tailorName || "Tailor"}
                  avatar={appt.tailorAvatar || appt.tailor?.avatar || appt.tailor?.avatar_url || appt.tailor?.imageUrl || appt.tailor?.image}
                  service={appt.serviceType || "Tailoring Appointment"}
                  date={appt.appointmentDate || appt.date || "Scheduled"}
                  time={appt.appointmentTime || appt.time || ""}
                  status={appt.status || "Upcoming"}
                  tone="blue"
                  placeholderTone={getTone(index)}
                  onPress={() =>
                    router.push({
                      pathname: "/appointments/[appointmentId]",
                      params: { appointmentId: appt.id },
                    } as any)
                  }
                />
              ))
            ) : (
              <View className="items-center justify-center rounded-md border border-brand-border bg-white py-12 px-4 shadow-xs">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <Ionicons name="calendar-outline" size={32} color="#14919B" />
                </View>
                <Text className="text-[16px] font-bold text-brand-dark">
                  No Upcoming Appointments
                </Text>
                <Text className="mt-1 text-center text-[12px] font-medium text-brand-gray max-w-[240px]">
                  Book an appointment with our master tailors for custom stitching.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push("/tailors" as any)}
                  className="mt-4 rounded-md bg-primary px-5 py-2.5 shadow-xs active:bg-primary-dark"
                >
                  <Text className="text-[13px] font-bold text-white">
                    Explore Tailors
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : selectedTabIndex === 1 ? (
          // Completed Tab
          <View className="mt-2">
            <SectionLabel title="Completed Appointments" />
            {completed.length > 0 ? (
              completed.map((appt, index) => (
                <AppointmentCard
                  key={appt.id || index}
                  tailor={appt.tailorName || "Tailor"}
                  avatar={appt.tailorAvatar || appt.tailor?.avatar || appt.tailor?.avatar_url || appt.tailor?.imageUrl || appt.tailor?.image}
                  service={appt.serviceType || "Tailoring Appointment"}
                  date={appt.appointmentDate || appt.date || "Completed"}
                  time={appt.appointmentTime || appt.time || ""}
                  status={appt.status || "Completed"}
                  tone="green"
                  placeholderTone={getTone(index + 1)}
                  onPress={() =>
                    router.push({
                      pathname: "/appointments/[appointmentId]",
                      params: { appointmentId: appt.id },
                    } as any)
                  }
                />
              ))
            ) : (
              <View className="items-center justify-center rounded-md border border-brand-border bg-white py-12 px-4 shadow-xs">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-green-50 mb-3">
                  <Ionicons name="checkmark-done-circle-outline" size={32} color="#10B981" />
                </View>
                <Text className="text-[16px] font-bold text-brand-dark">
                  No Completed Appointments
                </Text>
                <Text className="mt-1 text-center text-[12px] font-medium text-brand-gray">
                  Your past completed appointments will show up here.
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Cancelled Tab
          <View className="mt-2">
            <SectionLabel title="Cancelled Appointments" />
            {cancelled.length > 0 ? (
              cancelled.map((appt, index) => (
                <AppointmentCard
                  key={appt.id || index}
                  tailor={appt.tailorName || "Tailor"}
                  avatar={appt.tailorAvatar || appt.tailor?.avatar || appt.tailor?.avatar_url || appt.tailor?.imageUrl || appt.tailor?.image}
                  service={appt.serviceType || "Tailoring Appointment"}
                  date={appt.appointmentDate || appt.date || "Cancelled"}
                  time={appt.appointmentTime || appt.time || ""}
                  status={appt.status || "Cancelled"}
                  tone="red"
                  placeholderTone={getTone(index + 2)}
                  onPress={() =>
                    router.push({
                      pathname: "/appointments/[appointmentId]",
                      params: { appointmentId: appt.id },
                    } as any)
                  }
                />
              ))
            ) : (
              <View className="items-center justify-center rounded-md border border-brand-border bg-white py-12 px-4 shadow-xs">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-3">
                  <Ionicons name="close-circle-outline" size={32} color="#EF4444" />
                </View>
                <Text className="text-[16px] font-bold text-brand-dark">
                  No Cancelled Appointments
                </Text>
                <Text className="mt-1 text-center text-[12px] font-medium text-brand-gray">
                  Cancelled appointments will appear in this history list.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </BookingOrdersScreenShell>
  );
}
