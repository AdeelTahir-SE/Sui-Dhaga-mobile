import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";

export function isVideoMedia(uri?: string | null): boolean {
  if (!uri || typeof uri !== "string") return false;
  const lower = uri.toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".m4v") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".3gp") ||
    lower.includes("video/") ||
    lower.includes(".mp4?") ||
    lower.includes(".mov?")
  );
}

type VideoPlayerItemProps = {
  uri: string;
  width: number;
  height: number;
  borderRadius: number;
  onPress?: () => void;
};

function VideoPlayerItem({
  uri,
  width,
  height,
  borderRadius,
  onPress,
}: VideoPlayerItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (!player) return;

    const playSub = player.addListener("playingChange", (payload) => {
      setIsPlaying(payload.isPlaying);
    });

    const muteSub = player.addListener("mutedChange", (payload) => {
      setIsMuted(payload.muted);
    });

    return () => {
      playSub.remove();
      muteSub.remove();
    };
  }, [player]);

  const togglePlayback = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const toggleMute = () => {
    if (!player) return;
    player.muted = !player.muted;
  };

  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        overflow: "hidden",
        backgroundColor: "#111827",
        position: "relative",
      }}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Tap layer to toggle play / pause */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={togglePlayback}
        style={StyleSheet.absoluteFill}
        className="items-center justify-center"
      >
        {!isPlaying && (
          <View className="h-12 w-12 items-center justify-center rounded-full bg-black/60 shadow-lg">
            <Ionicons
              name="play"
              size={24}
              color="#FFFFFF"
              style={{ marginLeft: 3 }}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Reel badge in top-left */}
      <View
        pointerEvents="none"
        className="absolute left-2.5 top-2.5 flex-row items-center rounded-full bg-black/60 px-2.5 py-1"
      >
        <Ionicons name="film-outline" size={12} color="#FFFFFF" />
        <Text className="ml-1 text-[10px] font-bold text-white">Reel</Text>
      </View>

      {/* Mute button in bottom-right */}
      <TouchableOpacity
        onPress={toggleMute}
        activeOpacity={0.8}
        className="absolute bottom-2.5 right-2.5 h-7 w-7 items-center justify-center rounded-full bg-black/60"
      >
        <Ionicons
          name={isMuted ? "volume-mute" : "volume-high"}
          size={14}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
}

type SingleImageItemProps = {
  uri: string;
  width: number;
  height: number;
  borderRadius: number;
  onPress?: () => void;
};

function SingleImageItem({
  uri,
  width,
  height,
  borderRadius,
  onPress,
}: SingleImageItemProps) {
  const content = (
    <View
      style={{
        width,
        height,
        borderRadius,
        overflow: "hidden",
        backgroundColor: "#F3F4F6",
      }}
    >
      <Image
        source={{ uri }}
        contentFit="cover"
        style={{ width: "100%", height: "100%" }}
        transition={200}
      />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export type CommunityMediaCarouselProps = {
  media?: (string | null | undefined)[];
  fallbackImage?: any;
  height?: number;
  borderRadius?: number;
  onPress?: () => void;
  className?: string;
};

export function CommunityMediaCarousel({
  media,
  fallbackImage,
  height = 260,
  borderRadius = 16,
  onPress,
  className = "",
}: CommunityMediaCarouselProps) {
  const [containerWidth, setContainerWidth] = useState<number>(
    Dimensions.get("window").width - 32
  );
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter valid media URIs
  const validMedia: string[] = (media || []).filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );

  // If no valid media in array but fallback provided
  if (validMedia.length === 0) {
    if (fallbackImage) {
      return (
        <SingleImageItem
          uri={typeof fallbackImage === "string" ? fallbackImage : ""}
          width={containerWidth}
          height={height}
          borderRadius={borderRadius}
          onPress={onPress}
        />
      );
    }
    return null;
  }

  // Single Item: Image or Video
  if (validMedia.length === 1) {
    const singleUri = validMedia[0];
    const isVideo = isVideoMedia(singleUri);

    return (
      <View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setContainerWidth(w);
        }}
        className={`w-full overflow-hidden ${className}`}
        style={{ borderRadius }}
      >
        {isVideo ? (
          <VideoPlayerItem
            uri={singleUri}
            width={containerWidth}
            height={height}
            borderRadius={borderRadius}
            onPress={onPress}
          />
        ) : (
          <SingleImageItem
            uri={singleUri}
            width={containerWidth}
            height={height}
            borderRadius={borderRadius}
            onPress={onPress}
          />
        )}
      </View>
    );
  }

  // Multiple Items: Swipeable Carousel
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (containerWidth || 1));
    if (index !== activeIndex && index >= 0 && index < validMedia.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setContainerWidth(w);
      }}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ borderRadius }}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ width: containerWidth, height }}
      >
        {validMedia.map((uri, index) => {
          const isVideo = isVideoMedia(uri);
          return (
            <View key={`${uri}-${index}`} style={{ width: containerWidth, height }}>
              {isVideo ? (
                <VideoPlayerItem
                  uri={uri}
                  width={containerWidth}
                  height={height}
                  borderRadius={borderRadius}
                  onPress={onPress}
                />
              ) : (
                <SingleImageItem
                  uri={uri}
                  width={containerWidth}
                  height={height}
                  borderRadius={borderRadius}
                  onPress={onPress}
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Carousel Count Badge (Top-Right: e.g. 1/3) */}
      <View
        pointerEvents="none"
        className="absolute right-2.5 top-2.5 z-20 flex-row items-center rounded-full bg-black/65 px-2.5 py-1"
      >
        <Ionicons name="copy-outline" size={11} color="#FFFFFF" />
        <Text className="ml-1 text-[10px] font-bold text-white tracking-wide">
          {activeIndex + 1}/{validMedia.length}
        </Text>
      </View>

      {/* Pagination Dot Indicators (Bottom-Center) */}
      <View
        pointerEvents="none"
        className="absolute bottom-2.5 left-0 right-0 z-20 flex-row items-center justify-center gap-1.5"
      >
        {validMedia.map((_, i) => (
          <View
            key={`dot-${i}`}
            className={`rounded-full ${
              i === activeIndex
                ? "h-1.5 w-4 bg-white shadow-sm"
                : "h-1.5 w-1.5 bg-white/50"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
