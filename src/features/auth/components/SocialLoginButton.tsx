import React from "react";
import { TouchableOpacity, Text, type ViewStyle } from "react-native";
import { Image } from "expo-image";

const googleIcon = require("@/assets/icons/google-color-icon.svg");

type SocialLoginButtonProps = {
  provider?: "google";
  title?: string;
  onPress: () => void;
  style?: ViewStyle;
};

export function SocialLoginButton({
  title = "Continue with Google",
  onPress,
  style,
}: SocialLoginButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center justify-center h-[54px] w-full rounded-xl bg-white border border-brand-border"
      style={style}
    >
      <Image
        source={googleIcon}
        style={{ width: 22, height: 22, marginRight: 10 }}
        contentFit="contain"
      />
      <Text className="text-[15px] font-semibold text-brand-dark">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
