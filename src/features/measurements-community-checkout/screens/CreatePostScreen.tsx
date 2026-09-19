import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { SectionTitle } from "../components/SectionTitle";

const CATEGORIES = [
  "Lehenga",
  "Anarkali",
  "Kurti",
  "Salwar Suit",
  "Blouse",
  "Sherwani",
  "Western Wear",
  "Other",
];

const PRESET_TAGS = [
  "#BridalWear",
  "#CustomFit",
  "#HandEmbroidery",
  "#ZariWork",
  "#FestiveStyle",
  "#LehengaLove",
  "#TailorCraft",
  "#PureSilk",
];

export default function CreatePostScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Lehenga");
  const [caption, setCaption] = useState("");
  const [tailorTag, setTailorTag] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([
    "#CustomFit",
    "#BridalWear",
  ]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [visibility, setVisibility] = useState<"public" | "followers">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 4 - selectedImages.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((a) => a.uri).filter(Boolean);
        setSelectedImages((prev) => [...prev, ...uris].slice(0, 4));
      }
    } catch {
      Alert.alert(
        "Permission Error",
        "Could not open photo library. Please check app permissions."
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required to take photos."
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedImages((prev) => [...prev, result.assets[0].uri].slice(0, 4));
      }
    } catch {
      Alert.alert("Camera Error", "Could not launch camera.");
    }
  };

  const toggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter((t) => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    let clean = customTagInput.trim();
    if (!clean) return;
    if (!clean.startsWith("#")) {
      clean = "#" + clean;
    }
    if (!activeTags.includes(clean)) {
      setActiveTags([...activeTags, clean]);
    }
    setCustomTagInput("");
  };

  const handlePost = async () => {
    if (!caption.trim() && selectedImages.length === 0) {
      Alert.alert(
        "Incomplete Post",
        "Please add at least one photo or write a caption to share."
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Post Published! ✨",
        "Your outfit post has been shared to the Sui Dhaga community.",
        [
          {
            text: "View Community",
            onPress: () => router.push("/community" as any),
          },
        ]
      );
    }, 600);
  };

  return (
    <MccScreenShell header={<MccHeader title="Create Post" showBack />}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-5 pb-12">
          {/* Author info pill */}
          <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-brand-border bg-brand-surface p-3">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                <Ionicons name="person" size={20} color="#14919B" />
              </View>
              <View className="ml-3">
                <Text className="text-[13px] font-bold text-brand-dark">
                  Posting to Community
                </Text>
                <Text className="text-[11px] text-brand-gray">
                  Share your stitched look & tailor experience
                </Text>
              </View>
            </View>
            <View className="flex-row items-center rounded-full border border-primary/20 bg-primary-50 px-2.5 py-1">
              <Ionicons name="globe-outline" size={12} color="#14919B" />
              <Text className="ml-1 text-[10px] font-semibold text-primary">
                {visibility === "public" ? "Public" : "Followers"}
              </Text>
            </View>
          </View>

          {/* Upload Images Section */}
          <SectionTitle title="Outfit Photos" />
          {selectedImages.length === 0 ? (
            <View className="items-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary-50/40 p-6">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="camera" size={24} color="#14919B" />
              </View>
              <Text className="mt-2.5 text-[14px] font-semibold text-brand-dark">
                Upload Outfit Photos
              </Text>
              <Text className="mt-1 text-center text-[11px] leading-4 text-brand-gray">
                Add up to 4 photos to showcase the silhouette, stitching, and fabric.
              </Text>

              <View className="mt-4 flex-row gap-3">
                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  activeOpacity={0.8}
                  className="flex-row items-center rounded-xl bg-primary px-4 py-2.5 shadow-sm shadow-primary/20"
                >
                  <Ionicons name="images-outline" size={16} color="#FFFFFF" />
                  <Text className="ml-2 text-[12px] font-semibold text-white">
                    Choose from Gallery
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                  className="flex-row items-center rounded-xl border border-primary bg-white px-4 py-2.5"
                >
                  <Ionicons name="camera-outline" size={16} color="#14919B" />
                  <Text className="ml-2 text-[12px] font-semibold text-primary">
                    Camera
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5 px-5"
              >
                <View className="flex-row gap-3 py-1">
                  {selectedImages.map((uri, index) => (
                    <View
                      key={uri}
                      className="relative h-28 w-28 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface"
                    >
                      <Image
                        source={{ uri }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                      {index === 0 && (
                        <View className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5">
                          <Text className="text-[9px] font-bold text-white">
                            Cover
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedImages(
                            selectedImages.filter((_, i) => i !== index)
                          )
                        }
                        className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-black/70"
                      >
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {selectedImages.length < 4 && (
                    <TouchableOpacity
                      onPress={handlePickFromGallery}
                      activeOpacity={0.7}
                      className="h-28 w-28 items-center justify-center rounded-2xl border border-dashed border-primary bg-primary-50/50"
                    >
                      <Ionicons name="add" size={26} color="#14919B" />
                      <Text className="mt-1 text-[11px] font-medium text-primary">
                        Add More
                      </Text>
                      <Text className="text-[9px] text-brand-gray">
                        ({selectedImages.length}/4)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Outfit Category */}
          <SectionTitle title="Outfit Category" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-5 px-5 mb-2"
          >
            <View className="flex-row gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.7}
                    className={`rounded-full px-4 py-2 ${
                      isSelected
                        ? "bg-primary shadow-sm shadow-primary/30"
                        : "border border-brand-border bg-white"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-medium ${
                        isSelected ? "text-white" : "text-brand-dark"
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Caption / Story */}
          <SectionTitle title="Design & Stitching Story" />
          <View className="rounded-2xl border border-brand-border bg-white p-3.5 focus-within:border-primary">
            <TextInput
              multiline
              placeholder="Tell the community about this outfit! E.g. Fabric used, silhouette style, fitting details, embroidery craft, tailor tips, or styling inspiration..."
              placeholderTextColor="#9CA3AF"
              value={caption}
              onChangeText={setCaption}
              maxLength={500}
              className="min-h-[100px] text-[13px] leading-5 text-brand-dark"
              textAlignVertical="top"
            />
            <View className="mt-2 flex-row items-center justify-between border-t border-brand-border/60 pt-2">
              <Text className="text-[11px] text-brand-gray">
                Formatting tips: Mention fabric & fitting
              </Text>
              <Text className="text-[11px] font-medium text-brand-gray">
                {caption.length}/500
              </Text>
            </View>
          </View>

          {/* Tag Tailor / Boutique */}
          <SectionTitle title="Tag Tailor or Boutique (Optional)" />
          <View className="flex-row items-center rounded-xl border border-brand-border bg-white px-3.5 py-3">
            <Ionicons name="cut-outline" size={18} color="#14919B" />
            <TextInput
              placeholder="e.g. Rekha Designs, Master Stitchers"
              placeholderTextColor="#9CA3AF"
              value={tailorTag}
              onChangeText={setTailorTag}
              className="ml-2.5 flex-1 text-[13px] text-brand-dark"
            />
          </View>

          {/* Tags */}
          <SectionTitle title="Community Tags" />
          <View className="mb-3 flex-row flex-wrap gap-2">
            {PRESET_TAGS.map((tag) => {
              const isSelected = activeTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                  className={`rounded-lg px-3 py-1.5 ${
                    isSelected
                      ? "border border-primary bg-primary-50"
                      : "border border-brand-border bg-white"
                  }`}
                >
                  <Text
                    className={`text-[11.5px] font-medium ${
                      isSelected ? "text-primary font-semibold" : "text-brand-gray"
                    }`}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Tag Input */}
          <View className="mb-4 flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center rounded-xl border border-brand-border bg-white px-3 py-2">
              <Text className="text-[13px] text-brand-gray">#</Text>
              <TextInput
                placeholder="Add custom hashtag..."
                placeholderTextColor="#9CA3AF"
                value={customTagInput}
                onChangeText={setCustomTagInput}
                onSubmitEditing={handleAddCustomTag}
                className="ml-1 flex-1 text-[12px] text-brand-dark"
              />
            </View>
            <TouchableOpacity
              onPress={handleAddCustomTag}
              className="h-10 items-center justify-center rounded-xl bg-primary-50 px-4 border border-primary/30"
            >
              <Text className="text-[12px] font-semibold text-primary">Add</Text>
            </TouchableOpacity>
          </View>

          {/* Visibility */}
          <SectionTitle title="Who can see this?" />
          <View className="mb-6 flex-row gap-3">
            <TouchableOpacity
              onPress={() => setVisibility("public")}
              activeOpacity={0.8}
              className={`flex-1 rounded-xl p-3.5 border ${
                visibility === "public"
                  ? "border-primary bg-primary-50/40"
                  : "border-brand-border bg-white"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Ionicons
                  name="globe-outline"
                  size={18}
                  color={visibility === "public" ? "#14919B" : "#6F767E"}
                />
                <View
                  className={`h-4 w-4 rounded-full border items-center justify-center ${
                    visibility === "public"
                      ? "border-primary bg-primary"
                      : "border-brand-border"
                  }`}
                >
                  {visibility === "public" && (
                    <View className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </View>
              </View>
              <Text className="mt-2 text-[12px] font-bold text-brand-dark">
                Public Feed
              </Text>
              <Text className="mt-0.5 text-[10px] text-brand-gray">
                Visible to everyone in Sui Dhaga
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVisibility("followers")}
              activeOpacity={0.8}
              className={`flex-1 rounded-xl p-3.5 border ${
                visibility === "followers"
                  ? "border-primary bg-primary-50/40"
                  : "border-brand-border bg-white"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={visibility === "followers" ? "#14919B" : "#6F767E"}
                />
                <View
                  className={`h-4 w-4 rounded-full border items-center justify-center ${
                    visibility === "followers"
                      ? "border-primary bg-primary"
                      : "border-brand-border"
                  }`}
                >
                  {visibility === "followers" && (
                    <View className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </View>
              </View>
              <Text className="mt-2 text-[12px] font-bold text-brand-dark">
                Followers Only
              </Text>
              <Text className="mt-0.5 text-[10px] text-brand-gray">
                Visible only to your followers
              </Text>
            </TouchableOpacity>
          </View>

          {/* Share Button */}
          <TouchableOpacity
            onPress={handlePost}
            disabled={isSubmitting}
            activeOpacity={0.85}
            className="h-[54px] flex-row items-center justify-center rounded-2xl bg-primary shadow-md shadow-primary/30"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text className="ml-2 text-[15px] font-bold text-white">
                  Share to Community
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </MccScreenShell>
  );
}
