import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PostCard } from "../components/PostCard";
import { useCommunity } from "../hooks/useCommunity";

const CATEGORIES = [
  "For You",
  "Trending",
  "Lehenga",
  "Anarkali",
  "Kurti",
  "Salwar Suit",
  "Blouse",
  "Sherwani",
  "Tailor Work",
  "Fabrics & Care",
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const {
    posts,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    isLoading,
    isRefreshing,
    error,
    refresh,
    toggleLike,
  } = useCommunity("For You");

  return (
    <MccScreenShell
      header={
        <MccHeader
          title="Community"
          showBack
          titleClassName="text-[22px] font-bold text-brand-dark"
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor="#14919B"
          colors={["#14919B"]}
        />
      }
      floatingAction={
        <TouchableOpacity
          onPress={() => router.push("/community/create" as any)}
          accessibilityRole="button"
          accessibilityLabel="Create Post"
          activeOpacity={0.85}
          style={{
            position: "absolute",
            right: 20,
            bottom: insets.bottom + 16,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#14919B",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#14919B",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 99,
          }}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      }
    >
      <View className="px-4 pb-20">
        {/* Search Bar */}
        <View className="mb-3 flex-row items-center rounded-xl border border-brand-border bg-brand-surface px-3.5 py-2.5">
          <Ionicons name="search-outline" size={18} color="#6F767E" />
          <TextInput
            placeholder="Search designs, tailors, fabrics..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-2 flex-1 text-[13px] text-brand-dark"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 -mx-4 px-4"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <View className="flex-row gap-2">
            {CATEGORIES.map((tab) => {
              const isActive = category === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setCategory(tab)}
                  activeOpacity={0.7}
                  className={`rounded-full px-4 py-2 ${
                    isActive
                      ? "bg-primary shadow-sm shadow-primary/30"
                      : "border border-brand-border bg-white"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-medium ${
                      isActive ? "text-white" : "text-brand-gray"
                    }`}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Community Highlight Banner */}
        <View className="mb-4 rounded-2xl border border-primary/20 bg-primary-50 p-4">
          <View className="flex-row items-center">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15">
              <Ionicons name="sparkles" size={18} color="#14919B" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[13px] font-bold text-brand-dark">
                Sui Dhaga Community Feed
              </Text>
              <Text className="mt-0.5 text-[11px] leading-4 text-brand-gray">
                Discover bespoke tailoring, share your stitched fits & connect with master tailors.
              </Text>
            </View>
          </View>
        </View>

        {/* Loading Indicator */}
        {isLoading && posts.length === 0 && (
          <View className="my-12 items-center justify-center py-8">
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] font-medium text-brand-gray">
              Loading community designs...
            </Text>
          </View>
        )}

        {/* Connection Error State */}
        {!isLoading && error && posts.length === 0 && (
          <View className="my-8 items-center justify-center rounded-2xl border border-red-100 bg-red-50/60 p-6">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-3">
              <Ionicons name="cloud-offline-outline" size={24} color="#EF4444" />
            </View>
            <Text className="text-center text-[15px] font-bold text-brand-dark">
              Connection Error
            </Text>
            <Text className="mt-1 text-center text-[12px] text-brand-gray leading-4 px-2">
              {error}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={refresh}
              className="mt-4 rounded-xl bg-primary px-5 py-2.5 shadow-sm shadow-primary/20 flex-row items-center gap-1.5"
            >
              <Ionicons name="refresh" size={15} color="#FFFFFF" />
              <Text className="text-[13px] font-bold text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty Feed State */}
        {!isLoading && !error && posts.length === 0 && (
          <View className="my-8 items-center justify-center rounded-2xl border border-dashed border-brand-border bg-white p-8">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-50 mb-3">
              <Ionicons name="images-outline" size={26} color="#14919B" />
            </View>
            <Text className="text-center text-[16px] font-bold text-brand-dark">
              {searchQuery ? `No results for "${searchQuery}"` : "No Posts Yet"}
            </Text>
            <Text className="mt-1.5 text-center text-[12px] text-brand-gray leading-5 max-w-[260px]">
              {searchQuery
                ? "Try searching with a different term or browse other categories."
                : `Be the first to share a bespoke ${
                    category !== "For You" && category !== "Trending" ? category : "design"
                  } with the community!`}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/community/create" as any)}
              className="mt-5 rounded-xl bg-primary px-5 py-2.5 shadow-sm shadow-primary/20 flex-row items-center gap-1.5"
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text className="text-[13px] font-bold text-white">Create First Post</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Real Dynamic Posts Feed */}
        {!isLoading && posts.length > 0 && (
          <View>
            {posts.map((post) => {
              const authorName =
                post.author?.fullName ||
                post.author?.full_name ||
                post.author?.name ||
                "Community Member";

              const authorAvatar =
                post.author?.avatarUrl ||
                post.author?.avatar_url ||
                post.author?.avatar;

              const postImg =
                post.images && post.images.length > 0 ? post.images[0] : undefined;

              const postCategory =
                post.category || (post.tags && post.tags[0]) || undefined;

              const postCaption =
                post.content || post.caption || post.title || "";

              const likes = post.likesCount ?? post.likes_count ?? 0;
              const isLiked = Boolean(post.isLiked ?? post.is_liked);
              const comments = post.commentsCount ?? post.comments_count ?? 0;
              const isTailor = post.author?.role === "tailor" || post.author?.isVerified;

              return (
                <PostCard
                  key={post.id}
                  author={authorName}
                  caption={postCaption}
                  avatarImage={authorAvatar}
                  images={post.images}
                  postImage={postImg}
                  category={postCategory}
                  likesCount={likes}
                  isLiked={isLiked}
                  commentsCount={comments}
                  verifiedTailor={isTailor}
                  onPress={() => router.push(`/community/${post.id}` as any)}
                  onCommentPress={() => router.push(`/community/${post.id}` as any)}
                  onLikePress={() => toggleLike(post.id)}
                />
              );
            })}
          </View>
        )}
      </View>
    </MccScreenShell>
  );
}
