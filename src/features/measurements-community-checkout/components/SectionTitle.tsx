import { Text, TouchableOpacity, View } from "react-native";

type SectionTitleProps = {
  title: string;
  action?: string;
  onActionPress?: () => void;
};

export function SectionTitle({ title, action, onActionPress }: SectionTitleProps) {
  return (
    <View className="mb-3 mt-5 flex-row items-center justify-between">
      <Text className="text-[13px] font-semibold text-brand-dark">{title}</Text>
      {action ? (
        onActionPress ? (
          <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
            <Text className="text-[11px] font-semibold text-primary">{action}</Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-[11px] font-semibold text-primary">{action}</Text>
        )
      ) : null}
    </View>
  );
}
