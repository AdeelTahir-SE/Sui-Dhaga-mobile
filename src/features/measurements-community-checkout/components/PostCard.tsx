import { Text, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { PlaceholderVisual } from "./PlaceholderVisual";

const communityPost = require("@/assets/illustrations/generated/community-post.png");

type PostCardProps = {
  author: string;
  handle: string;
  caption: string;
  avatarImage?: ImageSource;
  postImage?: ImageSource;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
};

export function PostCard({
  author,
  handle,
  caption,
  avatarImage,
  postImage,
  tone = "mint",
}: PostCardProps) {
  return (
    <View className="mb-4 rounded-2xl border border-brand-border bg-white p-3">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <PlaceholderVisual image={avatarImage} variant="person" size="xs" tone="coral" />
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
      <View className="h-[260px] w-full overflow-hidden rounded-xl bg-brand-surface">
        <Image
          source={postImage ?? communityPost}
          contentFit="cover"
          style={{ height: "100%", width: "100%" }}
        />
      </View>
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
