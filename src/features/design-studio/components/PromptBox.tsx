import { Text, TextInput, View } from "react-native";

type PromptBoxProps = {
  label: string;
  value: string;
  count: string;
};

export function PromptBox({ label, value, count }: PromptBoxProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-semibold text-brand-dark">
        {label}
      </Text>
      <View className="rounded-xl border border-brand-border bg-white px-4 py-3">
        <TextInput
          value={value}
          multiline
          editable={false}
          className="min-h-[74px] text-[13px] leading-5 text-brand-dark"
          textAlignVertical="top"
        />
        <Text className="self-end text-[10px] text-brand-gray">{count}</Text>
      </View>
    </View>
  );
}
