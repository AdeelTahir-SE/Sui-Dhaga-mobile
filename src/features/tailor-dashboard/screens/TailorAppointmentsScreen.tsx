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

import { AppointmentRequestCard } from "../components/AppointmentRequestCard";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { useAppointments } from "../../booking-orders/hooks/useAppointments";

export default function TailorAppointmentsScreen() {
  const {
    appointments,
    isLoading,
    isRefreshing,
    refresh,
    updateStatus,
    cancelAppointment,
  } = useAppointments();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filterOptions = [
    {
      label: "All Appointments",
      value: null,
      desc: "Show all client bookings",
      icon: "calendar-outline",
      badge: "All",
    },
    {
      label: "New Requests",
      value: "requests",
      desc: "Booking requests awaiting your confirmation",
      icon: "alert-circle-outline",
      badge: "Requests",
    },
    {
      label: "Upcoming",
      value: "upcoming",
      desc: "Confirmed and scheduled appointments",
      icon: "time-outline",
      badge: "Upcoming",
    },
    {
      label: "Completed",
      value: "completed",
      desc: "Past finished consultations and fittings",
      icon: "checkmark-done-circle-outline",
      badge: "Completed",
    },
    {
      label: "Cancelled",
      value: "cancelled",
      desc: "Cancelled or declined appointments",
      icon: "close-circle-outline",
      badge: "Cancelled",
    },
  ];

  const handleAccept = async (id: string, name: string) => {
    setProcessingId(id);
    try {
      await updateStatus(id, "Upcoming");
    } catch {
      // Handled
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setProcessingId(id);
    try {
      await cancelAppointment(id, "Declined by tailor");
    } catch {
      // Handled
    } finally {
      setProcessingId(null);
    }
  };

  const allAppointments = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) return [];

    return appointments.map((apt, index) => {
      const statusLower = (apt.status || "").toLowerCase();
      const tabCategory =
        statusLower === "completed"
          ? "completed"
          : statusLower === "cancelled" ||
            statusLower === "canceled" ||
            statusLower === "declined"
          ? "cancelled"
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

  const getAppointmentCount = (filterVal: string | null) => {
    if (filterVal === null) return allAppointments.length;
    return allAppointments.filter((a) => a.status === filterVal).length;
  };

  const filteredAppointments = useMemo(() => {
    let result = [...allAppointments];

    // 1. Status Filter
    if (activeFilter !== null) {
      result = result.filter((a) => a.status === activeFilter);
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((a) => {
        const name = (a.name || "").toLowerCase();
        const service = (a.service || "").toLowerCase();
        const date = (a.date || "").toLowerCase();
        const time = (a.time || "").toLowerCase();
        return (
          name.includes(q) ||
          service.includes(q) ||
          date.includes(q) ||
          time.includes(q)
        );
      });
    }

    return result;
  }, [allAppointments, activeFilter, searchQuery]);

  const modalFilteredCount = useMemo(() => {
    let result = [...allAppointments];
    if (selectedFilter !== null) {
      result = result.filter((a) => a.status === selectedFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((a) => {
        const name = (a.name || "").toLowerCase();
        const service = (a.service || "").toLowerCase();
        const date = (a.date || "").toLowerCase();
        const time = (a.time || "").toLowerCase();
        return (
          name.includes(q) ||
          service.includes(q) ||
          date.includes(q) ||
          time.includes(q)
        );
      });
    }
    return result.length;
  }, [allAppointments, selectedFilter, searchQuery]);

  const activeFilterOption = filterOptions.find(
    (f) => f.value === activeFilter
  );

  return (
    <TailorDashboardShell
      bottomTabs={<TailorDashboardTabs active="Appointments" />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor="#14919B"
          colors={["#14919B"]}
        />
      }
    >
      <TailorDashboardHeader
        title="Appointments"
        rightIcon="clipboard-outline"
      />

      <View className="flex-1 px-5 pb-6">
        {/* Search Bar & Dedicated Filter Button (Customer Pages Style) */}
        <View className="flex-row items-center gap-2.5 mb-3.5">
          <View
            className="flex-1 flex-row items-center px-3.5 bg-[#F8FAFC] shadow-xs"
            style={{
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <Ionicons name="search" size={19} color="#14919B" />
            <TextInput
              style={{ paddingVertical: 0 }}
              className="ml-2.5 flex-1 text-[13px] font-medium text-brand-dark"
              placeholder="Search by client, service, date..."
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
            <View className="flex-row items-center bg-[#E0F7F7] px-3 py-1.5 rounded-full">
              <Text className="text-[12px] font-semibold text-[#0D7377] mr-1.5">
                Status: {activeFilterOption?.badge || activeFilter}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setActiveFilter(null);
                  setSelectedFilter(null);
                }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close-circle" size={16} color="#0D7377" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Modal: Appointment Filter (Customer Pages Design) */}
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
                  <View className="h-10 w-10 items-center justify-center rounded-md bg-[#E0F7F7] mr-3">
                    <Ionicons name="filter" size={20} color="#14919B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-bold text-brand-dark">
                      Filter Appointments
                    </Text>
                    <Text className="text-[12px] font-medium text-brand-gray">
                      Filter bookings by status
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsFilterModalVisible(false)}
                  className="h-8 w-8 items-center justify-center rounded-md bg-slate-100 active:bg-slate-200"
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
                        onPress={() => setSelectedFilter(opt.value)}
                        activeOpacity={0.75}
                        className="flex-row items-center rounded-md p-3.5"
                        style={{
                          backgroundColor: isSelected ? "#F0FAFA" : "#FFFFFF",
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? "#14919B" : "#E2E8F0",
                        }}
                      >
                        <View
                          className="h-10 w-10 items-center justify-center rounded-md mr-3"
                          style={{
                            backgroundColor: isSelected ? "#14919B" : "#F0FAFA",
                          }}
                        >
                          <Ionicons
                            name={opt.icon as any}
                            size={20}
                            color={isSelected ? "#FFFFFF" : "#14919B"}
                          />
                        </View>
                        <View className="flex-1 mr-2">
                          <View className="flex-row items-center">
                            <Text
                              className={`text-[14px] font-bold ${
                                isSelected
                                  ? "text-[#14919B]"
                                  : "text-brand-dark"
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
                            className={`text-[12px] mt-0.5 ${
                              isSelected ? "text-[#0D7377]" : "text-brand-gray"
                            }`}
                          >
                            {opt.desc}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text
                            className={`mr-2 text-[11px] font-bold ${
                              isSelected ? "text-[#14919B]" : "text-slate-400"
                            }`}
                          >
                            {count} {count === 1 ? "booking" : "bookings"}
                          </Text>
                          <View
                            className="h-5 w-5 rounded-md items-center justify-center"
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
                                size={13}
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

              {/* Fixed Bottom Action Buttons */}
              <View
                className="mt-3.5 pt-3 pb-1 flex flex-row items-center justify-center gap-3"
                style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0" }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFilter(null);
                    setActiveFilter(null);
                  }}
                  activeOpacity={0.7}
                  className="h-[50px] px-5 flex-1 items-center justify-center rounded-md bg-white shadow-xs"
                  style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
                >
                  <Text className="text-[13px] font-bold text-brand-gray">
                    Reset
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsFilterModalVisible(false);
                    setActiveFilter(selectedFilter);
                  }}
                  activeOpacity={0.85}
                  className="h-[50px] flex-1 items-center justify-center rounded-md bg-primary active:bg-primary-dark shadow-sm px-4"
                >
                  <Text className="text-[14px] font-bold text-white">
                    Show Results ({modalFilteredCount})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Content Section */}
        {isLoading && !isRefreshing ? (
          <View
            className="py-20 items-center justify-center"
            style={{ minHeight: 380 }}
          >
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] font-medium text-brand-gray">
              Loading appointments...
            </Text>
          </View>
        ) : filteredAppointments.length === 0 ? (
          <View
            className="flex-1 items-center justify-center py-12 px-4"
            style={{ minHeight: 400 }}
          >
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons
                name={
                  activeFilter === "completed"
                    ? "checkmark-done-circle-outline"
                    : activeFilter === "upcoming"
                    ? "calendar-outline"
                    : activeFilter === "cancelled"
                    ? "close-circle-outline"
                    : "calendar-clear-outline"
                }
                size={38}
                color="#14919B"
              />
            </View>
            <Text className="text-[18px] font-bold text-brand-dark text-center tracking-tight">
              {searchQuery.trim()
                ? "No Matching Appointments"
                : activeFilter === "requests"
                ? "No Appointment Requests"
                : activeFilter === "upcoming"
                ? "No Upcoming Appointments"
                : activeFilter === "completed"
                ? "No Completed Appointments"
                : activeFilter === "cancelled"
                ? "No Cancelled Appointments"
                : "No Appointments Yet"}
            </Text>
            <Text className="mt-2 text-[13px] font-medium text-brand-gray text-center leading-[20px] max-w-[290px] mb-6">
              {searchQuery.trim()
                ? `We couldn't find any appointments matching "${searchQuery}". Try searching by client name or service.`
                : activeFilter === "requests"
                ? "You're all caught up! New booking requests from clients will appear here."
                : activeFilter === "upcoming"
                ? "You don't have any upcoming appointments scheduled right now."
                : activeFilter === "completed"
                ? "Your completed appointment history will be listed here."
                : activeFilter === "cancelled"
                ? "Cancelled or declined appointments will be listed here."
                : "Bookings scheduled with your shop will appear here."}
            </Text>
            {searchQuery.trim() || activeFilter !== null ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery("");
                  setActiveFilter(null);
                  setSelectedFilter(null);
                }}
                className="h-[44px] px-6 rounded-md bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
              >
                <Text className="text-[13px] font-bold text-white tracking-wide">
                  {searchQuery.trim()
                    ? "Clear Search"
                    : "Show All Appointments"}
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
              status={apt.status}
              newRequest={apt.newRequest}
              tone={apt.tone}
              isProcessing={processingId === apt.id}
              onAccept={() => handleAccept(apt.id, apt.name)}
              onReject={() => handleReject(apt.id, apt.name)}
            />
          ))
        )}
      </View>
    </TailorDashboardShell>
  );
}
