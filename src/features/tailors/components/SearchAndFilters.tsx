import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { lightHaptic, selectionHaptic } from "../../../utils/haptics";

export type RadiusOption = number | null;

export const RADIUS_OPTIONS: { label: string; value: RadiusOption }[] = [
  { label: "All", value: null },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "15 km", value: 15 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
];

export type SearchAndFiltersProps = {
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  selectedRadius?: RadiusOption;
  onSelectRadius?: (radius: RadiusOption) => void;
  topRatedOnly?: boolean;
  onToggleTopRated?: () => void;
  totalFiltered?: number;
  onPressNearMe?: () => void;
  onPressOptions?: () => void;
  onResetFilters?: () => void;
};

export function SearchAndFilters({
  searchQuery = "",
  onSearchChange,
  selectedRadius = null,
  onSelectRadius,
  topRatedOnly = false,
  onToggleTopRated,
  totalFiltered,
  onPressNearMe,
  onPressOptions,
  onResetFilters,
}: SearchAndFiltersProps) {
  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedRadius !== null || topRatedOnly,
  );

  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#14919B" style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search by name, specialty, shop..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              lightHaptic();
              onSearchChange?.("");
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearBtn}
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Map Shortcut Button */}
        <TouchableOpacity
          onPress={onPressNearMe || (() => router.push("/tailors/map" as any))}
          activeOpacity={0.7}
          style={styles.mapBtn}
          accessibilityLabel="Open Map View"
        >
          <Ionicons name="map-outline" size={16} color="#14919B" />
        </TouchableOpacity>
      </View>

      {/* Filter Row: Radius Selector & Quick Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {/* Radius label badge */}
          <View style={styles.radiusHeader}>
            <Ionicons name="navigate-circle" size={14} color="#14919B" />
            <Text style={styles.radiusHeaderTitle}>Radius:</Text>
          </View>

          {/* Radius Options */}
          {RADIUS_OPTIONS.map((opt) => {
            const isSelected = selectedRadius === opt.value;
            return (
              <TouchableOpacity
                key={opt.label}
                activeOpacity={0.75}
                onPress={() => {
                  selectionHaptic();
                  onSelectRadius?.(opt.value);
                }}
                style={[
                  styles.filterPill,
                  isSelected ? styles.filterPillActive : styles.filterPillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected ? styles.filterPillTextActive : styles.filterPillTextInactive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.divider} />

          {/* Top Rated Pill */}
          {onToggleTopRated && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                selectionHaptic();
                onToggleTopRated();
              }}
              style={[
                styles.filterPill,
                topRatedOnly ? styles.filterPillActive : styles.filterPillInactive,
              ]}
            >
              <Ionicons
                name="star"
                size={12}
                color={topRatedOnly ? "#FFFFFF" : "#F59E0B"}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.filterPillText,
                  topRatedOnly ? styles.filterPillTextActive : styles.filterPillTextInactive,
                ]}
              >
                Top Rated
              </Text>
            </TouchableOpacity>
          )}

          {/* Map Near Me Pill */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onPressNearMe || (() => router.push("/tailors/map" as any))}
            style={[styles.filterPill, styles.filterPillInactive]}
          >
            <Ionicons
              name="location"
              size={12}
              color="#14919B"
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.filterPillText, styles.filterPillTextInactive]}>
              Near Me Map
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Active Filter Summary Bar (if filters or search are active) */}
      {hasActiveFilters && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {selectedRadius !== null ? `Within ${selectedRadius} km` : "All areas"}
            {searchQuery.trim() ? ` • "${searchQuery.trim()}"` : ""}
            {topRatedOnly ? ` • Top Rated` : ""}
            {typeof totalFiltered === "number" ? ` (${totalFiltered} found)` : ""}
          </Text>
          {onResetFilters && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                lightHaptic();
                onResetFilters();
              }}
              style={styles.summaryResetBtn}
            >
              <Text style={styles.summaryResetText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  searchBox: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 13,
    color: "#1A1D1F",
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
    marginRight: 6,
  },
  mapBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0FAFA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BCE3E5",
  },
  filtersWrapper: {
    marginTop: 10,
  },
  filterScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 12,
  },
  radiusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginRight: 2,
  },
  radiusHeaderTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#4B5563",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: "#14919B",
    borderColor: "#14919B",
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  filterPillInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  filterPillTextInactive: {
    color: "#374151",
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 3,
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FAFA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#CCEBEB",
  },
  summaryText: {
    fontSize: 11.5,
    color: "#0E7490",
    fontWeight: "600",
    flex: 1,
  },
  summaryResetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BCE3E5",
  },
  summaryResetText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#14919B",
  },
});
