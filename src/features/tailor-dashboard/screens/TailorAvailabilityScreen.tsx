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
            top: 14,
            left: 20,
            right: 20,
            zIndex: 999,
          }}
          className="flex-row items-center justify-center rounded-xl bg-brand-dark/95 py-3 px-4 shadow-md"
        >
          <Ionicons name="checkmark-circle" size={18} color="#14919B" />
          <Text className="ml-2 text-[13px] font-semibold text-white">
            {toastMessage}
          </Text>
        </View>
      )}

      <View className="px-5 pb-10">
        {/* ========================================================================= */}
        {/* 1. QUICK TIMING PRESETS                                                   */}
        {/* ========================================================================= */}
        <View className="mb-6 mt-2">
          <Text className="mb-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-400">
            Quick Timing Presets
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            <TouchableOpacity
              onPress={() => applyPreset("standard")}
              activeOpacity={0.75}
              className="flex-row items-center rounded-2xl bg-white px-4 py-3 border border-slate-100 shadow-xs"
            >
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#E0F7F7] mr-2.5">
                <Ionicons name="briefcase-outline" size={16} color="#14919B" />
              </View>
              <View>
                <Text className="text-[13px] font-bold text-brand-dark">
                  Standard Hours
                </Text>
                <Text className="text-[11px] font-medium text-brand-gray mt-0.5">
                  Mon-Sat 9-8 • Sun Closed
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => applyPreset("bazaar")}
              activeOpacity={0.75}
              className="flex-row items-center rounded-2xl bg-white px-4 py-3 border border-slate-100 shadow-xs"
            >
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#FFF6DA] mr-2.5">
                <Ionicons name="storefront-outline" size={16} color="#C08300" />
              </View>
              <View>
                <Text className="text-[13px] font-bold text-brand-dark">
                  Bazaar / Market
                </Text>
                <Text className="text-[11px] font-medium text-brand-gray mt-0.5">
                  11 AM – 10 PM • Sun Closed
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => applyPreset("fullweek")}
              activeOpacity={0.75}
              className="flex-row items-center rounded-2xl bg-white px-4 py-3 border border-slate-100 shadow-xs"
            >
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#E0F7F7] mr-2.5">
                <Ionicons name="calendar-outline" size={16} color="#14919B" />
              </View>
              <View>
                <Text className="text-[13px] font-bold text-brand-dark">
                  7 Days Open
                </Text>
                <Text className="text-[11px] font-medium text-brand-gray mt-0.5">
                  Mon-Sun 10 AM – 9 PM
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ========================================================================= */}
        {/* 2. SECTION HEADER WITH BULK SHORTCUT                                     */}
        {/* ========================================================================= */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-[16px] font-bold text-brand-dark tracking-tight">
              Weekly Operating Schedule
            </Text>
            <Text className="text-[11px] font-medium text-brand-gray mt-0.5">
              Set opening and closing timings for each day
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCopyMondayToWeekdays}
            activeOpacity={0.75}
            className="rounded-full bg-[#E0F7F7] px-3.5 py-1.5 active:bg-[#CCFBF1]"
          >
            <Text className="text-[11px] font-bold text-[#0D7377]">
              Copy Mon to Fri
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* 3. SEPARATE DAYS LIST (MON, TUE, WED, THU, FRI, SAT, SUN)                 */}
        {/* ========================================================================= */}
        <View className="gap-3.5 mb-6">
          {dayTimings.map((item) => (
            <View
              key={item.day}
              className={`rounded-2xl p-4.5 border ${
                item.isOpen
                  ? "bg-white border-slate-100 shadow-xs"
                  : "bg-slate-50/80 border-slate-100"
              }`}
            >
              {/* Top Row: Day Tag, Day Name, Open/Close Switch */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-xl mr-3.5 ${
                      item.isOpen ? "bg-[#E0F7F7]" : "bg-slate-100"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-bold ${
                        item.isOpen ? "text-[#0D7377]" : "text-slate-400"
                      }`}
                    >
                      {item.dayShort}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-[15px] font-bold text-brand-dark">
                        {item.day}
                      </Text>
                      {item.day === "Friday" && item.isOpen && (
                        <View className="ml-2.5 rounded-md bg-[#FFF6DA] px-2 py-0.5">
                          <Text className="text-[10px] font-bold text-[#C08300]">
                            Jummah Break
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      className={`text-[13px] font-semibold mt-1 ${
                        item.isOpen ? "text-[#14919B]" : "text-slate-400"
                      }`}
                    >
                      {item.isOpen
                        ? `${item.openTime} – ${item.closeTime}`
                        : "Shop Closed / Day Off"}
                    </Text>
                  </View>
                </View>

                {/* Right Switch & Status */}
                <View className="flex-row items-center gap-2.5">
                  <Text
                    className={`text-[11px] font-bold ${
                      item.isOpen ? "text-[#0D7377]" : "text-slate-400"
                    }`}
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
                <View className="mt-3.5 pt-3.5 border-t border-slate-100 flex-row items-center justify-between">
                  {item.hasBreak ? (
                    <View className="flex-row items-center flex-1 mr-2">
                      <Ionicons name="cafe-outline" size={15} color="#C08300" />
                      <Text className="ml-1.5 text-[11px] font-medium text-slate-600">
                        Break:{" "}
                        <Text className="font-bold text-[#C08300]">
                          {item.breakStart} – {item.breakEnd}
                        </Text>
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-[11px] font-medium text-slate-400">
                      No mid-day break set
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={() => setEditingDay(item)}
                    activeOpacity={0.7}
                    className="flex-row items-center rounded-xl bg-[#E0F7F7] px-3.5 py-2 active:bg-[#CCFBF1]"
                  >
                    <Ionicons name="time-outline" size={14} color="#14919B" />
                    <Text className="ml-1.5 text-[11px] font-bold text-[#0D7377]">
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
          className="h-[52px] items-center justify-center rounded-2xl bg-primary shadow-sm active:bg-primary-dark"
        >
          <Text className="text-[15px] font-bold text-white tracking-wide">
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
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
        >
          <View className="rounded-t-[32px] bg-white px-6 pb-8 pt-4 max-h-[85%] border-t border-slate-100">
            <View className="h-1.5 w-12 rounded-full bg-slate-200 self-center mb-3 mt-1" />

            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3.5">
              <View>
                <Text className="text-[18px] font-bold text-brand-dark">
                  Edit Hours: {editingDay?.day}
                </Text>
                <Text className="text-[12px] font-medium text-brand-gray mt-0.5">
                  Set shop opening, closing, and break timings
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditingDay(null)}
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View className="h-[1px] bg-slate-100 mb-4" />

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Opening Time Selection */}
              <Text className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Opening Time (Shop Opens)
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {PRESET_OPEN_TIMES.map((time) => {
                  const isSelected = editingDay?.openTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      onPress={() =>
                        setEditingDay((prev) => (prev ? { ...prev, openTime: time } : null))
                      }
                      className={`py-2 px-3.5 rounded-xl border ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-slate-100 bg-slate-50"
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

              {/* Closing Time Selection */}
              <Text className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Closing Time (Shop Closes)
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {PRESET_CLOSE_TIMES.map((time) => {
                  const isSelected = editingDay?.closeTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      onPress={() =>
                        setEditingDay((prev) => (prev ? { ...prev, closeTime: time } : null))
                      }
                      className={`py-2 px-3.5 rounded-xl border ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-slate-100 bg-slate-50"
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

              {/* Mid-day Break / Lunch Toggle */}
              <View className="mb-2 flex-row items-center justify-between pt-3 border-t border-slate-100">
                <View>
                  <Text className="text-[13px] font-bold text-brand-dark">
                    Lunch / Prayer Break
                  </Text>
                  <Text className="text-[11px] font-medium text-brand-gray mt-0.5">
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
                <View className="mb-4 gap-2.5">
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
                        className={`p-3 rounded-xl border flex-row items-center justify-between ${
                          isSelected
                            ? "border-primary bg-[#E0F7F7]"
                            : "border-slate-100 bg-white"
                        }`}
                      >
                        <Text
                          className={`text-[12px] font-semibold ${
                            isSelected ? "text-[#0D7377]" : "text-slate-700"
                          }`}
                        >
                          {bt.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={17} color="#14919B" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Preview Bar */}
              <View className="rounded-2xl bg-[#F0FAFA] p-3.5 mb-5 border border-[#E0F7F7] flex-row items-center justify-between">
                <Text className="text-[12px] font-medium text-[#0D7377]">
                  Hours Preview:
                </Text>
                <Text className="text-[13px] font-bold text-brand-dark">
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
              className="h-[50px] items-center justify-center rounded-2xl bg-primary shadow-xs active:bg-primary-dark"
            >
              <Text className="text-[14px] font-bold text-white">
                Apply Hours to {editingDay?.day}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TailorDashboardShell>
  );
}
