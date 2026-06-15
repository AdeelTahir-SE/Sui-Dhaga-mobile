import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ServiceCard } from "../components/ServiceCard";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";

export default function TailorServicesScreen() {
  return (
    <TailorDashboardShell>
      <TailorDashboardHeader title="Services" showBack rightIcon="chatbubble-ellipses-outline" />
      <View className="px-5">
        <View className="mb-4 flex-row gap-3">
          <View className="h-[44px] flex-1 flex-row items-center rounded-xl border border-brand-border px-3">
            <Ionicons name="search" size={17} color="#6F767E" />
            <Text className="ml-2 text-[12px] text-brand-gray">Search services</Text>
          </View>
          <TouchableOpacity className="h-[44px] flex-row items-center rounded-xl bg-primary px-4">
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text className="ml-1 text-[12px] font-semibold text-white">Add Service</Text>
          </TouchableOpacity>
        </View>
        <ServiceCard title="Bridal Lehenga" price="₹18,000" tone="coral" />
        <ServiceCard title="Anarkali Suit" price="₹8,500" tone="teal" />
        <ServiceCard title="Sherwani" price="₹12,000" tone="cream" />
        <ServiceCard title="Blouse Stitching" price="₹2,500" tone="blue" />
        <ServiceCard title="Saree Stitching" price="₹1,800" tone="gold" />
        <TailorDashboardTabs active="Services" />
      </View>
    </TailorDashboardShell>
  );
}
