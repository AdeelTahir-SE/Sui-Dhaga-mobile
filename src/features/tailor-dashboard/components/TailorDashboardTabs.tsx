import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TailorDashboardTabsProps = {
  active:
    | "Dashboard"
    | "Orders"
    | "Appointments"
    | "Services"
    | "Availability"
    | "Earnings"
    | "Profile";
};

export function TailorDashboardTabs({ active }: TailorDashboardTabsProps) {
  const tabs: {
    label: TailorDashboardTabsProps["active"];
    icon: keyof typeof Ionicons.glyphMap;
    href: string;
  }[] = [
    { label: "Dashboard", icon: "home-outline", href: "/tailor-dashboard" },
    { label: "Orders", icon: "bag-handle-outline", href: "/tailor-dashboard/orders" },
    { label: "Appointments", icon: "calendar-outline", href: "/tailor-dashboard/appointments" },
    { label: "Earnings", icon: "cash-outline", href: "/tailor-dashboard/earnings" },
    { label: "Profile", icon: "person-circle-outline", href: "/profile" },
  ];

  return (
    <View className="mt-5 flex-row justify-between border-t border-brand-border px-2 pt-3">
      {tabs.map((tab) => {
        const selected = tab.label === active;

        return (
          <TouchableOpacity
            key={tab.label}
            accessibilityRole="button"
            onPress={() => router.push(tab.href as never)}
            className="items-center"
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={selected ? "#14919B" : "#6F767E"}
            />
            <Text
              className={`mt-1 text-[9px] ${
                selected ? "font-semibold text-primary" : "text-brand-gray"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
