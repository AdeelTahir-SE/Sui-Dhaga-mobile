import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";

import {
  RadiusOption,
  SearchAndFilters,
} from "../components/SearchAndFilters";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorHeader } from "../components/TailorHeader";
import { TailorListCard } from "../components/TailorListCard";
import { TailorScreenShell } from "../components/TailorScreenShell";
import { TailorsListSkeleton } from "../../../components/ui/Skeleton";
import { useTailors } from "../hooks/useTailors";
import { TailorItem } from "../../../types/api";
import { lightHaptic, selectionHaptic } from "../../../utils/haptics";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";
import { calculateDistanceKm } from "../../../utils/distance";

const TONES: ("coral" | "blue" | "gold" | "teal")[] = [
  "coral",
  "blue",
  "gold",
  "teal",
];

const DEFAULT_CENTER = { lat: 31.5204, lng: 74.3587 }; // Lahore reference coords
const PAGE_SIZE = 15;

export default function TailorsScreen() {
  // Location state
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRadius, setSelectedRadius] = useState<RadiusOption>(null);
  const [topRatedOnly, setTopRatedOnly] = useState(false);

  // Pagination state (15 at a time)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Debounce search query (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when filter criteria change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, selectedRadius, topRatedOnly]);

  // Request user location on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (isMounted && loc?.coords) {
            setUserCoords({
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
            });
          }
        }
      } catch {
        // Fallback silently to default city center
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const effectiveCoords = useMemo(() => {
    return userCoords || DEFAULT_CENTER;
  }, [userCoords]);

  // Query filters to fetch from database
  const queryFilters = useMemo(() => {
    return {
      search: debouncedSearch || undefined,
      lat: effectiveCoords?.lat,
      lng: effectiveCoords?.lng,
      radius: selectedRadius ?? undefined,
      radiusKm: selectedRadius ?? undefined,
      minRating: topRatedOnly ? 4.5 : undefined,
      limit: 50,
    };
  }, [debouncedSearch, effectiveCoords, selectedRadius, topRatedOnly]);

  const { tailors, isLoading, isRefreshing, refresh } = useTailors(queryFilters);

  // 1. Calculate distances & 2. Filter by radius & 3. Filter by query
  const filteredTailors = useMemo(() => {
    const originLat = effectiveCoords.lat;
    const originLng = effectiveCoords.lng;

    // Attach calculated distance
    const withDistance = tailors.map((t) => {
      let dist = typeof t.distanceKm === "number" ? t.distanceKm : undefined;
      if (
        typeof originLat === "number" &&
        typeof originLng === "number" &&
        typeof t.latitude === "number" &&
        typeof t.longitude === "number"
      ) {
        dist = calculateDistanceKm(
          originLat,
          originLng,
          t.latitude,
          t.longitude,
        );
      }
      return {
        ...t,
        distanceKm: dist,
        distance:
          dist !== undefined ? `${dist.toFixed(1)} km away` : t.distance,
      };
    });

    // Step 1: Filter within X km radius if set by user
    let result = withDistance;
    if (selectedRadius !== null) {
      result = result.filter(
        (t) => typeof t.distanceKm === "number" && t.distanceKm <= selectedRadius,
      );
    }

    // Step 2: Filter by search query (name, specialty, shop, etc.)
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((t) => {
        const shop = (t.shopName || t.businessName || "").toLowerCase();
        const name = (t.name || "").toLowerCase();
        const city = (t.city || "").toLowerCase();
        const address = (t.address || "").toLowerCase();
        const bio = (t.bio || "").toLowerCase();
        const specialties = Array.isArray(t.specialties)
          ? t.specialties.join(" ").toLowerCase()
          : (t.specialty || "").toLowerCase();

        return (
          shop.includes(q) ||
          name.includes(q) ||
          specialties.includes(q) ||
          city.includes(q) ||
          address.includes(q) ||
          bio.includes(q)
        );
      });
    }

    // Optional Step 3: Top rated filter
    if (topRatedOnly) {
      result = result.filter((t) => (t.rating || 0) >= 4.5);
    }

    // Sort by distance (closest first), then rating
    return result.sort((a, b) => {
      const distA = a.distanceKm ?? 999999;
      const distB = b.distanceKm ?? 999999;
      if (distA !== distB) return distA - distB;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [tailors, effectiveCoords, selectedRadius, debouncedSearch, topRatedOnly]);

  // Paginated tailors: only first `visibleCount` displayed (15 at a time)
  const visibleTailors = useMemo(() => {
    return filteredTailors.slice(0, visibleCount);
  }, [filteredTailors, visibleCount]);

  // Load next 15 when user reaches bottom
  const handleEndReached = useCallback(() => {
    if (visibleCount < filteredTailors.length && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((prev) =>
          Math.min(prev + PAGE_SIZE, filteredTailors.length),
        );
        setIsLoadingMore(false);
      }, 300);
    }
  }, [visibleCount, filteredTailors.length, isLoadingMore]);

  const handleRefresh = useCallback(() => {
    lightHaptic();
    refresh();
  }, [refresh]);

  const handleResetFilters = useCallback(() => {
    selectionHaptic();
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedRadius(null);
    setTopRatedOnly(false);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: TailorItem; index: number }) => {
      const tone = TONES[index % TONES.length];
      const imageUri =
        item.avatarUrl ||
        item.avatar ||
        (item as any).profile?.avatar_url ||
        (item as any).user?.avatar_url ||
        item.imageUrl ||
        item.image;

      const shopName =
        item.shopName || item.businessName || item.name || "Tailor Studio";

      const ratingText = item.rating
        ? `${Number(item.rating).toFixed(1)} (${item.reviewsCount ?? item.reviews ?? 0})`
        : "New";

      const locationText =
        item.distance ||
        (item.distanceKm !== undefined ? `${item.distanceKm.toFixed(1)} km away` : null) ||
        item.city ||
        (typeof item.location === "object" ? item.location?.city : null) ||
        item.address ||
        "Nearby";

      const specialtyText =
        Array.isArray(item.specialties) && item.specialties.length > 0
          ? item.specialties.join(", ")
          : item.specialty || "Custom Tailoring";

      const itemPrice =
        item.startingPrice && Number(item.startingPrice) > 0
          ? Number(item.startingPrice)
          : (item as any).starting_price &&
            Number((item as any).starting_price) > 0
          ? Number((item as any).starting_price)
          : (item as any).price && Number((item as any).price) > 0
          ? Number((item as any).price)
          : item.services?.[0]?.price && Number(item.services[0].price) > 0
          ? Number(item.services[0].price)
          : "Pricing on request";

      return (
        <View className="px-5">
          <TailorListCard
            id={item.id}
            image={imageUri}
            name={shopName}
            rating={ratingText}
            distance={locationText}
            specialty={specialtyText}
            topRated={item.topRated || item.isTopRated}
            tone={tone}
            price={itemPrice}
            startingPrice={item.startingPrice}
          />
        </View>
      );
    },
    [],
  );

  const ListHeader = useMemo(
    () => (
      <View className="mb-2">
        <TailorHeader
          title="Tailors"
          subtitle="Find the perfect tailor for your style"
          rightIcon="map-outline"
          onPressRight={() => router.push("/tailors/map" as any)}
        />
        <View className="px-5 pt-1">
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedRadius={selectedRadius}
            onSelectRadius={setSelectedRadius}
            topRatedOnly={topRatedOnly}
            onToggleTopRated={() => setTopRatedOnly((prev) => !prev)}
            totalFiltered={filteredTailors.length}
            onPressNearMe={() => router.push("/tailors/map" as any)}
            onResetFilters={handleResetFilters}
          />
        </View>
      </View>
    ),
    [
      searchQuery,
      selectedRadius,
      topRatedOnly,
      filteredTailors.length,
      handleResetFilters,
    ],
  );

  const ListFooter = useMemo(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoaderWrap}>
          <ActivityIndicator size="small" color="#14919B" />
          <Text style={styles.footerLoaderText}>Loading next 15 tailors...</Text>
        </View>
      );
    }

    if (
      filteredTailors.length > PAGE_SIZE &&
      visibleCount >= filteredTailors.length
    ) {
      return (
        <View style={styles.footerEndWrap}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#9CA3AF" />
          <Text style={styles.footerEndText}>
            All {filteredTailors.length} tailors loaded
          </Text>
        </View>
      );
    }

    return null;
  }, [isLoadingMore, filteredTailors.length, visibleCount]);

  const ListEmpty = useMemo(() => {
    if (isLoading) {
      return (
        <View className="px-5 mt-4">
          <TailorsListSkeleton count={4} />
        </View>
      );
    }

    return (
      <View className="mx-5 my-8 items-center justify-center rounded-2xl border border-brand-border bg-white px-6 py-10 shadow-xs">
        <View className="h-16 w-16 rounded-full bg-primary-light items-center justify-center mb-3">
          <Ionicons name="search" size={26} color="#14919B" />
        </View>
        <Text className="text-center text-[16px] font-bold text-brand-dark">
          {debouncedSearch
            ? "No Tailors Found For Search"
            : selectedRadius !== null
            ? `No Tailors Within ${selectedRadius} km`
            : "No Tailors Found"}
        </Text>
        <Text className="mt-1.5 text-center text-[13px] text-brand-gray leading-5 max-w-[260px]">
          {debouncedSearch
            ? `No tailor matches "${debouncedSearch}". Try a different name, specialty, or clear search.`
            : selectedRadius !== null
            ? `No registered tailors found within ${selectedRadius} km radius. Try increasing the distance radius.`
            : "We couldn't find any tailors matching your current filter criteria."}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleResetFilters}
          className="mt-5 relative overflow-hidden flex-row items-center justify-center py-2.5 px-6 rounded-xl"
          style={{ borderRadius: 12 }}
        >
          <ButtonTexture variant="greenish" borderRadius={12} />
          <Text className="text-[13px] font-bold text-white z-10">
            Reset Filters
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [isLoading, debouncedSearch, selectedRadius, handleResetFilters]);

  return (
    <TailorScreenShell bottomTabs={<TailorBottomTabs />} scrollable={false}>
      <FlashList
        data={isLoading ? [] : visibleTailors}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || `tailor-${index}`}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#14919B"
            colors={["#14919B"]}
          />
        }
      />
    </TailorScreenShell>
  );
}

const styles = StyleSheet.create({
  footerLoaderWrap: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#14919B",
  },
  footerEndWrap: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerEndText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
});
