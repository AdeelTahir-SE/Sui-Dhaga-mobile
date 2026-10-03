import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type RatingLineProps = {
  rating: string;
  distance?: string;
  reviews?: string;
};

export function RatingLine({ rating, distance, reviews }: RatingLineProps) {
  // Extract number and possible review count from rating string (e.g. "4.8 (12)")
  let displayRating = rating;
  let reviewsText = reviews;

  if (typeof rating === "string") {
    const match = rating.match(/([0-9.]+)/);
    if (match) {
      displayRating = match[1];
    }
    const reviewMatch = rating.match(/\(([^)]+)\)/);
    if (reviewMatch && !reviewsText) {
      const inner = reviewMatch[1].trim();
      reviewsText = inner.toLowerCase().includes("review") ? inner : `${inner} reviews`;
    }
  }

  return (
    <View className="mt-1.5 flex-row items-center flex-wrap gap-1.5">
      <View className="flex-row items-center rounded-md bg-[#FEF3C7] px-1.5 py-0.5 gap-1">
        <Ionicons name="star" size={11} color="#F59E0B" />
        <Text className="text-[11.5px] font-extrabold text-[#B45309]">
          {displayRating}
        </Text>
      </View>
      {reviewsText ? (
        <Text className="text-[11px] font-medium text-brand-gray">
          ({reviewsText})
        </Text>
      ) : null}
      {distance ? (
        <>
          <Text className="text-[11px] text-[#CBD5E1]">•</Text>
          <View className="flex-row items-center gap-0.5">
            <Ionicons name="location-sharp" size={11} color="#078B87" />
            <Text className="text-[11px] font-semibold text-[#475569]">
              {distance}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}
