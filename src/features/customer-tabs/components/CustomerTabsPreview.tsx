import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CustomerTab = "Home" | "Tailors" | "Design" | "Orders" | "Messages" | "Profile";

type CustomerTabsPreviewProps = {
  active: CustomerTab;
};

export function CustomerTabsPreview({ active }: CustomerTabsPreviewProps) {
  const tabs: {
    label: CustomerTab;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { label: "Home", icon: "home-outline" },
    { label: "Tailors", icon: "person-outline" },
    { label: "Design", icon: "color-wand-outline" },
    { label: "Orders", icon: "bag-handle-outline" },
    { label: "Messages", icon: "chatbubble-outline" },
    { label: "Profile", icon: "person-circle-outline" },
  ];

  return (
    <View className="mt-5 flex-row justify-between border-t border-brand-border px-2 pt-3">
      {tabs.map((tab) => {
        const selected = tab.label === active;

        return (
          <View key={tab.label} className="items-center">
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
          </View>
        );
      })}
    </View>
  );
}
