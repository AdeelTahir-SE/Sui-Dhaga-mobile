import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type SundropTailorCardProps = {
  id?: string;
  name: string;
  rating: string | number;
  distance: string;
  specialty?: string;
  specialties?: string[];
  image?: any;
  topRated?: boolean;
  verified?: boolean;
  isVerified?: boolean;
  experienceYears?: number;
  city?: string;
  address?: string;
  distanceKm?: number;
  reviewsCount?: number | string;
  onPress?: () => void;
  price?: string | number;
  startingPrice?: string | number;
};

export function SundropTailorCard({
  id,
  name,
  rating,
  distance,
  specialty,
  specialties,
  image,
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
}: SundropTailorCardProps) {
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

  // Structured Rating & Reviews
  const { displayRating, reviewsCountText } = useMemo(() => {
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

    return {
      displayRating: rStr,
      reviewsCountText: countOnly ? `(${countOnly})` : "",
    };
  }, [rating, reviewsCount]);

  // Clean location & distance
  const { locationText, distanceBadgeText } = useMemo(() => {
    const loc = (address || city || "").trim();
    const distStr = (distance || "").trim();

    const isNumericDistance =
      /[0-9.]+\s*(km|m)/i.test(distStr) ||
      distStr.toLowerCase().includes("away") ||
      distStr.toLowerCase().includes("nearby");

    if (distanceKm !== undefined && !isNaN(distanceKm)) {
      return {
        locationText: loc || "Bespoke Atelier",
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

    return {
      locationText: distStr || "Bespoke Atelier",
      distanceBadgeText: isNumericDistance ? distStr : null,
    };
  }, [address, city, distance, distanceKm]);

  // Specialties list
  const parsedSpecialties = useMemo(() => {
    if (Array.isArray(specialties) && specialties.length > 0) {
      return specialties.slice(0, 3);
    }
    if (specialty && typeof specialty === "string") {
      return specialty
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
    }
    return ["Sundrop Couture", "Bespoke Cut"];
  }, [specialties, specialty]);

  // Structured pricing handling
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

  const initialLetter = (name || "T").charAt(0).toUpperCase();
  const hasValidImage = image && !imageError;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleCardPress}
      style={styles.card}
    >
      {/* Top Section: Avatar + Essential Info */}
      <View style={styles.topRow}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
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
                  name="sparkles"
                  size={14}
                  color="#F59E0B"
                  style={{ opacity: 0.8, marginBottom: 2 }}
                />
                <Text style={styles.initialText}>{initialLetter}</Text>
              </View>
            )}
          </View>
          {isTailorVerified && (
            <View style={styles.verifiedBadgeContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#F59E0B" />
            </View>
          )}
        </View>

        {/* Content Details */}
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.tailorName} numberOfLines={1}>
              {name}
            </Text>
            {topRated && (
              <View style={styles.artisanBadge}>
                <Ionicons name="star" size={10} color="#FDE68A" />
                <Text style={styles.artisanBadgeText}>Master Artisan</Text>
              </View>
            )}
          </View>

          {/* Rating & Reviews + Experience */}
          <View style={styles.metaRow}>
            <View style={styles.ratingGroup}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingNumber}>{displayRating}</Text>
              {reviewsCountText ? (
                <Text style={styles.reviewsText}>{reviewsCountText}</Text>
              ) : null}
            </View>

            {experienceYears ? (
              <>
                <View style={styles.dotDivider} />
                <Text style={styles.experienceText}>
                  {experienceYears}+ yrs exp
                </Text>
              </>
            ) : null}
          </View>

          {/* Location & Distance */}
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={12} color="#FBBF24" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationText}
            </Text>
            {distanceBadgeText && (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceBadgeText}>
                  {distanceBadgeText}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Specialties Badges */}
      {parsedSpecialties.length > 0 && (
        <View style={styles.specialtiesWrap}>
          {parsedSpecialties.map((spec, index) => (
            <View key={index} style={styles.specialtyChip}>
              <Text style={styles.specialtyText}>{spec}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Bottom Row: Price & Atelier CTA */}
      <View style={styles.bottomRow}>
        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>{priceLabelText}</Text>
          <Text
            style={[
              styles.priceValue,
              !hasActualPrice && {
                fontSize: 13,
                fontWeight: "700",
                color: "#CBD5E1",
              },
            ]}
          >
            {formattedPrice}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCardPress}
          activeOpacity={0.85}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>View Atelier</Text>
          <Ionicons name="arrow-forward" size={14} color="#1A0B2E" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(32, 14, 52, 0.9)",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "rgba(245, 158, 11, 0.25)",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(245, 158, 11, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
    fontSize: 18,
    fontWeight: "900",
    color: "#FDE68A",
  },
  verifiedBadgeContainer: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: "#160B24",
    borderRadius: 10,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  tailorName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  artisanBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(245, 158, 11, 0.16)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  artisanBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#FDE68A",
    letterSpacing: 0.4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  ratingGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingNumber: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#FDE68A",
  },
  reviewsText: {
    fontSize: 11.5,
    color: "#C4B5FD",
  },
  dotDivider: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "rgba(245, 158, 11, 0.5)",
    marginHorizontal: 7,
  },
  experienceText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#DDD6FE",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#DDD6FE",
    flexShrink: 1,
  },
  distanceBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 4,
  },
  distanceBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FBBF24",
  },
  specialtiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  specialtyChip: {
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FEF3C7",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceColumn: {
    justifyContent: "center",
  },
  priceLabel: {
    fontSize: 10.5,
    color: "#C4B5FD",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FDE68A",
    marginTop: 1,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F59E0B",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaButtonText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#1A0B2E",
    letterSpacing: 0.2,
  },
});
