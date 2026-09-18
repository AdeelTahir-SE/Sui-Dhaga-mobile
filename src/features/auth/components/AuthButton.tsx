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
}: AuthButtonProps) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isOutlined = variant === "outlined";

  // Determine texture: primary defaults to greenish, danger defaults to reddish
  const resolvedTextureVariant: ButtonTextureVariant =
    textureVariant ??
    (isPrimary ? "greenish" : isDanger ? "reddish" : "none");

  const bgStyle = isPrimary
    ? "bg-[#00949D] shadow-sm"
    : isDanger
    ? "bg-[#F05A57] shadow-sm"
    : "bg-white border-[1.5px] border-brand-border";

  const textColor = isOutlined ? "text-[#00949D]" : "text-white";
  const iconColor = isOutlined ? "#00949D" : "#FFFFFF";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      className={`relative flex-row items-center justify-center h-[54px] rounded-xl overflow-hidden ${bgStyle} ${
        disabled ? "opacity-50" : ""
      }`}
      style={style}
    >
      {/* Texture from assets/texture (greenish / reddish) */}
      {showTexture && resolvedTextureVariant !== "none" && (
        <ButtonTexture
          variant={resolvedTextureVariant}
          borderRadius={12}
        />
      )}

      {loading ? (
        <ActivityIndicator
          color={isOutlined ? "#00949D" : "#FFFFFF"}
          size="small"
        />
      ) : (
        <View className="flex-row items-center justify-center z-10 px-4">
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={iconColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            className={`text-base font-bold tracking-wide ${textColor}`}
            style={{
              textShadowColor: !isOutlined ? "rgba(0,0,0,0.22)" : "transparent",
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
