import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SectionTitle } from "../components/SectionTitle";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { TimeSlotRow } from "../components/TimeSlotRow";

export default function TailorAvailabilityScreen() {
  return (
    <TailorDashboardShell>
      <TailorDashboardHeader title="Availability" showBack />
      <View className="px-5">
        <View className="mb-4 flex-row items-center justify-between">
          <Ionicons name="chevron-back" size={18} color="#1A1D1F" />
          <Text className="text-[14px] font-semibold text-brand-dark">May 2024</Text>
          <Ionicons name="chevron-forward" size={18} color="#1A1D1F" />
        </View>
        <View className="mb-3 flex-row justify-between">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <Text key={day} className="w-8 text-center text-[9px] text-brand-gray">{day}</Text>
          ))}
        </View>
        <View className="mb-3 flex-row flex-wrap justify-between gap-y-3">
          {["19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((date) => (
            <View key={date} className={`h-9 w-9 items-center justify-center rounded-full ${date === "22" ? "bg-primary" : "bg-white"}`}>
              <Text className={`text-[11px] ${date === "22" ? "font-bold text-white" : "text-brand-dark"}`}>{date}</Text>
            </View>
          ))}
        </View>
        <View className="mt-4 flex-row items-center justify-between">
          <SectionTitle title="Available Time Slots" />
          <TouchableOpacity className="rounded-lg border border-primary px-4 py-2">
            <Text className="text-[12px] font-semibold text-primary">+ Add Slot</Text>
          </TouchableOpacity>
        </View>
        <Text className="mb-2 text-[13px] font-semibold text-brand-dark">22 May 2024</Text>
        <View className="rounded-xl border border-brand-border px-4">
          <TimeSlotRow time="09:00 AM - 10:00 AM" />
          <TimeSlotRow time="10:00 AM - 11:00 AM" booked />
          <TimeSlotRow time="11:00 AM - 12:00 PM" />
          <TimeSlotRow time="02:00 PM - 03:00 PM" />
          <TimeSlotRow time="03:00 PM - 04:00 PM" booked />
        </View>
        <TailorDashboardTabs active="Availability" />
      </View>
    </TailorDashboardShell>
  );
}
