import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { communityApi } from "../../../api/community.api";
import { useCommunityStore } from "../../../stores/community.store";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";
import { CommunityPost } from "../../../types/api";
import { TrendingDesignsListSkeleton } from "../../../components/ui/Skeleton";
import { SectionTitle } from "./SectionTitle";

type TrendingCommunitySectionProps = {
  title?: string;
  onViewAll?: () => void;
};

export function TrendingCommunitySection({
  title = "Trending Design",
  onViewAll,
}: TrendingCommunitySectionProps) {
  const [trendingPostIds, setTrendingPostIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const postsById = useCommunityStore((state) => state.postsById);
  const upsertPosts = useCommunityStore((state) => state.upsertPosts);
  const storeToggleLike = useCommunityStore((state) => state.toggleLike);

  const posts = useMemo(() => {
    return trendingPostIds.map((id) => postsById[id]).filter(Boolean);
  }, [trendingPostIds, postsById]);

  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await communityApi.getPosts({
        limit: 10,
        category: "Trending",
      });

      const records = Array.isArray(res.data)
        ? res.data
        : (res.data as any)?.records || [];

      upsertPosts(records);
      setTrendingPostIds(records.map((r: any) => r.id));
    } catch (err: any) {
      setError(err?.message || "Could not load trending community designs.");
    } finally {
      setIsLoading(false);
    }
  }, [upsertPosts]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const toggleLike = useCallback((postId: string) => {
    storeToggleLike(postId);
  }, [storeToggleLike]);

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push("/community" as never);
    }
  };

  return (
    <View className="mt-3 pb-2">
      {/* Section Header */}
      <SectionTitle
        title={title}
        action="Explore Feed"
        onPressAction={handleViewAll}
      />

      {/* Loading state */}
      {isLoading && <TrendingDesignsListSkeleton count={3} />}

      {/* Connection error state */}
      {!isLoading && error && (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={22} color="#EF4444" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={fetchTrending}
            style={styles.retryBtn}
          >
            <Ionicons name="refresh" size={13} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty state (No trending designs in database) */}
      {!isLoading && !error && posts.length === 0 && (
        <View style={styles.emptyContainer}>
          {/* Large prominent themed icon with solid primary style */}
          <View style={styles.emptyIconCircleOuter}>
            <View style={styles.emptyIconCircleInner}>
              <Ionicons name="sparkles" size={28} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.emptyTitle}>No Trending Designs Yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to share an outfit or design with the Sui Dhaga
            community!
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/community/create" as any)}
            style={styles.createBtn}
          >
            <ButtonTexture variant="greenish" borderRadius={12} opacity={1} />
            <View style={styles.createBtnContent}>
              <Ionicons name="add" size={17} color="#FFFFFF" />
              <Text style={styles.createBtnText}>Share First Design</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Horizontal Scroll of Real Trending Cards */}
      {!isLoading && posts.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          className="-mx-5 px-5"
        >
          {posts.map((item: CommunityPost) => {
            const authorName =
              item.author?.fullName ||
              item.author?.full_name ||
              item.author?.name ||
              "Community Member";

            const authorAvatar =
              item.author?.avatarUrl ||
              item.author?.avatar_url ||
              item.author?.avatar;

            const postImg =
              item.images && item.images.length > 0
                ? item.images[0]
                : undefined;

            const postCategory =
              item.category || (item.tags && item.tags[0]) || "Custom";

            const postTitle =
              item.title || item.caption || item.content || "Custom Outfit";

            const likes = item.likesCount ?? item.likes_count ?? 0;
            const isLiked = Boolean(item.isLiked ?? item.is_liked);
            const comments = item.commentsCount ?? item.comments_count ?? 0;
            const isVerified =
              item.author?.role === "tailor" || item.author?.isVerified;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                onPress={() => router.push(`/community/${item.id}` as any)}
                style={styles.card}
              >
                {/* Image Showcase */}
                <View style={styles.imageWrapper}>
                  {postImg ? (
                    <Image
                      source={{ uri: postImg }}
                      contentFit="cover"
                      transition={200}
                      style={styles.image}
                    />
                  ) : (
                    <View style={styles.noImagePlaceholder}>
                      <Ionicons
                        name="image-outline"
                        size={32}
                        color="#CBD5E1"
                      />
                    </View>
                  )}

                  {/* Category Pill Tag */}
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{postCategory}</Text>
                  </View>

                  {/* Quick Like Button on Card */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => toggleLike(item.id)}
                    style={styles.likeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={16}
                      color={isLiked ? "#E11D48" : "#FFFFFF"}
                    />
                    <Text
                      style={[
                        styles.likeCountText,
                        isLiked ? styles.likeCountActive : null,
                      ]}
                    >
                      {likes}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Design Details */}
                <View style={styles.contentContainer}>
                  <Text numberOfLines={1} style={styles.designTitle}>
                    {postTitle}
                  </Text>

                  {/* Tailor / Creator row */}
                  <View style={styles.authorRow}>
                    {authorAvatar ? (
                      <Image
                        source={{ uri: authorAvatar }}
                        contentFit="cover"
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={12} color="#14919B" />
                      </View>
                    )}
                    <View style={styles.authorTextContainer}>
                      <View style={styles.authorNameRow}>
                        <Text numberOfLines={1} style={styles.authorName}>
                          {authorName}
                        </Text>
                        {isVerified && (
                          <Ionicons
                            name="checkmark-circle"
                            size={13}
                            color="#14919B"
                            style={{ marginLeft: 3 }}
                          />
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Engagement / Action Footer */}
                  <View style={styles.footerRow}>
                    <View style={styles.commentRow}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={13}
                        color="#6F767E"
                      />
                      <Text style={styles.commentText}>{comments}</Text>
                    </View>
                    <View style={styles.viewBadge}>
                      <Text style={styles.viewBadgeText}>View Details</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={12}
                        color="#14919B"
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* "View All in Community" Card at End of Slider */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleViewAll}
            style={styles.exploreMoreCard}
          >
            <View style={styles.exploreIconCircle}>
              <Ionicons name="people" size={24} color="#14919B" />
            </View>
            <Text style={styles.exploreTitle}>Explore All Community</Text>
            <Text style={styles.exploreSubtitle}>
              Connect, share & find tailor inspiration
            </Text>
            <View style={styles.exploreBtn}>
              <Text style={styles.exploreBtnText}>Open Feed</Text>
              <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: 20,
    gap: 12,
    paddingVertical: 8,
  },
  card: {
    width: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrapper: {
    width: "100%",
    height: 155,
    backgroundColor: "#F4F5F6",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  categoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#14919B",
    letterSpacing: 0.2,
  },
  likeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  likeCountActive: {
    color: "#FFD1DC",
  },
  contentContainer: {
    padding: 12,
  },
  designTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1A1D1F",
    lineHeight: 18,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E2E8F0",
  },
  avatarPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  authorTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#1A1D1F",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6F767E",
  },
  viewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#14919B",
  },
  exploreMoreCard: {
    width: 150,
    backgroundColor: "#F0FAFA",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#CCEBEB",
    borderStyle: "dashed",
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  exploreIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  exploreTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#1A1D1F",
    textAlign: "center",
    lineHeight: 16,
  },
  exploreSubtitle: {
    fontSize: 10,
    color: "#6F767E",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 13,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14919B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
    gap: 4,
  },
  exploreBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loadingContainer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginVertical: 4,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6F767E",
    fontWeight: "500",
  },
  errorContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#991B1B",
  },
  errorSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#B91C1C",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14919B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E6E8EC",
    backgroundColor: "#FFFFFF",
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    marginVertical: 4,
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyAccentLine: {
    position: "absolute",
    top: 0,
    left: 24,
    right: 24,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: "rgba(20, 145, 155, 0.3)",
  },
  emptyIconCircleOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E0F7F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIconCircleInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#14919B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1D1F",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 12.5,
    fontWeight: "500",
    color: "#6F767E",
    textAlign: "center",
    maxWidth: 270,
    lineHeight: 18,
  },
  createBtn: {
    position: "relative",
    overflow: "hidden",
    marginTop: 20,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#14919B",
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  createBtnContent: {
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
