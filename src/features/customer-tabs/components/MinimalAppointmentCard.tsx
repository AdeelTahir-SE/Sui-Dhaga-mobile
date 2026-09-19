import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export type MinimalAppointmentCardProps = {
  id: string;
  tailor: string;
  avatar?: ImageSource | string;
  service: string;
  date: string;
  time: string;
  status: string;
  tone?: "teal" | "coral" | "gold" | "blue";
  onPress?: () => void;
};

const toneConfig: Record<string, { bg: string; text: string; lightBg: string }> = {
  teal: { bg: "#EBF8F9", text: "#078B87", lightBg: "#F0FDFA" },
  coral: { bg: "#FFF1EE", text: "#E11D48", lightBg: "#FFF1F2" },
  gold: { bg: "#FFF9E6", text: "#D97706", lightBg: "#FFFBEB" },
  blue: { bg: "#EFF6FF", text: "#2563EB", lightBg: "#F0F9FF" },
};

export function MinimalAppointmentCard({
  id,
  tailor,
  avatar,
  service,
  date,
  time,
  status,
  tone = "teal",
  onPress,
}: MinimalAppointmentCardProps) {
  const activeTone = toneConfig[tone] || toneConfig.teal;
  const initialLetter = (tailor || "T").charAt(0).toUpperCase();

  const normalizedStatus = (status || "").toLowerCase();
  const isConfirmed = normalizedStatus === "confirmed";
  const isCompleted = normalizedStatus === "completed";
  const isCancelled = normalizedStatus === "cancelled" || normalizedStatus === "rejected";

  const statusBadge = useMemo(() => {
    if (isConfirmed) {
      return {
        label: "Confirmed",
        icon: "checkmark-circle" as const,
        bg: "#E0F7F7",
        text: "#078B87",
        border: "#B2EBF2",
      };
    }
    if (isCompleted) {
      return {
        label: "Completed",
        icon: "checkmark-done-circle" as const,
        bg: "#ECFDF5",
        text: "#059669",
        border: "#A7F3D0",
      };
    }
    if (isCancelled) {
      return {
        label: "Cancelled",
        icon: "close-circle" as const,
        bg: "#FFF1EE",
        text: "#E11D48",
        border: "#FECDD3",
      };
    }
    return {
      label: status || "Scheduled",
      icon: "calendar-outline" as const,
      bg: "#EFF6FF",
      text: "#2563EB",
      border: "#BFDBFE",
    };
  }, [isConfirmed, isCompleted, isCancelled, status]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/appointments/${id}` as any);
    }
  };

  const hasAvatar = typeof avatar === "string" ? avatar.trim().length > 0 : Boolean(avatar);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.card}
    >
      {/* Top Banner / Avatar Area */}
      <View style={[styles.bannerContainer, { backgroundColor: activeTone.bg }]}>
        <View style={styles.avatarCircle}>
          {hasAvatar ? (
            <Image
              source={typeof avatar === "string" ? { uri: avatar } : avatar}
              contentFit="cover"
              style={styles.avatarImage}
              transition={200}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: activeTone.lightBg }]}>
              <Text style={[styles.initialText, { color: activeTone.text }]}>
                {initialLetter}
              </Text>
            </View>
          )}
        </View>

      </View>

      {/* Card Content */}
      <View style={styles.content}>
        {/* Tailor Name */}
        <Text style={styles.tailorName} numberOfLines={1}>
          {tailor}
        </Text>

        {/* Service Type */}
        <View style={styles.serviceRow}>
          <Ionicons name="sparkles-outline" size={12} color="#6F767E" />
          <Text style={styles.serviceText} numberOfLines={1}>
            {service}
          </Text>
        </View>

        {/* Date & Time */}
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={11} color="#2563EB" />
          <Text style={styles.timeText} numberOfLines={1}>
            {date}{time ? ` • ${time}` : ""}
          </Text>
        </View>

        {/* Footer: In-Store tag & Details Link */}
        <View style={styles.footerRow}>
          <View style={styles.visitChip}>
            <Ionicons name="storefront-outline" size={10} color="#64748B" />
            <Text style={styles.visitChipText}>Studio Visit</Text>
          </View>
          <View style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Details</Text>
            <Ionicons name="chevron-forward" size={11} color="#2563EB" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 215,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerContainer: {
    width: "100%",
    height: 96,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  initialText: {
    fontSize: 18,
    fontWeight: "900",
  },
  statusPill: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3.5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  serviceBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
  },
  serviceBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#475569",
  },
  content: {
    padding: 11,
  },
  tailorName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1A1D1F",
    lineHeight: 18,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  serviceText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#6F767E",
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#2563EB",
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  visitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  visitChipText: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#64748B",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailsButtonText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#2563EB",
  },
});
