import { Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { PreviewCard } from "./PreviewCard";
import { PrimaryButton } from "./PrimaryButton";
import { PromptBox } from "./PromptBox";
import { ScreenShell } from "./ScreenShell";
import { SectionTitle } from "./SectionTitle";
import { SelectField } from "./SelectField";
import { StudioHeader } from "./StudioHeader";
import { StyleChips } from "./StyleChips";
import { Swatches } from "./Swatches";

type DesignToolScreenProps = {
  title: string;
  uploadTitle?: string;
  uploadedImage?: ImageSource;
  changeLabel?: string;
  promptLabel: string;
  promptValue: string;
  ctaLabel: string;
  previewImages: ImageSource[];
};

export function DesignToolScreen({
  title,
  uploadTitle,
  uploadedImage,
  changeLabel,
  promptLabel,
  promptValue,
  ctaLabel,
  previewImages,
}: DesignToolScreenProps) {
  return (
    <ScreenShell>
      <StudioHeader title={title} />
      <View className="px-5">
        {uploadTitle && uploadedImage && changeLabel ? (
          <View className="mb-5">
            <Text className="mb-3 text-[13px] font-semibold text-brand-dark">
              {uploadTitle}
            </Text>
            <View className="overflow-hidden rounded-xl border border-brand-border bg-white p-3">
              <View>
                <Image
                  source={uploadedImage}
                  contentFit="cover"
                  className="h-[166px] w-full rounded-lg bg-brand-surface"
                />
                <TouchableOpacity className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Ionicons name="close" size={18} color="#6F767E" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity className="mt-3 h-[42px] items-center justify-center rounded-lg border border-primary bg-white">
                <Text className="text-[13px] font-medium text-primary">
                  {changeLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <PromptBox
          label={promptLabel}
          value={promptValue}
          count={uploadTitle ? "0/1000" : "0/300"}
        />

        {!uploadTitle ? (
          <SelectField label="Garment Type" value="Anarkali Suit" />
        ) : null}

        <Text className="mb-2 text-[13px] font-semibold text-brand-dark">
          Style
        </Text>
        <StyleChips />

        {!uploadTitle ? (
          <>
            <SelectField label="Occasion" value="Festive" />
            <Text className="mb-3 text-[13px] font-semibold text-brand-dark">
              Color Preference
            </Text>
            <View className="mb-5">
              <Swatches />
            </View>
          </>
        ) : null}

        <PrimaryButton title={ctaLabel} />

        <SectionTitle title="Result Preview" />
        <View className="flex-row justify-between">
          {previewImages.map((image, index) => (
            <PreviewCard
              key={index}
              image={image}
              title={["Anarkali", "Lehenga", "Kurta"][index] ?? "Design"}
              subtitle="AI concept"
            />
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}
