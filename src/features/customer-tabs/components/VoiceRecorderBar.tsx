import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VoiceRecorderBarProps {
  durationMillis: number;
  onCancel: () => void;
  onSend: () => void;
  isSending?: boolean;
}

function formatMillis(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export function VoiceRecorderBar({
  durationMillis,
  onCancel,
  onSend,
  isSending = false,
}: VoiceRecorderBarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View className="flex-row items-center justify-between flex-1 bg-red-50 rounded-2xl px-3 py-2 border border-red-200 mr-2">
      {/* Blinking Red Record Dot & Time */}
      <View className="flex-row items-center">
        <Animated.View
          style={{
            opacity: pulseAnim,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "#EF4444",
            marginRight: 8,
          }}
        />
        <Text className="text-[13px] font-bold text-red-600 tracking-wider">
          {formatMillis(durationMillis)}
        </Text>
        <Text className="text-[11px] font-medium text-red-400 ml-2">
          Recording voice...
        </Text>
      </View>

      {/* Action Buttons: Cancel and Send */}
      <View className="flex-row items-center space-x-2">
        {/* Cancel / Trash */}
        <TouchableOpacity
          onPress={onCancel}
          disabled={isSending}
          className="w-8 h-8 rounded-full bg-white items-center justify-center border border-red-200 mr-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>

        {/* Send */}
        <TouchableOpacity
          onPress={onSend}
          disabled={isSending}
          className="w-9 h-9 rounded-full bg-primary items-center justify-center shadow-sm"
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={15} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
