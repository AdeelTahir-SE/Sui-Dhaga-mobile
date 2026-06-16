import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FixedBottomTabsProps = {
  children: React.ReactNode;
};

export const FIXED_BOTTOM_TABS_HEIGHT = 86;

export function FixedBottomTabs({ children }: FixedBottomTabsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-white px-5 pt-3"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      {children}
    </View>
  );
}
