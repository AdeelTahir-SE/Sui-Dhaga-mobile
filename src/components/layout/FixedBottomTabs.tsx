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
      className="absolute bottom-0 left-0 right-0 bg-white px-2 pt-2"
      style={{
        paddingBottom: Math.max(insets.bottom, 10),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {children}
    </View>
  );
}
