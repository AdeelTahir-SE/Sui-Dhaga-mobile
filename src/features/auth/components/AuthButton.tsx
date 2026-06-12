import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AuthButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outlined";
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function AuthButton({
  title,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  style,
}: AuthButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`flex-row items-center justify-center h-[54px] rounded-xl ${
        isPrimary
          ? "bg-primary"
          : "bg-white border-[1.5px] border-brand-border"
      } ${disabled ? "opacity-50" : ""}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? "#FFFFFF" : "#14919B"}
          size="small"
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={isPrimary ? "#FFFFFF" : "#1A1D1F"}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            className={`text-base font-semibold ${
              isPrimary ? "text-white" : "text-brand-dark"
            }`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
