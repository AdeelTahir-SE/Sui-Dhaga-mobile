import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PasswordStrengthProps = {
  password: string;
};

type Rule = {
  label: string;
  test: (pw: string) => boolean;
};

const rules: Rule[] = [
  {
    label: "At least 8 characters",
    test: (pw) => pw.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    label: "One number or special character",
    test: (pw) => /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  return (
    <View className="mb-4 -mt-1">
      {rules.map((rule, index) => {
        const passed = password.length > 0 && rule.test(password);
        return (
          <View key={index} className="flex-row items-center mb-1.5">
            <Ionicons
              name={passed ? "checkmark-circle" : "ellipse-outline"}
              size={16}
              color={passed ? "#22C55E" : "#9CA3AF"}
            />
            <Text
              className={`text-[12px] ml-2 ${
                passed ? "text-green-600" : "text-brand-gray"
              }`}
            >
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
