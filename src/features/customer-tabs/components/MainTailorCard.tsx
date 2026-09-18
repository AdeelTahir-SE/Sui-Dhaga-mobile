import React, { useState, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type MainTailorCardProps = {
  id?: string;
  name: string;
  rating: string | number;
  distance: string;
  specialty: string;
  specialties?: string[];
  image?: any;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  topRated?: boolean;
  verified?: boolean;
  isVerified?: boolean;
  experienceYears?: number;
  onPress?: () => void;
  price?: string | number;
};

const toneConfig: Record<string, { bg: string; text: string }> = {
  teal: { bg: "#EBF8F9", text: "#078B87" },
  coral: { bg: "#FFF1EE", text: "#E11D48" },
  gold: { bg: "#FFF9E6", text: "#D97706" },
  blue: { bg: "#EFF6FF", text: "#2563EB" },
  mint: { bg: "#ECFDF5", text: "#059669" },
  cream: { bg: "#FDF8F0", text: "#B45309" },
};

export function MainTailorCard({
  id,
  name,
  rating,
  distance,
  specialty,
  specialties,
  image,
  tone = "teal",
  topRated,
  verified = true,
  isVerified = true,
  experienceYears,
  onPress,
  price = "Rs. 1,500",
}: MainTailorCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isTailorVerified = verified || isVerified;

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (id) {
      router.push(`/tailors/${id}` as any);
    } else {
      router.push("/tailors/rekha-tailors" as any);
    }
  };

  // Parse rating & review count
  const { displayRating, reviewsCountText } = useMemo(() => {
    let rStr = "New";
    let countStr = "";

    if (typeof rating === "number") {
      rStr = rating > 0 ? rating.toFixed(1) : "New";
    } else if (typeof rating === "string") {
      const match = rating.match(/([0-9.]+)/);
      if (match) {
        rStr = match[1];
      }
      const reviewMatch = rating.match(/\(([^)]+)\)/);
      if (reviewMatch) {
        countStr = `(${reviewMatch[1]})`;
      }
    }

    return { displayRating: rStr, reviewsCountText: countStr };
  }, [rating]);

  // Parse specialties list into individual tags
  const tagsList = useMemo(() => {
    if (Array.isArray(specialties) && specialties.length > 0) {
      return specialties.map((s) => s.trim()).filter(Boolean);
    }
    if (specialty) {
      return specialty.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return ["Custom Stitching"];
  }, [specialties, specialty]);

  // Price formatting
  const formattedPrice = useMemo(() => {
    if (typeof price === "number") {
      return `Rs. ${price.toLocaleString()}`;
    }
    if (typeof price === "string") {
      return price;
    }
    return "Price on request";
  }, [price]);

  const activeTone = toneConfig[tone] || toneConfig.teal;
  const initialLetter = (name || "T").charAt(0).toUpperCase();

  const hasValidImage = image && !imageError;

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={handleCardPress}
      style={styles.card}
    >
      {/* TOP ROW: AVATAR + DETAILS */}
      <View style={styles.topRow}>
        {/* AVATAR CONTAINER */}
        <View style={[styles.avatarContainer, { backgroundColor: activeTone.bg }]}>
          {hasValidImage ? (
            <Image
              source={image}
              contentFit="cover"
              style={styles.avatarImage}
              onError={() => setImageError(true)}
              transition={200}
            />
          ) : (
            <View style={styles.initialsWrap}>
              <Ionicons name="cut-outline" size={16} color={activeTone.text} style={{ opacity: 0.35, marginBottom: 2 }} />
              <Text style={[styles.initialText, { color: activeTone.text }]}>
                {initialLetter}
              </Text>
            </View>
          )}

          {/* Verified Mini Overlay on Avatar */}
          {isTailorVerified ? (
            <View style={styles.avatarVerifiedBadge}>
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          ) : null}
        </View>

        {/* MIDDLE INFO BLOCK */}
        <View style={styles.infoBlock}>
          {/* Header Row: Shop Name & Heart Toggle */}
          <View style={styles.nameHeartRow}>
            <Text style={styles.shopName} numberOfLines={1}>
              {name}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                setIsFavorited(!isFavorited);
              }}
              style={styles.heartButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Save Tailor to favorites"
            >
              <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={20}
                color={isFavorited ? "#EF4444" : "#94A3B8"}
              />
            </TouchableOpacity>
          </View>

          {/* Rating, Reviews & Location Row */}
          <View style={styles.metaRow}>
            {/* Rating Pill */}
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={11} color="#D97706" />
              <Text style={styles.ratingPillText}>{displayRating}</Text>
            </View>

            {reviewsCountText ? (
              <Text style={styles.reviewsCountText} numberOfLines={1}>
                {reviewsCountText}
              </Text>
            ) : null}

            <Text style={styles.dotDivider}>•</Text>

            {/* Location with Pin */}
            <View style={styles.locationWrap}>
              <Ionicons name="location-sharp" size={12} color="#078B87" />
              <Text style={styles.distanceText} numberOfLines={1}>
                {distance}
              </Text>
            </View>
          </View>

          {/* Badges Strip (Verified, Top Rated, Experience) */}
          <View style={styles.badgesRow}>
            {isTailorVerified ? (
              <View style={styles.verifiedTag}>
                <Ionicons name="shield-checkmark" size={11} color="#078B87" />
                <Text style={styles.verifiedTagText}>Verified</Text>
              </View>
            ) : null}

            {topRated ? (
              <View style={styles.topRatedTag}>
                <Ionicons name="trophy" size={10} color="#B45309" />
                <Text style={styles.topRatedTagText}>Top Rated</Text>
              </View>
            ) : null}

            {experienceYears && experienceYears > 0 ? (
              <View style={styles.expTag}>
                <Text style={styles.expTagText}>{experienceYears}+ yrs exp</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* SPECIALTIES TAGS */}
      {tagsList.length > 0 ? (
        <View style={styles.specialtiesWrap}>
          {tagsList.slice(0, 3).map((item, idx) => (
            <View key={idx} style={styles.specialtyPill}>
              <Text style={styles.specialtyPillText}>{item}</Text>
            </View>
          ))}
          {tagsList.length > 3 ? (
            <View style={styles.morePill}>
              <Text style={styles.morePillText}>+{tagsList.length - 3} more</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* FOOTER STRIP: PRICING + VIEW PROFILE CTA */}
      <View style={styles.footerRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>{formattedPrice}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={handleCardPress}
          style={styles.viewProfileCta}
        >
          <Text style={styles.viewProfileCtaText}>View Profile</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 3 }} />
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
    alignItems: "center",
    justifyContent: "center",
  },
  initialText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  avatarVerifiedBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: "#078B87",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBlock: {
    flex: 1,
    marginLeft: 13,
  },
  nameHeartRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shopName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  heartButton: {
    padding: 2,
    marginLeft: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    flexWrap: "wrap",
    gap: 4,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    gap: 3,
  },
  ratingPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#92400E",
  },
  reviewsCountText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },
  dotDivider: {
    fontSize: 11,
    color: "#CBD5E1",
    marginHorizontal: 1,
  },
  locationWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flexShrink: 1,
  },
  distanceText: {
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
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F7F7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#078B87",
  },
  topRatedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  topRatedTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#92400E",
  },
  expTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expTagText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  specialtiesWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 5,
  },
  specialtyPill: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  specialtyPillText: {
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
  viewProfileCta: {
    height: 38,
    backgroundColor: "#078B87",
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#078B87",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2,
  },
  viewProfileCtaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

