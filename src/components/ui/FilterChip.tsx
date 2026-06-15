import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FilterChipProps = {
  label: string;
  active?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export default function FilterChip({
  label,
  active = false,
  icon,
  onPress,
}: FilterChipProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center rounded-full px-4 h-9 mr-2 ${
        active
          ? 'bg-primary'
          : 'bg-brand-surface border border-brand-border'
      }`}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={active ? '#FFFFFF' : '#6F767E'}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        className={`text-sm font-medium ${
          active ? 'text-white' : 'text-brand-gray'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
