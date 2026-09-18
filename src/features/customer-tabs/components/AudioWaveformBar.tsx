import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

interface AudioWaveformBarProps {
  color?: string;
  count?: number;
}

export function AudioWaveformBar({
  color = "#EF4444",
  count = 6,
}: AudioWaveformBarProps) {
  const animatedValues = useRef(
    Array.from({ length: count }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((val, index) => {
      // Stagger durations and target heights for natural organic wave motion
      const minVal = 0.2 + (index % 3) * 0.1;
      const maxVal = 0.85 + (index % 2) * 0.15;
      const duration = 280 + (index % 4) * 90;

      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: maxVal,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: minVal,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
    });

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [animatedValues]);

  return (
    <View style={styles.container}>
      {animatedValues.map((anim, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 24,
    gap: 3,
    paddingHorizontal: 6,
  },
  bar: {
    width: 3,
    height: 20,
    borderRadius: 1.5,
  },
});
