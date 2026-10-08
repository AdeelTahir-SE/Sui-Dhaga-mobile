import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

type OrderCardProps = {
  id: string;
  item: string;
  tailor: string;
  placedOn?: string;
  price: string | number;
  delivery?: string;
  status: string;
  image?: string | any;
  designImages?: string[];
  statusTone?: "gold" | "blue" | "green" | "red";
  buttonLabel?: string;
  placeholderTone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  onPress?: () => void;
  tags?: string[];
};

const toneConfig: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  teal: { bg: "#EBF8F9", text: "#078B87", border: "#B2EBF2", iconBg: "#D4F4F5" },
  coral: { bg: "#FFF1EE", text: "#E11D48", border: "#FECDD3", iconBg: "#FFE4E6" },
  gold: { bg: "#FFF9E6", text: "#D97706", border: "#FDE68A", iconBg: "#FEF3C7" },
  blue: { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE", iconBg: "#DBEAFE" },
  mint: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0", iconBg: "#D1FAE5" },
  cream: { bg: "#FDF8F0", text: "#B45309", border: "#FDE68A", iconBg: "#FEF3C7" },
};

export function OrderCard({
  id,
  item,
  tailor,
  placedOn,
  price,
  delivery,
  status,
  image,
  designImages,
  statusTone,
  buttonLabel,
  placeholderTone = "teal",
  onPress,
  tags,
}: OrderCardProps) {
  const [imageError, setImageError] = useState(false);
  const normalizedStatus = (status || "").toLowerCase();
  const isCompleted =
    normalizedStatus === "completed" ||
    normalizedStatus === "delivered" ||
    statusTone === "green";
  const isCancelled =
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled" ||
    statusTone === "red";
  const isConfirmed = normalizedStatus === "confirmed" || statusTone === "blue";

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (id) {
      router.push(`/orders/${id}` as any);
    }
  };

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

  const timelineInfo = useMemo(() => {
    if (isCompleted) {
      if (delivery && !delivery.toLowerCase().includes("progress")) {
        const cleanDate = delivery.replace(/^(Est\.|Estimated|Delivered on|Delivered)\s*/i, "").trim();
        return {
          text: cleanDate ? `Delivered on ${cleanDate}` : "Delivered safely",
          icon: "checkmark-circle-outline" as const,
          color: "#64748B",
          bg: "transparent",
          border: "transparent",
        };
      }
      return {
        text: "Delivered safely",
        icon: "checkmark-circle-outline" as const,
        color: "#64748B",
        bg: "transparent",
        border: "transparent",
      };
    }
    if (isCancelled) {
      return {
        text: "Order cancelled",
        icon: "close-circle-outline" as const,
        color: "#E11D48",
        bg: "#FFF1EE",
        border: "#FECDD3",
      };
    }
    if (delivery && delivery.toLowerCase() !== "in progress") {
      const cleanDate = delivery.replace(/^(Est\.|Estimated delivery|Estimated|Delivery by)\s*/i, "").trim();
      return {
        text: `Expected delivery: ${cleanDate}`,
        icon: "calendar-outline" as const,
        color: "#078B87",
        bg: "#F0FAFA",
        border: "#CCF0EE",
      };
    }
    if (placedOn) {
      return {
        text: `Ordered on ${placedOn.replace(/^Placed:?\s*/i, "").trim()}`,
        icon: "time-outline" as const,
        color: "#078B87",
        bg: "#F0FAFA",
        border: "#CCF0EE",
      };
    }
    return {
      text: "Tailoring in progress",
      icon: "sync-outline" as const,
      color: "#078B87",
      bg: "#F0FAFA",
      border: "#CCF0EE",
    };
  }, [isCompleted, isCancelled, delivery, placedOn]);

  // Subtle support reference (unobtrusive, kept only for support inquiries)
  const formattedRef = useMemo(() => {
    if (!id || id === "—" || id === "-") return null;
    const cleanId = String(id).trim();
    if (cleanId.length > 12 && cleanId.includes("-")) {
      const parts = cleanId.split("-");
      return `#${parts[parts.length - 1].toUpperCase()}`;
    }
    if (cleanId.startsWith("#")) return cleanId;
    return `#${cleanId}`;
  }, [id]);

  // Filter out any duplicate date strings and show only genuine garment tags
  const customTags = useMemo(() => {
    if (!Array.isArray(tags) || tags.length === 0) return [];
    return tags
      .map((t) => t.trim())
      .filter((t) => {
        if (!t) return false;
        const lower = t.toLowerCase();
        if (lower.startsWith("est") || lower.startsWith("delivery") || lower.startsWith("placed")) return false;
        if (lower === "custom stitching" || lower === (item || "").toLowerCase()) return false;
        return true;
      });
  }, [tags, item]);

  const ctaLabel =
    buttonLabel ||
    (isCompleted ? "View Details" : isCancelled ? "Order Details" : "Track Order");

  const firstDesignImg =
    (Array.isArray(designImages) && designImages.length > 0 ? designImages[0] : null) ||
    (typeof image === "string" && image.trim().length > 0 ? image.trim() : null) ||
    (image && typeof image === "object" && image.uri ? image.uri : null);
  const hasValidImage = Boolean(firstDesignImg) && !imageError;

  const activeTone = toneConfig[placeholderTone] || toneConfig.teal;
  const initialLetter = (item || "O").charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={handleCardPress}
      style={styles.card}
    >
      {/* TOP ROW: THUMBNAIL + PRIMARY ORDER INFO */}
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          {hasValidImage ? (
            <Image
              source={{ uri: firstDesignImg }}
              contentFit="cover"
              style={styles.avatarImage}
              onError={() => setImageError(true)}
              transition={200}
            />
          ) : (
            <View
              style={[
                styles.avatarDivStyle,
                { backgroundColor: activeTone.bg, borderColor: activeTone.border },
              ]}
            >
              <View
                style={[
                  styles.avatarDivIconWrap,
                  { backgroundColor: activeTone.iconBg },
                ]}
              >
                <Ionicons name="shirt-outline" size={20} color={activeTone.text} />
              </View>
              <Text style={[styles.avatarDivInitial, { color: activeTone.text }]}>
                {initialLetter}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoBlock}>
          {/* Header Row: Outfit Name & Status Tag */}
          <View style={styles.headerRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item}
            </Text>
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
          </View>

          {/* Tailor Row */}
          <View style={styles.tailorRow}>
            <Ionicons name="storefront-outline" size={13} color="#64748B" />
            <Text style={styles.tailorText} numberOfLines={1}>
              {tailor}
            </Text>
          </View>

          {/* Customer-First Timeline Banner */}
          <View
            style={[
              styles.timelineBanner,
              isCompleted
                ? styles.timelineDeliveredPlain
                : {
                    backgroundColor: timelineInfo.bg,
                    borderColor: timelineInfo.border,
                  },
            ]}
          >
            <Ionicons
              name={timelineInfo.icon}
              size={12}
              color={timelineInfo.color}
            />
            <Text
              style={[
                styles.timelineText,
                { color: timelineInfo.color },
                isCompleted ? styles.timelineDeliveredText : null,
              ]}
              numberOfLines={1}
            >
              {timelineInfo.text}
            </Text>
          </View>
        </View>
      </View>

      {/* CUSTOM TAGS (Only if genuine garment attributes exist) */}
      {customTags.length > 0 ? (
        <View style={styles.tagsWrap}>
          {customTags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Text style={styles.tagPillText} numberOfLines={1}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* FOOTER ROW: PRICING + SUBTLE REF + ACTION BUTTON */}
      <View style={styles.footerRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.priceValue}>{formattedPrice}</Text>
          {formattedRef ? (
            <Text style={styles.subtleRefText}>Order {formattedRef}</Text>
          ) : null}
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
            style={{ marginLeft: 4, zIndex: 1 }}
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
  },
  avatarDivStyle: {
    width: 72,
    height: 72,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  avatarDivIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  avatarDivInitial: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  infoBlock: {
    flex: 1,
    marginLeft: 13,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 3.5,
  },
  statusTagText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  tailorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  tailorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    flex: 1,
  },
  timelineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  timelineDeliveredPlain: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 2,
    marginTop: 6,
  },
  timelineText: {
    fontSize: 11,
    fontWeight: "600",
  },
  timelineDeliveredText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
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
    color: "#475569",
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
    fontSize: 9.5,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  priceValue: {
    fontSize: 16.5,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 1,
  },
  subtleRefText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
    marginTop: 2,
  },
  actionCta: {
    height: 38,
    backgroundColor: "#078B87",
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#078B87",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
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
