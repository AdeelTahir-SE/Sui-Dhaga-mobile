import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MainTailorCard } from "../components/MainTailorCard";
import { useTailors } from "../../tailors/hooks/useTailors";

export default function MainTailorsScreen() {
  const { tailors, isLoading, isRefreshing, refresh } = useTailors();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Nearest / Distance Filter Options State
  const [isNearbyModalVisible, setIsNearbyModalVisible] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);

  const radiusOptions = [
    { label: "All Distances", value: null, desc: "Show tailors anywhere", icon: "globe-outline" },
    { label: "Within 2 km", value: 2, desc: "Walking / immediate vicinity", icon: "walk-outline" },
    { label: "Within 5 km", value: 5, desc: "Short drive in your area", icon: "bicycle-outline" },
    { label: "Within 10 km", value: 10, desc: "Across your district", icon: "car-outline" },
    { label: "Within 25 km", value: 25, desc: "Citywide radius", icon: "navigate-outline" },
  ];

  const filterOptions = ["Near Me", "Rating 4+", "Verified"];

  // Helper to parse numeric distance in km from tailor distance string
  const parseDistanceKm = (distStr?: string | null): number => {
    if (!distStr) return 999;
    const lower = distStr.toLowerCase().trim();
    if (lower.includes("nearby")) return 1.2;
    const match = lower.match(/([0-9.]+)\s*(km|m)?/);
    if (match) {
      let num = parseFloat(match[1]);
      if (match[2] === "m") num = num / 1000;
      return isNaN(num) ? 999 : num;
    }
    return 999;
  };

  const filteredTailors = useMemo(() => {
    let result = [...tailors];

    // 1. Text Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const name = (t.shopName || t.businessName || t.name || "").toLowerCase();
        const specialty = (
          (Array.isArray(t.specialties) ? t.specialties.join(" ") : "") ||
          t.specialty ||
          ""
        ).toLowerCase();
        const locationStr =
          t.city ||
          (typeof t.location === "object"
            ? `${t.location?.address || ""} ${t.location?.city || ""}`
            : t.address || t.distance || "");
        return (
          name.includes(q) ||
          specialty.includes(q) ||
          locationStr.toLowerCase().includes(q)
        );
      });
    }

    // 2. Distance Radius Filter
    if (selectedRadius !== null) {
      result = result.filter((t) => parseDistanceKm(t.distance) <= selectedRadius);
    }

    // 3. Quick filter chips
    if (activeFilter === "Rating 4+") {
      result = result.filter((t) => (Number(t.rating) || 0) >= 4);
    } else if (activeFilter === "Verified") {
      result = result.filter(
        (t) => t.isVerified || t.verified || t.topRated || t.isTopRated
      );
    } else if (activeFilter === "Near Me") {
      result = result.filter(
        (t) =>
          parseDistanceKm(t.distance) <= 10 ||
          (t.distance || "").toLowerCase().includes("km") ||
          (t.distance || "").toLowerCase().includes("nearby")
      );
    }

    // Sort by nearest distance
    result.sort((a, b) => parseDistanceKm(a.distance) - parseDistanceKm(b.distance));

    return result;
  }, [tailors, searchQuery, activeFilter, selectedRadius]);

  const getTone = (index: number) => {
    const tones: ("coral" | "blue" | "gold" | "teal")[] = [
      "coral",
      "blue",
      "gold",
      "teal",
    ];
    return tones[index % tones.length];
  };

  const handleFilterToggle = (filter: string) => {
    if (filter === "Near Me") {
      if (activeFilter === "Near Me") {
        setActiveFilter(null);
        setSelectedRadius(null);
      } else {
        setActiveFilter("Near Me");
        setSelectedRadius(5); // Default to 5 km when Near Me is tapped
        setIsNearbyModalVisible(true);
      }
    } else {
      setActiveFilter((prev) => (prev === filter ? null : filter));
    }
  };

  const hasActiveNearbyFilters = selectedRadius !== null;

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveFilter(null);
    setSelectedRadius(null);
  };

  return (
    <CustomerTabShell
      bottomTabs={<CustomerTabsPreview active="Tailors" />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor="#14919B"
          colors={["#14919B"]}
        />
      }
    >
      <CustomerHeader title="Find Tailors" subtitle="Explore bespoke master tailors" />
      <View className="flex-1 px-5 pb-6">
        {/* Search Bar & Upgraded Dedicated Filter Button */}
        <View className="flex-row items-center gap-2.5">
          <View className="h-[48px] flex-1 flex-row items-center rounded-xl border border-brand-border px-3.5 bg-white shadow-xs">
            <Ionicons name="search" size={18} color="#00949D" />
            <TextInput
              className="ml-2.5 flex-1 text-[13px] font-medium text-brand-dark"
              placeholder="Search by name, specialty, location..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="p-1"
              >
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Dedicated Upgraded Filter Button */}
          <TouchableOpacity
            onPress={() => setIsNearbyModalVisible(true)}
            activeOpacity={0.8}
            className={`h-[48px] px-3.5 flex-row items-center justify-center rounded-xl border shadow-xs ${
              selectedRadius !== null
                ? "bg-[#00949D] border-[#00949D]"
                : "bg-white border-brand-border"
            }`}
          >
            <Ionicons
              name={selectedRadius !== null ? "funnel" : "funnel-outline"}
              size={17}
              color={selectedRadius !== null ? "#FFFFFF" : "#00949D"}
            />
            <Text
              className={`ml-1.5 text-[12px] font-bold ${
                selectedRadius !== null ? "text-white" : "text-brand-dark"
              }`}
            >
              {selectedRadius !== null ? `< ${selectedRadius}km` : "Filter"}
            </Text>
            {selectedRadius !== null && (
              <View className="ml-1.5 h-1.5 w-1.5 rounded-full bg-white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Chips Row */}
        <View className="my-3 flex-row flex-wrap gap-2">
          {filterOptions.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.7}
                onPress={() => handleFilterToggle(filter)}
                className={`flex-row items-center rounded-lg border px-3 py-2 ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-brand-border bg-white"
                }`}
              >
                {filter === "Near Me" ? (
                  <Ionicons
                    name="location-sharp"
                    size={13}
                    color={isSelected ? "#00949D" : "#6F767E"}
                    style={{ marginRight: 4 }}
                  />
                ) : null}
                <Text
                  className={`text-[11px] font-bold ${
                    isSelected ? "text-primary" : "text-brand-dark"
                  }`}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Active Radius Tag if set */}
          {selectedRadius !== null ? (
            <TouchableOpacity
              onPress={() => setIsNearbyModalVisible(true)}
              className="flex-row items-center rounded-lg border border-[#00949D] bg-[#00949D]/10 px-2.5 py-1.5"
            >
              <Ionicons name="navigate" size={12} color="#00949D" />
              <Text className="ml-1 text-[11px] font-bold text-[#00949D]">
                &lt; {selectedRadius} km
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedRadius(null)}
                className="ml-1.5"
              >
                <Ionicons name="close" size={13} color="#00949D" />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Modal: Nearest Tailor Distance Filter */}
        <Modal
          visible={isNearbyModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsNearbyModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-2xl max-h-[85%]">
              {/* Header */}
              <View className="flex-row items-center justify-between border-b border-brand-border pb-3.5">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-[#00949D]/10 mr-2.5">
                    <Ionicons name="location" size={20} color="#00949D" />
                  </View>
                  <View>
                    <Text className="text-[17px] font-extrabold text-brand-dark">
                      Distance Filter
                    </Text>
                    <Text className="text-[12px] font-medium text-brand-gray">
                      Find tailors near your current location
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsNearbyModalVisible(false)}
                  className="h-8 w-8 items-center justify-center rounded-full bg-brand-surface"
                >
                  <Ionicons name="close" size={18} color="#1A1D1F" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
                {/* Distance Radius Options */}
                <Text className="text-[13px] font-bold uppercase tracking-wider text-brand-gray mb-3">
                  Select Radius
                </Text>

                <View className="gap-2.5 mb-5">
                  {radiusOptions.map((opt) => {
                    const isSelected = selectedRadius === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() => setSelectedRadius(opt.value)}
                        activeOpacity={0.7}
                        className={`flex-row items-center rounded-2xl border p-3.5 ${
                          isSelected
                            ? "border-[#00949D] bg-[#00949D]/10"
                            : "border-brand-border bg-white"
                        }`}
                      >
                        <View
                          className={`h-10 w-10 items-center justify-center rounded-xl mr-3 ${
                            isSelected ? "bg-[#00949D]" : "bg-brand-surface"
                          }`}
                        >
                          <Ionicons
                            name={opt.icon as any}
                            size={20}
                            color={isSelected ? "#FFFFFF" : "#6F767E"}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`text-[14px] font-bold ${
                              isSelected ? "text-[#00949D]" : "text-brand-dark"
                            }`}
                          >
                            {opt.label}
                          </Text>
                          <Text className="text-[12px] text-brand-gray mt-0.5">
                            {opt.desc}
                          </Text>
                        </View>
                        <View
                          className={`h-5 w-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? "border-[#00949D] bg-[#00949D]"
                              : "border-brand-border bg-white"
                          }`}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* View on Map Shortcut */}
                <TouchableOpacity
                  onPress={() => {
                    setIsNearbyModalVisible(false);
                    router.push("/tailors/map" as any);
                  }}
                  activeOpacity={0.8}
                  className="mb-4 flex-row items-center justify-center rounded-xl border border-[#00949D]/30 bg-[#00949D]/5 py-3"
                >
                  <Ionicons name="map-outline" size={17} color="#00949D" />
                  <Text className="ml-2 text-[13px] font-bold text-[#00949D]">
                    View Tailors on Interactive Map →
                  </Text>
                </TouchableOpacity>

                {/* Bottom Action Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedRadius(null);
                      setActiveFilter(null);
                    }}
                    className="h-[48px] flex-1 items-center justify-center rounded-xl border border-brand-border bg-white"
                  >
                    <Text className="text-[13px] font-bold text-brand-gray">
                      Reset
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setIsNearbyModalVisible(false);
                      if (selectedRadius !== null) {
                        setActiveFilter("Near Me");
                      }
                    }}
                    className="h-[48px] flex-[2] items-center justify-center rounded-xl bg-[#00949D] shadow-sm active:opacity-90"
                  >
                    <Text className="text-[14px] font-bold text-white">
                      Show Results ({filteredTailors.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Content States */}
        {isLoading && !isRefreshing ? (
          <View className="flex-1 items-center justify-center py-20" style={{ minHeight: 380 }}>
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] font-medium text-brand-gray">
              Loading tailors...
            </Text>
          </View>
        ) : filteredTailors.length === 0 ? (
          <View
            className="flex-1 items-center justify-center py-12 px-4"
            style={{ minHeight: 420 }}
          >
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons name="person-outline" size={38} color="#14919B" />
            </View>
            <Text className="text-[18px] font-bold text-brand-dark text-center tracking-tight">
              No Tailors Found
            </Text>
            <Text className="mt-2 text-[13px] font-medium text-brand-gray text-center leading-[20px] max-w-[280px] mb-6">
              {searchQuery.trim() || activeFilter
                ? `We couldn't find any tailors matching your search criteria. Try adjusting your search or clearing filters.`
                : "No tailors are available right now. Please check back later!"}
            </Text>
            {searchQuery.trim() || activeFilter ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery("");
                  setActiveFilter(null);
                }}
                className="h-[48px] px-6 rounded-md bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
              >
                <Text className="text-[13px] font-bold text-white tracking-wide">
                  Clear Filters
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          filteredTailors.map((tailor, index) => (
            <MainTailorCard
              key={tailor.id || index}
              id={tailor.id}
              name={tailor.shopName || tailor.businessName || tailor.name || "Tailor Studio"}
              rating={
                tailor.rating
                  ? `${Number(tailor.rating).toFixed(1)} (${tailor.reviewsCount ?? tailor.reviews ?? 0} reviews)`
                  : "New (0 reviews)"
              }
              distance={
                tailor.city ||
                (typeof tailor.location === "object" ? tailor.location?.city : null) ||
                tailor.address ||
                tailor.distance ||
                "Nearby"
              }
              specialty={
                Array.isArray(tailor.specialties) && tailor.specialties.length > 0
                  ? tailor.specialties.join(", ")
                  : tailor.specialty || "Custom Tailoring"
              }
              price={
                tailor.startingPrice && Number(tailor.startingPrice) > 0
                  ? `Rs. ${Number(tailor.startingPrice).toLocaleString()}`
                  : tailor.services?.[0]?.price
                  ? `Rs. ${Number(tailor.services[0].price).toLocaleString()}`
                  : "Price on request"
              }
              image={tailor.imageUrl || tailor.image || tailor.avatar}
              topRated={tailor.topRated || tailor.isTopRated}
              tone={getTone(index)}
            />
          ))
        )}
      </View>
    </CustomerTabShell>
  );
}
