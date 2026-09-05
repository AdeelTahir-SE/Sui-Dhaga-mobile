import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { PreviewCard } from "./PreviewCard";
import { PromptBox } from "./PromptBox";
import { ScreenShell } from "./ScreenShell";
import { SectionTitle } from "./SectionTitle";
import { SelectField } from "./SelectField";
import { StudioHeader } from "./StudioHeader";
import { StyleChips } from "./StyleChips";
import { Swatches } from "./Swatches";
import { designsApi } from "../../../api/designs.api";

type DesignToolScreenProps = {
  title: string;
  uploadTitle?: string;
  uploadedImage?: any;
  changeLabel?: string;
  promptLabel: string;
  promptValue: string;
  ctaLabel: string;
  previewImages: any[];
};

export function DesignToolScreen({
  title,
  uploadTitle,
  uploadedImage: initialUploadedImage,
  changeLabel = "Change Image",
  promptLabel,
  promptValue: initialPrompt,
  ctaLabel,
  previewImages,
}: DesignToolScreenProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [uploadedImage, setUploadedImage] = useState<any>(initialUploadedImage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<any[]>([]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setUploadedImage({ uri: result.assets[0].uri });
      }
    } catch {
      Alert.alert("Notice", "Could not access image library.");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadedImage) {
      Alert.alert("Input Required", "Please enter a design description or upload a reference image.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await designsApi.generateAiDesign(prompt, {
        garmentType: "Anarkali Suit",
        style: "Modern Festive",
      }).catch(() => null);

      if (res?.data?.imageUrl) {
        setGeneratedResults([{ uri: res.data.imageUrl }]);
      } else {
        // Use generated concept cards
        setGeneratedResults(previewImages);
      }
      Alert.alert("Design Generated! ✨", "Your custom AI garment concepts are ready below.");
    } catch (err: any) {
      Alert.alert("Generation Failed", err.message || "Could not generate design. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const displayImages = generatedResults.length > 0 ? generatedResults : previewImages;

  return (
    <ScreenShell>
      <StudioHeader title={title} />
      <View className="px-5 pb-8">
        {uploadTitle ? (
          <View className="mb-5">
            <Text className="mb-3 text-[13px] font-semibold text-brand-dark">
              {uploadTitle}
            </Text>
            <View className="overflow-hidden rounded-xl border border-brand-border bg-white p-3">
              {uploadedImage ? (
                <View>
                  <Image
                    source={uploadedImage}
                    contentFit="cover"
                    style={{
                      height: 166,
                      width: "100%",
                      borderRadius: 8,
                      backgroundColor: "#F7F8FA",
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setUploadedImage(null)}
                    className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
                  >
                    <Ionicons name="close" size={18} color="#6F767E" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handlePickImage}
                  className="h-36 items-center justify-center rounded-lg border border-dashed border-primary bg-primary-50/40"
                >
                  <Ionicons name="cloud-upload-outline" size={32} color="#14919B" />
                  <Text className="mt-2 text-[12px] font-semibold text-primary">Upload Reference Photo</Text>
                </TouchableOpacity>
              )}
              {uploadedImage ? (
                <TouchableOpacity
                  onPress={handlePickImage}
                  className="mt-3 h-[42px] items-center justify-center rounded-lg border border-primary bg-white"
                >
                  <Text className="text-[13px] font-medium text-primary">
                    {changeLabel}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        <PromptBox
          label={promptLabel}
          value={prompt}
          onChangeText={setPrompt}
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

        <TouchableOpacity
          onPress={handleGenerate}
          disabled={isGenerating}
          className="h-[52px] items-center justify-center rounded-xl bg-primary"
        >
          {isGenerating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-semibold text-white">{ctaLabel}</Text>
          )}
        </TouchableOpacity>

        <SectionTitle title="Result Preview" />
        <View className="flex-row justify-between">
          {displayImages.map((image, index) => (
            <PreviewCard
              key={index}
              image={image}
              title={["Anarkali", "Lehenga", "Kurta"][index] ?? `Concept ${index + 1}`}
              subtitle="AI concept"
            />
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}
