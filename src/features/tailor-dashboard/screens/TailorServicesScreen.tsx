import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ServiceCard } from "../components/ServiceCard";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";

const serviceImages = {
  lehenga: require("@/assets/illustrations/tailor-dashboard/services/lehenga.png"),
  anarkali: require("@/assets/illustrations/tailor-dashboard/services/anarkali.png"),
  sherwani: require("@/assets/illustrations/tailor-dashboard/services/sherwani.png"),
  blouse: require("@/assets/illustrations/tailor-dashboard/appointments/pooja-singh.png"),
  saree: require("@/assets/illustrations/tailor-dashboard/services/saree.png"),
};

export default function TailorServicesScreen() {
  return (
    <TailorDashboardShell
      bottomTabs={<TailorDashboardTabs active="Services" />}
    >
      <TailorDashboardHeader title="Services" showBack rightIcon="chatbubble-ellipses-outline" />
      <View className="px-5">
        <View className="mb-4 flex-row gap-3">
          <View className="h-[44px] flex-1 flex-row items-center rounded-md border border-brand-border px-3">
            <Ionicons name="search" size={17} color="#6F767E" />
            <Text className="ml-2 text-[12px] text-brand-gray">Search services</Text>
          </View>
          <TouchableOpacity className="h-[44px] flex-row items-center rounded-md bg-primary px-4">
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text className="ml-1 text-[12px] font-semibold text-white">Add Service</Text>
          </TouchableOpacity>
        </View>
        <ServiceCard image={serviceImages.lehenga} title="Bridal Lehenga" price="₹18,000" tone="coral" />
        <ServiceCard image={serviceImages.anarkali} title="Anarkali Suit" price="₹8,500" tone="teal" />
        <ServiceCard image={serviceImages.sherwani} title="Sherwani" price="₹12,000" tone="cream" />
        <ServiceCard image={serviceImages.blouse} title="Blouse Stitching" price="₹2,500" tone="blue" />
        <ServiceCard image={serviceImages.saree} title="Saree Stitching" price="₹1,800" tone="gold" />
      </View>
    </TailorDashboardShell>
  );
}
