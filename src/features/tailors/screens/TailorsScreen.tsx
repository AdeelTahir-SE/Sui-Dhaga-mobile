import React, { useCallback, useMemo } from "react";
import { RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { SearchAndFilters } from "../components/SearchAndFilters";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorHeader } from "../components/TailorHeader";
import { TailorListCard } from "../components/TailorListCard";
import { TailorScreenShell } from "../components/TailorScreenShell";
import { TailorsListSkeleton } from "../../../components/ui/Skeleton";
import { useTailors } from "../hooks/useTailors";
import { TailorItem } from "../../../types/api";
import { lightHaptic, selectionHaptic } from "../../../utils/haptics";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

const TONES: ("coral" | "blue" | "gold" | "teal")[] = ["coral", "blue", "gold", "teal"];

export default function TailorsScreen() {
  const { tailors, isLoading, isRefreshing, refresh } = useTailors();

  const handleRefresh = useCallback(() => {
    lightHaptic();
    refresh();
  }, [refresh]);

  const renderItem = useCallback(({ item, index }: { item: TailorItem; index: number }) => {
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
      item.city ||
      (typeof item.location === "object" ? item.location?.city : null) ||
      item.address ||
      item.distance ||
      "Nearby";

    const specialtyText =
      Array.isArray(item.specialties) && item.specialties.length > 0
        ? item.specialties.join(", ")
        : item.specialty || "Custom Tailoring";

    const itemPrice =
      item.startingPrice && Number(item.startingPrice) > 0
        ? Number(item.startingPrice)
        : (item as any).starting_price && Number((item as any).starting_price) > 0
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
  }, []);

  const ListHeader = useMemo(() => (
    <View className="mb-2">
      <TailorHeader
        title="Tailors"
        subtitle="Find the perfect tailor for your style"
        rightIcon="map-outline"
        onPressRight={() => router.push("/tailors/map" as any)}
      />
      <View className="px-5 pt-1">
        <SearchAndFilters
          onPressNearMe={() => router.push("/tailors/map" as any)}
          onPressOptions={() => router.push("/tailors/map" as any)}
        />
      </View>
    </View>
  ), []);

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
          No Tailors Found
        </Text>
        <Text className="mt-1.5 text-center text-[13px] text-brand-gray leading-5 max-w-[260px]">
          We couldn&apos;t find any tailors matching your current filter criteria.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            selectionHaptic();
            refresh();
          }}
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
  }, [isLoading, refresh]);

  return (
    <TailorScreenShell bottomTabs={<TailorBottomTabs />} scrollable={false}>
      <FlashList
        data={isLoading ? [] : tailors}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || `tailor-${index}`}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
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
