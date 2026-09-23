import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppointmentCard } from "../components/AppointmentCard";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { useAppointments } from "../hooks/useAppointments";

export default function AppointmentsScreen() {
  const { appointments, isLoading, isRefreshing, refresh, error } = useAppointments();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filterOptions = [
    {
      label: "All Appointments",
      value: null,
      desc: "Show all your scheduled and past appointments",
      icon: "calendar-outline" as const,
      badge: "All",
    },
    {
      label: "Upcoming",
      value: "upcoming",
      desc: "Confirmed and scheduled tailor visits",
      icon: "time-outline" as const,
      badge: "Upcoming",
    },
    {
      label: "Completed",
      value: "completed",
      desc: "Past consultations and finished fittings",
      icon: "checkmark-done-circle-outline" as const,
      badge: "Completed",
    },
    {
      label: "Cancelled",
      value: "cancelled",
      desc: "Appointments that were cancelled or declined",
      icon: "close-circle-outline" as const,
      badge: "Cancelled",
    },
  ];

  const isUpcoming = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "upcoming" || s === "confirmed" || s === "pending" || s === "scheduled" || !s;
  };

  const isCompleted = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "completed";
  };

  const isCancelled = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "cancelled" || s === "canceled" || s === "rejected";
  };

  const getAppointmentCount = (filterVal: string | null) => {
    if (filterVal === null) return appointments.length;
    if (filterVal === "upcoming") {
      return appointments.filter((a) => isUpcoming(a.status)).length;
    }
    if (filterVal === "completed") {
      return appointments.filter((a) => isCompleted(a.status)).length;
    }
    if (filterVal === "cancelled") {
      return appointments.filter((a) => isCancelled(a.status)).length;
    }
    return appointments.length;
  };

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];

    // 1. Status Filter
    if (activeFilter === "upcoming") {
      result = result.filter((a) => isUpcoming(a.status));
    } else if (activeFilter === "completed") {
      result = result.filter((a) => isCompleted(a.status));
    } else if (activeFilter === "cancelled") {
      result = result.filter((a) => isCancelled(a.status));
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((apt) => {
        const tailor = (apt.tailorName || apt.tailor?.name || apt.tailor?.shopName || "").toLowerCase();
        const service = (apt.serviceType || apt.service?.name || "").toLowerCase();
        const status = (apt.status || "").toLowerCase();
        const date = (apt.appointmentDate || apt.date || "").toLowerCase();
        const location = (apt.location || "").toLowerCase();
        return (
          tailor.includes(q) ||
          service.includes(q) ||
          status.includes(q) ||
          date.includes(q) ||
          location.includes(q)
        );
      });
    }

    return result;
  }, [appointments, activeFilter, searchQuery]);

  const modalFilteredCount = useMemo(() => {
    let result = [...appointments];
    if (selectedFilter === "upcoming") {
      result = result.filter((a) => isUpcoming(a.status));
    } else if (selectedFilter === "completed") {
      result = result.filter((a) => isCompleted(a.status));
    } else if (selectedFilter === "cancelled") {
      result = result.filter((a) => isCancelled(a.status));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((apt) => {
        const tailor = (apt.tailorName || apt.tailor?.name || apt.tailor?.shopName || "").toLowerCase();
        const service = (apt.serviceType || apt.service?.name || "").toLowerCase();
        const status = (apt.status || "").toLowerCase();
        const date = (apt.appointmentDate || apt.date || "").toLowerCase();
        return (
          tailor.includes(q) ||
          service.includes(q) ||
          status.includes(q) ||
          date.includes(q)
        );
      });
    }
    return result.length;
  }, [appointments, selectedFilter, searchQuery]);

  const getTone = (index: number): "coral" | "blue" | "gold" | "teal" => {
    const tones: ("coral" | "blue" | "gold" | "teal")[] = ["teal", "blue", "gold", "coral"];
    return tones[index % tones.length];
  };

  const activeFilterOption = filterOptions.find((f) => f.value === activeFilter);

  return (
    // Note: bottomTabs omitted to remove bottom tabs as requested
    <BookingOrdersScreenShell>
      {/* Header matching Orders page font style, back button on left, no bell icon at top right */}
      <View className="px-5 pb-3 pt-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color="#1A1D1F" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-[20px] font-black text-brand-dark tracking-tight">
              Appointments
            </Text>
            <Text className="mt-0.5 text-[13px] font-medium text-brand-gray">
              Manage fittings & tailor consultations
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pb-6"
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
        {/* Search Bar & Dedicated Filter Button (Identical to Orders page) */}
        <View className="flex-row items-center gap-2.5 mb-4 mt-1">
          <View
            className="flex-1 flex-row items-center px-3.5 bg-[#F8FAFC] shadow-xs"
            style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
          >
            <Ionicons name="search" size={19} color="#14919B" />
            <TextInput
              style={{ paddingVertical: 0 }}
              className="ml-2.5 flex-1 text-[13px] font-medium text-brand-dark"
              placeholder="Search by tailor, service, status..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="p-1"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={17} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => {
              setSelectedFilter(activeFilter);
              setIsFilterModalVisible(true);
            }}
            activeOpacity={0.8}
            className="items-center justify-center shadow-xs"
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
            accessibilityLabel="Filter appointments"
          >
            <Ionicons name="filter" size={21} color="#14919B" />
            {activeFilter !== null && (
              <View
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor: "#14919B",
                }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Pill if Filter Applied */}
        {activeFilter !== null && (
          <View className="flex-row items-center mb-3.5">
            <View
              className="flex-row items-center bg-[#E0F7F7] px-3 py-1.5 rounded-full"
              style={{ borderWidth: 1, borderColor: "#B2EBF2" }}
            >
              <Text className="text-[12px] font-semibold text-[#0D7377] mr-1.5">
                Status: {activeFilterOption?.badge || activeFilter}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveFilter(null)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close-circle" size={16} color="#0D7377" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Error Alert */}
        {error && !isLoading ? (
          <View
            className="mb-4 rounded-xl bg-red-50 p-4"
            style={{ borderWidth: 1, borderColor: "#FECACA" }}
          >
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

        {/* Loading Indicator */}
        {isLoading && !isRefreshing ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] font-medium text-brand-gray">
              Loading appointments...
            </Text>
          </View>
        ) : (
          <View className="mt-1">
            {/* Appointments Count & Header Row */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[13px] font-bold text-brand-dark uppercase tracking-wider">
                {activeFilter ? `${activeFilterOption?.badge} Appointments` : "All Appointments"}
              </Text>
              <Text className="text-[12px] font-medium text-brand-gray">
                {filteredAppointments.length} {filteredAppointments.length === 1 ? "result" : "results"}
              </Text>
            </View>

            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt, index) => {
                const tailorAvatar =
                  appt.tailorAvatar ||
                  appt.tailor?.avatar ||
                  appt.tailor?.avatar_url ||
                  appt.tailor?.imageUrl ||
                  appt.tailor?.image;

                return (
                  <AppointmentCard
                    key={appt.id || index}
                    id={appt.id}
                    tailor={appt.tailorName || appt.tailor?.name || "Master Tailor"}
                    avatar={tailorAvatar}
                    service={appt.serviceType || "Custom Stitching & Fitting"}
                    date={appt.appointmentDate || appt.date || "Scheduled"}
                    time={appt.appointmentTime || appt.time || ""}
                    status={appt.status || "Upcoming"}
                    location={appt.location}
                    placeholderTone={getTone(index)}
                    onPress={() =>
                      router.push({
                        pathname: "/appointments/[appointmentId]",
                        params: { appointmentId: appt.id },
                      } as any)
                    }
                  />
                );
              })
            ) : (
              <View
                className="items-center justify-center rounded-2xl bg-gray-50/60 py-12 px-4 shadow-xs my-2"
                style={{ borderWidth: 1, borderColor: "#E2E8F0", borderStyle: "dashed" }}
              >
                <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <Ionicons name="calendar-outline" size={30} color="#14919B" />
                </View>
                <Text className="text-[17px] font-bold text-brand-dark">
                  {searchQuery ? "No Matching Appointments" : "No Appointments Found"}
                </Text>
                <Text className="mt-1 text-center text-[12.5px] font-medium text-brand-gray max-w-[270px]">
                  {searchQuery
                    ? "Try adjusting your search query or clear the filter."
                    : "You don't have any appointments scheduled. Book a visit or fitting with an expert tailor."}
                </Text>
                {searchQuery ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSearchQuery("");
                      setActiveFilter(null);
                    }}
                    className="mt-4 rounded-xl bg-slate-100 px-4 py-2"
                  >
                    <Text className="text-[12.5px] font-bold text-brand-dark">
                      Clear Search & Filters
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push("/tailors" as any)}
                    className="mt-4 rounded-xl bg-primary px-5 py-2.5 shadow-xs active:bg-primary-dark"
                  >
                    <Text className="text-[13px] font-bold text-white">
                      Book New Appointment
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal: Appointment Filter */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
        >
          <View className="rounded-t-[36px] bg-white px-5 pb-8 pt-3 shadow-2xl max-h-[88%]">
            {/* Drag handle indicator */}
            <View className="h-1.5 w-12 rounded-full bg-slate-200 self-center mb-3 mt-1" />

            {/* Header */}
            <View className="flex-row items-center justify-between pb-3">
              <View className="flex-row items-center flex-1">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E0F7F7] mr-3">
                  <Ionicons name="filter" size={20} color="#14919B" />
                </View>
                <View className="flex-1">
                  <Text className="text-[17px] font-bold text-brand-dark">
                    Filter Appointments
                  </Text>
                  <Text className="text-[12px] font-medium text-brand-gray">
                    Filter your visits by appointment status
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsFilterModalVisible(false)}
                className="h-8 w-8 items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Subtle hairline divider */}
            <View className="h-[1px] bg-slate-100 mb-3.5" />

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Appointment Status
              </Text>

              <View className="gap-2.5 mb-4">
                {filterOptions.map((opt) => {
                  const isSelected = selectedFilter === opt.value;
                  const count = getAppointmentCount(opt.value);

                  return (
                    <TouchableOpacity
                      key={opt.label}
                      activeOpacity={0.75}
                      onPress={() => setSelectedFilter(opt.value)}
                      className="flex-row items-center justify-between p-3.5 rounded-xl"
                      style={{
                        backgroundColor: isSelected ? "#F0FAFA" : "#FFFFFF",
                        borderWidth: isSelected ? 1.5 : 1,
                        borderColor: isSelected ? "#14919B" : "#E2E8F0",
                      }}
                    >
                      <View className="flex-row items-center flex-1 mr-3">
                        <View
                          className="h-10 w-10 items-center justify-center rounded-xl mr-3"
                          style={{
                            backgroundColor: isSelected ? "#14919B" : "#F0FAFA",
                          }}
                        >
                          <Ionicons
                            name={opt.icon}
                            size={19}
                            color={isSelected ? "#FFFFFF" : "#14919B"}
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center">
                            <Text
                              className={`text-[14px] font-bold ${
                                isSelected ? "text-[#14919B]" : "text-brand-dark"
                              }`}
                            >
                              {opt.label}
                            </Text>
                            <View
                              className="ml-2 px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: isSelected
                                  ? "#E0F7F7"
                                  : "#F1F5F9",
                              }}
                            >
                              <Text
                                className={`text-[10px] font-bold ${
                                  isSelected
                                    ? "text-[#0D7377]"
                                    : "text-slate-500"
                                }`}
                              >
                                {opt.badge}
                              </Text>
                            </View>
                          </View>
                          <Text
                            className={`text-[11.5px] mt-0.5 ${
                              isSelected ? "text-[#0D7377]" : "text-brand-gray"
                            }`}
                          >
                            {opt.desc}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center gap-2.5">
                        <Text
                          className={`text-[11px] font-bold ${
                            isSelected ? "text-[#14919B]" : "text-slate-400"
                          }`}
                        >
                          {count} {count === 1 ? "visit" : "visits"}
                        </Text>
                        <View
                          className="h-5 w-5 rounded-full items-center justify-center"
                          style={{
                            backgroundColor: isSelected
                              ? "#14919B"
                              : "#FFFFFF",
                            borderWidth: isSelected ? 0 : 1.5,
                            borderColor: "#CBD5E1",
                          }}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color="#FFFFFF"
                            />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View
              className="mt-3.5 pt-3 pb-1 flex flex-row items-center justify-center gap-3"
              style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0" }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedFilter(null);
                  setActiveFilter(null);
                }}
                className="h-[50px] px-5 flex-1 items-center justify-center rounded-xl bg-white shadow-xs"
                style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
              >
                <Text className="text-[13px] font-bold text-brand-gray">
                  Reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setActiveFilter(selectedFilter);
                  setIsFilterModalVisible(false);
                }}
                className="h-[50px] flex-1 items-center justify-center rounded-xl bg-[#14919B] active:bg-[#0D7377] shadow-sm px-4"
              >
                <Text className="text-[14px] font-bold text-white">
                  Apply Filter ({modalFilteredCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </BookingOrdersScreenShell>
  );
}
