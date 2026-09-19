import React, { useState, useEffect, useCallback } from "react";
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

type ReelCommentsModalProps = {
  visible: boolean;
  onClose: () => void;
  postId: string;
  commentsCount?: number;
  onCommentAdded?: () => void;
};

export function ReelCommentsModal({
  visible,
  onClose,
  postId,
  commentsCount = 0,
  onCommentAdded,
}: ReelCommentsModalProps) {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const screenHeight = Dimensions.get("window").height;
  const modalHeight = Math.min(screenHeight * 0.72, 600);

  const fetchComments = useCallback(async () => {
    if (!postId || !visible) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await communityApi.getComments(postId);
      if (Array.isArray(res.data)) {
        setComments(res.data);
      } else {
        setComments([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [postId, visible]);

  useEffect(() => {
    if (visible) {
      fetchComments();
    } else {
      setCommentText("");
      setError(null);
    }
  }, [visible, fetchComments]);

  const handleSend = async () => {
    const text = commentText.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await communityApi.addComment(postId, text);
      if (res && res.data) {
        const newCmt = res.data;
        setComments((prev) => [...prev, newCmt]);
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

  const renderCommentItem = ({ item }: { item: CommunityComment }) => {
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

        {/* Small aesthetic like heart for comment */}
        <TouchableOpacity activeOpacity={0.6} className="ml-2 pt-1 items-center">
          <Ionicons name="heart-outline" size={14} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    );
  };

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
          <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center my-2.5" />

          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-5 pb-3 border-b border-gray-100">
            <Text className="text-[16px] font-bold text-gray-900">
              Comments ({comments.length || commentsCount})
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="h-7 w-7 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={18} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <View style={{ flex: 1 }}>
            {isLoading && comments.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <ActivityIndicator size="small" color="#14919B" />
                <Text className="mt-2 text-[12px] text-gray-400">Loading comments...</Text>
              </View>
            ) : error && comments.length === 0 ? (
              <View className="flex-1 items-center justify-center py-10 px-6">
                <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
                <Text className="mt-2 text-[12px] text-gray-600 text-center">{error}</Text>
                <TouchableOpacity
                  onPress={fetchComments}
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
              />
            )}
          </View>

          {/* Comment Input Bar */}
          <View className="border-t border-gray-100 px-4 pt-2.5 bg-white">
            <View className="flex-row items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5">
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
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
});
