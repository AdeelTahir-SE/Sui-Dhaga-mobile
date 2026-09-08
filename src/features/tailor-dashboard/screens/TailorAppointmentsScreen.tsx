import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppointmentRequestCard } from "../components/AppointmentRequestCard";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { useAppointments } from "../../booking-orders/hooks/useAppointments";

type AppointmentTab = "requests" | "upcoming" | "completed";

export default function TailorAppointmentsScreen() {
  const { appointments, isLoading, isRefreshing, refresh } = useAppointments();
  const [selectedTab, setSelectedTab] = useState<AppointmentTab>("requests");
  const [searchQuery, setSearchQuery] = useState("");

  const allAppointments = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) return [];

    return appointments.map((apt, index) => {
      const statusLower = (apt.status || "").toLowerCase();
      const tabCategory: AppointmentTab =
        statusLower === "completed"
          ? "completed"
          : statusLower === "upcoming" || statusLower === "confirmed"
          ? "upcoming"
          : "requests";

      const tones: ("coral" | "blue" | "gold" | "teal" | "mint")[] = [
        "coral",
        "blue",
        "gold",
        "teal",
        "mint",
      ];
      const avatarUrl =
        apt.customerAvatar || apt.clientAvatar || apt.tailorAvatar;

      return {
        id: apt.id || `apt-${index}`,
        name:
          apt.customerName ||
          apt.clientName ||
          apt.userName ||
          apt.tailorName ||
          "Customer",
        service: apt.serviceType || "Tailoring Appointment",
        date: apt.appointmentDate || "Date TBD",
        time: apt.appointmentTime || "Time TBD",
        status: tabCategory,
        newRequest: tabCategory === "requests",
        tone: tones[index % tones.length],
        image: avatarUrl ? { uri: avatarUrl } : undefined,
      };
    });
  }, [appointments]);

  const requestsList = useMemo(
    () => allAppointments.filter((a) => a.status === "requests"),
    [allAppointments]
  );
  const upcomingList = useMemo(
    () => allAppointments.filter((a) => a.status === "upcoming"),
    [allAppointments]
  );
  const completedList = useMemo(
    () => allAppointments.filter((a) => a.status === "completed"),
    [allAppointments]
  );

  const tabs: { key: AppointmentTab; label: string; count: number }[] = [
    { key: "requests", label: "Requests", count: requestsList.length },
    { key: "upcoming", label: "Upcoming", count: upcomingList.length },
    { key: "completed", label: "Completed", count: completedList.length },
  ];

  const currentList =
    selectedTab === "requests"
      ? requestsList
      : selectedTab === "upcoming"
      ? upcomingList
      : completedList;

  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter((a) => {
      const name = a.name.toLowerCase();
      const service = a.service.toLowerCase();
      const date = a.date.toLowerCase();
      const time = a.time.toLowerCase();
      return name.includes(q) || service.includes(q) || date.includes(q) || time.includes(q);
    });
  }, [currentList, searchQuery]);

  return (
    <TailorDashboardShell
      bottomTabs={<TailorDashboardTabs active="Appointments" />}
    >
      <TailorDashboardHeader title="Appointments" rightIcon="clipboard-outline" />

      {/* Fixed Search and Filter Tabs at top */}
      <View className="px-5 pt-1">
        {/* Search Field */}
        <View className="mb-3.5 h-[46px] flex-row items-center rounded-md border border-brand-border bg-white px-3.5 shadow-xs">
          <Ionicons name="search-outline" size={17} color="#6F767E" />
          <TextInput
            className="ml-2.5 flex-1 text-[13px] font-medium text-brand-dark"
            placeholder="Search appointments by client or service..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Interactive Filter Tabs */}
        <View className="mb-3 flex-row border-b border-brand-border">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => setSelectedTab(tab.key)}
                className={`flex-1 items-center pb-3 ${
                  isActive ? "-mb-[1px] border-b-2 border-primary" : ""
                }`}
              >
                <Text
                  className={`text-[13px] ${
                    isActive
                      ? "font-bold text-primary"
                      : "font-semibold text-brand-gray"
                  }`}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#14919B"
            colors={["#14919B"]}
          />
        }
      >

        {isLoading && !isRefreshing ? (
          <View className="py-20 items-center justify-center" style={{ minHeight: 380 }}>
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] font-medium text-brand-gray">
              Loading appointments...
            </Text>
          </View>
        ) : filteredAppointments.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12 px-4" style={{ minHeight: 400 }}>
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons
                name={
                  selectedTab === "completed"
                    ? "checkmark-done-circle-outline"
                    : selectedTab === "upcoming"
                    ? "calendar-outline"
                    : "calendar-clear-outline"
                }
                size={38}
                color="#14919B"
              />
            </View>
            <Text className="text-[18px] font-bold text-brand-dark text-center tracking-tight">
              {searchQuery.trim()
                ? "No Matching Appointments"
                : selectedTab === "requests"
                ? "No Appointment Requests"
                : selectedTab === "upcoming"
                ? "No Upcoming Appointments"
                : "No Completed Appointments"}
            </Text>
            <Text className="mt-2 text-[13px] font-medium text-brand-gray text-center leading-[20px] max-w-[290px] mb-6">
              {searchQuery.trim()
                ? `We couldn't find any appointments matching "${searchQuery}". Try searching by client name or service.`
                : selectedTab === "requests"
                ? "You're all caught up! New booking requests from clients will appear here."
                : selectedTab === "upcoming"
                ? "You don't have any upcoming appointments scheduled right now."
                : "Your completed appointment history will be listed here."}
            </Text>
            {searchQuery.trim() ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSearchQuery("")}
                className="h-[44px] px-6 rounded-md bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
              >
                <Text className="text-[13px] font-bold text-white tracking-wide">
                  Clear Search
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          filteredAppointments.map((apt) => (
            <AppointmentRequestCard
              key={apt.id}
              image={apt.image}
              name={apt.name}
              service={apt.service}
              date={apt.date}
              time={apt.time}
              newRequest={apt.newRequest}
              tone={apt.tone}
            />
          ))
        )}
      </ScrollView>
    </TailorDashboardShell>
  );
}
