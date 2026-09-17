import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { RatingLine } from "../components/RatingLine";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorHeader } from "../components/TailorHeader";
import { TailorLeafletMap } from "../components/TailorLeafletMap";
import { TailorPlaceholder } from "../components/TailorPlaceholder";
import { TailorScreenShell } from "../components/TailorScreenShell";
import { useTailorDetails } from "../hooks/useTailors";
import { useAuthStore } from "@/stores/auth.store";
import { conversationsApi } from "@/api/conversations.api";

const profileHeroImage = require("@/assets/illustrations/tailor-discovery/profile-hero.png");
const rekhaImage = require("@/assets/illustrations/customer-tabs/tailors/rekha.png");
const mapImage = require("@/assets/illustrations/tailor-discovery/map/tailors-map.png");

const galleryImages = [
  require("@/assets/illustrations/tailor-discovery/gallery/mint-anarkali.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/gold-saree.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/coral-lehenga.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/teal-sherwani.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/cream-kurta.png"),
];

export default function TailorProfileScreen() {
  const params = useLocalSearchParams<{ tailorId?: string; id?: string }>();
  const tailorId = params.tailorId || params.id || "";
  const { tailor, isLoading } = useTailorDetails(tailorId);
  const currentUser = useAuthStore((state) => state.user);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapZoomLevel, setMapZoomLevel] = useState(1);

  if (isLoading && !tailor) {
    return (
      <TailorScreenShell bottomTabs={<TailorBottomTabs />}>
        <View className="flex-1 items-center justify-center py-20" style={{ minHeight: 520 }}>
          <ActivityIndicator size="large" color="#14919B" />
          <Text className="mt-4 text-[14px] font-medium text-brand-gray">
            Loading tailor profile...
          </Text>
        </View>
      </TailorScreenShell>
    );
  }

  const name = tailor?.shopName || tailor?.businessName || tailor?.name || "Tailor Profile";
  const rating = tailor?.rating ? Number(tailor.rating).toFixed(1) : "New";
  const reviewsCount = `${tailor?.reviewsCount ?? tailor?.reviews ?? 0} reviews`;
  const distance = tailor?.distance || "Nearby";
  const location = tailor?.address
    ? tailor?.city
      ? `${tailor.address}, ${tailor.city}`
      : tailor.address
    : tailor?.city || tailor?.location?.address || "Location not specified";
  const bio = tailor?.bio || "";
  const tags =
    tailor?.specialties && tailor.specialties.length > 0
      ? tailor.specialties
      : tailor?.specialty
        ? [tailor.specialty]
        : [];

  const rawAvatarUri =
    tailor?.avatarUrl ||
    tailor?.avatar ||
    (tailor as any)?.profile?.avatar_url ||
    (tailor as any)?.profile?.avatarUrl ||
    (tailor as any)?.profile?.avatar ||
    (tailor as any)?.user?.avatar_url ||
    (tailor as any)?.user?.avatarUrl ||
    (tailor as any)?.user?.avatar ||
    null;

  const avatarSource = rawAvatarUri
    ? { uri: rawAvatarUri }
    : rekhaImage;

  const rawBannerUri =
    tailor?.bannerUrl ||
    tailor?.banner ||
    (tailor as any)?.shop_banner ||
    (tailor as any)?.shopBanner ||
    null;

  const bannerSource = rawBannerUri
    ? { uri: rawBannerUri }
    : profileHeroImage;


  const cityLower = (tailor?.city || tailor?.address || location || "").toLowerCase();
  let defaultLat = 31.5204;
  let defaultLng = 74.3587;
  if (cityLower.includes("karachi")) {
    defaultLat = 24.8607;
    defaultLng = 67.0011;
  } else if (cityLower.includes("islamabad")) {
    defaultLat = 33.6844;
    defaultLng = 73.0479;
  } else if (cityLower.includes("rawalpindi")) {
    defaultLat = 33.5651;
    defaultLng = 73.0169;
  } else if (cityLower.includes("faisalabad")) {
    defaultLat = 31.4504;
    defaultLng = 73.1350;
  }
  const latitude = Number((tailor as any)?.latitude || (tailor as any)?.lat || defaultLat);
  const longitude = Number((tailor as any)?.longitude || (tailor as any)?.lng || defaultLng);

  const profileUrl = `https://suidhaga.app/tailors/${tailorId || "1"}`;

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${name} | Sui Dhaga`,
        message: `Check out ${name}'s tailor profile on Sui Dhaga: ${profileUrl}\n📍 Location: ${location}\n⭐ Rating: ${rating} (${reviewsCount})`,
        url: profileUrl,
      });
    } catch (error) {
      console.error("Error sharing tailor profile:", error);
    }
  };

  const handleMessageTailor = async () => {
    if (!currentUser) {
      Alert.alert(
        "Sign In Required",
        "Please log in to message this tailor.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Log In",
            onPress: () => router.push("/auth/login" as any),
          },
        ]
      );
      return;
    }

    const targetUserId =
      tailor?.userId ||
      (tailor as any)?.user_id ||
      (tailor as any)?.user?.id ||
      (tailor as any)?.profile?.id ||
      tailor?.id ||
      tailorId;

    if (!targetUserId) {
      router.push("/messages" as any);
      return;
    }

    if (
      currentUser.id &&
      String(currentUser.id).toLowerCase() === String(targetUserId).toLowerCase()
    ) {
      Alert.alert("Note", "This is your own tailor profile.");
      return;
    }

    setIsStartingChat(true);
    const avatarUrl =
      typeof avatarSource === "object" && avatarSource && "uri" in avatarSource
        ? (avatarSource as any).uri
        : typeof avatarSource === "string"
        ? avatarSource
        : "";

    const resolvedTailorId =
      tailor?.userId ||
      (tailor as any)?.user_id ||
      (tailor as any)?.user?.id ||
      tailor?.id ||
      tailorId ||
      targetUserId;

    const personName =
      (tailor as any)?.user?.fullName ||
      (tailor as any)?.user?.full_name ||
      (tailor as any)?.user?.name ||
      (tailor as any)?.profile?.fullName ||
      (tailor as any)?.profile?.full_name ||
      (tailor as any)?.fullName ||
      (tailor as any)?.full_name ||
      tailor?.name ||
      tailor?.shopName ||
      name ||
      "Tailor";

    router.push({
      pathname: "/messages/[conversationId]",
      params: {
        conversationId: "new",
        tailorId: resolvedTailorId,
        clientId: currentUser.id,
        recipientId: resolvedTailorId,
        name: personName,
        avatar: avatarUrl,
      },
    } as any);
  };

  return (
    <TailorScreenShell
      bottomTabs={<TailorBottomTabs />}
      fixedBottomAction={
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleMessageTailor}
            disabled={isStartingChat}
            className="h-[52px] flex-1 flex-row items-center justify-center rounded-xl border border-primary bg-white shadow-xs active:bg-primary-50"
          >
            {isStartingChat ? (
              <ActivityIndicator size="small" color="#14919B" />
            ) : (
              <>
                <Ionicons name="chatbubble-outline" size={19} color="#14919B" />
                <Text className="ml-2 text-[15px] font-bold text-primary">
                  Message
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/booking/${tailorId || "1"}` as never)}
            className="h-[52px] flex-1 flex-row items-center justify-center rounded-xl bg-primary shadow-xs active:bg-primary-600"
          >
            <Ionicons name="calendar-outline" size={19} color="#FFFFFF" />
            <Text className="ml-2 text-[15px] font-bold text-white">
              Book Appointment
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View className="relative">
        <TailorPlaceholder
          image={bannerSource}
          variant="map"
          size="wide"
          tone="cream"
        />
        <View className="absolute left-0 right-0 top-0">
          <TailorHeader
            title=""
            showBack
            rightIcon="share-social-outline"
            onPressRight={handleShare}
            floating
          />
        </View>
      </View>

      <View className="px-5 pb-6">
        <View className="-mt-9 flex-row items-end">
          <TailorPlaceholder image={avatarSource} size="md" tone="coral" />
          <View className="ml-4 flex-1 pb-1">
            <Text className="text-[23px] font-black text-brand-dark leading-[28px]">
              {name}
            </Text>
            <RatingLine rating={rating} reviews={reviewsCount} distance={distance} />
            <Text className="mt-1 text-[13px] font-medium text-brand-gray">
              {location}
            </Text>
          </View>
        </View>

        {tailor?.experienceYears ? (
          <View className="mt-3.5 self-start rounded-lg bg-primary-50 px-3.5 py-1.5">
            <Text className="text-[12.5px] font-bold text-primary">
              ⭐ {tailor.experienceYears} Years of Experience
            </Text>
          </View>
        ) : null}

        {tags.length > 0 ? (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <View
                key={tag}
                className="rounded-lg border border-brand-border bg-white px-3.5 py-2 shadow-xs"
              >
                <Text className="text-[12.5px] font-semibold text-brand-dark">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {bio ? (
          <View className="mt-6">
            <Text className="text-[18px] font-bold text-brand-dark">
              About
            </Text>
            <Text className="mt-2 text-[14px] leading-[22px] font-normal text-brand-dark/85">
              {bio}
            </Text>
          </View>
        ) : null}

        {/* Shop Location Section with interactive Leaflet map preview */}
        <View className="mb-3 mt-6 flex-row items-center">
          <Ionicons name="location-sharp" size={20} color="#14919B" />
          <Text className="ml-1.5 text-[18px] font-bold text-brand-dark">
            Shop Location
          </Text>
        </View>

        <View className="overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 shadow-xs">
          {/* Leaflet Map Preview with 1 single tailor marker */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsMapModalVisible(true)}
            className="relative h-[150px] w-full overflow-hidden rounded-xl bg-[#E6EFF0]"
          >
            <TailorLeafletMap
              latitude={latitude}
              longitude={longitude}
              shopName={name}
              locationText={location}
              height={150}
              zoom={15}
              interactive={false}
            />

            {/* Tap to expand badge overlay */}
            <View className="absolute right-2.5 top-2.5 flex-row items-center rounded-lg bg-white/95 px-2.5 py-1 shadow-sm">
              <Ionicons name="expand-outline" size={13} color="#14919B" />
              <Text className="ml-1.5 text-[11px] font-bold text-brand-dark">
                Tap for Full Screen
              </Text>
            </View>
          </TouchableOpacity>

          {/* Bottom address row & Full Screen action button */}
          <View className="mt-3.5 flex-row items-center justify-between">
            <View className="mr-3 flex-1 flex-row items-center">
              <Ionicons name="location-sharp" size={17} color="#14919B" />
              <Text
                className="ml-1.5 text-[13.5px] font-semibold text-brand-dark"
                numberOfLines={1}
              >
                {location}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsMapModalVisible(true)}
              className="flex-row items-center rounded-lg border border-[#14919B] bg-white px-3.5 py-1.5 shadow-xs active:bg-primary-50"
            >
              <Ionicons name="expand-outline" size={15} color="#14919B" />
              <Text className="ml-1.5 text-[13px] font-bold text-[#14919B]">
                Full Screen
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Full Screen Interactive Leaflet Map Modal */}
      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsMapModalVisible(false)}
      >
        <View className="flex-1 bg-[#F4EFE3]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between border-b border-brand-border bg-white px-5 pb-3.5 pt-12 shadow-xs">
            <View className="flex-1 pr-3">
              <Text className="text-[18px] font-bold text-brand-dark" numberOfLines={1}>
                {name}
              </Text>
              <Text className="mt-0.5 text-[13px] font-medium text-brand-gray" numberOfLines={1}>
                📍 {location}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsMapModalVisible(false)}
              className="h-10 w-10 items-center justify-center rounded-full bg-brand-surface shadow-xs active:bg-gray-200"
            >
              <Ionicons name="close" size={22} color="#1A1D1F" />
            </TouchableOpacity>
          </View>

          {/* Full Interactive Leaflet Map Canvas */}
          <View className="relative flex-1">
            <TailorLeafletMap
              latitude={latitude}
              longitude={longitude}
              shopName={name}
              locationText={location}
              height="100%"
              zoom={16}
              interactive={true}
            />

            {/* Floating Bottom Directions Card */}
            <View className="absolute bottom-8 left-5 right-5 rounded-2xl border border-brand-border bg-white p-4 shadow-xl">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[16px] font-bold text-brand-dark">
                    {name}
                  </Text>
                  <Text className="mt-0.5 text-[13px] text-brand-gray" numberOfLines={2}>
                    {location}
                  </Text>
                  <Text className="mt-1 text-[12px] font-semibold text-primary">
                    ⭐ {rating} ({reviewsCount}) • {distance}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const query = encodeURIComponent(`${name} ${location}`);
                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
                  }}
                  className="flex-row items-center rounded-xl bg-primary px-4 py-3 shadow-sm active:bg-primary-600"
                >
                  <Ionicons name="navigate-outline" size={17} color="#FFFFFF" />
                  <Text className="ml-1.5 text-[13.5px] font-bold text-white">
                    Directions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </TailorScreenShell>
  );
}
