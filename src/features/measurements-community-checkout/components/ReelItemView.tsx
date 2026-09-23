import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CommunityPost } from "../../../types/api";
import { isVideoMedia } from "./CommunityMediaCarousel";

import { getCachedVideoUri } from "../../../utils/mediaCache";

type ReelItemViewProps = {
  post: CommunityPost;
  isActive: boolean;
  height: number;
  width: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
};

export function ReelItemView({
  post,
  isActive,
  height,
  width,
  isMuted,
  onToggleMute,
  onToggleLike,
  onOpenComments,
  onShare,
}: ReelItemViewProps) {
  const insets = useSafeAreaInsets();
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Filter valid media
  const mediaList: string[] = (post.images || []).filter(
    (uri): uri is string => typeof uri === "string" && uri.trim().length > 0
  );

  // Determine if primary media is video
  const primaryMedia = mediaList[activeMediaIndex] || mediaList[0] || null;
  const isVideo = isVideoMedia(primaryMedia);

  const [videoUri, setVideoUri] = useState<string | null>(isVideo ? primaryMedia : null);

  useEffect(() => {
    let isMounted = true;
    if (isVideo && primaryMedia) {
      getCachedVideoUri(primaryMedia)
        .then((cached) => {
          if (isMounted && cached) {
            setVideoUri(cached);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [isVideo, primaryMedia]);

  // Video player configuration
  const player = useVideoPlayer(isVideo ? videoUri || primaryMedia : null, (p) => {
    p.loop = true;
    p.muted = isMuted;
  });

  // Keep mute state in sync
  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  // Handle active playback lifecycle
  useEffect(() => {
    if (!player) return;

    if (isActive && !userPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, userPaused, player]);

  // Reset userPaused state when reel switches out of view
  useEffect(() => {
    if (!isActive) {
      setUserPaused(false);
      setIsCaptionExpanded(false);
    }
  }, [isActive]);

  const handleTogglePlayPause = () => {
    if (!isVideo || !player) return;
    if (userPaused) {
      setUserPaused(false);
      player.play();
    } else {
      setUserPaused(true);
      player.pause();
    }
  };

  const handleSharePress = async () => {
    if (onShare) {
      onShare();
      return;
    }
    try {
      await Share.share({
        message: `Watch this bespoke design on Sui Dhaga: "${post.title || post.caption || post.content || "Bespoke Design"}"`,
      });
    } catch {}
  };

  const isLiked = Boolean(post.isLiked ?? post.is_liked);
  const likesCount = post.likesCount ?? post.likes_count ?? 0;
  const commentsCount = post.commentsCount ?? post.comments_count ?? 0;

  const authorName =
    post.author?.fullName ||
    post.author?.full_name ||
    post.author?.name ||
    "Sui Dhaga Tailor";

  const authorAvatar =
    post.author?.avatarUrl ||
    post.author?.avatar_url ||
    post.author?.avatar;

  const isTailor = post.author?.role === "tailor" || post.author?.isVerified;
  const captionText = post.content || post.caption || post.title || "";

  // Dynamic bottom padding to clear device navigation bar or home indicator
  const safeBottom = Math.max(insets.bottom, 16);

  return (
    <View style={{ width, height, backgroundColor: "#000000", overflow: "hidden", position: "relative" }}>
      {/* 1. MEDIA LAYER (Full Screen Video / Image Carousel) */}
      {mediaList.length === 0 ? (
        <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-gray-950">
          <Ionicons name="film-outline" size={54} color="#374151" />
          <Text className="mt-3 text-sm text-gray-500 font-medium">Bespoke Design</Text>
        </View>
      ) : mediaList.length === 1 ? (
        <TouchableWithoutFeedback onPress={handleTogglePlayPause}>
          <View style={StyleSheet.absoluteFill}>
            {isVideo ? (
              <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                nativeControls={false}
              />
            ) : (
              <Image
                source={{ uri: mediaList[0] }}
                cachePolicy="memory-disk"
                priority="high"
                contentFit="cover"
                style={StyleSheet.absoluteFill}
                transition={200}
              />
            )}

            {/* Play icon overlay when user paused */}
            {isVideo && userPaused && (
              <View
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
                className="items-center justify-center bg-black/30"
              >
                <View className="h-16 w-16 items-center justify-center rounded-full bg-black/60 shadow-xl">
                  <Ionicons name="play" size={32} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </View>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      ) : (
        /* Multi-media horizontal carousel */
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            if (index !== activeMediaIndex) {
              setActiveMediaIndex(index);
            }
          }}
          style={StyleSheet.absoluteFill}
        >
          {mediaList.map((uri, idx) => {
            const isThisVideo = isVideoMedia(uri);
            return (
              <TouchableWithoutFeedback key={`${uri}-${idx}`} onPress={handleTogglePlayPause}>
                <View style={{ width, height, position: "relative" }}>
                  {isThisVideo && idx === activeMediaIndex ? (
                    <VideoView
                      player={player}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      nativeControls={false}
                    />
                  ) : (
                    <Image
                      source={{ uri }}
                      cachePolicy="memory-disk"
                      priority="high"
                      contentFit="cover"
                      style={StyleSheet.absoluteFill}
                      transition={150}
                    />
                  )}

                  {isThisVideo && idx === activeMediaIndex && userPaused && (
                    <View
                      pointerEvents="none"
                      style={StyleSheet.absoluteFill}
                      className="items-center justify-center bg-black/30"
                    >
                      <View className="h-16 w-16 items-center justify-center rounded-full bg-black/60 shadow-xl">
                        <Ionicons name="play" size={32} color="#FFFFFF" style={{ marginLeft: 4 }} />
                      </View>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            );
          })}
        </ScrollView>
      )}

      {/* 2. TOP SMOOTH GRADIENT SCRIM */}
      <LinearGradient
        colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0.25)", "transparent"]}
        style={[styles.topScrim, { width }]}
        pointerEvents="none"
      />

      {/* 3. MULTI-MEDIA INDICATOR (if more than 1 image/video) */}
      {mediaList.length > 1 && (
        <View
          pointerEvents="none"
          style={{ top: Math.max(insets.top, 16) + 48, right: 16 }}
          className="absolute z-20 flex-row items-center rounded-full bg-black/60 px-2.5 py-1"
        >
          <Ionicons name="copy-outline" size={11} color="#FFFFFF" />
          <Text className="ml-1 text-[11px] font-bold text-white tracking-wider">
            {activeMediaIndex + 1}/{mediaList.length}
          </Text>
        </View>
      )}

      {/* 4. BOTTOM SMOOTH GRADIENT SCRIM */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.88)"]}
        style={[styles.bottomScrim, { width }]}
        pointerEvents="none"
      />

      {/* 5. RIGHT ACTION BAR (Instagram / TikTok Style Column) */}
      <View
        className="absolute z-30 items-center"
        style={{
          right: 12,
          bottom: safeBottom + 12,
          gap: 13,
        }}
      >
        {/* Author Avatar with Follow/Tailor Badge */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/community/profile" as any)}
          className="items-center mb-0.5"
        >
          <View className="h-11 w-11 rounded-full border-2 border-white overflow-hidden bg-gray-800 shadow-lg">
            {authorAvatar ? (
              <Image
                source={{ uri: authorAvatar }}
                cachePolicy="memory-disk"
                contentFit="cover"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-teal-800">
                <Ionicons name="person" size={18} color="#FFFFFF" />
              </View>
            )}
          </View>
          {isTailor && (
            <View className="absolute -bottom-1 rounded-full bg-primary p-0.5 shadow-sm border border-white">
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity
          onPress={onToggleLike}
          activeOpacity={0.7}
          className="items-center"
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-black/35 shadow-md">
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={26}
              color={isLiked ? "#EF4444" : "#FFFFFF"}
            />
          </View>
          <Text style={styles.actionText}>{likesCount}</Text>
        </TouchableOpacity>

        {/* Comments Button (Opens bottom sheet) */}
        <TouchableOpacity
          onPress={onOpenComments}
          activeOpacity={0.7}
          className="items-center"
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-black/35 shadow-md">
            <Ionicons name="chatbubble-ellipses" size={23} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>{commentsCount}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          onPress={handleSharePress}
          activeOpacity={0.7}
          className="items-center"
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-black/35 shadow-md">
            <Ionicons name="paper-plane" size={21} color="#FFFFFF" style={{ marginRight: 1 }} />
          </View>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        {/* Mute/Audio Button */}
        {isVideo && (
          <TouchableOpacity
            onPress={onToggleMute}
            activeOpacity={0.7}
            className="items-center"
          >
            <View
              className="h-9 w-9 items-center justify-center rounded-full bg-black/45"
              style={{ borderWidth: 0 }}
            >
              <Ionicons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={17}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* 6. BOTTOM DESCRIPTION & INFO OVERLAY */}
      <View
        className="absolute z-20"
        style={{
          left: 16,
          right: 76,
          bottom: safeBottom + 8,
        }}
      >
        {/* Creator Name + Role Tag */}
        <View className="flex-row items-center flex-wrap mb-1.5">
          <Text style={styles.authorTitle} numberOfLines={1}>
            {authorName}
          </Text>
          {isTailor && (
            <View
              className="ml-2 flex-row items-center rounded-full px-2 py-0.5"
              style={{ backgroundColor: "#14919B", borderWidth: 0 }}
            >
              <Ionicons name="cut-outline" size={10} color="#FFFFFF" />
              <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "700", marginLeft: 4 }}>
                Master Tailor
              </Text>
            </View>
          )}
          {post.category && (
            <View
              className="ml-2 rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.25)", borderWidth: 0 }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 10.5,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                  textShadowColor: "rgba(0, 0, 0, 0.8)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {post.category}
              </Text>
            </View>
          )}
        </View>

        {/* Caption / Description */}
        {captionText ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsCaptionExpanded(!isCaptionExpanded)}
            className="mb-2"
          >
            <Text
              style={styles.captionText}
              numberOfLines={isCaptionExpanded ? undefined : 2}
            >
              {captionText}
            </Text>
            {captionText.length > 65 && !isCaptionExpanded && (
              <Text className="text-[12px] font-bold text-gray-300 mt-0.5">...more</Text>
            )}
          </TouchableOpacity>
        ) : null}

        {/* Tags (Pure White) */}
        {post.tags && post.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mb-2">
            {post.tags.slice(0, 5).map((tag, idx) => (
              <View
                key={`tag-${idx}`}
                className="rounded-md px-2 py-0.5"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", borderWidth: 0 }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 11.5,
                    fontWeight: "600",
                    textShadowColor: "rgba(0, 0, 0, 0.8)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Music / Audio Marquee Row */}
        <View className="flex-row items-center">
          <Ionicons name="musical-notes" size={12} color="#FFFFFF" style={{ opacity: 0.85 }} />
          <Text style={styles.audioTicker} numberOfLines={1}>
            Original Audio • {authorName} — Sui Dhaga
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 140,
  },
  bottomScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 280,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  authorTitle: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    maxWidth: 170,
  },
  captionText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    lineHeight: 17,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  audioTicker: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 5,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
