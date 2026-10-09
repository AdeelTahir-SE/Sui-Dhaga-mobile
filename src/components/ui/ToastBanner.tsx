import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useToastStore } from "../../stores/toast.store";

export function ToastBanner() {
  const insets = useSafeAreaInsets();
  const { message, type, isVisible, hideToast } = useToastStore();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, translateY, opacity]);

  if (!message && !isVisible) return null;

  const getStyleForType = () => {
    switch (type) {
      case "error":
        return {
          bg: "#FEF2F2",
          border: "#FCA5A5",
          text: "#991B1B",
          icon: "alert-circle" as const,
          iconColor: "#EF4444",
        };
      case "warning":
        return {
          bg: "#FFFBEB",
          border: "#FDE68A",
          text: "#92400E",
          icon: "warning-outline" as const,
          iconColor: "#F59E0B",
        };
      case "success":
        return {
          bg: "#ECFDF5",
          border: "#A7F3D0",
          text: "#065F46",
          icon: "checkmark-circle" as const,
          iconColor: "#10B981",
        };
      case "info":
      default:
        return {
          bg: "#F0FDFA",
          border: "#99F6E4",
          text: "#115E59",
          icon: "information-circle" as const,
          iconColor: "#14919B",
        };
    }
  };

  const styleConfig = getStyleForType();
  const topPadding = Math.max(insets.top, Platform.OS === "android" ? 36 : 16);

  return (
    <Animated.View
      pointerEvents={isVisible ? "auto" : "none"}
      style={[
        styles.container,
        {
          top: topPadding,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        style={[
          styles.toastCard,
          {
            backgroundColor: styleConfig.bg,
            borderColor: styleConfig.border,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={styleConfig.icon}
            size={20}
            color={styleConfig.iconColor}
          />
        </View>

        <Text
          style={[styles.messageText, { color: styleConfig.text }]}
          numberOfLines={2}
        >
          {message}
        </Text>

        <TouchableOpacity
          onPress={hideToast}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={16} color={styleConfig.text} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 99999,
    elevation: 99999,
  },
  toastCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 10,
  },
  messageText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "600",
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 8,
    padding: 2,
  },
});
