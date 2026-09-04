import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type CustomerTab =
  | "Home"
  | "Tailors"
  | "Design"
  | "Orders"
  | "Messages"
  | "Profile";

type CustomerTabsPreviewProps = {
  active: CustomerTab;
};

type TabItem = {
  label: CustomerTab;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  href: string;
};

const tabs: TabItem[] = [
  {
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
    href: "/home",
  },
  {
    label: "Tailors",
    icon: "person-outline",
    activeIcon: "person",
    href: "/tailors",
  },
  {
    label: "Design",
    icon: "color-wand-outline",
    activeIcon: "color-wand",
    href: "/design",
  },
  {
    label: "Orders",
    icon: "bag-handle-outline",
    activeIcon: "bag-handle",
    href: "/orders",
  },
  {
    label: "Messages",
    icon: "chatbubble-outline",
    activeIcon: "chatbubble",
    href: "/messages",
  },
  {
    label: "Profile",
    icon: "person-circle-outline",
    activeIcon: "person-circle",
    href: "/profile",
  },
];

export function CustomerTabsPreview({ active }: CustomerTabsPreviewProps) {
  return (
    <View className="flex-row items-center justify-around">
      {tabs.map((tab) => {
        const selected = tab.label === active;

        return (
          <TouchableOpacity
            key={tab.label}
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={() => router.push(tab.href as never)}
            className="flex-1 items-center justify-center py-0.5"
          >
            {/* Active Pill Area */}
            <View
              className={`h-8 w-12 items-center justify-center rounded-full ${
                selected ? "bg-primary-light" : "bg-transparent"
              }`}
            >
              <View className="relative items-center justify-center">
                <Ionicons
                  name={selected ? tab.activeIcon : tab.icon}
                  size={21}
                  color={selected ? "#14919B" : "#6F767E"}
                />
                {tab.label === "Messages" ? (
                  <View className="absolute -top-1 -right-2 h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 border-[1.5px] border-white">
                    <Text className="text-[8px] font-bold text-white leading-none">
                      1
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Text
              className={`mt-0.5 text-[10px] tracking-tight ${
                selected
                  ? "font-bold text-primary"
                  : "font-medium text-brand-gray"
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
