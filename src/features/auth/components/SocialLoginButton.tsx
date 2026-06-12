import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Provider = "google" | "apple" | "facebook";

type SocialLoginButtonProps = {
  provider: Provider;
  onPress: () => void;
};

const providerConfig: Record<
  Provider,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  google: { icon: "logo-google", color: "#DB4437" },
  apple: { icon: "logo-apple", color: "#000000" },
  facebook: { icon: "logo-facebook", color: "#1877F2" },
};

export function SocialLoginButton({
  provider,
  onPress,
}: SocialLoginButtonProps) {
  const { icon, color } = providerConfig[provider];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="w-[60px] h-[60px] rounded-full border-[1.5px] border-brand-border items-center justify-center bg-white"
    >
      <Ionicons name={icon} size={26} color={color} />
    </TouchableOpacity>
  );
}
