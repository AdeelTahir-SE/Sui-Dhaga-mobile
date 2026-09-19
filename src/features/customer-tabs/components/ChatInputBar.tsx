import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  PanResponder,
  Vibration,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { AnimatedDustbin } from "./AnimatedDustbin";
import { AudioWaveformBar } from "./AudioWaveformBar";
import { RecordingTimer } from "./RecordingTimer";

interface ChatInputBarProps {
  inputText: string;
  onChangeInputText: (text: string) => void;
  pendingAttachments: string[];
  isSending: boolean;
  onSendTextMessage: () => void;
  onSendVoiceMessage: (uri: string) => Promise<void>;
  onPickAttachment: () => void;
  onTakePhoto: () => void;
  insetsBottom: number;
}

export function ChatInputBar({
  inputText,
  onChangeInputText,
  pendingAttachments,
  isSending,
  onSendTextMessage,
  onSendVoiceMessage,
  onPickAttachment,
  onTakePhoto,
  insetsBottom,
}: ChatInputBarProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Audio Recorder instance
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Synchronous interaction state refs
  const isHoldingVoiceRef = useRef(false);
  const isLockedRef = useRef(false);
  const isNearTrashRef = useRef(false);
  const isCancelingRef = useRef(false);
  const recordingStartTimeRef = useRef(0);
  const isStartingRecordingRef = useRef(false);

  // Animated values (all optimized for useNativeDriver: true)
  const micScaleAnim = useRef(new Animated.Value(1)).current;
  const micTranslateX = useRef(new Animated.Value(0)).current;
  const micTranslateY = useRef(new Animated.Value(0)).current;
  const micRippleAnim = useRef(new Animated.Value(0)).current;
  const trashLidAnim = useRef(new Animated.Value(0)).current;
  const trashScaleAnim = useRef(new Animated.Value(1)).current;
  const trashShakeAnim = useRef(new Animated.Value(0)).current;
  const lockSlideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const normalInputOpacity = useRef(new Animated.Value(1)).current;
  const recordingPulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the red recording dot
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulseAnim, {
            toValue: 0.2,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(recordingPulseAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
    } else {
      recordingPulseAnim.setValue(1);
    }
    return () => pulseLoop?.stop();
  }, [isRecording, recordingPulseAnim]);

  // Expanding ripple aura while holding mic
  useEffect(() => {
    let rippleLoop: Animated.CompositeAnimation | null = null;
    if (isRecording && !isLocked) {
      rippleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(micRippleAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(micRippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      rippleLoop.start();
    } else {
      micRippleAnim.setValue(0);
    }
    return () => rippleLoop?.stop();
  }, [isRecording, isLocked, micRippleAnim]);

  // Floating bounce animation for lock pill above the mic
  useEffect(() => {
    let lockLoop: Animated.CompositeAnimation | null = null;
    if (isRecording && !isLocked) {
      lockLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(lockSlideAnim, {
            toValue: -5,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(lockSlideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      lockLoop.start();
    } else {
      lockSlideAnim.setValue(0);
    }
    return () => lockLoop?.stop();
  }, [isRecording, isLocked, lockSlideAnim]);

  const handleStartRecordingAudio = async () => {
    if (isStartingRecordingRef.current) return;
    isStartingRecordingRef.current = true;
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Microphone Permission Required",
          "Permission to access the microphone is required to record voice messages."
        );
        handleCancelRecording();
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      try {
        await audioRecorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      } catch {}

      if (!isHoldingVoiceRef.current && !isLockedRef.current) {
        try {
          await setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: false,
          });
        } catch {}
        return;
      }

      audioRecorder.record();
    } catch (err) {
      console.warn("Audio record start error:", err);
      handleCancelRecording();
    } finally {
      isStartingRecordingRef.current = false;
    }
  };

  const handleCancelRecording = async () => {
    isHoldingVoiceRef.current = false;
    isLockedRef.current = false;
    isNearTrashRef.current = false;
    isCancelingRef.current = false;
    setIsLocked(false);
    setIsRecording(false);

    // Snappy reset of animations
    Animated.parallel([
      Animated.spring(micScaleAnim, { toValue: 1, tension: 180, friction: 8, useNativeDriver: true }),
      Animated.spring(micTranslateX, { toValue: 0, tension: 180, friction: 8, useNativeDriver: true }),
      Animated.spring(micTranslateY, { toValue: 0, tension: 180, friction: 8, useNativeDriver: true }),
      Animated.spring(trashLidAnim, { toValue: 0, tension: 180, friction: 8, useNativeDriver: true }),
      Animated.spring(trashScaleAnim, { toValue: 1, tension: 180, friction: 8, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(normalInputOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    trashShakeAnim.setValue(0);

    try {
      await audioRecorder.stop();
    } catch {}
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    } catch {}
  };

  const handleSendRecording = async () => {
    isHoldingVoiceRef.current = false;
    isLockedRef.current = false;
    isNearTrashRef.current = false;
    isCancelingRef.current = false;
    setIsLocked(false);
    setIsRecording(false);

    Animated.parallel([
      Animated.spring(micScaleAnim, { toValue: 1, tension: 180, friction: 8, useNativeDriver: true }),
      Animated.spring(micTranslateX, { toValue: 0, tension: 180, friction: 8, useNativeDriver: true }),
      Animated.spring(micTranslateY, { toValue: 0, tension: 180, friction: 8, useNativeDriver: true }),
      Animated.spring(trashLidAnim, { toValue: 0, tension: 180, friction: 8, useNativeDriver: true }),
      Animated.spring(trashScaleAnim, { toValue: 1, tension: 180, friction: 8, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(normalInputOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    trashShakeAnim.setValue(0);

    try {
      const stopResult = await audioRecorder.stop();
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch {}

      const recordedUri =
        audioRecorder.uri ||
        (stopResult as any)?.uri ||
        (stopResult as any)?.url;

      if (recordedUri) {
        await onSendVoiceMessage(recordedUri);
      }
    } catch (err) {
      console.warn("Audio record stop/send error:", err);
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch {}
    }
  };

  const triggerDeleteDropAnimation = (onComplete: () => void) => {
    isCancelingRef.current = true;
    try {
      Vibration.vibrate([0, 25, 35, 45]);
    } catch {}

    // Fast, crisp drop into bin (140ms)
    Animated.parallel([
      Animated.timing(micTranslateX, {
        toValue: -135,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(micTranslateY, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(micScaleAnim, {
        toValue: 0.08,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Lid snaps shut fast
      Animated.spring(trashLidAnim, {
        toValue: 0,
        tension: 180,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Quick snappy bin shake
      Animated.sequence([
        Animated.timing(trashShakeAnim, { toValue: -6, duration: 30, useNativeDriver: true }),
        Animated.timing(trashShakeAnim, { toValue: 6, duration: 30, useNativeDriver: true }),
        Animated.timing(trashShakeAnim, { toValue: -3, duration: 30, useNativeDriver: true }),
        Animated.timing(trashShakeAnim, { toValue: 3, duration: 30, useNativeDriver: true }),
        Animated.timing(trashShakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
      ]).start(() => {
        onComplete();
      });
    });
  };

  const micPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isLockedRef.current && !isSending,
      onMoveShouldSetPanResponder: () => !isLockedRef.current && !isSending,
      onPanResponderGrant: () => {
        if (isSending || isLockedRef.current || isCancelingRef.current) return;
        isHoldingVoiceRef.current = true;
        isNearTrashRef.current = false;
        recordingStartTimeRef.current = Date.now();

        micTranslateX.setValue(0);
        micTranslateY.setValue(0);
        trashLidAnim.setValue(0);
        trashScaleAnim.setValue(1);
        trashShakeAnim.setValue(0);

        // Immediate visual response (0ms lag!)
        setIsRecording(true);
        Animated.parallel([
          Animated.spring(micScaleAnim, {
            toValue: 1.65,
            tension: 200,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(normalInputOpacity, {
            toValue: 0,
            duration: 60,
            useNativeDriver: true,
          }),
        ]).start();

        try {
          Vibration.vibrate(30);
        } catch {}

        handleStartRecordingAudio();
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isHoldingVoiceRef.current || isLockedRef.current || isCancelingRef.current) return;

        // 1. Check Scroll UP to LOCK (dy <= -55)
        if (gestureState.dy <= -55) {
          isLockedRef.current = true;
          isHoldingVoiceRef.current = false;
          setIsLocked(true);

          try {
            Vibration.vibrate(45);
          } catch {}

          // Snap mic back to resting state
          Animated.parallel([
            Animated.spring(micScaleAnim, {
              toValue: 1,
              tension: 180,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(micTranslateX, {
              toValue: 0,
              tension: 180,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(micTranslateY, {
              toValue: 0,
              tension: 180,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
          return;
        }

        // Slight upward tracking
        const clampedDy = Math.max(-50, Math.min(0, gestureState.dy));
        micTranslateY.setValue(clampedDy);

        // 2. Check Slide LEFT towards DUSTBIN (dx < 0)
        const clampedDx = Math.max(-140, Math.min(0, gestureState.dx));
        micTranslateX.setValue(clampedDx);

        if (gestureState.dx <= -50) {
          if (!isNearTrashRef.current) {
            isNearTrashRef.current = true;
            try {
              Vibration.vibrate(25);
            } catch {}
            Animated.spring(trashLidAnim, {
              toValue: 1,
              tension: 160,
              friction: 8,
              useNativeDriver: true,
            }).start();
            Animated.spring(trashScaleAnim, {
              toValue: 1.35,
              tension: 160,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }
        } else if (gestureState.dx > -35) {
          if (isNearTrashRef.current) {
            isNearTrashRef.current = false;
            Animated.spring(trashLidAnim, {
              toValue: 0,
              tension: 160,
              friction: 8,
              useNativeDriver: true,
            }).start();
            Animated.spring(trashScaleAnim, {
              toValue: 1,
              tension: 160,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isCancelingRef.current) return;
        if (isLockedRef.current) return;
        if (!isHoldingVoiceRef.current) return;
        isHoldingVoiceRef.current = false;

        // Released near dustbin -> delete drop animation
        if (isNearTrashRef.current || gestureState.dx <= -55) {
          triggerDeleteDropAnimation(() => {
            handleCancelRecording();
          });
          return;
        }

        // Quick tap check
        const duration = Date.now() - recordingStartTimeRef.current;
        if (duration < 400) {
          handleCancelRecording();
          Alert.alert(
            "Voice Message",
            "Hold to record. Slide up to lock, or slide left to the dustbin to cancel.",
            [{ text: "Got it" }]
          );
          return;
        }

        // Normal release -> send recording!
        handleSendRecording();
      },
      onPanResponderTerminate: () => {
        if (isHoldingVoiceRef.current && !isLockedRef.current && !isCancelingRef.current) {
          handleCancelRecording();
        }
      },
    })
  ).current;

  const canSendText = (inputText.trim().length > 0 || pendingAttachments.length > 0) && !isSending;

  // Cross-fade opacity between "Slide to cancel" and "Release to delete" via native driver
  const cancelTextOpacity = trashLidAnim.interpolate({
    inputRange: [0, 0.4],
    outputRange: [1, 0],
  });

  const deleteTextOpacity = trashLidAnim.interpolate({
    inputRange: [0.6, 1],
    outputRange: [0, 1],
  });

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insetsBottom, 10),
        },
      ]}
    >
      {/* Normal Input Layer (Attachment, Camera, TextInput) */}
      <Animated.View
        style={[
          styles.normalInputLayer,
          {
            opacity: normalInputOpacity,
          },
        ]}
        pointerEvents={isRecording ? "none" : "auto"}
      >
        <TouchableOpacity
          onPress={onPickAttachment}
          activeOpacity={0.75}
          style={styles.circleBtn}
          accessibilityLabel="Add attachment"
        >
          <Ionicons name="add" size={22} color="#14919B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTakePhoto}
          activeOpacity={0.75}
          style={styles.circleBtn}
          accessibilityLabel="Take photo"
        >
          <Ionicons name="camera-outline" size={19} color="#6F767E" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={onChangeInputText}
          multiline
        />
      </Animated.View>

      {/* Recording Overlay Layer (Dustbin, Timer, Cancel / Locked Mode) */}
      <Animated.View
        style={[
          styles.recordingOverlayLayer,
          {
            opacity: overlayOpacity,
            right: isLocked ? 12 : 58,
          },
        ]}
        pointerEvents={isRecording ? "auto" : "none"}
      >
        {isLocked ? (
          /* Locked Hands-free Mode */
          <View style={styles.lockedRow}>
            <AnimatedDustbin
              isOpen={false}
              onPress={handleCancelRecording}
              size={38}
            />

            <View style={styles.timerWaveformRow}>
              <Animated.View
                style={[
                  styles.redRecordDot,
                  { opacity: recordingPulseAnim },
                ]}
              />
              <RecordingTimer
                isRecording={isRecording}
                startTime={recordingStartTimeRef.current}
              />
              <AudioWaveformBar color="#EF4444" count={6} />
            </View>

            <TouchableOpacity
              onPress={handleSendRecording}
              disabled={isSending}
              activeOpacity={0.85}
              style={styles.sendLockedBtn}
              accessibilityLabel="Send voice message"
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* Holding Mode */
          <View style={styles.holdingRow}>
            {/* Left: Dustbin with opening lid animation */}
            <View style={styles.dustbinTimerRow}>
              <AnimatedDustbin
                lidAnim={trashLidAnim}
                scaleAnim={trashScaleAnim}
                shakeAnim={trashShakeAnim}
                size={38}
              />
              <View style={styles.liveTimerRow}>
                <Animated.View
                  style={[
                    styles.redRecordDot,
                    { opacity: recordingPulseAnim },
                  ]}
                />
                <RecordingTimer
                  isRecording={isRecording}
                  startTime={recordingStartTimeRef.current}
                />
              </View>
            </View>

            {/* Center: Slide to Cancel text that cross-fades into Release to Delete on GPU */}
            <View style={styles.cancelTextContainer}>
              {/* Default "Slide to cancel" */}
              <Animated.View
                style={[
                  styles.slideHintRow,
                  { opacity: cancelTextOpacity },
                ]}
              >
                <Ionicons name="chevron-back" size={15} color="#9CA3AF" />
                <Text style={styles.slideHintText}>Slide to cancel</Text>
              </Animated.View>

              {/* Active "Release to delete" */}
              <Animated.View
                style={[
                  styles.slideHintRow,
                  StyleSheet.absoluteFill,
                  { opacity: deleteTextOpacity, justifyContent: "flex-end" },
                ]}
              >
                <Text style={styles.deleteHintText}>Release to delete</Text>
              </Animated.View>
            </View>
          </View>
        )}
      </Animated.View>

      {/* PERMANENT, UNMOUNTED RIGHT BUTTON (Mic or Send) */}
      {!isLocked && (
        <View style={styles.rightButtonContainer}>
          {canSendText ? (
            <TouchableOpacity
              onPress={onSendTextMessage}
              disabled={!canSendText}
              activeOpacity={0.85}
              style={[
                styles.sendTextBtn,
                { backgroundColor: canSendText ? "#14919B" : "#E2DDD5" },
              ]}
              accessibilityLabel="Send message"
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={17} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.micButtonWrapper}>
              {/* Floating Slide-up Lock Capsule */}
              {isRecording && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.lockCapsule,
                    { transform: [{ translateY: lockSlideAnim }] },
                  ]}
                >
                  <Ionicons name="lock-closed" size={15} color="#14919B" />
                  <Ionicons name="chevron-up" size={13} color="#14919B" style={{ marginTop: 1 }} />
                  <Text style={styles.lockCapsuleText}>Lock</Text>
                </Animated.View>
              )}

              {/* Pulsing Ripple Aura Ring */}
              {isRecording && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.rippleAura,
                    {
                      transform: [
                        {
                          scale: micRippleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 2.2],
                          }),
                        },
                        { translateX: micTranslateX },
                        { translateY: micTranslateY },
                      ],
                      opacity: micRippleAnim.interpolate({
                        inputRange: [0, 0.7, 1],
                        outputRange: [0.6, 0.25, 0],
                      }),
                    },
                  ]}
                />
              )}

              {/* THE PERMANENT MIC BUTTON WITH TOUCH PAN RESPONDER */}
              <View {...micPanResponder.panHandlers} style={styles.micTouchArea}>
                <Animated.View
                  style={[
                    styles.micCircle,
                    {
                      backgroundColor: isRecording ? "#EF4444" : "#14919B",
                      shadowColor: isRecording ? "#EF4444" : "#14919B",
                      transform: [
                        { scale: micScaleAnim },
                        { translateX: micTranslateX },
                        { translateY: micTranslateY },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="mic" size={20} color="#FFFFFF" />
                </Animated.View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EAE5DD",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 3,
    position: "relative",
    minHeight: 62,
  },
  normalInputLayer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 50,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE5DD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE5DD",
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1A1D1F",
  },
  recordingOverlayLayer: {
    position: "absolute",
    left: 12,
    top: 10,
    bottom: 10,
    justifyContent: "center",
  },
  lockedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  timerWaveformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  redRecordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  sendLockedBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#14919B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  holdingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  dustbinTimerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveTimerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 6,
  },
  cancelTextContainer: {
    justifyContent: "center",
    minWidth: 115,
    height: 30,
    paddingRight: 6,
  },
  slideHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  slideHintText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6F767E",
    marginLeft: 2,
  },
  deleteHintText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#EF4444",
  },
  rightButtonContainer: {
    position: "absolute",
    right: 12,
    bottom: 10,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  sendTextBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  micButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  lockCapsule: {
    position: "absolute",
    bottom: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAE5DD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 5,
  },
  lockCapsuleText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#6F767E",
    marginTop: 1,
  },
  rippleAura: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(239, 68, 68, 0.26)",
  },
  micTouchArea: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  micCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
});
