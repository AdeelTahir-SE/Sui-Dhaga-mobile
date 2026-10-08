import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

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
  completedOrders?: number;
  city?: string;
  address?: string;
  distanceKm?: number;
  reviewsCount?: number | string;
  onPress?: () => void;
  price?: string | number;
  startingPrice?: string | number;
};

const toneConfig: Record<string, { bg: string; text: string }> = {
  teal: { bg: "#EBF8F9", text: "#078B87" },
  coral: { bg: "#FFF1EE", text: "#E11D48" },
  gold: { bg: "#FFF9E6", text: "#D97706" },
  blue: { bg: "#EFF6FF", text: "#2563EB" },
  mint: { bg: "#ECFDF5", text: "#059669" },
  cream: { bg: "#FDF8F0", text: "#B45309" },
};

export function MainTailorCard(props: MainTailorCardProps) {
  const {
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
    city,
    address,
    distanceKm,
    reviewsCount,
    onPress,
    price,
    startingPrice,
  } = props;
  const [imageError, setImageError] = useState(false);

  const isTailorVerified = verified || isVerified;

  const handleCardPress = () => {
    if (onPress) {
      onPress();
      return;
    }
    const targetId = id || (props as any).tailorId || (props as any).userId;
    if (targetId) {
      router.push(`/tailors/${targetId}` as any);
    }
  };

  // Parse rating & review count into structured format
  const { displayRating, reviewsCountOnly } = useMemo(() => {
    let rStr = "New";
    let countOnly = "";

    if (reviewsCount !== undefined && reviewsCount !== null) {
      const parsed = Number(reviewsCount);
      if (!isNaN(parsed) && parsed > 0) {
        countOnly = `${parsed}`;
      }
    }

    if (typeof rating === "number") {
      rStr = rating > 0 ? rating.toFixed(1) : "New";
    } else if (typeof rating === "string") {
      const match = rating.match(/([0-9.]+)/);
      if (match) {
        rStr = match[1];
      }
      if (!countOnly) {
        const reviewMatch = rating.match(/\(([^)]+)\)/);
        if (reviewMatch) {
          const inner = reviewMatch[1].trim();
          const digits = inner.match(/([0-9]+)/);
          countOnly = digits ? digits[1] : inner;
        }
      }
    }

    return { displayRating: rStr, reviewsCountOnly: countOnly };
  }, [rating, reviewsCount]);

  // Clean location & distance handling
  const { locationText, distanceBadgeText } = useMemo(() => {
    const loc = (address || city || "").trim();
    const distStr = (distance || "").trim();

    const isNumericDistance =
      /[0-9.]+\s*(km|m)/i.test(distStr) ||
      distStr.toLowerCase().includes("away") ||
      distStr.toLowerCase().includes("nearby");

    if (distanceKm !== undefined && !isNaN(distanceKm)) {
      return {
        locationText: loc || "Local Atelier",
        distanceBadgeText: `${distanceKm.toFixed(1)} km away`,
      };
    }

    if (loc && isNumericDistance) {
      return {
        locationText: loc,
        distanceBadgeText: distStr,
      };
    }

    if (loc && !isNumericDistance) {
      return {
        locationText: loc,
        distanceBadgeText:
          distStr && distStr.toLowerCase() !== loc.toLowerCase()
            ? distStr
            : null,
      };
    }

    if (!loc && isNumericDistance) {
      return {
        locationText: distStr.toLowerCase().includes("nearby")
          ? "Nearby Area"
          : "City Atelier",
        distanceBadgeText: distStr,
      };
    }

    return {
      locationText: distStr || "Local Atelier",
      distanceBadgeText: null,
    };
  }, [city, address, distance, distanceKm]);

  // Parse specialties list into individual tags
  const tagsList = useMemo(() => {
    if (Array.isArray(specialties) && specialties.length > 0) {
      return specialties.map((s) => s.trim()).filter(Boolean);
    }
    if (specialty) {
      return specialty
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return ["Custom Stitching"];
  }, [specialties, specialty]);

  // Check if actual pricing is set by tailor
  const { hasActualPrice, formattedPrice, priceLabelText } = useMemo(() => {
    const rawVal =
      startingPrice !== undefined && startingPrice !== null && startingPrice !== ""
        ? startingPrice
        : price;

    if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
      if (typeof rawVal === "number" && rawVal > 0) {
        return {
          hasActualPrice: true,
          formattedPrice: `Rs. ${rawVal.toLocaleString()}`,
          priceLabelText: "Starting from",
        };
      }
      if (typeof rawVal === "string") {
        const trimmed = rawVal.trim();
        const lower = trimmed.toLowerCase();
        if (
          lower === "" ||
          lower === "0" ||
          lower === "rs. 0" ||
          lower.includes("on request") ||
          lower === "not set"
        ) {
          return {
            hasActualPrice: false,
            formattedPrice: "Pricing on request",
            priceLabelText: "Pricing",
          };
        }

        const numMatch = trimmed.match(/[0-9,.]+/);
        if (numMatch) {
          const numParsed = Number(numMatch[0].replace(/,/g, ""));
          if (!isNaN(numParsed) && numParsed > 0) {
            return {
              hasActualPrice: true,
              formattedPrice: trimmed.startsWith("Rs")
                ? trimmed
                : `Rs. ${numParsed.toLocaleString()}`,
              priceLabelText: "Starting from",
            };
          }
        }
      }
    }

    return {
      hasActualPrice: false,
      formattedPrice: "Pricing on request",
      priceLabelText: "Pricing",
    };
  }, [price, startingPrice]);

  const activeTone = toneConfig[tone] || toneConfig.teal;
  const initialLetter = (name || "T").charAt(0).toUpperCase();
  const hasValidImage = image && !imageError;

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={handleCardPress}
      style={styles.card}
    >
      {/* 1. TOP HEADER: AVATAR + ESSENTIAL IDENTITY */}
      <View style={styles.topRow}>
        {/* AVATAR WITH VERIFIED BADGE */}
        <View style={styles.avatarWrapper}>
          <View
            style={[styles.avatarContainer, { backgroundColor: activeTone.bg }]}
          >
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
                <Ionicons
                  name="cut-outline"
                  size={18}
                  color={activeTone.text}
                  style={{ opacity: 0.35, marginBottom: 2 }}
                />
                <Text style={[styles.initialText, { color: activeTone.text }]}>
                  {initialLetter}
                </Text>
              </View>
            )}
          </View>
          {isTailorVerified && (
            <View style={styles.verifiedBadgeContainer}>
              <Ionicons name="checkmark-circle" size={17} color="#00949D" />
            </View>
          )}
        </View>

        {/* INFO COLUMN */}
        <View style={styles.infoBlock}>
          {/* Row 1: Shop Name & Rating Badge */}
          <View style={styles.nameRatingRow}>
            <Text style={styles.shopName} numberOfLines={1}>
              {name}
            </Text>

            {/* Prominent Rating Pill */}
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingScore}>{displayRating}</Text>
              {reviewsCountOnly ? (
                <Text style={styles.ratingCount}>({reviewsCountOnly})</Text>
              ) : null}
            </View>
          </View>

          {/* Row 2: Location & Distance */}
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={13} color="#00949D" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationText}
            </Text>
            {distanceBadgeText && (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceBadgeText}>{distanceBadgeText}</Text>
              </View>
            )}
          </View>

          {/* Row 3: Badges Strip (Top Rated, Experience) */}
          {topRated || (experienceYears && experienceYears > 0) ? (
            <View style={styles.badgesRow}>
              {topRated ? (
                <View style={styles.topRatedBadge}>
                  <Ionicons name="trophy" size={10} color="#92400E" />
                  <Text style={styles.topRatedBadgeText}>Top Rated</Text>
                </View>
              ) : null}

              {experienceYears && experienceYears > 0 ? (
                <View style={styles.expBadge}>
                  <Ionicons name="ribbon-outline" size={10} color="#475569" />
                  <Text style={styles.expBadgeText}>
                    {experienceYears}+ yrs exp
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      {/* 2. SPECIALTIES TAGS */}
      {tagsList.length > 0 ? (
        <View style={styles.specialtiesWrap}>
          {tagsList.slice(0, 3).map((item, idx) => (
            <View key={idx} style={styles.specialtyPill}>
              <Text style={styles.specialtyPillText}>{item}</Text>
            </View>
          ))}
          {tagsList.length > 3 ? (
            <View style={styles.morePill}>
              <Text style={styles.morePillText}>
                +{tagsList.length - 3} more
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* 3. FOOTER ROW: PRICING + VIEW PROFILE CTA */}
      <View style={styles.footerRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{priceLabelText}</Text>
          <Text
            style={[
              styles.priceValue,
              !hasActualPrice && {
                fontSize: 13,
                fontWeight: "700",
                color: "#64748B",
              },
            ]}
          >
            {formattedPrice}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={handleCardPress}
          style={styles.viewProfileCta}
        >
          <ButtonTexture variant="greenish" borderRadius={10} />
          <Text style={styles.viewProfileCtaText}>View Profile</Text>
          <Ionicons
            name="arrow-forward"
            size={13}
            color="#FFFFFF"
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
    shadowOffset: { width: 0, height: 2 },
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
  avatarContainer: {
    width: 74,
    height: 74,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
  verifiedBadgeContainer: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  infoBlock: {
    flex: 1,
    marginLeft: 13,
    justifyContent: "space-between",
  },
  nameRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  shopName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3.5,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    paddingHorizontal: 7.5,
    paddingVertical: 3,
    borderRadius: 8,
    flexShrink: 0,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E",
    lineHeight: 14,
  },
  ratingCount: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#B45309",
    lineHeight: 14,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
    flexWrap: "wrap",
  },
  locationText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    flexShrink: 1,
  },
  distanceBadge: {
    backgroundColor: "#E0F7F7",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 2,
  },
  distanceBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0D7377",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  topRatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6.5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  topRatedBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#92400E",
  },
  expBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  expBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  specialtiesWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 11,
    gap: 5,
  },
  specialtyPill: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8.5,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  specialtyPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
  morePill: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 7.5,
    paddingVertical: 3.5,
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
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 1,
  },
  viewProfileCta: {
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
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2,
  },
  viewProfileCtaText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
    zIndex: 1,
  },
});
