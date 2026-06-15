import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SearchBarProps = {
  placeholder: string;
  onPress?: () => void;
  editable?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  rightIcon?: boolean;
};

export default function SearchBar({
  placeholder,
  onPress,
  editable = true,
  value,
  onChangeText,
  rightIcon = false,
}: SearchBarProps) {
  const inner = (
    <View className="flex-row items-center bg-brand-surface rounded-xl h-12 px-4">
      <Ionicons name="search-outline" size={20} color="#9CA3AF" />
      <TextInput
        className="flex-1 ml-2.5 text-sm text-brand-dark"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        editable={editable && !onPress}
        value={value}
        onChangeText={onChangeText}
      />
      {rightIcon && (
        <TouchableOpacity
          className="ml-2 w-8 h-8 items-center justify-center rounded-lg bg-white border border-brand-border"
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={18} color="#6F767E" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (!editable || onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
}
