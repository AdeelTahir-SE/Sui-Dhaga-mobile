import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TailorScreenShellProps = {
  children: React.ReactNode;
};

export function TailorScreenShell({ children }: TailorScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 22 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}
