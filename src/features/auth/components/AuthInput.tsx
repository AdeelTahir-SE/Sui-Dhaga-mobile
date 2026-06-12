import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AuthInputProps = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  secureTextEntry?: boolean;
};

export function AuthInput({
  label,
  icon,
  error,
  secureTextEntry,
  ...props
}: AuthInputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View className="mb-4">
      <Text className="text-[13px] font-medium text-brand-dark mb-1.5">
        {label}
      </Text>
      <View className="flex-row items-center border border-brand-border rounded-xl px-4 h-[52px] bg-white">
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color="#9CA3AF"
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          className="flex-1 text-[15px] text-brand-dark"
          secureTextEntry={isSecure}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}
    </View>
  );
}
