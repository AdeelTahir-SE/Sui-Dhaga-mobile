import { Text, View } from "react-native";
import { Image, type ImageSource } from "expo-image";

type PreviewCardProps = {
  image: ImageSource;
  title: string;
  subtitle: string;
};

export function PreviewCard({ image, title, subtitle }: PreviewCardProps) {
  return (
    <View className="w-[31%]">
      <Image
        source={image}
        contentFit="cover"
        style={{
          height: 88,
          width: "100%",
          borderRadius: 8,
          backgroundColor: "#F7F8FA",
        }}
      />
      <Text className="mt-2 text-[11px] font-medium text-brand-dark">
        {title}
      </Text>
      <Text className="text-[10px] text-brand-gray">{subtitle}</Text>
    </View>
  );
}
