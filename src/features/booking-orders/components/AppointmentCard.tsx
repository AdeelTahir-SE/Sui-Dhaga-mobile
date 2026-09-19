import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export type AppointmentCardProps = {
  id?: string;
  tailor: string;
  avatar?: string | ImageSource;
  image?: string | ImageSource;
  service: string;
  date: string;
  time: string;
  status: string;
  location?: string;
  tone?: "teal" | "green" | "red" | "blue" | "gold";
  placeholderTone?: "teal" | "coral" | "gold" | "blue";
  onPress?: () => void;
};

const toneConfig: Record<string, { bg: string; text: string; lightBg: string }> = {
  teal: { bg: "#EBF8F9", text: "#078B87", lightBg: "#F0FDFA" },
  green: { bg: "#ECFDF5", text: "#059669", lightBg: "#F0FDF4" },
  coral: { bg: "#FFF1EE", text: "#E11D48", lightBg: "#FFF1F2" },
  red: { bg: "#FFF1EE", text: "#E11D48", lightBg: "#FFF1F2" },
  gold: { bg: "#FFF9E6", text: "#D97706", lightBg: "#FFFBEB" },
  blue: { bg: "#EFF6FF", text: "#2563EB", lightBg: "#F0F9FF" },
};

export function AppointmentCard({
  id,
  tailor,
  avatar,
  image,
  service,
  date,
  time,
  status,
  location,
  tone = "teal",
  placeholderTone = "teal",
  onPress,
}: AppointmentCardProps) {
  const [imageError, setImageError] = useState(false);

  const activeTone = toneConfig[placeholderTone] || toneConfig[tone] || toneConfig.teal;
  const initialLetter = (tailor || "T").charAt(0).toUpperCase();

  const normalizedStatus = (status || "").toLowerCase();
  const isConfirmed = normalizedStatus === "confirmed";
  const isCompleted = normalizedStatus === "completed";
  const isCancelled = normalizedStatus === "cancelled" || normalizedStatus === "rejected";

  const statusDisplay = useMemo(() => {
    if (isConfirmed) {
      return {
        label: "Confirmed",
        icon: "checkmark-circle" as const,
        bg: "#E0F7F7",
        text: "#078B87",
        border: "#B2EBF2",
        dotColor: "#078B87",
      };
    }
    if (isCompleted) {
      return {
        label: "Completed",
        icon: "checkmark-done-circle" as const,
        bg: "#ECFDF5",
        text: "#059669",
        border: "#A7F3D0",
        dotColor: "#059669",
      };
    }
    if (isCancelled) {
      return {
        label: "Cancelled",
        icon: "close-circle" as const,
        bg: "#FFF1EE",
        text: "#E11D48",
        border: "#FECDD3",
        dotColor: "#E11D48",
      };
    }
    return {
      label: status || "Upcoming",
      icon: "calendar-outline" as const,
      bg: "#EFF6FF",
      text: "#2563EB",
      border: "#BFDBFE",
      dotColor: "#2563EB",
    };
  }, [isConfirmed, isCompleted, isCancelled, status]);

  const avatarSource = avatar || image;
  const hasValidAvatar = Boolean(avatarSource) && !imageError;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      {/* Top Section */}
      <View style={styles.topRow}>
        {/* Avatar / Icon Container */}
        <View style={[styles.avatarContainer, { backgroundColor: activeTone.bg }]}>
          {hasValidAvatar ? (
            <Image
              source={typeof avatarSource === "string" ? { uri: avatarSource } : avatarSource}
              contentFit="cover"
              style={styles.avatarImage}
              onError={() => setImageError(true)}
              transition={200}
            />
          ) : (
            <View style={styles.initialsWrap}>
              <Ionicons
                name="cut-outline"
                size={18}
                color={activeTone.text}
                style={{ opacity: 0.75, marginBottom: 2 }}
              />
              <Text style={[styles.initialText, { color: activeTone.text }]}>
                {initialLetter}
              </Text>
            </View>
          )}

          {/* Status Dot Overlay */}
          <View
            style={[
              styles.avatarStatusBadge,
              { backgroundColor: statusDisplay.dotColor },
            ]}
          >
            <Ionicons
              name={
                isConfirmed
                  ? "checkmark"
                  : isCompleted
                  ? "checkmark-done"
                  : isCancelled
                  ? "close"
                  : "calendar"
              }
              size={9}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Middle Info Column */}
        <View style={styles.infoBlock}>
          {/* Tailor Name + Verified Badge */}
          <View style={styles.nameRow}>
            <Text style={styles.tailorName} numberOfLines={1}>
              {tailor}
            </Text>
            <Ionicons name="checkmark-circle" size={14} color="#14919B" style={{ marginLeft: 4 }} />
          </View>

          {/* Service Row */}
          <View style={styles.serviceRow}>
            <Ionicons name="sparkles-outline" size={12} color="#6F767E" />
            <Text style={styles.serviceText} numberOfLines={1}>
              {service}
            </Text>
          </View>

          {/* Date & Time Row */}
          <View style={styles.timePill}>
            <Ionicons name="time-outline" size={11} color="#2563EB" />
            <Text style={styles.timePillText} numberOfLines={1}>
              {date}  •  {time || "Time TBD"}
            </Text>
          </View>
        </View>

        {/* Right Status Pill */}
        <View
          style={[
            styles.statusTag,
            {
              backgroundColor: statusDisplay.bg,
              borderColor: statusDisplay.border,
            },
          ]}
        >
          <Ionicons name={statusDisplay.icon} size={11} color={statusDisplay.text} />
          <Text style={[styles.statusTagText, { color: statusDisplay.text }]}>
            {statusDisplay.label}
          </Text>
        </View>
      </View>

      {/* Subtle Divider */}
      <View style={styles.divider} />

      {/* Bottom Action Row (like Tailor & Order Card) */}
      <View style={styles.bottomRow}>
        <View style={styles.locationWrap}>
          <Ionicons name="storefront-outline" size={12} color="#64748B" />
          <Text style={styles.locationText} numberOfLines={1}>
            {location || "In-Shop Consultation & Measurement"}
          </Text>
        </View>

        <View style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Details</Text>
          <Ionicons name="chevron-forward" size={12} color="#14919B" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 13,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  initialsWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  initialText: {
    fontSize: 13,
    fontWeight: "900",
  },
  avatarStatusBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  infoBlock: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tailorName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#1A1D1F",
    letterSpacing: -0.2,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6F767E",
  },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    backgroundColor: "#EFF6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginTop: 12,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#E0F7F7",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  detailsButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#078B87",
  },
});
