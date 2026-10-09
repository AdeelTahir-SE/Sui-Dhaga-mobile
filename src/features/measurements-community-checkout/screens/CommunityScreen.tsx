import React, { useCallback, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PostCard } from "../components/PostCard";
import { useCommunity } from "../hooks/useCommunity";
import { useAuthStore } from "../../../stores/auth.store";
import { CommunityFeedSkeleton } from "../../../components/ui/Skeleton";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";
import { CommunityPost } from "../../../types/api";
import {
  errorHaptic,
  lightHaptic,
  selectionHaptic,
} from "../../../utils/haptics";

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
  const user = useAuthStore((state) => state.user);
  const userAvatarUrl =
    user?.avatar_url ||
    user?.avatarUrl ||
    user?.avatar ||
    (user as any)?.profile?.avatar_url ||
    (user as any)?.profile?.avatarUrl ||
    (user as any)?.user_metadata?.avatar_url ||
    null;

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

  const handleRefresh = useCallback(() => {
    lightHaptic();
    refresh();
  }, [refresh]);

  const handleCategorySelect = useCallback(
    (tab: string) => {
      selectionHaptic();
      setCategory(tab);
    },
    [setCategory]
  );

  const handleClearFilters = useCallback(() => {
    selectionHaptic();
    setSearchQuery("");
    setCategory("For You");
  }, [setSearchQuery, setCategory]);

  const handleLike = useCallback(
    (postId: string) => {
      lightHaptic();
      toggleLike(postId);
    },
    [toggleLike]
  );

  const renderPost = useCallback(
    ({ item: post }: { item: CommunityPost }) => {
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
      const authorId =
        post.author?.id ||
        (post.author as any)?.user_id ||
        (post.author as any)?.userId ||
        post.userId ||
        post.user_id;

      const handleAuthorPress = () => {
        if (!authorId) return;
        router.push({
          pathname: "/community/profile",
          params: {
            userId: String(authorId),
            authorId: String(authorId),
            name: authorName,
            avatar: authorAvatar || "",
            role: isTailor ? "tailor" : (post.author?.role || "customer"),
          },
        } as any);
      };

      return (
        <View className="px-4">
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
            onAuthorPress={handleAuthorPress}
            onCommentPress={() => router.push(`/community/${post.id}` as any)}
            onLikePress={() => handleLike(post.id)}
          />
        </View>
      );
    },
    [handleLike]
  );

  const ListHeader = useMemo(
    () => (
      <View className="px-4 pt-1">
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
            <TouchableOpacity
              onPress={() => {
                selectionHaptic();
                setSearchQuery("");
              }}
            >
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
                  onPress={() => handleCategorySelect(tab)}
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

        {/* Community Info Banner */}
        <View className="mb-4 rounded-2xl border border-brand-border bg-white p-4 shadow-xs">
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
              <Ionicons name="people" size={20} color="#14919B" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[14px] font-bold text-brand-dark">
                Sui Dhaga Community Feed
              </Text>
              <Text className="mt-0.5 text-[11.5px] leading-4 text-brand-gray">
                Discover bespoke tailoring, share your stitched fits & connect with master tailors.
              </Text>
            </View>
          </View>
        </View>
      </View>
    ),
    [category, searchQuery, handleCategorySelect, setSearchQuery]
  );

  const ListEmpty = useMemo(() => {
    if (isLoading && posts.length === 0) {
      return (
        <View className="px-4">
          <CommunityFeedSkeleton count={3} />
        </View>
      );
    }

    if (!isLoading && error && posts.length === 0) {
      return (
        <View className="mx-4 my-8 items-center justify-center rounded-2xl border border-red-100 bg-red-50/60 p-6">
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
            onPress={() => {
              errorHaptic();
              refresh();
            }}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 shadow-sm shadow-primary/20 flex-row items-center gap-1.5"
          >
            <Ionicons name="refresh" size={15} color="#FFFFFF" />
            <Text className="text-[13px] font-bold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const hasActiveFilters =
      Boolean(searchQuery) ||
      (category !== "For You" && category !== "Trending");

    return (
      <View className="mx-4 my-6 items-center justify-center rounded-2xl border border-brand-border bg-white px-6 py-9 relative overflow-hidden shadow-xs">
        <View className="absolute top-0 left-6 right-6 h-[3px] bg-primary/25 rounded-b" />

        <View className="h-16 w-16 rounded-full bg-primary-light items-center justify-center mb-3.5">
          <View className="h-11 w-11 rounded-full bg-primary items-center justify-center shadow-sm shadow-primary/30">
            <Ionicons name="shirt-outline" size={22} color="#FFFFFF" />
          </View>
        </View>

        <Text className="text-center text-[16px] font-black text-brand-dark tracking-tight">
          {searchQuery ? `No results for "${searchQuery}"` : "No Posts Yet"}
        </Text>
        <Text className="mt-1.5 text-center text-[12.5px] font-medium text-brand-gray leading-5 max-w-[270px]">
          {searchQuery
            ? "Try searching with a different term or clear your filter to browse other designs."
            : `Be the first to share a bespoke ${
                category !== "For You" && category !== "Trending" ? category : "design"
              } with the community!`}
        </Text>

        <View className="mt-5 flex-row gap-3">
          {hasActiveFilters && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleClearFilters}
              className="rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 items-center justify-center"
            >
              <Text className="text-[13px] font-semibold text-brand-dark">
                Clear Filters
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              lightHaptic();
              router.push("/community/create" as any);
            }}
            className="relative overflow-hidden flex-row items-center justify-center py-2.5 px-5 rounded-xl shadow-sm"
            style={{ borderRadius: 12 }}
          >
            <ButtonTexture variant="greenish" borderRadius={12} />
            <View className="z-10 flex-row items-center gap-1.5">
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text
                className="text-[13.5px] font-bold text-white tracking-wide"
                style={{
                  textShadowColor: "rgba(0,0,0,0.22)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Create Post
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [
    isLoading,
    posts.length,
    error,
    searchQuery,
    category,
    handleClearFilters,
    refresh,
  ]);

  return (
    <MccScreenShell
      header={
        <MccHeader
          title="Community"
          showBack
          titleClassName="text-[22px] font-bold text-brand-dark"
          rightIcon="person-circle-outline"
          rightAvatarUrl={userAvatarUrl}
          onRightPress={() => router.push("/community/profile" as any)}
        />
      }
      scrollable={false}
      floatingAction={
        <TouchableOpacity
          onPress={() => {
            lightHaptic();
            router.push("/community/create" as any);
          }}
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
      <FlashList
        data={isLoading ? [] : posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 90,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#14919B"
            colors={["#14919B"]}
          />
        }
      />
    </MccScreenShell>
  );
}
