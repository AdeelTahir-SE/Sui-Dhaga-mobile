import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type BookingOrdersHeaderProps = {
  title: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightLabel?: string;
  rightIconColor?: string;
  hideRightIcon?: boolean;
  alignLeftTitle?: boolean;
  titleClassName?: string;
  onPressLeft?: () => void;
  onPressRight?: () => void;
};

export function BookingOrdersHeader({
  title,
  leftIcon = "arrow-back",
  rightIcon = "ellipsis-vertical",
  rightLabel = "More options",
  rightIconColor,
  hideRightIcon = false,
  alignLeftTitle = false,
  titleClassName,
  onPressLeft,
  onPressRight,
}: BookingOrdersHeaderProps) {
  const handleLeftPress = () => {
    if (onPressLeft) {
      onPressLeft();
    } else if (leftIcon === "arrow-back") {
      router.back();
    }
  };

  if (alignLeftTitle) {
    return (
      <View className="h-14 flex-row items-center justify-between px-4 bg-white">
        <View className="flex-1 flex-row items-center">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={leftIcon === "arrow-back" ? "Go back" : "Menu"}
            onPress={handleLeftPress}
            className="h-10 w-10 items-center justify-center -ml-2 mr-2 active:opacity-70"
          >
            <Ionicons name={leftIcon} size={24} color="#1A1D1F" />
          </TouchableOpacity>
          <Text
            className={titleClassName || "text-[20px] font-bold text-brand-dark tracking-tight"}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        {!hideRightIcon && rightIcon ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={rightLabel}
            onPress={onPressRight}
            className="h-10 w-10 items-center justify-center -mr-2 active:opacity-70"
          >
            <Ionicons
              name={rightIcon}
              size={22}
              color={rightIconColor || (rightIcon === "heart" ? "#EF4444" : "#1A1D1F")}
            />
          </TouchableOpacity>
        ) : (
          <View className="h-10 w-10" />
        )}
      </View>
    );
  }

  return (
    <View className="h-14 flex-row items-center justify-between px-4">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={leftIcon === "arrow-back" ? "Go back" : "Menu"}
        onPress={handleLeftPress}
        className="h-10 w-10 items-center justify-center active:opacity-70"
      >
        <Ionicons name={leftIcon} size={22} color="#1A1D1F" />
      </TouchableOpacity>
      <Text className="text-[15px] font-semibold text-brand-dark">
        {title}
      </Text>
      {!hideRightIcon && rightIcon ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={rightLabel}
          onPress={onPressRight}
          className="h-10 w-10 items-center justify-center active:opacity-70"
        >
          <Ionicons
            name={rightIcon}
            size={20}
            color={rightIconColor || (rightIcon === "heart" ? "#EF4444" : "#1A1D1F")}
          />
        </TouchableOpacity>
      ) : (
        <View className="h-10 w-10" />
      )}
    </View>
  );
}
