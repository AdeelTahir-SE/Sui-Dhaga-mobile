import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, TouchableOpacity } from "react-native";

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
  const internalLid = useRef(new Animated.Value(0)).current;
  const activeLid = lidAnim || internalLid;

  const internalScale = useRef(new Animated.Value(1)).current;
  const activeScale = scaleAnim || internalScale;

  const internalShake = useRef(new Animated.Value(0)).current;
  const activeShake = shakeAnim || internalShake;

  useEffect(() => {
    if (!lidAnim) {
      Animated.spring(internalLid, {
        toValue: isOpen ? 1 : 0,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, lidAnim, internalLid]);

  // Robust rotation & translation for opening the dustbin lid:
  // Tilts open -40 degrees and lifts up smoothly
  const lidRotate = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-45deg"],
  });

  const lidTranslateY = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const lidTranslateX = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
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
        {/* Animated Dustbin Lid Container */}
        <Animated.View
          style={[
            styles.lidContainer,
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
              backgroundColor: isOpen ? "rgba(239, 68, 68, 0.1)" : "transparent",
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
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  lidContainer: {
    alignItems: "center",
    marginBottom: 1,
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
