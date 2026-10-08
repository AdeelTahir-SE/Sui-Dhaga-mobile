import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { communityApi } from "../../../api/community.api";
import { CommunityComment } from "../../../types/api";
import {
  getCachedComments,
  setCachedComments,
  appendCachedComment,
} from "../../../utils/mediaCache";
import { useCommunityStore } from "../../../stores/community.store";
import { CommentsListSkeleton } from "../../../components/ui/Skeleton";

type ReelCommentsModalProps = {
  visible: boolean;
  onClose: () => void;
  postId: string;
  commentsCount?: number;
  onCommentAdded?: () => void;
  onCommentsCountSync?: (count: number) => void;
};

export const ReelCommentsModal = memo(function ReelCommentsModal({
  visible,
  onClose,
  postId,
  commentsCount = 0,
  onCommentAdded,
  onCommentsCountSync,
}: ReelCommentsModalProps) {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const screenHeight = Dimensions.get("window").height;
  const modalHeight = Math.min(screenHeight * 0.72, 600);

  const fetchComments = useCallback(
    async (isSilent = false) => {
      if (!postId || !visible) return;
      if (!isSilent) setIsLoading(true);
      setError(null);
      try {
        const res = await communityApi.getComments(postId);
        if (Array.isArray(res.data)) {
          setComments(res.data);
          setCachedComments(postId, res.data);
          useCommunityStore.getState().syncCommentsCount(postId, res.data.length);
          if (onCommentsCountSync) {
            onCommentsCountSync(res.data.length);
          }
        } else {
          setComments([]);
          useCommunityStore.getState().syncCommentsCount(postId, 0);
          if (onCommentsCountSync) {
            onCommentsCountSync(0);
          }
        }
      } catch (err: any) {
        if (!isSilent) {
          setError(err?.message || "Failed to load comments");
        }
      } finally {
        if (!isSilent) {
          setIsLoading(false);
        }
      }
    },
    [postId, visible, onCommentsCountSync]
  );

  useEffect(() => {
    if (visible && postId) {
      const cached = getCachedComments(postId);
      if (cached && cached.length > 0) {
        setComments(cached);
        setIsLoading(false);
        // Silent background refresh to keep comments fresh
        fetchComments(true);
      } else {
        setComments([]);
        fetchComments(false);
      }
    } else {
      setComments([]);
      setCommentText("");
      setError(null);
    }
  }, [visible, postId, fetchComments]);

  const handleSend = async () => {
    const text = commentText.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await communityApi.addComment(postId, text);
      if (res && res.data) {
        const newCmt = res.data;
        setComments((prev) => [...prev, newCmt]);
        appendCachedComment(postId, newCmt);
        useCommunityStore.getState().incrementCommentsCount(postId, 1);
        setCommentText("");
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (err: any) {
      setError(err?.message || "Could not post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommentItem = useCallback(({ item }: { item: CommunityComment }) => {
    const authorName =
      item.user?.fullName ||
      item.user?.full_name ||
      item.user?.name ||
      "Community Member";

    const avatar =
      item.user?.avatarUrl ||
      item.user?.avatar_url ||
      item.user?.avatar;

    const isTailor = item.user?.role === "tailor" || item.user?.isVerified;

    // Relative time string
    let timeString = "Recently";
    if (item.createdAt || item.created_at) {
      try {
        const date = new Date(item.createdAt || item.created_at || "");
        const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (diffMinutes < 1) timeString = "Just now";
        else if (diffMinutes < 60) timeString = `${diffMinutes}m`;
        else if (diffMinutes < 1440) timeString = `${Math.floor(diffMinutes / 60)}h`;
        else timeString = `${Math.floor(diffMinutes / 1440)}d`;
      } catch {}
    }

    return (
      <View className="flex-row items-start px-4 py-3 border-b border-gray-100">
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            cachePolicy="memory-disk"
            style={{ width: 36, height: 36, borderRadius: 18 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Ionicons name="person" size={18} color="#14919B" />
          </View>
        )}

        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="text-[13px] font-bold text-gray-900">{authorName}</Text>
            {isTailor && (
              <Ionicons
                name="checkmark-circle"
                size={13}
                color="#14919B"
                style={{ marginLeft: 3 }}
              />
            )}
            <Text className="ml-2 text-[11px] text-gray-400">{timeString}</Text>
          </View>
          <Text className="mt-1 text-[13px] text-gray-800 leading-4">{item.content}</Text>
        </View>
      </View>
    );
  }, []);

  // Compute accurate count: if comments fetched, use actual array length; otherwise fallback to post's count
  const displayCount = isLoading && comments.length === 0 ? commentsCount : comments.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop tap to dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          style={[styles.sheetContainer, { height: modalHeight, paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          {/* Drag Handle Bar */}
          <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-3 mt-1.5" />

          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-5 pb-3 border-b border-slate-100">
            <View className="flex-row items-center flex-1">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#E0F7F7] mr-2.5">
                <Ionicons name="chatbubbles" size={18} color="#14919B" />
              </View>
              <View>
                <Text className="text-[16px] font-extrabold text-brand-dark">
                  Comments ({displayCount})
                </Text>
                <Text className="text-[11.5px] font-medium text-brand-gray">
                  Community feedback & discussions
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200"
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <View style={{ flex: 1 }}>
            {isLoading && comments.length === 0 ? (
              <CommentsListSkeleton count={4} />
            ) : error && comments.length === 0 ? (
              <View className="flex-1 items-center justify-center py-10 px-6">
                <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
                <Text className="mt-2 text-[12px] text-gray-600 text-center">{error}</Text>
                <TouchableOpacity
                  onPress={() => fetchComments(false)}
                  className="mt-3 rounded-lg bg-gray-100 px-3 py-1.5"
                >
                  <Text className="text-[12px] font-semibold text-gray-700">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : comments.length === 0 ? (
              <View className="flex-1 items-center justify-center py-14 px-6">
                <View className="h-12 w-12 rounded-full bg-teal-50 items-center justify-center mb-2">
                  <Ionicons name="chatbubbles-outline" size={24} color="#14919B" />
                </View>
                <Text className="text-[14px] font-bold text-gray-800">No comments yet</Text>
                <Text className="mt-1 text-[12px] text-gray-400 text-center">
                  Be the first to share your thoughts on this design!
                </Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item, idx) => item.id || `cmt-${idx}`}
                renderItem={renderCommentItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}
                initialNumToRender={8}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews
              />
            )}
          </View>

          {/* Comment Input Bar */}
          <View
            className="px-4 pt-2.5 bg-white"
            style={{ borderTopWidth: 1, borderTopColor: "#F3F4F6" }}
          >
            <View
              className="flex-row items-center rounded-full px-4 py-1.5"
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                backgroundColor: "#F9FAFB",
              }}
            >
              <TextInput
                placeholder="Add a comment for this tailor..."
                placeholderTextColor="#9CA3AF"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                className="flex-1 text-[13px] text-gray-800 max-h-20 py-1"
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!commentText.trim() || isSubmitting}
                activeOpacity={0.7}
                className={`ml-2 h-8 w-8 items-center justify-center rounded-full ${
                  commentText.trim() && !isSubmitting ? "bg-primary" : "bg-gray-200"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="arrow-up" size={17} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
});
