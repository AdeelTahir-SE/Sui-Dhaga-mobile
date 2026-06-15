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
        className="h-[88px] w-full rounded-lg bg-brand-surface"
      />
      <Text className="mt-2 text-[11px] font-medium text-brand-dark">
        {title}
      </Text>
      <Text className="text-[10px] text-brand-gray">{subtitle}</Text>
    </View>
  );
}
