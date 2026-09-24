import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ButtonTexture, type ButtonTextureVariant } from "../../../components/ui/ButtonTexture";

type AuthButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outlined" | "danger";
  textureVariant?: ButtonTextureVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  showTexture?: boolean;
  style?: ViewStyle;
  className?: string;
  borderRadius?: number;
  textColor?: string;
  iconColor?: string;
};

export function AuthButton({
  title,
  onPress,
  variant = "primary",
  textureVariant,
  icon,
  loading = false,
  disabled = false,
  showTexture = true,
  style,
  className = "",
  borderRadius,
  textColor,
  iconColor,
}: AuthButtonProps) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isOutlined = variant === "outlined";

  // Determine texture: primary defaults to greenish, danger defaults to reddish
  const resolvedTextureVariant: ButtonTextureVariant =
    textureVariant ??
    (isPrimary ? "greenish" : isDanger ? "reddish" : "none");

  const radius = borderRadius ?? 12;

  const bgStyle = isPrimary
    ? "bg-[#00949D] shadow-sm"
    : isDanger
    ? "bg-[#3B1E22]"
    : "bg-white border-[1.5px] border-brand-border";

  const heightStyle = isDanger ? "h-[44px]" : "h-[54px]";
  const defaultTextColor = isOutlined ? "#00949D" : "#FFFFFF";
  const resolvedTextColor = textColor ?? defaultTextColor;
  const defaultIconColor = isOutlined ? "#00949D" : "#FFFFFF";
  const resolvedIconColor = iconColor ?? defaultIconColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      className={`relative flex-row items-center justify-center ${heightStyle} rounded-xl overflow-hidden ${bgStyle} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
      style={[{ borderRadius: radius }, style]}
    >
      {/* Texture from assets/texture (greenish / reddish) */}
      {showTexture && resolvedTextureVariant !== "none" && (
        <ButtonTexture
          variant={resolvedTextureVariant}
          borderRadius={radius}
          opacity={isDanger ? 0.45 : 1}
          backgroundColor={isDanger ? "#3B1E22" : undefined}
        />
      )}

      {loading ? (
        <ActivityIndicator
          color={resolvedIconColor}
          size="small"
        />
      ) : (
        <View className="flex-row items-center justify-center z-10 px-4">
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={resolvedIconColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            className="text-base font-bold tracking-wide"
            style={{
              color: resolvedTextColor,
              textShadowColor: !isOutlined ? "rgba(0,0,0,0.3)" : "transparent",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
