import { View, Text, TouchableOpacity } from 'react-native';

type SectionHeaderProps = {
  title: string;
  onViewAll?: () => void;
  showViewAll?: boolean;
};

export default function SectionHeader({
  title,
  onViewAll,
  showViewAll = true,
}: SectionHeaderProps) {
  return (
    <View className="flex-row justify-between items-center px-5 mb-3">
      <Text className="text-lg font-bold text-brand-dark">{title}</Text>
      {showViewAll && (
        <TouchableOpacity activeOpacity={0.7} onPress={onViewAll}>
          <Text className="text-sm text-primary">View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
