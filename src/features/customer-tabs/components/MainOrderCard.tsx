import React, { useState, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

type MainOrderCardProps = {
  id: string;
  item: string;
  tailor: string;
  delivery?: string;
  placedOn?: string;
  price: string | number;
  status: string;
  image?: ImageSource | string | null;
  designImages?: string[];
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  button?: string;
  orderId?: string;
  tags?: string[];
  onPress?: () => void;
};

const toneConfig: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  teal: { bg: "#EBF8F9", text: "#078B87", border: "#B2EBF2", iconBg: "#D4F4F5" },
  coral: { bg: "#FFF1EE", text: "#E11D48", border: "#FECDD3", iconBg: "#FFE4E6" },
  gold: { bg: "#FFF9E6", text: "#D97706", border: "#FDE68A", iconBg: "#FEF3C7" },
  blue: { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE", iconBg: "#DBEAFE" },
  mint: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0", iconBg: "#D1FAE5" },
  cream: { bg: "#FDF8F0", text: "#B45309", border: "#FDE68A", iconBg: "#FEF3C7" },
};

export function MainOrderCard({
  id,
  item,
  tailor,
  delivery,
  placedOn,
  price,
  status,
  image,
  designImages,
  tone = "teal",
  button,
  orderId,
  tags,
  onPress,
}: MainOrderCardProps) {
  const [imageError, setImageError] = useState(false);

  const normalizedStatus = (status || "").toLowerCase();
  const isCompleted = normalizedStatus === "completed" || normalizedStatus === "delivered";
  const isCancelled = normalizedStatus === "cancelled" || normalizedStatus === "canceled";
  const isConfirmed = normalizedStatus === "confirmed";

  const activeTone = toneConfig[tone] || toneConfig.teal;
  const initialLetter = (item || "O").charAt(0).toUpperCase();

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (orderId || id) {
      router.push(`/orders/${orderId || id}` as any);
    }
  };

  // Formatted price string
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

  // Clean status display
  const statusDisplay = useMemo(() => {
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

  // Tags list (similar to specialties in Tailor card)
  const tagsList = useMemo(() => {
    if (Array.isArray(tags) && tags.length > 0) {
      return tags.map((t) => t.trim()).filter(Boolean);
    }
    const list: string[] = [];
    if (delivery) {
      list.push(delivery);
    }
    if (placedOn) {
      list.push(`Placed ${placedOn}`);
    }
    if (list.length === 0) {
      list.push("Custom Stitching");
    }
    return list;
  }, [tags, delivery, placedOn]);

  // Button label
  const ctaLabel = button || (isCompleted ? "View Details" : isCancelled ? "Order Details" : "Track Order");

  const firstDesignImg =
    (Array.isArray(designImages) && designImages.length > 0 ? designImages[0] : null) ||
    (typeof image === "string" && image.trim().length > 0 ? image.trim() : null) ||
    (image && typeof image === "object" && (image as any).uri ? (image as any).uri : null);
  const hasValidImage = Boolean(firstDesignImg) && !imageError;

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={handleCardPress}
      style={styles.card}
    >
      {/* TOP ROW: AVATAR / GARMENT IMAGE + ORDER DETAILS */}
      <View style={styles.topRow}>
        {/* AVATAR / IMAGE CONTAINER */}
        <View style={[styles.avatarContainer, { backgroundColor: activeTone.bg, borderColor: activeTone.border }]}>
          {hasValidImage ? (
            <Image
              source={{ uri: firstDesignImg }}
              contentFit="cover"
              style={styles.avatarImage}
              onError={() => setImageError(true)}
              transition={200}
            />
          ) : (
            <View style={styles.initialsWrap}>
              <View style={[styles.divIconWrap, { backgroundColor: activeTone.iconBg }]}>
                <Ionicons
                  name="shirt-outline"
                  size={18}
                  color={activeTone.text}
                />
              </View>
              <Text style={[styles.initialText, { color: activeTone.text }]}>
                {initialLetter}
              </Text>
            </View>
          )}

          {/* Status Mini Badge Overlay on Avatar */}
          <View
            style={[
              styles.avatarStatusBadge,
              {
                backgroundColor: isCompleted
                  ? "#059669"
                  : isCancelled
                  ? "#E11D48"
                  : isConfirmed
                  ? "#2563EB"
                  : "#078B87",
              },
            ]}
          >
            <Ionicons
              name={
                isCompleted
                  ? "checkmark"
                  : isCancelled
                  ? "close"
                  : isConfirmed
                  ? "shield"
                  : "sync"
              }
              size={10}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* MIDDLE INFO BLOCK */}
        <View style={styles.infoBlock}>
          {/* Header: Item / Outfit Name */}
          <Text style={styles.itemName} numberOfLines={1}>
            {item}
          </Text>

          {/* Order ID & Tailor Meta Row */}
          <View style={styles.metaRow}>
            {/* Order ID Pill */}
            <View style={styles.orderIdPill}>
              <Ionicons name="receipt-outline" size={11} color="#078B87" />
              <Text style={styles.orderIdPillText}>#{id}</Text>
            </View>

            <Text style={styles.dotDivider}>•</Text>

            {/* Tailor Name */}
            <View style={styles.tailorWrap}>
              <Ionicons name="storefront-outline" size={12} color="#078B87" />
              <Text style={styles.tailorText} numberOfLines={1}>
                {tailor}
              </Text>
            </View>
          </View>

          {/* Badges Strip (Status, Delivery/Timeline) */}
          <View style={styles.badgesRow}>
            {/* Status Tag */}
            <View
              style={[
                styles.statusTag,
                {
                  backgroundColor: statusDisplay.bg,
                  borderColor: statusDisplay.border,
                },
              ]}
            >
              <Ionicons
                name={statusDisplay.icon}
                size={11}
                color={statusDisplay.text}
              />
              <Text style={[styles.statusTagText, { color: statusDisplay.text }]}>
                {statusDisplay.label}
              </Text>
            </View>

            {/* Placed date or quick tag if available */}
            {placedOn ? (
              <View style={styles.dateTag}>
                <Ionicons name="time-outline" size={10} color="#475569" />
                <Text style={styles.dateTagText}>{placedOn}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* TAGS / DETAILS STRIP */}
      {tagsList.length > 0 ? (
        <View style={styles.tagsWrap}>
          {tagsList.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Text style={styles.tagPillText} numberOfLines={1}>
                {tag}
              </Text>
            </View>
          ))}
          {tagsList.length > 3 ? (
            <View style={styles.morePill}>
              <Text style={styles.morePillText}>+{tagsList.length - 3} more</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* FOOTER STRIP: PRICING + CTA BUTTON */}
      <View style={styles.footerRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.priceValue}>{formattedPrice}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={handleCardPress}
          style={[
            styles.actionCta,
            isCancelled ? styles.actionCtaCancelled : null,
          ]}
        >
          {!isCancelled && <ButtonTexture variant="greenish" borderRadius={10} />}
          <Text
            style={[
              styles.actionCtaText,
              isCancelled ? styles.actionCtaTextCancelled : null,
            ]}
          >
            {ctaLabel}
          </Text>
          <Ionicons
            name={isCancelled ? "chevron-forward" : "arrow-forward"}
            size={14}
            color={isCancelled ? "#64748B" : "#FFFFFF"}
            style={{ marginLeft: 3, zIndex: 1 }}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  initialsWrap: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  divIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  initialText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  avatarStatusBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBlock: {
    flex: 1,
    marginLeft: 13,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    flexWrap: "wrap",
    gap: 4,
  },
  orderIdPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FAFA",
    borderWidth: 1,
    borderColor: "#CCF0EE",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    gap: 3,
  },
  orderIdPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#078B87",
  },
  dotDivider: {
    fontSize: 11,
    color: "#CBD5E1",
    marginHorizontal: 1,
  },
  tailorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexShrink: 1,
  },
  tailorText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 7,
    flexWrap: "wrap",
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 3,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  dateTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  dateTagText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  tagsWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 5,
  },
  tagPill: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
  morePill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  morePillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priceContainer: {
    justifyContent: "center",
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 1,
  },
  actionCta: {
    height: 38,
    backgroundColor: "#078B87",
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#078B87",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCtaCancelled: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowOpacity: 0,
    elevation: 0,
  },
  actionCtaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    zIndex: 1,
  },
  actionCtaTextCancelled: {
    color: "#64748B",
  },
});

