import { RefreshControlProps, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FixedBottomTabs,
  FIXED_BOTTOM_TABS_HEIGHT,
} from "@/components/layout/FixedBottomTabs";

type MccScreenShellProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  bottomTabs?: React.ReactNode;
  floatingAction?: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

export function MccScreenShell({
  children,
  header,
  bottomTabs,
  floatingAction,
  refreshControl,
}: MccScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {header}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom:
            insets.bottom + (bottomTabs ? FIXED_BOTTOM_TABS_HEIGHT + 22 : 36),
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
      {bottomTabs ? <FixedBottomTabs>{bottomTabs}</FixedBottomTabs> : null}
      {floatingAction}
    </View>
  );
}
