import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";

interface RecordingTimerProps {
  isRecording: boolean;
  startTime: number;
}

export function RecordingTimer({ isRecording, startTime }: RecordingTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - (startTime || Date.now())) / 1000));
      setElapsedSeconds(elapsed);
    }, 250);

    return () => clearInterval(interval);
  }, [isRecording, startTime]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formatted = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return <Text style={styles.timerText}>{formatted}</Text>;
}

const styles = StyleSheet.create({
  timerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D1F",
    letterSpacing: 0.3,
    minWidth: 42,
  },
});
