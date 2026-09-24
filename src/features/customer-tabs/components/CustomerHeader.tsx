import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type CustomerHeaderProps = {
  title: string;
  subtitle?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap | null;
  avatarUrl?: string | null;
  onRightPress?: () => void;
  centered?: boolean;
  hideRightIcon?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
};

export function CustomerHeader({
  title,
  subtitle,
  rightIcon = "notifications-outline",
  avatarUrl,
  onRightPress,
  centered,
  hideRightIcon = false,
  showBack = false,
  onBackPress,
}: CustomerHeaderProps) {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/tailor-dashboard" as any);
    }
  };

  return (
    <View className={`px-5 pb-3 pt-2 ${centered && !showBack ? "items-center" : ""}`}>
      <View className="w-full flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          {showBack && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBack}
              className="mr-3 h-10 w-10 items-center justify-center -ml-2 rounded-md active:bg-brand-surface"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={22} color="#1A1D1F" />
            </TouchableOpacity>
          )}
          <View className={centered && !showBack ? "flex-1 items-center" : "flex-1"}>
            <Text className="text-[20px] font-black text-brand-dark tracking-tight">
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-0.5 text-[13px] font-medium text-brand-gray">
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {!hideRightIcon && rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-9 h-9 rounded-full border border-brand-border bg-brand-surface"
                contentFit="cover"
              />
            ) : (
              <Ionicons name={rightIcon} size={20} color="#1A1D1F" />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
