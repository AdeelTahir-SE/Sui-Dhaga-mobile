import React from "react";
import { Text, View, TouchableOpacity } from "react-native";

type SegmentedTabsProps = {
  tabs: string[];
  activeIndex?: number;
  onSelectTab?: (index: number) => void;
  onChange?: (index: number) => void;
};

export function SegmentedTabs({
  tabs,
  activeIndex = 0,
  onSelectTab,
  onChange,
}: SegmentedTabsProps) {
  const handlePress = (index: number) => {
    if (onSelectTab) onSelectTab(index);
    if (onChange) onChange(index);
  };

  return (
    <View className="flex-row gap-2">
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => handlePress(index)}
            activeOpacity={0.7}
            className={`rounded-xl border px-4 py-2 ${
              isActive
                ? "border-primary bg-primary shadow-sm"
                : "border-brand-border bg-white"
            }`}
          >
            <Text
              className={`text-[12px] font-semibold ${
                isActive ? "text-white" : "text-brand-dark"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

