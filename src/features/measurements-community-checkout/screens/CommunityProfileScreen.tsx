import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { communityApi } from "../../../api/community.api";
import { useAuthStore } from "../../../stores/auth.store";
import { CommunityPost, CreateCommunityPostPayload } from "../../../types/api";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { isVideoMedia } from "../components/CommunityMediaCarousel";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

const CATEGORIES = [
  "All",
  "Lehenga",
  "Anarkali",
  "Kurti",
  "Salwar Suit",
  "Blouse",
  "Sherwani",
  "Western Wear",
  "Other",
];

const PRESET_TAGS = [
  "#CustomFit",
  "#BridalWear",
  "#HandEmbroidery",
  "#ZariWork",
  "#FestiveStyle",
  "#LehengaLove",
  "#TailorCraft",
  "#PureSilk",
];

export default function CommunityProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and layout
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Edit Modal State
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editCategory, setEditCategory] = useState("Lehenga");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Action State
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const displayName =
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    (user?.email ? user.email.split("@")[0] : "Community Member");

  const avatarUri =
    user?.avatar_url ||
    user?.avatarUrl ||
    user?.avatar ||
    (user as any)?.image ||
    null;

  const initials = (displayName || "SD")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Load user's community posts
  const fetchMyPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // 1. Query backend with authorId
      const res = await communityApi.getPosts({
        authorId: user?.id,
        limit: 100,
      });

      let fetched = Array.isArray(res.data)
        ? res.data
        : (res.data as any)?.records || [];

      // Ensure client-side filtering matching current user
      if (user?.id && fetched.length > 0) {
        const matching = fetched.filter((p: CommunityPost) => {
          const postUserId = p.userId || p.user_id || p.author?.id;
          return postUserId === user.id;
        });

        if (matching.length > 0 || fetched.every((p: CommunityPost) => (p.userId || p.user_id || p.author?.id) === user.id)) {
          fetched = matching.length > 0 ? matching : fetched;
        }
      }

      setPosts(fetched);
    } catch (err: any) {
      setError(err?.message || "Failed to load your community posts");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  // Derived statistics
  const totalPosts = posts.length;
  const totalLikes = useMemo(
    () => posts.reduce((sum, p) => sum + (p.likesCount ?? p.likes_count ?? 0), 0),
    [posts]
  );
  const totalComments = useMemo(
    () => posts.reduce((sum, p) => sum + (p.commentsCount ?? p.comments_count ?? 0), 0),
    [posts]
  );

  // Filtered posts based on category and search
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCategory =
        selectedCategory === "All" ||
        (p.category || "").toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (p.title || "").toLowerCase().includes(q) ||
        (p.content || p.caption || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchCategory && matchQuery;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (post: CommunityPost) => {
    setEditingPost(post);
    setEditTitle(post.title || "");
    setEditCaption(post.content || post.caption || "");
    setEditCategory(post.category || "Lehenga");
    setEditTags(
      Array.isArray(post.tags)
        ? [...post.tags]
        : typeof post.tags === "string"
        ? (post.tags as string).split(",").map((t) => t.trim()).filter(Boolean)
        : []
    );
    setNewTagInput("");
  };

  // Add Tag to Edit form
  const handleAddTag = (tagToAdd: string) => {
    let clean = tagToAdd.trim();
    if (!clean) return;
    if (!clean.startsWith("#")) {
      clean = `#${clean}`;
    }
    if (!editTags.includes(clean)) {
      setEditTags((prev) => [...prev, clean]);
    }
    setNewTagInput("");
  };

  // Remove Tag from Edit form
  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Submit Edit
  const handleSaveEdit = async () => {
    if (!editingPost) return;

    if (!editCaption.trim() && !editTitle.trim()) {
      Alert.alert("Missing details", "Please enter a title or caption for your design post.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const payload: Partial<CreateCommunityPostPayload> = {
        title: editTitle.trim() || editCaption.trim().slice(0, 40) || "Custom Design",
        content: editCaption.trim(),
        category: editCategory,
        tags: editTags,
      };

      const res = await communityApi.updatePost(editingPost.id, payload);
      const updatedPost = res.data;

      // Update state locally
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === editingPost.id) {
            return {
              ...p,
              ...(updatedPost || {}),
              title: payload.title,
              content: payload.content,
              caption: payload.content,
              category: payload.category,
              tags: editTags,
            };
          }
          return p;
        })
      );

      setEditingPost(null);
      Alert.alert("Success", "Your community post has been updated!");
    } catch (err: any) {
      Alert.alert("Update Failed", err?.message || "Could not update post. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Post with confirmation
  const handleDeletePost = (post: CommunityPost) => {
    Alert.alert(
      "Delete Community Post",
      `Are you sure you want to delete "${post.title || "this post"}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeletingId(post.id);
            try {
              await communityApi.deletePost(post.id);
              setPosts((prev) => prev.filter((p) => p.id !== post.id));
              Alert.alert("Deleted", "Your community post has been removed.");
            } catch (err: any) {
              Alert.alert(
                "Delete Failed",
                err?.message || "Could not delete post. Please try again."
              );
            } finally {
              setIsDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <MccScreenShell
      header={
        <MccHeader
          title="Community Profile"
          showBack
          titleClassName="text-[18px] font-bold text-brand-dark"
          hideRight
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => fetchMyPosts(true)}
          tintColor="#14919B"
          colors={["#14919B"]}
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="px-4 pt-2">
          {/* User Profile Summary Card */}
          <View
            className="rounded-3xl bg-white p-5 shadow-xs mb-4"
            style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
          >
            <View className="flex-row items-center">
              {/* Avatar */}
              <View
                className="h-16 w-16 rounded-2xl bg-[#E0F7F7] overflow-hidden items-center justify-center mr-4"
                style={{ borderWidth: 1.5, borderColor: "#14919B" }}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <Text className="text-[20px] font-black text-[#0D7377]">
                    {initials}
                  </Text>
                )}
              </View>

              {/* User Info */}
              <View className="flex-1 justify-center">
                <View className="flex-row items-center">
                  <Text
                    className="text-[18px] font-bold text-brand-dark tracking-tight"
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                  {user?.role === "tailor" && (
                    <View
                      className="ml-2 rounded-full bg-[#E0F7F7] px-2.5 py-0.5"
                      style={{ borderWidth: 1, borderColor: "#B2EBF2" }}
                    >
                      <Text className="text-[10.5px] font-bold text-[#0D7377]">
                        Tailor
                      </Text>
                    </View>
                  )}
                </View>

                <Text className="mt-0.5 text-[12.5px] font-medium text-slate-500" numberOfLines={1}>
                  {user?.email || "Sui Dhaga Creator"}
                </Text>

                <Text className="mt-1 text-[11.5px] font-medium text-slate-500" numberOfLines={1}>
                  {user?.city ? `📍 ${user.city}` : "Bespoke Fashion Enthusiast"}
                </Text>
              </View>
            </View>

            {/* Metrics Row */}
            <View
              className="mt-4 pt-3.5 flex-row items-center justify-around"
              style={{ borderTopWidth: 1, borderTopColor: "#F1F5F9" }}
            >
              <View className="items-center flex-1">
                <Text className="text-[18px] font-bold text-brand-dark">
                  {totalPosts}
                </Text>
                <Text className="text-[11.5px] font-semibold text-slate-500">
                  Designs
                </Text>
              </View>

              <View className="h-6 w-[1px] bg-slate-200" />

              <View className="items-center flex-1">
                <Text className="text-[18px] font-bold text-[#E11D48]">
                  {totalLikes}
                </Text>
                <Text className="text-[11.5px] font-semibold text-slate-500">
                  Likes
                </Text>
              </View>

              <View className="h-6 w-[1px] bg-slate-200" />

              <View className="items-center flex-1">
                <Text className="text-[18px] font-bold text-[#0D7377]">
                  {totalComments}
                </Text>
                <Text className="text-[11.5px] font-semibold text-slate-500">
                  Comments
                </Text>
              </View>
            </View>

            {/* Quick Action Button with greenish texture and roundness-md */}
            <TouchableOpacity
              onPress={() => router.push("/community/create" as any)}
              activeOpacity={0.88}
              className="mt-4 relative overflow-hidden flex-row items-center justify-center py-3.5 px-5 rounded-md shadow-sm"
              style={{ borderRadius: 8 }}
            >
              <ButtonTexture variant="greenish" borderRadius={8} />
              <View className="z-10 flex-row items-center justify-center gap-1.5">
                <Ionicons name="add" size={19} color="#FFFFFF" />
                <Text
                  className="text-[13.5px] font-bold text-white tracking-wide"
                  style={{
                    textShadowColor: "rgba(0,0,0,0.22)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Share New Design
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Search & Layout Toggle Bar */}
          <View className="mb-3 flex-row items-center gap-2.5">
            <View
              className="flex-1 flex-row items-center px-3.5 bg-[#F8FAFC]"
              style={{ height: 44, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
            >
              <Ionicons name="search" size={17} color="#14919B" />
              <TextInput
                style={{ paddingVertical: 0 }}
                className="ml-2.5 flex-1 text-[13px] font-medium text-brand-dark"
                placeholder="Search your designs or tags..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* View Mode Toggle */}
            <View
              className="flex-row items-center bg-white p-1 rounded-xl shadow-xs"
              style={{ borderWidth: 1, borderColor: "#E2E8F0", height: 44 }}
            >
              <TouchableOpacity
                onPress={() => setViewMode("list")}
                className={`h-8 w-8 items-center justify-center rounded-lg ${
                  viewMode === "list" ? "bg-[#14919B]" : "bg-transparent"
                }`}
              >
                <Ionicons
                  name="list"
                  size={18}
                  color={viewMode === "list" ? "#FFFFFF" : "#64748B"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode("grid")}
                className={`h-8 w-8 items-center justify-center rounded-lg ${
                  viewMode === "grid" ? "bg-[#14919B]" : "bg-transparent"
                }`}
              >
                <Ionicons
                  name="grid"
                  size={17}
                  color={viewMode === "grid" ? "#FFFFFF" : "#64748B"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4 -mx-4 px-4"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <View className="flex-row gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCategory(cat)}
                    className="px-3.5 py-1.5 rounded-full"
                    style={{
                      backgroundColor: isSelected ? "#14919B" : "#FFFFFF",
                      borderWidth: 1,
                      borderColor: isSelected ? "#14919B" : "#E2E8F0",
                    }}
                  >
                    <Text
                      className={`text-[12px] font-bold ${
                        isSelected ? "text-white" : "text-brand-gray"
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Loading Indicator */}
          {isLoading && !isRefreshing ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#14919B" />
              <Text className="mt-3 text-[13px] font-medium text-brand-gray">
                Loading your community designs...
              </Text>
            </View>
          ) : error && posts.length === 0 ? (
            <View
              className="py-12 px-5 items-center justify-center rounded-2xl bg-white my-3"
              style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
            >
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
              <Text className="mt-2 text-[15px] font-bold text-brand-dark">
                Failed to Load Posts
              </Text>
              <Text className="mt-1 text-[12px] text-center text-brand-gray">
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => fetchMyPosts()}
                className="mt-4 px-4 py-2 rounded-xl bg-[#14919B]"
              >
                <Text className="text-[12.5px] font-bold text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredPosts.length === 0 ? (
            /* Empty State */
            <View
              className="py-14 px-6 items-center justify-center rounded-3xl bg-white my-2"
              style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
            >
              <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E0F7F7] mb-3">
                <Ionicons name="images-outline" size={30} color="#14919B" />
              </View>
              <Text className="text-[16px] font-bold text-brand-dark text-center">
                {searchQuery || selectedCategory !== "All"
                  ? "No Matching Designs"
                  : "No Community Posts Yet"}
              </Text>
              <Text className="mt-1.5 text-center text-[12.5px] font-normal text-slate-500 max-w-[270px] leading-5">
                {searchQuery || selectedCategory !== "All"
                  ? "Try resetting your search query or choosing another category."
                  : "Share your custom-stitched dresses, fittings, or tailoring craft with the community!"}
              </Text>
              {searchQuery || selectedCategory !== "All" ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-4 rounded-xl px-4 py-2 bg-slate-100"
                  style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
                >
                  <Text className="text-[12.5px] font-semibold text-brand-dark">
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => router.push("/community/create" as any)}
                  className="mt-5 relative overflow-hidden flex-row items-center justify-center py-3 px-5 rounded-md shadow-sm"
                  style={{ borderRadius: 8 }}
                >
                  <ButtonTexture variant="greenish" borderRadius={8} />
                  <View className="z-10 flex-row items-center justify-center gap-1.5">
                    <Ionicons name="add" size={17} color="#FFFFFF" />
                    <Text
                      className="text-[13px] font-bold text-white tracking-wide"
                      style={{
                        textShadowColor: "rgba(0,0,0,0.22)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      Create Your First Post
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : viewMode === "list" ? (
            /* List View */
            <View className="gap-4">
              {filteredPosts.map((post) => {
                const mediaUrl =
                  post.images && post.images.length > 0 ? post.images[0] : null;
                const isVid = mediaUrl ? isVideoMedia(mediaUrl) : false;
                const likes = post.likesCount ?? post.likes_count ?? 0;
                const comments = post.commentsCount ?? post.comments_count ?? 0;
                const isDeleting = isDeletingId === post.id;

                return (
                  <View
                    key={post.id}
                    className="rounded-2xl bg-white overflow-hidden shadow-xs"
                    style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
                  >
                    {/* Media Thumbnail with tap to view */}
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => router.push(`/community/${post.id}` as any)}
                      className="relative h-56 w-full bg-slate-100"
                    >
                      {mediaUrl ? (
                        <Image
                          source={{ uri: mediaUrl }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                          transition={200}
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center bg-slate-50">
                          <Ionicons name="image-outline" size={40} color="#94A3B8" />
                        </View>
                      )}

                      {/* Video Badge */}
                      {isVid && (
                        <View className="absolute top-3 left-3 flex-row items-center bg-black/60 px-2.5 py-1 rounded-full">
                          <Ionicons name="videocam" size={13} color="#FFFFFF" />
                          <Text className="ml-1 text-[11px] font-bold text-white">
                            Video
                          </Text>
                        </View>
                      )}

                      {/* Category Pill */}
                      {post.category && (
                        <View className="absolute top-3 right-3 bg-white/90 px-2.5 py-1 rounded-full shadow-xs">
                          <Text className="text-[11px] font-bold text-[#0D7377]">
                            {post.category}
                          </Text>
                        </View>
                      )}

                      {/* Overlay count */}
                      {post.images && post.images.length > 1 && (
                        <View className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded-md flex-row items-center">
                          <Ionicons name="copy-outline" size={12} color="#FFFFFF" />
                          <Text className="ml-1 text-[11px] font-bold text-white">
                            {post.images.length}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Post Content Body */}
                    <View className="p-4">
                      {/* Title */}
                      <Text
                        className="text-[15.5px] font-bold text-brand-dark tracking-tight"
                        numberOfLines={1}
                      >
                        {post.title || post.category || "Custom Design Outfit"}
                      </Text>

                      {/* Caption */}
                      {(post.content || post.caption) ? (
                        <Text
                          className="mt-1 text-[13px] font-normal text-slate-600 leading-5"
                          numberOfLines={2}
                        >
                          {post.content || post.caption}
                        </Text>
                      ) : null}

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 ? (
                        <View className="flex-row flex-wrap gap-1.5 mt-2.5">
                          {post.tags.map((tag, idx) => (
                            <View
                              key={idx}
                              className="bg-slate-100 px-2 py-0.5 rounded-md"
                            >
                              <Text className="text-[11px] font-medium text-slate-600">
                                {tag}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}

                      {/* Stats & Actions Row */}
                      <View
                        className="mt-3.5 pt-3 flex-row items-center justify-between"
                        style={{ borderTopWidth: 1, borderTopColor: "#F1F5F9" }}
                      >
                        {/* Likes & Comments Count */}
                        <View className="flex-row items-center gap-3">
                          <View className="flex-row items-center">
                            <Ionicons name="heart" size={16} color="#E11D48" />
                            <Text className="ml-1 text-[12px] font-semibold text-slate-700">
                              {likes}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Ionicons name="chatbubble" size={15} color="#64748B" />
                            <Text className="ml-1 text-[12px] font-semibold text-slate-700">
                              {comments}
                            </Text>
                          </View>
                        </View>

                        {/* Action Buttons: Edit & Delete */}
                        <View className="flex-row items-center gap-2">
                          <TouchableOpacity
                            onPress={() => handleOpenEdit(post)}
                            activeOpacity={0.7}
                            className="flex-row items-center px-3 py-1.5 rounded-xl bg-[#E0F7F7] active:bg-[#C9F0F0]"
                            style={{ borderWidth: 1, borderColor: "#B2EBF2" }}
                            accessibilityLabel="Edit post"
                          >
                            <Ionicons name="create-outline" size={15} color="#0D7377" />
                            <Text className="ml-1 text-[12px] font-semibold text-[#0D7377]">
                              Edit
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleDeletePost(post)}
                            disabled={isDeleting}
                            activeOpacity={0.7}
                            className="flex-row items-center px-3 py-1.5 rounded-xl bg-red-50 active:bg-red-100"
                            style={{ borderWidth: 1, borderColor: "#FECACA" }}
                            accessibilityLabel="Delete post"
                          >
                            {isDeleting ? (
                              <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                              <>
                                <Ionicons name="trash-outline" size={15} color="#DC2626" />
                                <Text className="ml-1 text-[12px] font-bold text-red-600">
                                  Delete
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            /* Grid View */
            <View className="flex-row flex-wrap gap-2.5">
              {filteredPosts.map((post) => {
                const mediaUrl =
                  post.images && post.images.length > 0 ? post.images[0] : null;
                const isVid = mediaUrl ? isVideoMedia(mediaUrl) : false;
                const likes = post.likesCount ?? post.likes_count ?? 0;

                return (
                  <View
                    key={post.id}
                    className="rounded-2xl bg-white overflow-hidden shadow-xs"
                    style={{
                      width: "48.2%",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => router.push(`/community/${post.id}` as any)}
                      className="relative h-44 w-full bg-slate-100"
                    >
                      {mediaUrl ? (
                        <Image
                          source={{ uri: mediaUrl }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center bg-slate-50">
                          <Ionicons name="image-outline" size={30} color="#94A3B8" />
                        </View>
                      )}

                      {/* Video tag */}
                      {isVid && (
                        <View className="absolute top-2 left-2 bg-black/60 p-1 rounded-md">
                          <Ionicons name="videocam" size={12} color="#FFFFFF" />
                        </View>
                      )}

                      {/* Likes overlay */}
                      <View className="absolute bottom-2 left-2 flex-row items-center bg-black/50 px-2 py-0.5 rounded-md">
                        <Ionicons name="heart" size={11} color="#FFFFFF" />
                        <Text className="ml-1 text-[10.5px] font-bold text-white">
                          {likes}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Action Bar for Grid item */}
                    <View className="p-2.5 flex-row items-center justify-between">
                      <Text
                        className="text-[12px] font-bold text-brand-dark flex-1 mr-1"
                        numberOfLines={1}
                      >
                        {post.title || post.category || "Design"}
                      </Text>
                      <View className="flex-row items-center gap-1.5">
                        <TouchableOpacity
                          onPress={() => handleOpenEdit(post)}
                          className="h-7 w-7 items-center justify-center rounded-lg bg-[#E0F7F7]"
                        >
                          <Ionicons name="create-outline" size={14} color="#0D7377" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeletePost(post)}
                          className="h-7 w-7 items-center justify-center rounded-lg bg-red-50"
                        >
                          <Ionicons name="trash-outline" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Community Post Modal */}
      <Modal
        visible={Boolean(editingPost)}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingPost(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
        >
          <View className="rounded-t-[32px] bg-white px-5 pb-8 pt-3 max-h-[90%] shadow-2xl">
            {/* Drag Handle */}
            <View className="h-1.5 w-12 rounded-full bg-slate-200 self-center mb-3 mt-1" />

            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3">
              <View className="flex-row items-center flex-1">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E0F7F7] mr-3">
                  <Ionicons name="create" size={20} color="#14919B" />
                </View>
                <View className="flex-1">
                  <Text className="text-[17px] font-bold text-brand-dark">
                    Edit Design Post
                  </Text>
                  <Text className="text-[12px] font-medium text-brand-gray">
                    Update title, caption, category and tags
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setEditingPost(null)}
                className="h-8 w-8 items-center justify-center rounded-xl bg-slate-100"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View className="h-[1px] bg-slate-100 mb-4" />

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Media Thumbnail Preview */}
              {editingPost?.images && editingPost.images.length > 0 && (
                <View className="mb-4 flex-row items-center bg-[#F8FAFC] p-2.5 rounded-2xl border border-slate-100">
                  <Image
                    source={{ uri: editingPost.images[0] }}
                    style={{ width: 56, height: 56, borderRadius: 12 }}
                    contentFit="cover"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="text-[12px] font-bold text-brand-dark">
                      Attached Media
                    </Text>
                    <Text className="text-[11px] text-slate-500">
                      {editingPost.images.length} {editingPost.images.length === 1 ? "media item" : "media items"} in this post
                    </Text>
                  </View>
                </View>
              )}

              {/* Title Field */}
              <View className="mb-4">
                <Text className="text-[12.5px] font-bold text-brand-dark mb-1.5">
                  Design Title
                </Text>
                <View
                  className="rounded-xl bg-[#F8FAFC] px-3.5"
                  style={{ height: 46, borderWidth: 1, borderColor: "#E2E8F0" }}
                >
                  <TextInput
                    value={editTitle}
                    onChangeText={setEditTitle}
                    placeholder="e.g. Royal Bridal Velvet Lehenga"
                    placeholderTextColor="#94A3B8"
                    className="flex-1 text-[13px] text-brand-dark"
                  />
                </View>
              </View>

              {/* Category Picker Chips */}
              <View className="mb-4">
                <Text className="text-[12.5px] font-bold text-brand-dark mb-2">
                  Category
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => {
                    const isSelected = editCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setEditCategory(cat)}
                        className="px-3.5 py-1.5 rounded-full"
                        style={{
                          backgroundColor: isSelected ? "#14919B" : "#FFFFFF",
                          borderWidth: 1,
                          borderColor: isSelected ? "#14919B" : "#E2E8F0",
                        }}
                      >
                        <Text
                          className={`text-[12px] font-bold ${
                            isSelected ? "text-white" : "text-brand-gray"
                          }`}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Caption Field */}
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-[12.5px] font-bold text-brand-dark">
                    Caption & Story
                  </Text>
                  <Text className="text-[11px] text-slate-400">
                    {editCaption.length}/500
                  </Text>
                </View>
                <View
                  className="rounded-xl bg-[#F8FAFC] p-3"
                  style={{ minHeight: 90, borderWidth: 1, borderColor: "#E2E8F0" }}
                >
                  <TextInput
                    value={editCaption}
                    onChangeText={setEditCaption}
                    placeholder="Tell the community about this outfit, the craftsmanship, fitting details..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    maxLength={500}
                    textAlignVertical="top"
                    className="text-[13px] text-brand-dark"
                    style={{ minHeight: 70 }}
                  />
                </View>
              </View>

              {/* Tags Section */}
              <View className="mb-5">
                <Text className="text-[12.5px] font-bold text-brand-dark mb-1.5">
                  Tags & Keywords
                </Text>

                {/* Active Tags */}
                {editTags.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mb-2.5">
                    {editTags.map((tag) => (
                      <View
                        key={tag}
                        className="flex-row items-center bg-[#E0F7F7] px-2.5 py-1 rounded-full"
                        style={{ borderWidth: 1, borderColor: "#B2EBF2" }}
                      >
                        <Text className="text-[11.5px] font-bold text-[#0D7377] mr-1">
                          {tag}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveTag(tag)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons name="close-circle" size={14} color="#0D7377" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Custom Tag Input */}
                <View
                  className="flex-row items-center bg-[#F8FAFC] px-3.5 mb-2.5"
                  style={{ height: 42, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
                >
                  <Ionicons name="pricetag-outline" size={15} color="#94A3B8" />
                  <TextInput
                    value={newTagInput}
                    onChangeText={setNewTagInput}
                    placeholder="Add custom tag (e.g. #SilkDupatta)"
                    placeholderTextColor="#94A3B8"
                    className="ml-2 flex-1 text-[12.5px] text-brand-dark"
                    onSubmitEditing={() => handleAddTag(newTagInput)}
                  />
                  {newTagInput.trim().length > 0 && (
                    <TouchableOpacity
                      onPress={() => handleAddTag(newTagInput)}
                      className="px-2 py-1 rounded-md bg-[#14919B]"
                    >
                      <Text className="text-[11px] font-bold text-white">Add</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Preset Suggestions */}
                <Text className="text-[11px] text-slate-400 mb-1.5">
                  Tap to add popular tags:
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {PRESET_TAGS.map((pt) => {
                    const alreadyAdded = editTags.includes(pt);
                    return (
                      <TouchableOpacity
                        key={pt}
                        onPress={() =>
                          alreadyAdded ? handleRemoveTag(pt) : handleAddTag(pt)
                        }
                        className="px-2.5 py-1 rounded-md"
                        style={{
                          backgroundColor: alreadyAdded ? "#E0F7F7" : "#F1F5F9",
                          borderWidth: 1,
                          borderColor: alreadyAdded ? "#B2EBF2" : "#E2E8F0",
                        }}
                      >
                        <Text
                          className={`text-[11px] font-semibold ${
                            alreadyAdded ? "text-[#0D7377]" : "text-slate-600"
                          }`}
                        >
                          {pt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom Buttons */}
            <View
              className="pt-3 flex-row items-center gap-3"
              style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0" }}
            >
              <TouchableOpacity
                onPress={() => setEditingPost(null)}
                disabled={isSavingEdit}
                className="h-[48px] px-5 flex-1 items-center justify-center rounded-xl bg-white shadow-xs"
                style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
              >
                <Text className="text-[13.5px] font-bold text-slate-600">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveEdit}
                disabled={isSavingEdit}
                activeOpacity={0.85}
                className="h-[48px] flex-2 items-center justify-center rounded-xl bg-[#14919B] active:bg-[#0D7377] shadow-sm px-5"
              >
                {isSavingEdit ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-[13.5px] font-bold text-white">
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </MccScreenShell>
  );
}
