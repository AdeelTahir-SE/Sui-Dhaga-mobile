import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FixedBottomTabs,
  FIXED_BOTTOM_TABS_HEIGHT,
} from "@/components/layout/FixedBottomTabs";

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
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F3F4F6",
            paddingHorizontal: 20,
            paddingVertical: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 10,
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
