import { View, Text } from 'react-native';
import React from 'react';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
};

export default function ScreenHeader({
  title,
  subtitle,
  rightAction,
}: ScreenHeaderProps) {
  return (
    <View className="px-5 pb-2">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-[22px] font-bold text-brand-dark">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm text-brand-gray mt-0.5">
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View>{rightAction}</View>}
      </View>
    </View>
  );
}
