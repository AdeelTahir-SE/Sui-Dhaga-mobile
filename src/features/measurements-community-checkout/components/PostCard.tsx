import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { PlaceholderVisual } from "./PlaceholderVisual";
import { CommunityMediaCarousel } from "./CommunityMediaCarousel";

type PostCardProps = {
  author: string;
  handle?: string;
  caption: string;
  avatarImage?: any;
  postImage?: any;
  images?: (string | null | undefined)[];
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  category?: string;
  timeAgo?: string;
  likesCount?: number;
  initialLikes?: number;
  isLiked?: boolean;
  commentsCount?: number;
  verifiedTailor?: boolean;
  onPress?: () => void;
  onCommentPress?: () => void;
  onLikePress?: () => void;
};

export function PostCard({
  author,
  handle,
  caption,
  avatarImage,
  postImage,
  images,
  tone = "teal",
  category,
  timeAgo = "Recently",
  likesCount,
  initialLikes = 0,
  isLiked: controlledIsLiked,
  commentsCount = 0,
  verifiedTailor = false,
  onPress,
  onCommentPress,
  onLikePress,
}: PostCardProps) {
  const [internalLiked, setInternalLiked] = useState(false);
  const [internalLikeCount, setInternalLikeCount] = useState(initialLikes);

  const isLiked = controlledIsLiked !== undefined ? controlledIsLiked : internalLiked;
  const currentLikes = likesCount !== undefined ? likesCount : internalLikeCount;

  const handleLike = () => {
    if (onLikePress) {
      onLikePress();
    } else {
      setInternalLiked(!internalLiked);
      setInternalLikeCount((prev) => (internalLiked ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const imageSource =
    typeof postImage === "string" ? { uri: postImage } : postImage;

  const avatarSource =
    typeof avatarImage === "string" ? { uri: avatarImage } : avatarImage;

  // Resolve media list for single vs carousel presentation
  const mediaList: string[] = [];
  if (images && images.length > 0) {
    images.forEach((img) => {
      if (typeof img === "string" && img.trim().length > 0) {
        mediaList.push(img.trim());
      }
    });
  } else if (typeof postImage === "string" && postImage.trim().length > 0) {
    mediaList.push(postImage.trim());
  }

  return (
    <View className="mb-4 rounded-2xl border border-brand-border bg-white p-3.5 shadow-sm">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center"
        >
          {avatarSource ? (
            <Image
              source={avatarSource}
              contentFit="cover"
              style={{ width: 34, height: 34, borderRadius: 17 }}
            />
          ) : (
            <PlaceholderVisual
              variant="person"
              size="xs"
              tone={tone}
            />
          )}
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-[13px] font-bold text-brand-dark" numberOfLines={1}>
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
              {handle ? (
                <>
                  <Text className="text-[10px] text-brand-gray">{handle}</Text>
                  <Text className="mx-1.5 text-[10px] text-brand-gray">•</Text>
                </>
              ) : null}
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
        ) : null}
      </View>

      {/* Caption & Media */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {caption ? (
          <Text className="mb-3 text-[12.5px] leading-5 text-brand-dark">
            {caption}
          </Text>
        ) : null}

        {/* Media Container (Carousel if > 1, single item if 1) */}
        {mediaList.length > 0 ? (
          <View className="mb-2">
            <CommunityMediaCarousel
              media={mediaList}
              fallbackImage={imageSource}
              height={260}
              borderRadius={16}
              onPress={onPress}
            />
          </View>
        ) : imageSource ? (
          <View className="h-[260px] w-full overflow-hidden rounded-xl bg-brand-surface mb-1">
            <Image
              source={imageSource}
              contentFit="cover"
              style={{ height: "100%", width: "100%" }}
              transition={200}
            />
          </View>
        ) : null}
      </TouchableOpacity>

      {/* Action Footer */}
      <View className="mt-2.5 flex-row items-center justify-between pt-1">
        <View className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={handleLike}
            activeOpacity={0.7}
            className="flex-row items-center py-1 pr-2"
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#E11D48" : "#1A1D1F"}
            />
            <Text
              className={`ml-1.5 text-[12px] font-medium ${
                isLiked ? "text-red-500 font-semibold" : "text-brand-dark"
              }`}
            >
              {currentLikes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCommentPress || onPress}
            activeOpacity={0.7}
            className="flex-row items-center py-1 pr-2"
          >
            <Ionicons name="chatbubble-outline" size={18} color="#1A1D1F" />
            <Text className="ml-1.5 text-[12px] font-medium text-brand-dark">
              {commentsCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
