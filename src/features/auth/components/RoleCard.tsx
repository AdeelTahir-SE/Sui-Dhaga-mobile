import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  type ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type RoleCardProps = {
  title: string;
  description: string;
  image: ImageSourcePropType;
  selected: boolean;
  onPress: () => void;
};

export function RoleCard({
  title,
  description,
  image,
  selected,
  onPress,
}: RoleCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-1 items-center rounded-2xl px-2 py-4 border-[1.5px] ${
        selected
          ? "border-primary bg-primary-50"
          : "border-brand-border bg-white"
      }`}
    >
      {/* Selected checkmark badge */}
      {selected && (
        <View className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary items-center justify-center z-10">
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      )}

      {/* Role illustration */}
      <View className="w-14 h-14 items-center justify-center mb-2">
        <Image
          source={image}
          style={{ width: 48, height: 48 }}
          resizeMode="contain"
        />
      </View>

      {/* Role title */}
      <Text
        className={`text-[13px] font-semibold mb-1 ${
          selected ? "text-primary-dark" : "text-brand-dark"
        }`}
      >
        {title}
      </Text>

      {/* Role description */}
      <Text className="text-[10px] text-brand-gray text-center leading-[14px]">
        {description}
      </Text>
    </TouchableOpacity>
  );
}
