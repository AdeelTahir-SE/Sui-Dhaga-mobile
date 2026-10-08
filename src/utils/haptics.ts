import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Safe haptic feedback wrapper across iOS, Android, and Web
 */
export async function lightHaptic(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Ignore unsupported devices
  }
}

export async function mediumHaptic(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Ignore
  }
}

export async function selectionHaptic(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // Ignore
  }
}

export async function successHaptic(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignore
  }
}

export async function errorHaptic(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Ignore
  }
}
