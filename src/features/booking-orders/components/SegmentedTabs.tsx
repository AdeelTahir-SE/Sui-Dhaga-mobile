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
            className={`rounded-md border px-3.5 py-2 shadow-xs ${
              isActive
                ? "border-primary bg-primary"
                : "border-brand-border bg-white"
            }`}
          >
            <Text
              className={`text-[12px] font-bold ${
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

