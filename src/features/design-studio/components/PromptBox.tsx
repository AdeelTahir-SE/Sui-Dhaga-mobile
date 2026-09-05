import React from "react";
import { Text, TextInput, View } from "react-native";

type PromptBoxProps = {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  count?: string;
  placeholder?: string;
  editable?: boolean;
};

export function PromptBox({
  label,
  value,
  onChangeText,
  count,
  placeholder = "Describe your design...",
  editable = true,
}: PromptBoxProps) {
  const displayCount = count || `${value.length}/300`;

  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-semibold text-brand-dark">
        {label}
      </Text>
      <View className="rounded-xl border border-brand-border bg-white px-4 py-3">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          editable={editable}
          maxLength={300}
          className="min-h-[74px] text-[13px] leading-5 text-brand-dark"
          textAlignVertical="top"
        />
        <Text className="self-end text-[10px] text-brand-gray">{displayCount}</Text>
      </View>
    </View>
  );
}
