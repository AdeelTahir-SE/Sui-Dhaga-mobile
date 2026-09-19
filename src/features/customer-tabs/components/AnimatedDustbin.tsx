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
        friction: 7,
        tension: 140,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, lidAnim, internalLid]);

  // Lid tilts open -42 degrees and shifts up
  const lidRotate = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-44deg"],
  });

  const lidTranslateY = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const lidTranslateX = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  // Cross-fade opacity between idle (gray) and open (red) for 100% GPU native driver speed
  const redOpacity = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const grayOpacity = activeLid.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const renderLid = (color: string) => (
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
      <View style={[styles.lidHandle, { backgroundColor: color }]} />
      <View style={[styles.lidFlap, { backgroundColor: color }]} />
    </Animated.View>
  );

  const renderBody = (color: string, bgColor: string) => (
    <View style={[styles.binBody, { borderColor: color, backgroundColor: bgColor }]}>
      <View style={[styles.binRib, { backgroundColor: color }]} />
      <View style={[styles.binRib, { backgroundColor: color }]} />
    </View>
  );

  const content = (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: activeScale }, { translateX: activeShake }],
        },
      ]}
    >
      {/* Background layer: Gray */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            backgroundColor: "#F3F4F6",
            opacity: grayOpacity,
          },
        ]}
      />

      {/* Background layer: Red glowing */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            backgroundColor: "#FEE2E2",
            opacity: redOpacity,
          },
        ]}
      />

      {/* Icon layer: Gray (Idle) */}
      <Animated.View style={[styles.iconContainer, { opacity: grayOpacity }]}>
        {renderLid("#6F767E")}
        {renderBody("#6F767E", "transparent")}
      </Animated.View>

      {/* Icon layer: Red (Open/Active) */}
      <Animated.View
        style={[
          styles.iconContainer,
          StyleSheet.absoluteFill,
          { opacity: redOpacity, alignItems: "center", justifyContent: "center" },
        ]}
      >
        {renderLid("#EF4444")}
        {renderBody("#EF4444", "rgba(239, 68, 68, 0.1)")}
      </Animated.View>
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
    overflow: "hidden",
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
