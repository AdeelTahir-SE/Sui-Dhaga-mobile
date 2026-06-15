import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PlaceholderVisual } from "./PlaceholderVisual";

type PostCardProps = {
  author: string;
  handle: string;
  caption: string;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
};

export function PostCard({
  author,
  handle,
  caption,
  tone = "mint",
}: PostCardProps) {
  return (
    <View className="mb-4 rounded-2xl border border-brand-border bg-white p-3">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <PlaceholderVisual variant="person" size="xs" tone="coral" />
          <View className="ml-3">
            <Text className="text-[13px] font-bold text-brand-dark">
              {author}
            </Text>
            <Text className="text-[10px] text-brand-gray">{handle}</Text>
          </View>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color="#1A1D1F" />
      </View>
      <Text className="mb-3 text-[12px] leading-5 text-brand-dark">
        {caption}
      </Text>
      <PlaceholderVisual variant="garment" size="lg" tone={tone} />
      <View className="mt-3 flex-row items-center">
        <Ionicons name="heart" size={18} color="#F05A57" />
        <Text className="ml-2 mr-6 text-[12px] text-brand-dark">128</Text>
        <Ionicons name="chatbubble-outline" size={18} color="#1A1D1F" />
        <Text className="ml-2 flex-1 text-[12px] text-brand-dark">24</Text>
        <Ionicons name="bookmark-outline" size={19} color="#1A1D1F" />
      </View>
    </View>
  );
}
