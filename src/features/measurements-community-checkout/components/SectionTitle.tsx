import { Text, View } from "react-native";

type SectionTitleProps = {
  title: string;
  action?: string;
};

export function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <View className="mb-3 mt-5 flex-row items-center justify-between">
      <Text className="text-[13px] font-semibold text-brand-dark">{title}</Text>
      {action ? (
        <Text className="text-[11px] font-semibold text-primary">{action}</Text>
      ) : null}
    </View>
  );
}
