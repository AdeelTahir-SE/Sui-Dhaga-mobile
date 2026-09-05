import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AuthMessageBannerProps = {
  type?: "error" | "success" | "info";
  message: string;
  onDismiss?: () => void;
};

export function AuthMessageBanner({
  type = "error",
  message,
  onDismiss,
}: AuthMessageBannerProps) {
  if (!message) return null;

  const isError = type === "error";
  const isSuccess = type === "success";

  const config = {
    error: {
      bgColor: "bg-rose-50/90",
      borderColor: "border-rose-200",
      iconBg: "bg-rose-100",
      iconName: "alert-circle" as keyof typeof Ionicons.glyphMap,
      iconColor: "#E11D48",
      textColor: "text-rose-800",
      closeColor: "#9F1239",
    },
    success: {
      bgColor: "bg-teal-50/90",
      borderColor: "border-teal-200",
      iconBg: "bg-teal-100",
      iconName: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
      iconColor: "#0D9488",
      textColor: "text-teal-900",
      closeColor: "#115E59",
    },
    info: {
      bgColor: "bg-sky-50/90",
      borderColor: "border-sky-200",
      iconBg: "bg-sky-100",
      iconName: "information-circle" as keyof typeof Ionicons.glyphMap,
      iconColor: "#0284C7",
      textColor: "text-sky-900",
      closeColor: "#075985",
    },
  }[type];

  return (
    <View
      className={`mb-5 rounded-2xl p-3.5 border ${config.bgColor} ${config.borderColor} flex-row items-start shadow-sm`}
      style={{
        shadowColor: isError ? "#E11D48" : "#0D9488",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View
        className={`w-7 h-7 rounded-full ${config.iconBg} items-center justify-center mr-3 mt-0.5`}
      >
        <Ionicons name={config.iconName} size={16} color={config.iconColor} />
      </View>

      <Text className={`flex-1 text-[13px] font-medium leading-[19px] ${config.textColor}`}>
        {message}
      </Text>

      {onDismiss ? (
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="ml-2 mt-0.5 p-0.5"
        >
          <Ionicons name="close" size={16} color={config.closeColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
