import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type MccHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightText?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap | null;
  hideRight?: boolean;
  onBackPress?: () => void;
  titleClassName?: string;
};

export function MccHeader({
  title,
  subtitle,
  showBack,
  rightText,
  rightIcon,
  hideRight = false,
  onBackPress,
  titleClassName,
}: MccHeaderProps) {
  const handleBack =
    onBackPress ||
    (() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/home" as any);
      }
    });

  return (
    <View className="h-14 flex-row items-center justify-between px-4">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={showBack ? "Go back" : "Menu"}
        onPress={() => (showBack ? handleBack() : undefined)}
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <Ionicons
          name={showBack ? "arrow-back" : "menu"}
          size={22}
          color="#1A1D1F"
        />
      </TouchableOpacity>

      <View className="flex-1 items-center px-2">
        <Text
          numberOfLines={1}
          className={titleClassName || "text-[18px] font-bold text-brand-dark"}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-[11px] font-medium text-brand-gray">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {!hideRight && (rightText || rightIcon) ? (
        <TouchableOpacity className="h-10 min-w-10 items-center justify-center px-1">
          {rightText ? (
            <Text className="text-[12px] font-semibold text-primary">
              {rightText}
            </Text>
          ) : rightIcon ? (
            <Ionicons name={rightIcon} size={20} color="#1A1D1F" />
          ) : null}
        </TouchableOpacity>
      ) : (
        <View className="h-10 w-10" />
      )}
    </View>
  );
}
