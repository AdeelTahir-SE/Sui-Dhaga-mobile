import {
  FIXED_BOTTOM_TABS_HEIGHT,
  FixedBottomTabs,
} from "@/components/layout/FixedBottomTabs";
import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TailorScreenShellProps = {
  children: React.ReactNode;
  bottomTabs?: React.ReactNode;
  fixedBottomAction?: React.ReactNode;
};

export function TailorScreenShell({
  children,
  bottomTabs,
  fixedBottomAction,
}: TailorScreenShellProps) {
  const insets = useSafeAreaInsets();

  const tabsHeight = bottomTabs ? FIXED_BOTTOM_TABS_HEIGHT : 0;
  const actionHeight = fixedBottomAction ? 76 : 0;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + tabsHeight + actionHeight + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {fixedBottomAction ? (
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + tabsHeight,
            left: 0,
            right: 0,
            backgroundColor: "transparent",
            paddingHorizontal: 20,
            paddingVertical: 10,
            zIndex: 30,
          }}
        >
          {fixedBottomAction}
        </View>
      ) : null}

      {bottomTabs ? <FixedBottomTabs>{bottomTabs}</FixedBottomTabs> : null}
    </View>
  );
}
