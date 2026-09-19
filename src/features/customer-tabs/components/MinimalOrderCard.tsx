import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export type MinimalOrderCardProps = {
  id: string;
  orderNumber?: string;
  item: string;
  tailor: string;
  delivery?: string;
  price: string | number;
  status: string;
  image?: ImageSource | string | null;
  designImages?: string[];
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  onPress?: () => void;
};

const toneConfig: Record<string, { bg: string; text: string; lightBg: string }> = {
  teal: { bg: "#EBF8F9", text: "#078B87", lightBg: "#F0FDFA" },
  coral: { bg: "#FFF1EE", text: "#E11D48", lightBg: "#FFF1F2" },
  gold: { bg: "#FFF9E6", text: "#D97706", lightBg: "#FFFBEB" },
  blue: { bg: "#EFF6FF", text: "#2563EB", lightBg: "#F0F9FF" },
  mint: { bg: "#ECFDF5", text: "#059669", lightBg: "#F0FDF4" },
  cream: { bg: "#FDF8F0", text: "#B45309", lightBg: "#FFFBEB" },
};

export function MinimalOrderCard({
  id,
  orderNumber,
  item,
  tailor,
  delivery,
  price,
  status,
  image,
  designImages,
  tone = "teal",
  onPress,
}: MinimalOrderCardProps) {
  const [imageError, setImageError] = useState(false);

  const activeTone = toneConfig[tone] || toneConfig.teal;
  const initialLetter = (item || "O").charAt(0).toUpperCase();

  const normalizedStatus = (status || "").toLowerCase();
  const isCompleted = normalizedStatus === "completed" || normalizedStatus === "delivered";
  const isCancelled = normalizedStatus === "cancelled" || normalizedStatus === "canceled";
  const isConfirmed = normalizedStatus === "confirmed";

  const statusBadge = useMemo(() => {
    if (isCompleted) {
      return {
        label: "Delivered",
        icon: "checkmark-circle" as const,
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
    if (isConfirmed) {
      return {
        label: "Confirmed",
        icon: "shield-checkmark" as const,
        bg: "#EFF6FF",
        text: "#2563EB",
        border: "#BFDBFE",
      };
    }
    return {
      label: status || "In Progress",
      icon: "time" as const,
      bg: "#E0F7F7",
      text: "#078B87",
      border: "#B2EBF2",
    };
  }, [isCompleted, isCancelled, isConfirmed, status]);

  const formattedPrice = useMemo(() => {
    if (typeof price === "number") {
      return `Rs. ${price.toLocaleString()}`;
    }
    if (typeof price === "string") {
      const trimmed = price.trim();
      if (trimmed.startsWith("Rs") || trimmed.startsWith("₹") || trimmed.startsWith("$")) {
        return trimmed;
      }
      return `Rs. ${trimmed}`;
    }
    return "Rs. 0";
  }, [price]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/orders/${orderNumber || id}` as any);
    }
  };

  const firstDesignImg =
    (Array.isArray(designImages) && designImages.length > 0 ? designImages[0] : null) ||
    (typeof image === "string" && image.trim().length > 0 ? image.trim() : null) ||
    (image && typeof image === "object" && (image as any).uri ? (image as any).uri : null);
  const hasValidImage = Boolean(firstDesignImg) && !imageError;
  const displayId = orderNumber || (id?.length > 8 ? id.slice(0, 8) : id);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.card}
    >
      {/* Top Banner / Image Area */}
      <View style={[styles.imageContainer, { backgroundColor: activeTone.bg }]}>
        {hasValidImage ? (
          <Image
            source={{ uri: firstDesignImg }}
            contentFit="cover"
            style={styles.image}
            onError={() => setImageError(true)}
            transition={200}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={[styles.divIconCircle, { backgroundColor: activeTone.lightBg }]}>
              <Ionicons name="shirt-outline" size={22} color={activeTone.text} style={{ opacity: 0.9 }} />
            </View>
            <Text style={[styles.placeholderText, { color: activeTone.text }]}>
              {initialLetter}
            </Text>
          </View>
        )}

        {/* Status Pill Overlaid Top-Left */}
        <View
          style={[
            styles.statusPill,
            { backgroundColor: statusBadge.bg, borderColor: statusBadge.border },
          ]}
        >
          <Ionicons name={statusBadge.icon} size={10} color={statusBadge.text} />
          <Text style={[styles.statusPillText, { color: statusBadge.text }]}>
            {statusBadge.label}
          </Text>
        </View>

        {/* Order ID Overlaid Top-Right */}
        <View style={styles.orderIdBadge}>
          <Text style={styles.orderIdText}>#{displayId}</Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        {/* Item Name */}
        <Text style={styles.itemName} numberOfLines={1}>
          {item}
        </Text>

        {/* Tailor Row */}
        <View style={styles.tailorRow}>
          <Ionicons name="storefront-outline" size={12} color="#6F767E" />
          <Text style={styles.tailorText} numberOfLines={1}>
            {tailor}
          </Text>
        </View>

        {/* Delivery / Timeline */}
        {delivery ? (
          <View style={styles.deliveryRow}>
            <Ionicons name="calendar-outline" size={11} color="#078B87" />
            <Text style={styles.deliveryText} numberOfLines={1}>
              {delivery}
            </Text>
          </View>
        ) : null}

        {/* Footer: Price & Track Link */}
        <View style={styles.footerRow}>
          <Text style={styles.priceText}>{formattedPrice}</Text>
          <View style={styles.trackButton}>
            <Text style={styles.trackButtonText}>Track</Text>
            <Ionicons name="chevron-forward" size={11} color="#078B87" />
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
  imageContainer: {
    width: "100%",
    height: 96,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  divIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  placeholderText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
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
  orderIdBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
  },
  orderIdText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#475569",
  },
  content: {
    padding: 11,
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1A1D1F",
    lineHeight: 18,
  },
  tailorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  tailorText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#6F767E",
    flex: 1,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  deliveryText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#078B87",
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
  priceText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1A1D1F",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#E0F7F7",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trackButtonText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#078B87",
  },
});
