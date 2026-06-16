import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type CustomerTab = "Home" | "Tailors" | "Design" | "Orders" | "Messages" | "Profile";

type CustomerTabsPreviewProps = {
  active: CustomerTab;
};

export function CustomerTabsPreview({ active }: CustomerTabsPreviewProps) {
  const tabs: {
    label: CustomerTab;
    icon: keyof typeof Ionicons.glyphMap;
    href: string;
  }[] = [
    { label: "Home", icon: "home-outline", href: "/home" },
    { label: "Tailors", icon: "person-outline", href: "/tailors" },
    { label: "Design", icon: "color-wand-outline", href: "/design" },
    { label: "Orders", icon: "bag-handle-outline", href: "/orders" },
    { label: "Messages", icon: "chatbubble-outline", href: "/messages" },
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
            <View>
              <Ionicons
                name={tab.icon}
                size={18}
                color={selected ? "#14919B" : "#6F767E"}
              />
              {tab.label === "Messages" ? (
                <View className="absolute -right-2 -top-2 h-4 w-4 items-center justify-center rounded-full bg-[#F05A57]">
                  <Text className="text-[8px] font-bold text-white">1</Text>
                </View>
              ) : null}
            </View>
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
