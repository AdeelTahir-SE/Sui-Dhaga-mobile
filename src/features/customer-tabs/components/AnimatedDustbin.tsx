import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AnimatedDustbinProps {
  isOpen?: boolean;
  lidAnim?: Animated.Value;
  scaleAnim?: Animated.Value;
  shakeAnim?: Animated.Value;
  onPress?: () => void;
  size?: number;
}

export function AnimatedDustbin({
  isOpen = false,
  lidAnim,
  scaleAnim,
  shakeAnim,
  onPress,
  size = 40,
}: AnimatedDustbinProps) {
  // Internal fallback lid animation if external isn't passed
  const internalLid = useRef(new Animated.Value(0)).current;
  const activeLid = lidAnim || internalLid;

  // Internal fallback scale animation
  const internalScale = useRef(new Animated.Value(1)).current;
  const activeScale = scaleAnim || internalScale;

  // Internal fallback shake animation
  const internalShake = useRef(new Animated.Value(0)).current;
  const activeShake = shakeAnim || internalShake;

  useEffect(() => {
    if (!lidAnim) {
      Animated.spring(internalLid, {
        toValue: isOpen ? 1 : 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, lidAnim, internalLid]);

  // Interpolate rotation for lid opening (pivot from bottom-left)
  const lidRotate = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-42deg"],
  });

  const lidTranslateY = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const lidTranslateX = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  const content = (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isOpen ? "#FEE2E2" : "#F3F4F6",
          transform: [{ scale: activeScale }, { translateX: activeShake }],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        {/* Animated Dustbin Lid */}
        <Animated.View
          style={[
            styles.lidWrapper,
            {
              transform: [
                { translateX: lidTranslateX },
                { translateY: lidTranslateY },
                { rotate: lidRotate },
              ],
            },
          ]}
        >
          {/* Lid Handle */}
          <View
            style={[
              styles.lidHandle,
              { backgroundColor: isOpen ? "#EF4444" : "#6F767E" },
            ]}
          />
          {/* Lid Flap */}
          <View
            style={[
              styles.lidFlap,
              { backgroundColor: isOpen ? "#EF4444" : "#6F767E" },
            ]}
          />
        </Animated.View>

        {/* Dustbin Body */}
        <View
          style={[
            styles.binBody,
            {
              borderColor: isOpen ? "#EF4444" : "#6F767E",
              backgroundColor: isOpen ? "rgba(239, 68, 68, 0.08)" : "transparent",
            },
          ]}
        >
          <View
            style={[
              styles.binRib,
              { backgroundColor: isOpen ? "#EF4444" : "#6F767E" },
            ]}
          />
          <View
            style={[
              styles.binRib,
              { backgroundColor: isOpen ? "#EF4444" : "#6F767E" },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel="Delete recording"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  lidWrapper: {
    alignItems: "center",
    marginBottom: 1,
    // transformOrigin for pivot at bottom left
    transformOrigin: "left bottom" as any,
  },
  lidHandle: {
    width: 6,
    height: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginBottom: 1,
  },
  lidFlap: {
    width: 17,
    height: 2.5,
    borderRadius: 1.25,
  },
  binBody: {
    width: 13,
    height: 12,
    borderWidth: 1.8,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingTop: 1,
  },
  binRib: {
    width: 1.5,
    height: 6,
    borderRadius: 0.75,
  },
});
