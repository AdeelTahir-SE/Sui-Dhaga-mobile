import { Text, View } from "react-native";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MainOrderCard } from "../components/MainOrderCard";

export default function MainOrdersScreen() {
  return (
    <CustomerTabShell>
      <CustomerHeader title="My Orders" rightIcon="notifications-outline" />
      <View className="px-5">
        <View className="mb-4 flex-row gap-5 border-b border-brand-border">
          {["Active (3)", "Completed (12)", "Cancelled (2)"].map((tab, index) => (
            <View key={tab} className={`pb-3 ${index === 0 ? "border-b-2 border-primary" : ""}`}>
              <Text className={`text-[12px] font-medium ${index === 0 ? "text-primary" : "text-brand-dark"}`}>{tab}</Text>
            </View>
          ))}
        </View>
        <MainOrderCard id="SD1256" item="Custom Anarkali Suit" tailor="Rekha Tailors" delivery="25 May, 2024" price="₹12,500" status="In Progress" tone="cream" />
        <MainOrderCard id="SD1241" item="Kurta Set" tailor="Stitch Craft" delivery="30 May, 2024" price="₹3,200" status="Confirmed" tone="mint" button="View Details" />
        <MainOrderCard id="SD1230" item="Lehenga" tailor="Aarav Bespoke" delivery="28 May, 2024" price="₹18,900" status="In Progress" tone="coral" />
        <CustomerTabsPreview active="Orders" />
      </View>
    </CustomerTabShell>
  );
}
