import { Text, View } from "react-native";

import { OrderRequestCard } from "../components/OrderRequestCard";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";

export default function TailorOrdersScreen() {
  return (
    <TailorDashboardShell>
      <TailorDashboardHeader title="Orders" showBack rightIcon="cube-outline" />
      <View className="px-5">
        <View className="mb-4 flex-row gap-2">
          {["Order Requests 12", "In Progress 5", "Completed"].map((tab, index) => (
            <View key={tab} className={`rounded-lg px-3 py-2 ${index === 0 ? "bg-primary-50" : "bg-white border border-brand-border"}`}>
              <Text className={`text-[11px] font-medium ${index === 0 ? "text-primary" : "text-brand-dark"}`}>{tab}</Text>
            </View>
          ))}
        </View>
        <OrderRequestCard id="ORD12345" item="Anarkali Suit" price="₹12,500" customer="Riya Sharma" tone="coral" />
        <OrderRequestCard id="ORD12344" item="Sherwani Set" price="₹18,000" customer="Aman Verma" tone="teal" />
        <OrderRequestCard id="ORD12343" item="Lehenga Choli" price="₹22,500" customer="Neha Kapoor" tone="coral" />
        <TailorDashboardTabs active="Orders" />
      </View>
    </TailorDashboardShell>
  );
}
