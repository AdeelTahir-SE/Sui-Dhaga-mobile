import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";

interface VoiceMessagePlayerProps {
  uri: string;
  isOutgoing?: boolean;
  duration?: number;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function VoiceMessagePlayer({
  uri,
  isOutgoing = false,
  duration: initialDuration,
}: VoiceMessagePlayerProps) {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing;
  const currentTime = status.currentTime || 0;
  const totalDuration = status.duration > 0 ? status.duration : initialDuration || 0;

  // Percentage progress
  const progressPercent =
    totalDuration > 0
      ? Math.min(Math.max((currentTime / totalDuration) * 100, 0), 100)
      : isPlaying
      ? 50
      : 0;

  const handleTogglePlay = async () => {
    try {
      // Ensure speaker playback (not earpiece receiver) and unmute
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      if (isPlaying) {
        player.pause();
      } else {
        // If finished, seek to start
        if (totalDuration > 0 && currentTime >= totalDuration - 0.2) {
          player.seekTo(0);
        }
        player.play();
      }
    } catch (err) {
      console.warn("Failed to toggle voice playback:", err);
    }
  };

  const handleCycleSpeed = () => {
    try {
      const speeds = [1, 1.5, 2];
      const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
      const nextSpeed = speeds[nextIdx];
      setPlaybackSpeed(nextSpeed);
      if (typeof (player as any).setPlaybackRate === "function") {
        (player as any).setPlaybackRate(nextSpeed);
      }
    } catch {}
  };

  const handleSeek = (ratio: number) => {
    try {
      if (totalDuration > 0) {
        const target = ratio * totalDuration;
        player.seekTo(target);
      }
    } catch {}
  };

  // Sample bars for the waveform visual
  const waveformHeights = [
    10, 16, 24, 14, 20, 28, 18, 12, 22, 30, 26, 16, 22, 14, 20, 26, 18, 12, 16, 8,
  ];

  return (
    <View className="py-1 min-w-[210px] max-w-[260px]">
      <View className="flex-row items-center">
        {/* Play / Pause Circular Button */}
        <TouchableOpacity
          onPress={handleTogglePlay}
          activeOpacity={0.8}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: isOutgoing ? "rgba(255, 255, 255, 0.25)" : "#14919B",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {status.isBuffering ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={18}
              color="#FFFFFF"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          )}
        </TouchableOpacity>

        {/* Waveform Scrubber & Timer */}
        <View className="flex-1 ml-2.5 justify-center">
          {/* Waveform bars */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => {
              const { locationX } = e.nativeEvent;
              const ratio = Math.max(0, Math.min(locationX / 140, 1));
              handleSeek(ratio);
            }}
            className="flex-row items-center justify-between h-7 py-1"
          >
            {waveformHeights.map((h, i) => {
              const barPercent = (i / waveformHeights.length) * 100;
              const isPlayed = progressPercent >= barPercent;

              const barColor = isOutgoing
                ? isPlayed
                  ? "#FFFFFF"
                  : "rgba(255, 255, 255, 0.4)"
                : isPlayed
                ? "#14919B"
                : "#D1D5DB";

              return (
                <View
                  key={i}
                  style={{
                    height: h,
                    width: 3,
                    borderRadius: 1.5,
                    backgroundColor: barColor,
                  }}
                />
              );
            })}
          </TouchableOpacity>

          {/* Time indicator and Speed toggle */}
          <View className="flex-row items-center justify-between mt-0.5">
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: isOutgoing ? "rgba(255, 255, 255, 0.9)" : "#6B7280",
              }}
            >
              {isPlaying || currentTime > 0
                ? formatDuration(currentTime)
                : formatDuration(totalDuration)}
            </Text>

            <TouchableOpacity
              onPress={handleCycleSpeed}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={{
                paddingHorizontal: 4,
                paddingVertical: 1,
                borderRadius: 4,
                backgroundColor: isOutgoing
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(20, 145, 155, 0.1)",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: isOutgoing ? "#FFFFFF" : "#14919B",
                }}
              >
                {playbackSpeed}x
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
