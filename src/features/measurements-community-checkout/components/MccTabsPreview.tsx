import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type MccTabsPreviewProps = {
  active: "Design" | "Community" | "Orders" | "Profile";
};

type TabItem = {
  label: "Home" | "Design" | "Community" | "Orders" | "Profile";
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  href: string;
};

const tabs: TabItem[] = [
  { label: "Home", icon: "home-outline", activeIcon: "home", href: "/home" },
  { label: "Design", icon: "color-wand-outline", activeIcon: "color-wand", href: "/design" },
  { label: "Community", icon: "people-outline", activeIcon: "people", href: "/community" },
  { label: "Orders", icon: "bag-handle-outline", activeIcon: "bag-handle", href: "/orders" },
  { label: "Profile", icon: "person-circle-outline", activeIcon: "person-circle", href: "/profile" },
];

export function MccTabsPreview({ active }: MccTabsPreviewProps) {
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
            <View
              className={`h-8 w-12 items-center justify-center rounded-full ${
                selected ? "bg-primary-light" : "bg-transparent"
              }`}
            >
              <Ionicons
                name={selected ? tab.activeIcon : tab.icon}
                size={21}
                color={selected ? "#14919B" : "#6F767E"}
              />
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
