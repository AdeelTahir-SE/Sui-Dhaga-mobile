import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type MccTabsPreviewProps = {
  active: "Design" | "Community" | "Orders" | "Profile";
};

export function MccTabsPreview({ active }: MccTabsPreviewProps) {
  const tabs: {
    label: "Home" | "Design" | "Community" | "Orders" | "Profile";
    icon: keyof typeof Ionicons.glyphMap;
    href: string;
  }[] = [
    { label: "Home", icon: "home-outline", href: "/home" },
    { label: "Design", icon: "color-wand-outline", href: "/design" },
    { label: "Community", icon: "people-outline", href: "/community" },
    { label: "Orders", icon: "bag-handle-outline", href: "/orders" },
    { label: "Profile", icon: "person-circle-outline", href: "/profile" },
  ];

  return (
    <View className="flex-row justify-between px-2">
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
