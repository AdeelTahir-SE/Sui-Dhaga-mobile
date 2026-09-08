import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FixedBottomTabs,
  FIXED_BOTTOM_TABS_HEIGHT,
} from "@/components/layout/FixedBottomTabs";

type TailorDashboardShellProps = {
  children: React.ReactNode;
  bottomTabs?: React.ReactNode;
  refreshControl?: React.ReactElement<any>;
};

export function TailorDashboardShell({
  children,
  bottomTabs,
  refreshControl,
}: TailorDashboardShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        refreshControl={refreshControl}
        contentContainerStyle={{
          flexGrow: 1,
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
