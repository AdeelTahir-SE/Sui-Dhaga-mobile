import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PlaceholderVisual } from "../components/PlaceholderVisual";
import { SectionTitle } from "../components/SectionTitle";
import { CommunityMediaCarousel } from "../components/CommunityMediaCarousel";
import { usePostDetails } from "../hooks/useCommunity";

export default function PostDetailsScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const {
    post,
    comments,
    isLoading,
    isSubmittingComment,
    error,
    refresh,
    addComment,
    toggleLike,
  } = usePostDetails(postId || "");

  const [commentText, setCommentText] = useState("");

  const handleSendComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    try {
      setCommentText("");
      await addComment(text);
    } catch (err: any) {
      Alert.alert("Comment Error", err?.message || "Could not post comment. Please try again.");
    }
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        message: `Check out this design on Sui Dhaga: "${post.title || post.caption || "Bespoke Design"}"`,
      });
    } catch {}
  };

  const isLiked = Boolean(post?.isLiked ?? post?.is_liked);
  const likesCount = post?.likesCount ?? post?.likes_count ?? 0;
  const postImage = post?.images && post.images.length > 0 ? post.images[0] : undefined;

  const authorName =
    post?.author?.fullName ||
    post?.author?.full_name ||
    post?.author?.name ||
    "Community Member";

  const authorAvatar =
    post?.author?.avatarUrl ||
    post?.author?.avatar_url ||
    post?.author?.avatar;

  const authorHandle = post?.author?.role === "tailor" ? "Verified Tailor" : "Designer";

  return (
    <MccScreenShell
      header={<MccHeader title="Post Details" showBack rightText="" />}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
        style={{ flex: 1 }}
      >
        <View className="px-5 pb-6">
          {/* Loading State */}
          {isLoading && !post && (
            <View className="my-16 items-center justify-center">
              <ActivityIndicator size="large" color="#14919B" />
              <Text className="mt-3 text-[13px] font-medium text-brand-gray">
                Loading post details...
              </Text>
            </View>
          )}

          {/* Error State */}
          {!isLoading && error && !post && (
            <View className="my-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50/60 p-6">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-3">
                <Ionicons name="alert-circle-outline" size={26} color="#EF4444" />
              </View>
              <Text className="text-center text-[15px] font-bold text-brand-dark">
                Post Not Available
              </Text>
              <Text className="mt-1 text-center text-[12px] text-brand-gray px-4 leading-4">
                {error}
              </Text>
              <View className="mt-4 flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={refresh}
                  className="rounded-xl border border-brand-border bg-white px-4 py-2"
                >
                  <Text className="text-[12px] font-semibold text-brand-dark">Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.back()}
                  className="rounded-xl bg-primary px-4 py-2"
                >
                  <Text className="text-[12px] font-semibold text-white">Go Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Post Content */}
          {post && (
            <>
              {/* Author Header */}
              <View className="mb-3.5 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  {authorAvatar ? (
                    <Image
                      source={{ uri: authorAvatar }}
                      contentFit="cover"
                      style={{ width: 38, height: 38, borderRadius: 19 }}
                    />
                  ) : (
                    <PlaceholderVisual variant="person" size="xs" tone="teal" />
                  )}
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-[13.5px] font-bold text-brand-dark" numberOfLines={1}>
                        {authorName}
                      </Text>
                      {(post.author?.role === "tailor" || post.author?.isVerified) && (
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#14919B"
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </View>
                    <Text className="text-[10.5px] text-brand-gray">{authorHandle}</Text>
                  </View>
                </View>

                {post.category ? (
                  <View className="rounded-full border border-primary/20 bg-primary-50 px-3 py-1">
                    <Text className="text-[11px] font-semibold text-primary">
                      {post.category}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Post Media (Single or Carousel) */}
              {post.images && post.images.length > 0 ? (
                <View className="mb-3">
                  <CommunityMediaCarousel
                    media={post.images}
                    height={320}
                    borderRadius={18}
                  />
                </View>
              ) : postImage ? (
                <View className="h-[300px] overflow-hidden rounded-2xl bg-brand-surface mb-3 border border-brand-border/60 shadow-xs">
                  <Image
                    source={{ uri: postImage }}
                    contentFit="cover"
                    style={{ height: "100%", width: "100%" }}
                    transition={200}
                  />
                </View>
              ) : null}

              {/* Caption */}
              <Text className="text-[13px] leading-5 text-brand-dark font-medium mb-3">
                {post.content || post.caption || post.title || ""}
              </Text>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5 mb-3">
                  {post.tags.map((tag, idx) => (
                    <View
                      key={`tag-${idx}`}
                      className="rounded-md bg-gray-100 px-2 py-0.5"
                    >
                      <Text className="text-[10px] text-brand-gray font-medium">
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Action Counters Bar */}
              <View className="flex-row items-center justify-between border-y border-brand-border py-3 my-2">
                <View className="flex-row items-center gap-6">
                  <TouchableOpacity
                    onPress={toggleLike}
                    activeOpacity={0.7}
                    className="flex-row items-center py-1"
                  >
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={20}
                      color={isLiked ? "#E11D48" : "#1A1D1F"}
                    />
                    <Text
                      className={`ml-1.5 text-[12.5px] font-semibold ${
                        isLiked ? "text-red-500" : "text-brand-dark"
                      }`}
                    >
                      {likesCount} Likes
                    </Text>
                  </TouchableOpacity>

                  <View className="flex-row items-center py-1">
                    <Ionicons name="chatbubble-outline" size={18} color="#1A1D1F" />
                    <Text className="ml-1.5 text-[12.5px] font-semibold text-brand-dark">
                      {comments.length} Comments
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleShare}
                  activeOpacity={0.7}
                  className="p-1"
                >
                  <Ionicons name="share-social-outline" size={19} color="#1A1D1F" />
                </TouchableOpacity>
              </View>

              {/* Comments Section */}
              <SectionTitle title={`Comments (${comments.length})`} />

              {/* Empty comments */}
              {comments.length === 0 && (
                <View className="py-6 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 my-2">
                  <Ionicons name="chatbubbles-outline" size={24} color="#9CA3AF" />
                  <Text className="mt-2 text-[12px] font-medium text-brand-gray">
                    No comments yet. Start the conversation!
                  </Text>
                </View>
              )}

              {/* Comments list */}
              {comments.map((comment, index) => {
                const commenterName =
                  comment.user?.fullName ||
                  comment.user?.full_name ||
                  comment.user?.name ||
                  "User";

                const commenterAvatar =
                  comment.user?.avatarUrl ||
                  comment.user?.avatar_url ||
                  comment.user?.avatar;

                return (
                  <View
                    key={comment.id || `comment-${index}`}
                    className="flex-row mb-4 pt-1"
                  >
                    {commenterAvatar ? (
                      <Image
                        source={{ uri: commenterAvatar }}
                        contentFit="cover"
                        style={{ width: 30, height: 30, borderRadius: 15 }}
                      />
                    ) : (
                      <PlaceholderVisual variant="person" size="xs" tone="blue" />
                    )}
                    <View className="ml-3 flex-1 rounded-xl bg-gray-50 p-2.5 border border-gray-100">
                      <Text className="text-[12px] font-bold text-brand-dark">
                        {commenterName}
                      </Text>
                      <Text className="mt-0.5 text-[12px] text-brand-dark leading-4">
                        {comment.content}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Comment Input Bar */}
              <View className="mt-4 flex-row items-center rounded-2xl border border-brand-border bg-white px-3.5 py-2 shadow-xs">
                <TextInput
                  placeholder="Write a comment..."
                  placeholderTextColor="#9CA3AF"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  className="flex-1 text-[13px] text-brand-dark max-h-20"
                />
                <TouchableOpacity
                  onPress={handleSendComment}
                  disabled={!commentText.trim() || isSubmittingComment}
                  activeOpacity={0.8}
                  className={`ml-2 h-9 w-9 items-center justify-center rounded-full ${
                    commentText.trim() && !isSubmittingComment ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  {isSubmittingComment ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </MccScreenShell>
  );
}
