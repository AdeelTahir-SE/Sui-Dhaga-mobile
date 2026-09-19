import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { communityApi } from "../../../api/community.api";
import { CommunityPost } from "../../../types/api";
import { ReelItemView } from "../components/ReelItemView";
import { ReelCommentsModal } from "../components/ReelCommentsModal";

export default function PostDetailsScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Track exact container dimensions to guarantee pixel-perfect snap without offset drift
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const [containerWidth, setContainerWidth] = useState(windowWidth);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(postId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Comments Bottom Sheet State
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [commentsTargetPostId, setCommentsTargetPostId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList<CommunityPost>>(null);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const { height: h, width: w } = e.nativeEvent.layout;
    if (h > 0 && Math.abs(h - containerHeight) > 1) {
      setContainerHeight(h);
    }
    if (w > 0 && Math.abs(w - containerWidth) > 1) {
      setContainerWidth(w);
    }
  };

  // Load target post and community feed
  const loadPostsFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Parallel fetch: target post (if specific) + general feed
      const [feedRes, targetRes] = await Promise.all([
        communityApi.getPosts({ limit: 40 }).catch(() => ({ data: [] })),
        postId ? communityApi.getPostById(postId).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
      ]);

      const feedList: CommunityPost[] = Array.isArray(feedRes.data)
        ? feedRes.data
        : (feedRes.data as any)?.records || [];

      let combined: CommunityPost[] = [...feedList];

      // Ensure the targeted post is at the start or preserved
      const targetPost = targetRes && "data" in targetRes ? (targetRes.data as CommunityPost | null) : null;
      if (targetPost && targetPost.id) {
        const existingIdx = combined.findIndex((p) => p.id === targetPost.id);
        if (existingIdx > 0) {
          // Move target post to top for immediate viewing
          const [targeted] = combined.splice(existingIdx, 1);
          combined = [targeted, ...combined];
        } else if (existingIdx === -1) {
          // Prepend target post
          combined = [targetPost, ...combined];
        }
      }

      if (combined.length === 0) {
        setError("No community designs found");
      } else {
        setPosts(combined);
        setActivePostId(combined[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load community designs");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPostsFeed();
  }, [loadPostsFeed]);

  // Track currently viewable reel item
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const topItem = viewableItems[0]?.item;
      if (topItem?.id) {
        setActivePostId(topItem.id);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  // Optimistic Like Handler
  const handleToggleLike = async (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const currentlyLiked = Boolean(p.isLiked ?? p.is_liked);
          const curCount = p.likesCount ?? p.likes_count ?? 0;
          const nextLiked = !currentlyLiked;
          const nextCount = nextLiked ? curCount + 1 : Math.max(0, curCount - 1);
          return {
            ...p,
            isLiked: nextLiked,
            is_liked: nextLiked,
            likesCount: nextCount,
            likes_count: nextCount,
          };
        }
        return p;
      })
    );

    try {
      const res = await communityApi.toggleLike(id);
      if (res && res.data && res.data.post) {
        const serverPost = res.data.post;
        const serverLiked = res.data.liked;
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...serverPost,
                  isLiked: serverLiked,
                  is_liked: serverLiked,
                }
              : p
          )
        );
      }
    } catch {
      // Revert if API failed
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const currentlyLiked = Boolean(p.isLiked ?? p.is_liked);
            const curCount = p.likesCount ?? p.likes_count ?? 0;
            const revLiked = !currentlyLiked;
            const revCount = revLiked ? curCount + 1 : Math.max(0, curCount - 1);
            return {
              ...p,
              isLiked: revLiked,
              is_liked: revLiked,
              likesCount: revCount,
              likes_count: revCount,
            };
          }
          return p;
        })
      );
    }
  };

  const handleOpenComments = (id: string) => {
    setCommentsTargetPostId(id);
    setCommentsModalVisible(true);
  };

  const handleCommentAdded = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const cnt = (p.commentsCount ?? p.comments_count ?? 0) + 1;
          return {
            ...p,
            commentsCount: cnt,
            comments_count: cnt,
          };
        }
        return p;
      })
    );
  };

  const handleShare = async (post: CommunityPost) => {
    try {
      await Share.share({
        message: `Watch this bespoke design on Sui Dhaga: "${post.title || post.caption || post.content || "Bespoke Design"}"`,
      });
    } catch {}
  };

  const activePost = posts.find((p) => p.id === (commentsTargetPostId || activePostId));

  return (
    <View
      onLayout={handleContainerLayout}
      style={{ flex: 1, backgroundColor: "#000000" }}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Loading State */}
      {isLoading && posts.length === 0 && (
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#14919B" />
          <Text className="mt-3 text-[13px] font-medium text-gray-400">Loading Designs...</Text>
        </View>
      )}

      {/* Error State */}
      {!isLoading && error && posts.length === 0 && (
        <View className="flex-1 items-center justify-center bg-black px-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-red-950/60 mb-4 border border-red-800/40">
            <Ionicons name="film-outline" size={32} color="#EF4444" />
          </View>
          <Text className="text-lg font-bold text-white text-center">Design Unavailable</Text>
          <Text className="mt-1 text-center text-sm text-gray-400 leading-5">{error}</Text>
          <View className="mt-6 flex-row gap-3">
            <TouchableOpacity
              onPress={loadPostsFeed}
              activeOpacity={0.8}
              className="rounded-xl bg-white/20 px-5 py-2.5"
            >
              <Text className="text-sm font-semibold text-white">Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="rounded-xl bg-primary px-5 py-2.5"
            >
              <Text className="text-sm font-semibold text-white">Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Community Designs Vertical Paging FlatList */}
      {posts.length > 0 && (
        <FlatList
          ref={flatListRef}
          data={posts}
          keyExtractor={(item, index) => item.id || `post-${index}`}
          renderItem={({ item }) => (
            <ReelItemView
              post={item}
              isActive={item.id === activePostId}
              height={containerHeight}
              width={containerWidth}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((m) => !m)}
              onToggleLike={() => handleToggleLike(item.id)}
              onOpenComments={() => handleOpenComments(item.id)}
              onShare={() => handleShare(item)}
            />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={containerHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: containerHeight,
            offset: containerHeight * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          removeClippedSubviews
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      )}

      {/* Floating Top Bar (Back Button, Header Title & Create Action) */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: Math.max(insets.top, 14),
          left: 16,
          right: 16,
          zIndex: 40,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/45 shadow-lg border border-white/10"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Header Title: "Community Designs" */}
        <View className="rounded-full bg-black/40 px-4 py-1.5 border border-white/15">
          <Text className="text-[13px] font-bold text-white tracking-wide">
            Community Designs
          </Text>
        </View>

        {/* Create / Camera Button */}
        <TouchableOpacity
          onPress={() => router.push("/community/create" as any)}
          activeOpacity={0.8}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/45 shadow-lg border border-white/10"
        >
          <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Slide-Up Comments Drawer Modal */}
      {activePost && (
        <ReelCommentsModal
          visible={commentsModalVisible}
          onClose={() => setCommentsModalVisible(false)}
          postId={commentsTargetPostId || activePost.id}
          commentsCount={activePost.commentsCount ?? activePost.comments_count ?? 0}
          onCommentAdded={() => {
            if (commentsTargetPostId || activePost.id) {
              handleCommentAdded(commentsTargetPostId || activePost.id);
            }
          }}
        />
      )}
    </View>
  );
}
