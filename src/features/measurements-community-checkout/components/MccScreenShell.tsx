import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FixedBottomTabs,
  FIXED_BOTTOM_TABS_HEIGHT,
} from "@/components/layout/FixedBottomTabs";

type MccScreenShellProps = {
  children: React.ReactNode;
  bottomTabs?: React.ReactNode;
};

export function MccScreenShell({ children, bottomTabs }: MccScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom:
            insets.bottom + (bottomTabs ? FIXED_BOTTOM_TABS_HEIGHT + 22 : 22),
        }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {bottomTabs ? <FixedBottomTabs>{bottomTabs}</FixedBottomTabs> : null}
    </View>
  );
}
