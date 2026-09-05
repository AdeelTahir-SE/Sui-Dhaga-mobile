import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { SectionTitle } from "../components/SectionTitle";

export default function CreatePostScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>(["#Bridal", "#Lehenga", "#CustomFit"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedImages([...selectedImages, result.assets[0].uri]);
      }
    } catch {
      Alert.alert("Permission Error", "Could not open image library. Please check app permissions.");
    }
  };

  const handlePost = async () => {
    if (!caption.trim() && selectedImages.length === 0) {
      Alert.alert("Empty Post", "Please add a photo or caption to share.");
      return;
    }

    setIsSubmitting(true);
    // Simulate backend publication
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Post Published! ✨", "Your outfit post is live in the Sui Dhaga community.", [
        {
          text: "View Feed",
          onPress: () => router.push("/community" as any),
        },
      ]);
    }, 600);
  };

  return (
    <MccScreenShell>
      <MccHeader title="Create Post" showBack rightText="" />
      <View className="px-5 pb-8">
        <SectionTitle title="Upload Images" />
        <View className="flex-row flex-wrap gap-3">
          {selectedImages.map((uri, index) => (
            <View key={uri} className="relative h-24 w-24 overflow-hidden rounded-xl border border-brand-border">
              <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              <TouchableOpacity
                onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-black/60"
              >
                <Ionicons name="close" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={handlePickImage}
            className="h-24 w-24 items-center justify-center rounded-xl border border-dashed border-primary bg-primary-50/50"
          >
            <Ionicons name="camera-outline" size={24} color="#14919B" />
            <Text className="mt-1 text-[10px] font-medium text-primary">Add Photo</Text>
          </TouchableOpacity>
        </View>

        <SectionTitle title="Caption" />
        <View className="rounded-xl border border-brand-border px-4 py-3 bg-white">
          <TextInput
            multiline
            placeholder="Share details about this custom design, fabric, tailor or stitching..."
            placeholderTextColor="#9CA3AF"
            value={caption}
            onChangeText={setCaption}
            maxLength={300}
            className="min-h-[92px] text-[12px] leading-5 text-brand-dark"
            textAlignVertical="top"
          />
          <Text className="self-end text-[10px] text-brand-gray">{caption.length}/300</Text>
        </View>

        <SectionTitle title="Tags" />
        <View className="mb-4 flex-row flex-wrap gap-2">
          {activeTags.map((tag) => (
            <View key={tag} className="rounded-lg border border-[#F05A57] bg-[#FFF0EC] px-3 py-1.5">
              <Text className="text-[11px] font-medium text-[#F05A57]">{tag}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Who can see this?" />
        <View className="mb-6 h-[48px] justify-center rounded-xl border border-brand-border px-4 bg-white">
          <Text className="text-[12px] text-brand-dark">Everyone in Sui Dhaga Community</Text>
        </View>

        <TouchableOpacity
          onPress={handlePost}
          disabled={isSubmitting}
          className="h-[52px] items-center justify-center rounded-xl bg-[#F05A57]"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-semibold text-white">Share Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </MccScreenShell>
  );
}
