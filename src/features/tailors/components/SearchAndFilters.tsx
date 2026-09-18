import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type SearchAndFiltersProps = {
  onPressOptions?: () => void;
  onPressNearMe?: () => void;
};

export function SearchAndFilters({ onPressOptions, onPressNearMe }: SearchAndFiltersProps) {
  return (
    <>
      <View
        className="h-[48px] flex-row items-center rounded-2xl bg-white px-4 shadow-xs"
        style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
      >
        <Ionicons name="search" size={18} color="#14919B" />
        <Text className="ml-3 flex-1 text-[12px] text-brand-gray">
          Search by name, specialty or location
        </Text>
        <TouchableOpacity
          onPress={onPressOptions || (() => router.push("/tailors" as any))}
          activeOpacity={0.7}
          className="h-8 w-8 items-center justify-center rounded-xl bg-[#F0FAFA]"
          style={{ borderWidth: 1, borderColor: "#BCE3E5" }}
        >
          <Ionicons name="options-outline" size={16} color="#14919B" />
        </TouchableOpacity>
      </View>

      <View className="mt-3 flex-row gap-2">
        {["Filters", "Near Me", "Top Rated", "Available Now"].map((filter) => {
          const isNearMe = filter === "Near Me";
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                if (filter === "Near Me" && onPressNearMe) {
                  onPressNearMe();
                } else if (onPressOptions) {
                  onPressOptions();
                } else {
                  router.push("/tailors" as any);
                }
              }}
              activeOpacity={0.7}
              className="flex-row items-center rounded-xl px-3 py-2"
              style={{
                backgroundColor: isNearMe ? "#F0FAFA" : "#FFFFFF",
                borderWidth: 1,
                borderColor: isNearMe ? "#BCE3E5" : "#E2E8F0",
              }}
            >
              {filter === "Filters" ? (
                <Ionicons
                  name="filter"
                  size={13}
                  color="#14919B"
                  style={{ marginRight: 5 }}
                />
              ) : filter === "Near Me" ? (
                <Ionicons
                  name="location-sharp"
                  size={13}
                  color="#14919B"
                  style={{ marginRight: 4 }}
                />
              ) : null}
              <Text
                className={`text-[11px] font-bold ${
                  isNearMe ? "text-[#14919B]" : "text-brand-dark"
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
