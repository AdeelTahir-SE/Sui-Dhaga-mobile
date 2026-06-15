import { Text, View } from "react-native";

type DetailRowProps = {
  title: string;
  value: string;
};

export function DetailRow({ title, value }: DetailRowProps) {
  return (
    <View className="flex-row justify-between py-1.5">
      <Text className="text-[11px] text-brand-gray">{title}</Text>
      <Text className="text-right text-[11px] font-medium text-brand-dark">
        {value}
      </Text>
    </View>
  );
}
