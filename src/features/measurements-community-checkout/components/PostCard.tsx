import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
  category?: string;
  timeAgo?: string;
  initialLikes?: number;
  commentsCount?: number;
  verifiedTailor?: boolean;
  onPress?: () => void;
  onCommentPress?: () => void;
};

export function PostCard({
  author,
  handle,
  caption,
  avatarImage,
  postImage,
  tone = "teal",
  category,
  timeAgo = "2h ago",
  initialLikes = 128,
  commentsCount = 24,
  verifiedTailor = false,
  onPress,
  onCommentPress,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [bookmarked, setBookmarked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  return (
    <View className="mb-4 rounded-2xl border border-brand-border bg-white p-3.5 shadow-sm">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center"
        >
          <PlaceholderVisual
            image={avatarImage}
            variant="person"
            size="xs"
            tone={tone}
          />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-[13px] font-bold text-brand-dark">
                {author}
              </Text>
              {verifiedTailor && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#14919B"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
            <View className="flex-row items-center">
              <Text className="text-[10px] text-brand-gray">{handle}</Text>
              <Text className="mx-1.5 text-[10px] text-brand-gray">•</Text>
              <Text className="text-[10px] text-brand-gray">{timeAgo}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {category ? (
          <View className="rounded-full border border-primary/20 bg-primary-50 px-2.5 py-1">
            <Text className="text-[10px] font-semibold text-primary">
              {category}
            </Text>
          </View>
        ) : (
          <TouchableOpacity className="p-1">
            <Ionicons name="ellipsis-horizontal" size={18} color="#6F767E" />
          </TouchableOpacity>
        )}
      </View>

      {/* Caption */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Text className="mb-3 text-[12.5px] leading-5 text-brand-dark">
          {caption}
        </Text>

        {/* Media Container */}
        <View className="h-[260px] w-full overflow-hidden rounded-xl bg-brand-surface">
          <Image
            source={postImage ?? communityPost}
            contentFit="cover"
            style={{ height: "100%", width: "100%" }}
            transition={200}
          />
        </View>
      </TouchableOpacity>

      {/* Action Footer */}
      <View className="mt-3 flex-row items-center justify-between pt-1">
        <View className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={toggleLike}
            activeOpacity={0.7}
            className="flex-row items-center"
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={20}
              color={liked ? "#14919B" : "#1A1D1F"}
            />
            <Text
              className={`ml-1.5 text-[12px] font-medium ${
                liked ? "text-primary font-semibold" : "text-brand-dark"
              }`}
            >
              {likeCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCommentPress || onPress}
            activeOpacity={0.7}
            className="flex-row items-center"
          >
            <Ionicons name="chatbubble-outline" size={18} color="#1A1D1F" />
            <Text className="ml-1.5 text-[12px] font-medium text-brand-dark">
              {commentsCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} className="flex-row items-center">
            <Ionicons name="paper-plane-outline" size={18} color="#1A1D1F" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={toggleBookmark} activeOpacity={0.7} className="p-1">
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={bookmarked ? "#14919B" : "#1A1D1F"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
