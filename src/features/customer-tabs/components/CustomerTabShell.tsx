import React from "react";
import { RefreshControlProps, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FixedBottomTabs,
  FIXED_BOTTOM_TABS_HEIGHT,
} from "@/components/layout/FixedBottomTabs";

type CustomerTabShellProps = {
  children: React.ReactNode;
  bottomTabs?: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentContainerStyle?: any;
};

export  function CustomerTabShell({
  children,
  bottomTabs,
  refreshControl,
  contentContainerStyle,
}: CustomerTabShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={[
          {
            flexGrow: 1,
            paddingBottom:
              insets.bottom + (bottomTabs ? FIXED_BOTTOM_TABS_HEIGHT + 22 : 22),
          },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
      {bottomTabs ? <FixedBottomTabs>{bottomTabs}</FixedBottomTabs> : null}
    </View>
  );
}
