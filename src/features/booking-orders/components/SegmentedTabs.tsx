import { Text, View } from "react-native";

type SegmentedTabsProps = {
  tabs: string[];
  activeIndex?: number;
};

export function SegmentedTabs({ tabs, activeIndex = 0 }: SegmentedTabsProps) {
  return (
    <View className="flex-row gap-2">
      {tabs.map((tab, index) => (
        <View
          key={tab}
          className={`rounded-lg border px-4 py-2 ${
            index === activeIndex
              ? "border-primary bg-primary"
              : "border-brand-border bg-white"
          }`}
        >
          <Text
            className={`text-[11px] font-medium ${
              index === activeIndex ? "text-white" : "text-brand-dark"
            }`}
          >
            {tab}
          </Text>
        </View>
      ))}
    </View>
  );
}
