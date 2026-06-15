import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function SearchAndFilters() {
  return (
    <>
      <View className="h-[48px] flex-row items-center rounded-xl border border-brand-border bg-white px-4">
        <Ionicons name="search" size={18} color="#1A1D1F" />
        <Text className="ml-3 flex-1 text-[12px] text-brand-gray">
          Search by name, specialty or location
        </Text>
        <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-surface">
          <Ionicons name="options-outline" size={18} color="#1A1D1F" />
        </View>
      </View>

      <View className="mt-3 flex-row gap-2">
        {["Filters", "Near Me", "Top Rated", "Available Now"].map((filter) => (
          <View
            key={filter}
            className="flex-row items-center rounded-lg border border-brand-border px-3 py-2"
          >
            {filter === "Filters" ? (
              <Ionicons
                name="filter"
                size={13}
                color="#1A1D1F"
                style={{ marginRight: 5 }}
              />
            ) : null}
            <Text className="text-[11px] font-medium text-brand-dark">
              {filter}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}
