import { Text, View } from "react-native";

import { OrderRequestCard } from "../components/OrderRequestCard";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";

const orderImages = {
  anarkali: require("@/assets/illustrations/tailor-dashboard/orders/anarkali-suit.png"),
  sherwani: require("@/assets/illustrations/tailor-dashboard/orders/sherwani-set.png"),
  lehenga: require("@/assets/illustrations/tailor-dashboard/orders/lehenga-choli.png"),
};

export default function TailorOrdersScreen() {
  return (
    <TailorDashboardShell bottomTabs={<TailorDashboardTabs active="Orders" />}>
      <TailorDashboardHeader title="Orders" showBack rightIcon="cube-outline" />
      <View className="px-5">
        <View className="mb-4 flex-row gap-2">
          {["Order Requests 12", "In Progress 5", "Completed"].map((tab, index) => (
            <View key={tab} className={`rounded-lg px-3 py-2 ${index === 0 ? "bg-primary-50" : "bg-white border border-brand-border"}`}>
              <Text className={`text-[11px] font-medium ${index === 0 ? "text-primary" : "text-brand-dark"}`}>{tab}</Text>
            </View>
          ))}
        </View>
        <OrderRequestCard image={orderImages.anarkali} id="ORD12345" item="Anarkali Suit" price="₹12,500" customer="Riya Sharma" tone="coral" />
        <OrderRequestCard image={orderImages.sherwani} id="ORD12344" item="Sherwani Set" price="₹18,000" customer="Aman Verma" tone="teal" />
        <OrderRequestCard image={orderImages.lehenga} id="ORD12343" item="Lehenga Choli" price="₹22,500" customer="Neha Kapoor" tone="coral" />
      </View>
    </TailorDashboardShell>
  );
}
