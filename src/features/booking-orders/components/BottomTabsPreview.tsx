import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type BottomTabsPreviewProps = {
  active: "Tailors" | "Orders";
};

export function BottomTabsPreview({ active }: BottomTabsPreviewProps) {
  const tabs: {
    label: string;
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
