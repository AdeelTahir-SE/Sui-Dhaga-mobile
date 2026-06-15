import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type RatingLineProps = {
  rating: string;
  distance?: string;
  reviews?: string;
};

export function RatingLine({ rating, distance, reviews }: RatingLineProps) {
  return (
    <View className="mt-1 flex-row items-center">
      <Ionicons name="star" size={13} color="#F4B400" />
      <Text className="ml-1 text-[12px] font-medium text-brand-dark">
        {rating}
      </Text>
      {reviews ? (
        <Text className="ml-1 text-[12px] text-brand-gray">({reviews})</Text>
      ) : null}
      {distance ? (
        <Text className="ml-2 text-[12px] text-brand-gray">• {distance}</Text>
      ) : null}
    </View>
  );
}
