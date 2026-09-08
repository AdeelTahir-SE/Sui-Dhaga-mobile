import { Text, TouchableOpacity, View } from "react-native";

type SectionTitleProps = {
  title: string;
  action?: string;
  onPressAction?: () => void;
};

export function SectionTitle({ title, action, onPressAction }: SectionTitleProps) {
  return (
    <View className="mb-3.5 mt-6 flex-row items-center justify-between">
      <Text className="text-[18px] font-bold text-brand-dark tracking-tight">{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onPressAction} activeOpacity={0.7} className="py-1 px-1">
          <Text className="text-[14px] font-semibold text-primary">{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
