import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

  const filterOptions = ["Near Me", "Rating 4+", "Verified"];

  const filteredTailors = useMemo(() => {
    let result = tailors;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const name = (t.name || t.businessName || "").toLowerCase();
        const specialty = (
          t.specialty ||
          t.specialties?.join(" ") ||
          ""
        ).toLowerCase();
        const locationStr =
          typeof t.location === "object"
            ? `${t.location?.address || ""} ${t.location?.city || ""}`
            : typeof t.location === "string"
            ? t.location
            : t.distance || "";
        return (
          name.includes(q) ||
          specialty.includes(q) ||
          locationStr.toLowerCase().includes(q)
        );
      });
    }

    if (activeFilter === "Rating 4+") {
      result = result.filter((t) => (t.rating || 0) >= 4);
    } else if (activeFilter === "Verified") {
      result = result.filter(
        (t) => t.isVerified || t.verified || t.topRated || t.isTopRated
      );
    } else if (activeFilter === "Near Me") {
      result = result.filter(
        (t) =>
          (t.distance || "").toLowerCase().includes("km") ||
          (t.distance || "").toLowerCase().includes("nearby")
      );
    }

    return result;
  }, [tailors, searchQuery, activeFilter]);

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
    setActiveFilter((prev) => (prev === filter ? null : filter));
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
      <CustomerHeader title="Find Tailors" subtitle="Jaipur, Rajasthan" />
      <View className="flex-1 px-5 pb-6">
        {/* Search Bar */}
        <View className="h-[48px] flex-row items-center rounded-md border border-brand-border px-4 bg-white">
          <Ionicons name="search" size={17} color="#6F767E" />
          <TextInput
            className="ml-3 flex-1 text-[13px] font-medium text-brand-dark"
            placeholder="Search by name, specialty or location"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="mr-2"
            >
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          <Ionicons name="options-outline" size={18} color="#1A1D1F" />
        </View>

        {/* Filter Chips */}
        <View className="my-4 flex-row gap-2">
          {filterOptions.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.7}
                onPress={() => handleFilterToggle(filter)}
                className={`rounded-md border px-3 py-2 ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-brand-border bg-white"
                }`}
              >
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
        </View>

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
              name={tailor.name || tailor.businessName || "Tailor"}
              rating={`${tailor.rating || 0} (${tailor.reviews || tailor.reviewsCount || 0})`}
              distance={tailor.distance || "Nearby"}
              specialty={
                tailor.specialty ||
                tailor.specialties?.join(", ") ||
                "Bespoke Stitching"
              }
              price={tailor.startingPrice || 1500}
              image={tailor.image || tailor.imageUrl}
              topRated={tailor.topRated || tailor.isTopRated}
              tone={getTone(index)}
            />
          ))
        )}
      </View>
    </CustomerTabShell>
  );
}
