import { Text, View } from "react-native";
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
  }[] = [
    { label: "Dashboard", icon: "home-outline" },
    { label: "Orders", icon: "bag-handle-outline" },
    { label: "Appointments", icon: "calendar-outline" },
    { label: "Earnings", icon: "cash-outline" },
    { label: "Profile", icon: "person-circle-outline" },
  ];

  return (
    <View className="mt-5 flex-row justify-between border-t border-brand-border px-2 pt-3">
      {tabs.map((tab) => {
        const selected = tab.label === active;

        return (
          <View key={tab.label} className="items-center">
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
          </View>
        );
      })}
    </View>
  );
}
