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
import { ButtonTexture } from "../../../components/ui/ButtonTexture";
import { isVideoMedia } from "../components/CommunityMediaCarousel";
import { communityApi } from "../../../api/community.api";

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

export type PostMediaItem = {
  uri: string;
  type: "image" | "video";
};

export default function CreatePostScreen() {
  const [selectedMedia, setSelectedMedia] = useState<PostMediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Lehenga");
  const [caption, setCaption] = useState("");
  const [tailorTag, setTailorTag] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([
    "#CustomFit",
    "#BridalWear",
  ]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        selectionLimit: 5 - selectedMedia.length,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newItems: PostMediaItem[] = result.assets
          .filter((a) => Boolean(a.uri))
          .map((a) => {
            const isVid = a.type === "video" || isVideoMedia(a.uri);
            return {
              uri: a.uri,
              type: isVid ? "video" : "image",
            };
          });

        setSelectedMedia((prev) => [...prev, ...newItems].slice(0, 5));
      }
    } catch {
      Alert.alert(
        "Permission Error",
        "Could not open media library. Please check app permissions."
      );
    }
  };

  const handleCaptureMedia = async (mode: "photo" | "video" = "photo") => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required to capture photos or videos."
        );
        return;
      }

      if (mode === "video") {
        const micPerm = await (ImagePicker as any).requestMicrophonePermissionsAsync?.();
        if (micPerm && !micPerm.granted) {
          Alert.alert(
            "Microphone Permission",
            "Microphone permission is required to record video reels."
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: mode === "video" ? ["videos"] : ["images"],
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const asset = result.assets[0];
        const isVid = mode === "video" || asset.type === "video" || isVideoMedia(asset.uri);
        const mediaType: "video" | "image" = isVid ? "video" : "image";
        setSelectedMedia((prev) => [
          ...prev,
          { uri: asset.uri, type: mediaType },
        ].slice(0, 5));
      }
    } catch {
      Alert.alert("Camera Error", "Could not launch camera.");
    }
  };

  const promptCameraOptions = () => {
    Alert.alert("Capture Media", "Take a photo or record a video reel for your post", [
      { text: "Take Photo 📸", onPress: () => handleCaptureMedia("photo") },
      { text: "Record Reel 🎬", onPress: () => handleCaptureMedia("video") },
      { text: "Cancel", style: "cancel" },
    ]);
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
    if (!caption.trim() && selectedMedia.length === 0) {
      Alert.alert(
        "Incomplete Post",
        "Please add at least one photo, reel, or write a caption to share."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("category", selectedCategory);
      formData.append("content", caption.trim() || `${selectedCategory} design`);
      formData.append("title", selectedCategory);

      if (activeTags.length > 0) {
        formData.append("tags", activeTags.join(","));
      }

      selectedMedia.forEach((item, index) => {
        const isVid = item.type === "video";
        const filename =
          item.uri.split("/").pop() ||
          `post_${Date.now()}_${index}.${isVid ? "mp4" : "jpg"}`;
        const match = /\.(\w+)$/.exec(filename);
        let ext = match ? match[1].toLowerCase() : (isVid ? "mp4" : "jpg");
        if (isVid && !["mp4", "mov", "webm", "m4v"].includes(ext)) {
          ext = "mp4";
        }
        const mimeType = isVid
          ? ext === "mov"
            ? "video/quicktime"
            : "video/mp4"
          : `image/${ext === "jpg" ? "jpeg" : ext}`;

        formData.append("images", {
          uri: Platform.OS === "ios" ? item.uri.replace("file://", "") : item.uri,
          name: filename,
          type: mimeType,
        } as any);
      });

      const res = await communityApi.createPost(formData);

      if (res.success || res.data) {
        Alert.alert(
          "Post Published! ✨",
          "Your outfit post has been shared to the Sui Dhaga community.",
          [
            {
              text: "View Community",
              onPress: () => router.replace("/community" as any),
            },
          ]
        );
      } else {
        throw new Error(res.error || "Failed to publish post");
      }
    } catch (err: any) {
      Alert.alert(
        "Publication Failed",
        err?.message || "Could not publish your post. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MccScreenShell
      header={
        <MccHeader
          title="Create Post"
          showBack
          titleClassName="text-[22px] font-bold text-brand-dark"
        />
      }
    >
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
                Public Post
              </Text>
            </View>
          </View>

          {/* Upload Media Section (Photos & Reels) */}
          <SectionTitle title="Photos & Reels" />
          {selectedMedia.length === 0 ? (
            <View className="items-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary-50/40 p-6">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="videocam-outline" size={24} color="#14919B" />
              </View>
              <Text className="mt-2.5 text-[14px] font-semibold text-brand-dark">
                Upload Photos or Reels
              </Text>
              <Text className="mt-1 text-center text-[11px] leading-4 text-brand-gray">
                Add up to 5 photos or video reels to showcase your stitched look and fabrics.
              </Text>

              <View className="mt-4 flex-row gap-3">
                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  activeOpacity={0.8}
                  className="flex-row items-center rounded-xl bg-primary px-4 py-2.5 shadow-sm shadow-primary/20"
                >
                  <Ionicons name="images-outline" size={16} color="#FFFFFF" />
                  <Text className="ml-2 text-[12px] font-semibold text-white">
                    Choose Media
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={promptCameraOptions}
                  activeOpacity={0.8}
                  className="flex-row items-center rounded-xl border border-primary bg-white px-4 py-2.5"
                >
                  <Ionicons name="camera-outline" size={16} color="#14919B" />
                  <Text className="ml-2 text-[12px] font-semibold text-primary">
                    Camera / Reel
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
                  {selectedMedia.map((item, index) => {
                    const isVid = item.type === "video";
                    return (
                      <View
                        key={`${item.uri}-${index}`}
                        className="relative h-28 w-28 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface"
                      >
                        <Image
                          source={{ uri: item.uri }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />

                        {/* Video overlay indicator */}
                        {isVid && (
                          <View
                            pointerEvents="none"
                            className="absolute inset-0 items-center justify-center bg-black/25"
                          >
                            <Ionicons
                              name="play-circle"
                              size={30}
                              color="#FFFFFF"
                            />
                            <View className="absolute bottom-1.5 left-1.5 flex-row items-center rounded-full bg-black/60 px-1.5 py-0.5">
                              <Ionicons name="film-outline" size={10} color="#FFFFFF" />
                              <Text className="ml-1 text-[8.5px] font-bold text-white">
                                Reel
                              </Text>
                            </View>
                          </View>
                        )}

                        {index === 0 && (
                          <View className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5">
                            <Text className="text-[9px] font-bold text-white">
                              Cover
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity
                          onPress={() =>
                            setSelectedMedia(
                              selectedMedia.filter((_, i) => i !== index)
                            )
                          }
                          className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-black/70"
                        >
                          <Ionicons name="close" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  {selectedMedia.length < 5 && (
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
                        ({selectedMedia.length}/5)
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

          {/* Share Button with Bespoke Tailor Texture */}
          <TouchableOpacity
            onPress={handlePost}
            disabled={isSubmitting}
            activeOpacity={0.85}
            className={`relative mt-6 h-[54px] flex-row items-center justify-center rounded-2xl overflow-hidden bg-primary shadow-md shadow-primary/30 ${
              isSubmitting ? "opacity-60" : ""
            }`}
            style={{ borderRadius: 16 }}
          >
            <ButtonTexture variant="greenish" borderRadius={16} />
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View className="z-10 flex-row items-center justify-center">
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text
                  className="ml-2 text-[15px] font-bold tracking-wide text-white"
                  style={{
                    textShadowColor: "rgba(0,0,0,0.22)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Share to Community
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </MccScreenShell>
  );
}
