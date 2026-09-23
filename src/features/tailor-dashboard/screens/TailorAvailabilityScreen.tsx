import React, { useState, useCallback } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

interface DayTiming {
  day: string;
  dayShort: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
}

const PRESET_OPEN_TIMES = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "12:00 PM",
];

const PRESET_CLOSE_TIMES = [
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
  "10:00 PM",
  "11:00 PM",
];

const PRESET_BREAK_TIMES = [
  { start: "01:00 PM", end: "02:00 PM", label: "Lunch Break (1:00 - 2:00 PM)" },
  { start: "01:30 PM", end: "02:30 PM", label: "Lunch Break (1:30 - 2:30 PM)" },
  { start: "12:30 PM", end: "02:30 PM", label: "Friday Jummah (12:30 - 2:30 PM)" },
  { start: "02:00 PM", end: "03:00 PM", label: "Afternoon Rest (2:00 - 3:00 PM)" },
];

const INITIAL_DAY_TIMINGS: DayTiming[] = [
  { day: "Monday", dayShort: "Mon", isOpen: true, openTime: "09:00 AM", closeTime: "08:00 PM", hasBreak: true, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
  { day: "Tuesday", dayShort: "Tue", isOpen: true, openTime: "09:00 AM", closeTime: "08:00 PM", hasBreak: true, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
  { day: "Wednesday", dayShort: "Wed", isOpen: true, openTime: "09:00 AM", closeTime: "08:00 PM", hasBreak: true, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
  { day: "Thursday", dayShort: "Thu", isOpen: true, openTime: "09:00 AM", closeTime: "08:00 PM", hasBreak: true, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
  { day: "Friday", dayShort: "Fri", isOpen: true, openTime: "09:00 AM", closeTime: "08:00 PM", hasBreak: true, breakStart: "12:30 PM", breakEnd: "02:30 PM" },
  { day: "Saturday", dayShort: "Sat", isOpen: true, openTime: "10:00 AM", closeTime: "09:00 PM", hasBreak: true, breakStart: "02:00 PM", breakEnd: "03:00 PM" },
  { day: "Sunday", dayShort: "Sun", isOpen: false, openTime: "11:00 AM", closeTime: "06:00 PM", hasBreak: false, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
];

export default function TailorAvailabilityScreen() {
  // Individual 7 Days Operating Schedule State
  const [dayTimings, setDayTimings] = useState<DayTiming[]>(INITIAL_DAY_TIMINGS);

  // Edit Modal State
  const [editingDay, setEditingDay] = useState<DayTiming | null>(null);

  // Floating Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  }, []);

  // Quick Preset Actions
  const applyPreset = (presetType: "standard" | "bazaar" | "fullweek") => {
    if (presetType === "standard") {
      setDayTimings([
        { day: "Monday", dayShort: "Mon", isOpen: true, openTime: "09:00 AM", closeTime: "08:00 PM", hasBreak: true, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
        { day: "Tuesday", dayShort: "Tue", isOpen: true, openTime: "09:00 AM", closeTime: "08:00 PM", hasBreak: true, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
        { day: "Wednesday", dayShort: "Wed", isOpen: true, openTime: "09:00 AM", closeTime: "08:00 PM", hasBreak: true, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
        { day: "Thursday", dayShort: "Thu", isOpen: true, openTime: "09:00 AM", closeTime: "08:00 PM", hasBreak: true, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
        { day: "Friday", dayShort: "Fri", isOpen: true, openTime: "09:00 AM", closeTime: "08:00 PM", hasBreak: true, breakStart: "12:30 PM", breakEnd: "02:30 PM" },
        { day: "Saturday", dayShort: "Sat", isOpen: true, openTime: "10:00 AM", closeTime: "09:00 PM", hasBreak: true, breakStart: "02:00 PM", breakEnd: "03:00 PM" },
        { day: "Sunday", dayShort: "Sun", isOpen: false, openTime: "11:00 AM", closeTime: "06:00 PM", hasBreak: false, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
      ]);
      showToast("Standard timings applied (Mon-Sat open, Sun off)");
    } else if (presetType === "bazaar") {
      setDayTimings([
        { day: "Monday", dayShort: "Mon", isOpen: true, openTime: "11:00 AM", closeTime: "10:00 PM", hasBreak: true, breakStart: "02:00 PM", breakEnd: "03:00 PM" },
        { day: "Tuesday", dayShort: "Tue", isOpen: true, openTime: "11:00 AM", closeTime: "10:00 PM", hasBreak: true, breakStart: "02:00 PM", breakEnd: "03:00 PM" },
        { day: "Wednesday", dayShort: "Wed", isOpen: true, openTime: "11:00 AM", closeTime: "10:00 PM", hasBreak: true, breakStart: "02:00 PM", breakEnd: "03:00 PM" },
        { day: "Thursday", dayShort: "Thu", isOpen: true, openTime: "11:00 AM", closeTime: "10:00 PM", hasBreak: true, breakStart: "02:00 PM", breakEnd: "03:00 PM" },
        { day: "Friday", dayShort: "Fri", isOpen: true, openTime: "11:00 AM", closeTime: "10:00 PM", hasBreak: true, breakStart: "12:30 PM", breakEnd: "02:30 PM" },
        { day: "Saturday", dayShort: "Sat", isOpen: true, openTime: "11:00 AM", closeTime: "11:00 PM", hasBreak: true, breakStart: "02:00 PM", breakEnd: "03:00 PM" },
        { day: "Sunday", dayShort: "Sun", isOpen: false, openTime: "11:00 AM", closeTime: "06:00 PM", hasBreak: false, breakStart: "01:00 PM", breakEnd: "02:00 PM" },
      ]);
      showToast("Bazaar schedule applied (11 AM – 10 PM)");
    } else if (presetType === "fullweek") {
      setDayTimings([
        { day: "Monday", dayShort: "Mon", isOpen: true, openTime: "10:00 AM", closeTime: "09:00 PM", hasBreak: true, breakStart: "01:30 PM", breakEnd: "02:30 PM" },
        { day: "Tuesday", dayShort: "Tue", isOpen: true, openTime: "10:00 AM", closeTime: "09:00 PM", hasBreak: true, breakStart: "01:30 PM", breakEnd: "02:30 PM" },
        { day: "Wednesday", dayShort: "Wed", isOpen: true, openTime: "10:00 AM", closeTime: "09:00 PM", hasBreak: true, breakStart: "01:30 PM", breakEnd: "02:30 PM" },
        { day: "Thursday", dayShort: "Thu", isOpen: true, openTime: "10:00 AM", closeTime: "09:00 PM", hasBreak: true, breakStart: "01:30 PM", breakEnd: "02:30 PM" },
        { day: "Friday", dayShort: "Fri", isOpen: true, openTime: "10:00 AM", closeTime: "09:00 PM", hasBreak: true, breakStart: "12:30 PM", breakEnd: "02:30 PM" },
        { day: "Saturday", dayShort: "Sat", isOpen: true, openTime: "10:00 AM", closeTime: "09:00 PM", hasBreak: true, breakStart: "01:30 PM", breakEnd: "02:30 PM" },
        { day: "Sunday", dayShort: "Sun", isOpen: true, openTime: "11:00 AM", closeTime: "08:00 PM", hasBreak: false, breakStart: "02:00 PM", breakEnd: "03:00 PM" },
      ]);
      showToast("7-Day schedule applied (Mon-Sun Open)");
    }
  };

  // Toggle open/closed for a specific day
  const handleToggleDay = (dayName: string) => {
    setDayTimings((prev) =>
      prev.map((d) => (d.day === dayName ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  // Copy Monday's hours to all weekdays (Tue-Fri)
  const handleCopyMondayToWeekdays = () => {
    const monday = dayTimings[0];
    setDayTimings((prev) =>
      prev.map((d, index) => {
        if (index >= 1 && index <= 4) {
          return {
            ...d,
            isOpen: true,
            openTime: monday.openTime,
            closeTime: monday.closeTime,
            hasBreak: monday.hasBreak,
            breakStart: d.day === "Friday" ? "12:30 PM" : monday.breakStart,
            breakEnd: d.day === "Friday" ? "02:30 PM" : monday.breakEnd,
          };
        }
        return d;
      })
    );
    showToast("Monday hours copied to Tue – Fri");
  };

  // Save Modal Edits
  const handleSaveModal = () => {
    if (!editingDay) return;

    setDayTimings((prev) =>
      prev.map((d) => (d.day === editingDay.day ? editingDay : d))
    );

    setEditingDay(null);
    showToast(`${editingDay.day} hours updated`);
  };

  return (
    <TailorDashboardShell>
      {/* Top Header with Back button and hidden Notification icon */}
      <TailorDashboardHeader
        title="Shop Timings"
        subtitle="Manage daily opening hours, breaks, and days off"
        showBack={true}
        hideRightIcon={true}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View
          style={{
            position: "absolute",
            top: 16,
            left: 20,
            right: 20,
            zIndex: 999,
            backgroundColor: "#1A1D1F",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="checkmark-circle" size={18} color="#14919B" />
          <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: "600", color: "#FFFFFF" }}>
            {toastMessage}
          </Text>
        </View>
      )}

      {/* Main Container with guaranteed spacing */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}>
        {/* ========================================================================= */}
        {/* 1. QUICK TIMING PRESETS                                                   */}
        {/* ========================================================================= */}
        <View style={{ marginBottom: 24, marginTop: 4 }}>
          <Text style={{ marginBottom: 12, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, color: "#94A3B8" }}>
            Quick Timing Presets
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 10 }}
          >
            <TouchableOpacity
              onPress={() => applyPreset("standard")}
              activeOpacity={0.75}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                marginRight: 12,
              }}
            >
              <View style={{ width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#E0F7F7", marginRight: 12 }}>
                <Ionicons name="briefcase-outline" size={17} color="#14919B" />
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>
                  Standard Hours
                </Text>
                <Text style={{ fontSize: 11, fontWeight: "500", color: "#64748B", marginTop: 2 }}>
                  Mon-Sat 9-8 • Sun Closed
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => applyPreset("bazaar")}
              activeOpacity={0.75}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                marginRight: 12,
              }}
            >
              <View style={{ width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#FFF6DA", marginRight: 12 }}>
                <Ionicons name="storefront-outline" size={17} color="#C08300" />
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>
                  Bazaar / Market
                </Text>
                <Text style={{ fontSize: 11, fontWeight: "500", color: "#64748B", marginTop: 2 }}>
                  11 AM – 10 PM • Sun Closed
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => applyPreset("fullweek")}
              activeOpacity={0.75}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                marginRight: 12,
              }}
            >
              <View style={{ width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#E0F7F7", marginRight: 12 }}>
                <Ionicons name="calendar-outline" size={17} color="#14919B" />
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>
                  7 Days Open
                </Text>
                <Text style={{ fontSize: 11, fontWeight: "500", color: "#64748B", marginTop: 2 }}>
                  Mon-Sun 10 AM – 9 PM
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ========================================================================= */}
        {/* 2. SECTION HEADER WITH BULK SHORTCUT                                     */}
        {/* ========================================================================= */}
        <View style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1D1F", letterSpacing: -0.3 }}>
              Weekly Operating Schedule
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "500", color: "#64748B", marginTop: 2 }}>
              Set opening and closing timings for each day
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCopyMondayToWeekdays}
            activeOpacity={0.75}
            style={{
              borderRadius: 20,
              backgroundColor: "#E0F7F7",
              paddingHorizontal: 14,
              paddingVertical: 7,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#0D7377" }}>
              Copy Mon to Fri
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* 3. SEPARATE DAYS LIST (MON, TUE, WED, THU, FRI, SAT, SUN)                 */}
        {/* ========================================================================= */}
        <View style={{ marginBottom: 20 }}>
          {dayTimings.map((item) => (
            <View
              key={item.day}
              style={{
                backgroundColor: item.isOpen ? "#FFFFFF" : "#F8FAFC",
                borderRadius: 18,
                padding: 18,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: item.isOpen ? "#E2E8F0" : "#EDF2F7",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              {/* Top Row: Day Tag, Day Name, Open/Close Switch */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      backgroundColor: item.isOpen ? "#E0F7F7" : "#EDF2F7",
                      marginRight: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: item.isOpen ? "#0D7377" : "#94A3B8",
                      }}
                    >
                      {item.dayShort}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1D1F" }}>
                        {item.day}
                      </Text>
                      {item.day === "Friday" && item.isOpen && (
                        <View style={{ marginLeft: 8, borderRadius: 6, backgroundColor: "#FFF6DA", paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 10, fontWeight: "700", color: "#C08300" }}>
                            Jummah Break
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        marginTop: 4,
                        color: item.isOpen ? "#14919B" : "#94A3B8",
                      }}
                    >
                      {item.isOpen
                        ? `${item.openTime} – ${item.closeTime}`
                        : "Shop Closed / Day Off"}
                    </Text>
                  </View>
                </View>

                {/* Right Switch & Status */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      marginRight: 8,
                      color: item.isOpen ? "#0D7377" : "#94A3B8",
                    }}
                  >
                    {item.isOpen ? "Open" : "Closed"}
                  </Text>
                  <Switch
                    value={item.isOpen}
                    onValueChange={() => handleToggleDay(item.day)}
                    trackColor={{ false: "#E2E8F0", true: "#14919B" }}
                    thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
                  />
                </View>
              </View>

              {/* Bottom Row when Open: Break Details & Edit Button */}
              {item.isOpen && (
                <View
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: "#F1F5F9",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {item.hasBreak ? (
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
                      <Ionicons name="cafe-outline" size={15} color="#C08300" />
                      <Text style={{ marginLeft: 6, fontSize: 11, fontWeight: "500", color: "#64748B" }}>
                        Break:{" "}
                        <Text style={{ fontWeight: "700", color: "#C08300" }}>
                          {item.breakStart} – {item.breakEnd}
                        </Text>
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 11, fontWeight: "500", color: "#94A3B8" }}>
                      No mid-day break set
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={() => setEditingDay(item)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 10,
                      backgroundColor: "#E0F7F7",
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                    }}
                  >
                    <Ionicons name="time-outline" size={14} color="#14919B" />
                    <Text style={{ marginLeft: 6, fontSize: 11, fontWeight: "700", color: "#0D7377" }}>
                      Edit Hours
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Save Timings Action Button */}
        <TouchableOpacity
          onPress={() => showToast("Shop timings updated and published")}
          activeOpacity={0.85}
          style={{
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            overflow: "hidden",
            marginTop: 4,
            marginBottom: 20,
            shadowColor: "#14919B",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <ButtonTexture variant="greenish" borderRadius={16} />
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.3 }}>
            Save Shop Timings
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* MODAL: EDIT DAY TIMINGS                                                   */}
      {/* ========================================================================= */}
      <Modal
        visible={!!editingDay}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingDay(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(15, 23, 42, 0.45)",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 36,
              maxHeight: "85%",
            }}
          >
            {/* Handle Bar */}
            <View
              style={{
                width: 44,
                height: 5,
                borderRadius: 3,
                backgroundColor: "#E2E8F0",
                alignSelf: "center",
                marginBottom: 14,
              }}
            />

            {/* Modal Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1D1F" }}>
                  Edit Hours: {editingDay?.day}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "500", color: "#64748B", marginTop: 2 }}>
                  Set shop opening, closing, and break timings
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditingDay(null)}
                style={{
                  width: 34,
                  height: 34,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 17,
                  backgroundColor: "#F1F5F9",
                }}
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ height: 1, backgroundColor: "#F1F5F9", marginBottom: 16 }} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Opening Time Selection */}
              <Text style={{ fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, color: "#94A3B8", marginBottom: 10 }}>
                Opening Time (Shop Opens)
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 18 }}>
                {PRESET_OPEN_TIMES.map((time) => {
                  const isSelected = editingDay?.openTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      onPress={() =>
                        setEditingDay((prev) => (prev ? { ...prev, openTime: time } : null))
                      }
                      style={{
                        paddingVertical: 9,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isSelected ? "#14919B" : "#E2E8F0",
                        backgroundColor: isSelected ? "#14919B" : "#F8FAFC",
                        marginRight: 8,
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: isSelected ? "#FFFFFF" : "#1A1D1F",
                        }}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Closing Time Selection */}
              <Text style={{ fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, color: "#94A3B8", marginBottom: 10 }}>
                Closing Time (Shop Closes)
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 18 }}>
                {PRESET_CLOSE_TIMES.map((time) => {
                  const isSelected = editingDay?.closeTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      onPress={() =>
                        setEditingDay((prev) => (prev ? { ...prev, closeTime: time } : null))
                      }
                      style={{
                        paddingVertical: 9,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isSelected ? "#14919B" : "#E2E8F0",
                        backgroundColor: isSelected ? "#14919B" : "#F8FAFC",
                        marginRight: 8,
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: isSelected ? "#FFFFFF" : "#1A1D1F",
                        }}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Mid-day Break / Lunch Toggle */}
              <View style={{ marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1D1F" }}>
                    Lunch / Prayer Break
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: "500", color: "#64748B", marginTop: 2 }}>
                    Block out time for rest or Jummah
                  </Text>
                </View>
                <Switch
                  value={editingDay?.hasBreak || false}
                  onValueChange={(val) =>
                    setEditingDay((prev) => (prev ? { ...prev, hasBreak: val } : null))
                  }
                  trackColor={{ false: "#E2E8F0", true: "#14919B" }}
                  thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
                />
              </View>

              {/* Break Presets */}
              {editingDay?.hasBreak && (
                <View style={{ marginBottom: 18 }}>
                  {PRESET_BREAK_TIMES.map((bt) => {
                    const isSelected =
                      editingDay.breakStart === bt.start && editingDay.breakEnd === bt.end;
                    return (
                      <TouchableOpacity
                        key={bt.label}
                        onPress={() =>
                          setEditingDay((prev) =>
                            prev
                              ? { ...prev, breakStart: bt.start, breakEnd: bt.end }
                              : null
                          )
                        }
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: isSelected ? "#14919B" : "#E2E8F0",
                          backgroundColor: isSelected ? "#E0F7F7" : "#FFFFFF",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: isSelected ? "#0D7377" : "#334155",
                          }}
                        >
                          {bt.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={18} color="#14919B" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Preview Bar */}
              <View
                style={{
                  borderRadius: 16,
                  backgroundColor: "#F0FAFA",
                  padding: 14,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: "#CCFBF1",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#0D7377" }}>
                  Hours Preview:
                </Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>
                  {editingDay?.openTime} – {editingDay?.closeTime}
                  {editingDay?.hasBreak
                    ? ` (Break: ${editingDay.breakStart} - ${editingDay.breakEnd})`
                    : ""}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleSaveModal}
              activeOpacity={0.85}
              style={{
                height: 50,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <ButtonTexture variant="greenish" borderRadius={16} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
                Apply Hours to {editingDay?.day}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TailorDashboardShell>
  );
}
