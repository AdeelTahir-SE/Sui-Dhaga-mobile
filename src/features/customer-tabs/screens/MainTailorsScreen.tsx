import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
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

import { useTailors } from "../../tailors/hooks/useTailors";
import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MainTailorCard } from "../components/MainTailorCard";

export default function MainTailorsScreen() {
  const { tailors, isLoading, isRefreshing, refresh } = useTailors();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Nearest / Distance Filter Options State
  const [isNearbyModalVisible, setIsNearbyModalVisible] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);

  const radiusOptions = [
    {
      label: "All Distances",
      value: null,
      desc: "Show tailors anywhere in the city",
      icon: "globe-outline",
      badge: "All",
    },
    {
      label: "Within 2 km",
      value: 2,
      desc: "Walking distance • 5-10 min",
      icon: "walk-outline",
      badge: "2 km",
    },
    {
      label: "Within 5 km",
      value: 5,
      desc: "Short drive in your neighborhood",
      icon: "bicycle-outline",
      badge: "5 km",
    },
    {
      label: "Within 10 km",
      value: 10,
      desc: "Across your district & sector",
      icon: "car-outline",
      badge: "10 km",
    },
    {
      label: "Within 25 km",
      value: 25,
      desc: "Citywide coverage",
      icon: "navigate-outline",
      badge: "25 km",
    },
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

  const getTailorCountForRadius = (rad: number | null) => {
    if (rad === null) return tailors.length;
    return tailors.filter((t) => parseDistanceKm(t.distance) <= rad).length;
  };

  const filteredTailors = useMemo(() => {
    let result = [...tailors];

    // 1. Text Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const name = (
          t.shopName ||
          t.businessName ||
          t.name ||
          ""
        ).toLowerCase();
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
      result = result.filter(
        (t) => parseDistanceKm(t.distance) <= selectedRadius,
      );
    }

    // 3. Quick filter chips
    if (activeFilter === "Rating 4+") {
      result = result.filter((t) => (Number(t.rating) || 0) >= 4);
    } else if (activeFilter === "Verified") {
      result = result.filter(
        (t) => t.isVerified || t.verified || t.topRated || t.isTopRated,
      );
    } else if (activeFilter === "Near Me") {
      result = result.filter(
        (t) =>
          parseDistanceKm(t.distance) <= 10 ||
          (t.distance || "").toLowerCase().includes("km") ||
          (t.distance || "").toLowerCase().includes("nearby"),
      );
    }

    // Sort by nearest distance
    result.sort(
      (a, b) => parseDistanceKm(a.distance) - parseDistanceKm(b.distance),
    );

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
      <CustomerHeader
        title="Find Tailors"
        subtitle="Explore bespoke master tailors"
        hideRightIcon={true}
      />
      <View className="flex-1 px-5 pb-6">
        {/* Search Bar & Upgraded Dedicated Filter Button */}
        <View className="flex-row items-center gap-2.5">
          <View
            className="h-[48px] flex-1 flex-row items-center rounded-md px-3.5 bg-white shadow-xs"
            style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
          >
            <Ionicons name="search" size={18} color="#14919B" />
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

          {/* Dedicated Upgraded Distance Filter Button */}
          <TouchableOpacity
            onPress={() => setIsNearbyModalVisible(true)}
            activeOpacity={0.8}
            className="h-[48px] px-3.5 flex-row items-center justify-center rounded-md shadow-xs"
            style={{
              backgroundColor: selectedRadius !== null ? "#14919B" : "#F0FAFA",
              borderWidth: 1,
              borderColor: selectedRadius !== null ? "#14919B" : "#BCE3E5",
            }}
          >
            <Ionicons
              name={selectedRadius !== null ? "funnel" : "funnel-outline"}
              size={16}
              color={selectedRadius !== null ? "#FFFFFF" : "#14919B"}
            />
            <Text
              className={`ml-1.5 text-[12px] font-bold ${
                selectedRadius !== null ? "text-white" : "text-[#14919B]"
              }`}
            >
              {selectedRadius !== null ? `< ${selectedRadius}km` : "Distance"}
            </Text>
            {selectedRadius !== null && (
              <View className="ml-1.5 h-1.5 w-1.5 rounded-full bg-white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Chips Row */}
        <View className="my-3 flex-row flex-wrap items-center gap-2">
          {filterOptions.map((filter) => {
            const isSelected = activeFilter === filter;
            const isNearMe = filter === "Near Me";

            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.7}
                onPress={() => handleFilterToggle(filter)}
                className="flex-row items-center rounded-md px-3 py-2"
                style={{
                  backgroundColor: isSelected
                    ? "#14919B"
                    : isNearMe
                      ? "#F0FAFA"
                      : "#FFFFFF",
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: isNearMe ? "#BCE3E5" : "#E2E8F0",
                }}
              >
                {isNearMe ? (
                  <Ionicons
                    name="location-sharp"
                    size={13}
                    color={isSelected ? "#FFFFFF" : "#14919B"}
                    style={{ marginRight: 4 }}
                  />
                ) : null}
                <Text
                  className={`text-[11px] font-bold ${
                    isSelected
                      ? "text-white"
                      : isNearMe
                        ? "text-[#14919B]"
                        : "text-brand-dark"
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
              className="flex-row items-center rounded-md px-2.5 py-1.5"
              style={{
                backgroundColor: "#E0F7F7",
                borderWidth: 1,
                borderColor: "rgba(20, 145, 155, 0.4)",
              }}
            >
              <Ionicons name="navigate" size={12} color="#14919B" />
              <Text className="ml-1 text-[11px] font-bold text-[#0D7377]">
                &lt; {selectedRadius} km
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedRadius(null)}
                className="ml-1.5 h-4 w-4 rounded-md bg-[#14919B]/20 items-center justify-center"
              >
                <Ionicons name="close" size={10} color="#14919B" />
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
          <View
            className="flex-1 justify-end "
            style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
          >
            <View className="rounded-t-[36px] bg-white px-5 pb-8 pt-3 shadow-2xl max-h-[88%]">
              {/* Drag handle indicator */}
              <View className="h-1.5 w-12 rounded-full bg-slate-200 self-center mb-3 mt-1" />

              {/* Header */}
              <View className="flex-row items-center justify-between pb-3">
                <View className="flex-row items-center flex-1">
                  <View className="h-10 w-10 items-center justify-center rounded-md bg-[#E0F7F7] mr-3">
                    <Ionicons name="location" size={20} color="#14919B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-bold text-brand-dark">
                      Distance Filter
                    </Text>
                    <Text className="text-[12px] font-medium text-brand-gray">
                      Find bespoke tailors near your location
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsNearbyModalVisible(false)}
                  className="h-8 w-8 items-center justify-center rounded-md bg-slate-100 active:bg-slate-200"
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Subtle hairline divider */}
              <View className="h-[1px] bg-slate-100 mb-3.5" />

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Distance Radius Options List */}
                <Text className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Select Radius
                </Text>

                <View className="gap-2.5 mb-4">
                  {radiusOptions.map((opt) => {
                    const isSelected = selectedRadius === opt.value;
                    const count = getTailorCountForRadius(opt.value);
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() => setSelectedRadius(opt.value)}
                        activeOpacity={0.75}
                        className="flex-row items-center rounded-md p-3.5"
                        style={{
                          backgroundColor: isSelected ? "#F0FAFA" : "#FFFFFF",
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? "#14919B" : "#E2E8F0",
                        }}
                      >
                        <View
                          className="h-10 w-10 items-center justify-center rounded-md mr-3"
                          style={{
                            backgroundColor: isSelected ? "#14919B" : "#F0FAFA",
                          }}
                        >
                          <Ionicons
                            name={opt.icon as any}
                            size={20}
                            color={isSelected ? "#FFFFFF" : "#14919B"}
                          />
                        </View>
                        <View className="flex-1 mr-2">
                          <View className="flex-row items-center">
                            <Text
                              className={`text-[14px] font-bold ${
                                isSelected
                                  ? "text-[#14919B]"
                                  : "text-brand-dark"
                              }`}
                            >
                              {opt.label}
                            </Text>
                            <View
                              className="ml-2 px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: isSelected
                                  ? "#E0F7F7"
                                  : "#F1F5F9",
                              }}
                            >
                              <Text
                                className={`text-[10px] font-bold ${
                                  isSelected
                                    ? "text-[#0D7377]"
                                    : "text-slate-500"
                                }`}
                              >
                                {opt.badge}
                              </Text>
                            </View>
                          </View>
                          <Text
                            className={`text-[12px] mt-0.5 ${
                              isSelected ? "text-[#0D7377]" : "text-brand-gray"
                            }`}
                          >
                            {opt.desc}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text
                            className={`mr-2 text-[11px] font-bold ${
                              isSelected ? "text-[#14919B]" : "text-slate-400"
                            }`}
                          >
                            {count} {count === 1 ? "tailor" : "tailors"}
                          </Text>
                          <View
                            className="h-5 w-5 rounded-md items-center justify-center"
                            style={{
                              backgroundColor: isSelected
                                ? "#14919B"
                                : "#FFFFFF",
                              borderWidth: isSelected ? 0 : 1.5,
                              borderColor: "#CBD5E1",
                            }}
                          >
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={13}
                                color="#FFFFFF"
                              />
                            )}
                          </View>
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
                  className="mb-2 flex-row items-center justify-between rounded-md p-3.5 bg-[#F0FAFA]"
                  style={{ borderWidth: 1, borderColor: "#BCE3E5" }}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="h-9 w-9 rounded-md bg-white items-center justify-center shadow-xs mr-3">
                      <Ionicons name="map" size={18} color="#14919B" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[13px] font-bold text-[#0D7377]">
                        View Tailors on Interactive Map
                      </Text>
                      <Text className="text-[11px] text-slate-500">
                        Locate nearby tailors visually on the live map
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#14919B" />
                </TouchableOpacity>
              </ScrollView>

              {/* Fixed Bottom Action Buttons */}
              <View
                className="mt-3.5 pt-3 pb-1 flex flex-row items-center justify-center gap-3 "
                style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0" }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelectedRadius(null);
                    setActiveFilter(null);
                  }}
                  activeOpacity={0.7}
                  className="h-[50px] px-5 flex-1 items-center justify-center rounded-md bg-white shadow-xs"
                  style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
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
                  activeOpacity={0.85}
                  className="h-[50px] flex-1 items-center justify-center rounded-md bg-primary active:bg-primary-dark shadow-sm px-4"
                >
                  <Text className="text-[14px] font-bold text-white">
                    Show Results ({filteredTailors.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Content States */}
        {isLoading && !isRefreshing ? (
          <View
            className="flex-1 items-center justify-center py-20"
            style={{ minHeight: 380 }}
          >
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
              name={
                tailor.shopName ||
                tailor.businessName ||
                tailor.name ||
                "Tailor Studio"
              }
              rating={
                tailor.rating
                  ? `${Number(tailor.rating).toFixed(1)} (${tailor.reviewsCount ?? tailor.reviews ?? 0} reviews)`
                  : "New (0 reviews)"
              }
              distance={
                tailor.city ||
                (typeof tailor.location === "object"
                  ? tailor.location?.city
                  : null) ||
                tailor.address ||
                tailor.distance ||
                "Nearby"
              }
              specialty={
                Array.isArray(tailor.specialties) &&
                tailor.specialties.length > 0
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
