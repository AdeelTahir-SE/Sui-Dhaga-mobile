import { Text, TouchableOpacity, View } from "react-native";

type SectionTitleProps = {
  title: string;
  action?: string;
  onActionPress?: () => void;
  titleClassName?: string;
};

export function SectionTitle({
  title,
  action,
  onActionPress,
  titleClassName,
}: SectionTitleProps) {
  return (
    <View className="mb-3 mt-5 flex-row items-center justify-between">
      <Text
        className={
          titleClassName || "text-[15px] font-bold text-brand-dark"
        }
      >
        {title}
      </Text>
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
