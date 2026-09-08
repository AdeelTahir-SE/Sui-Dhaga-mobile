import React from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { RatingLine } from "../components/RatingLine";
import { TailorBadge } from "../components/TailorBadge";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorHeader } from "../components/TailorHeader";
import { TailorPlaceholder } from "../components/TailorPlaceholder";
import { TailorScreenShell } from "../components/TailorScreenShell";
import { useTailorDetails } from "../hooks/useTailors";
import { useAuthStore } from "@/stores/auth.store";
import { conversationsApi } from "@/api/conversations.api";

const profileHeroImage = require("@/assets/illustrations/tailor-discovery/profile-hero.png");
const rekhaImage = require("@/assets/illustrations/customer-tabs/tailors/rekha.png");

const galleryImages = [
  require("@/assets/illustrations/tailor-discovery/gallery/mint-anarkali.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/gold-saree.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/coral-lehenga.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/teal-sherwani.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/cream-kurta.png"),
];

const serviceImages = [
  require("@/assets/illustrations/tailor-discovery/services/custom-anarkali.png"),
  require("@/assets/illustrations/tailor-discovery/services/bridal-lehenga.png"),
];

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="mb-3 mt-5 flex-row items-center justify-between">
      <Text className="text-[14px] font-semibold text-brand-dark">{title}</Text>
      <Text className="text-[11px] font-semibold text-primary">See All</Text>
    </View>
  );
}

export default function TailorProfileScreen() {
  const params = useLocalSearchParams<{ tailorId?: string; id?: string }>();
  const tailorId = params.tailorId || params.id || "";
  const { tailor, isLoading } = useTailorDetails(tailorId);
  const currentUser = useAuthStore((state) => state.user);
  const [isStartingChat, setIsStartingChat] = React.useState(false);

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

  const avatarSource =
    tailor?.imageUrl || tailor?.image || tailor?.avatar
      ? typeof (tailor.imageUrl || tailor.image || tailor.avatar) === "string"
        ? { uri: tailor.imageUrl || tailor.image || tailor.avatar }
        : tailor.imageUrl || tailor.image || tailor.avatar
      : rekhaImage;

  const services = tailor?.services && tailor.services.length > 0 ? tailor.services : null;

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

    try {
      // 1. Check if conversation already exists with this tailor
      const listRes = await conversationsApi.getConversations();
      const existing = (listRes.data || []).find((c: any) => {
        const pId =
          c.participantId ||
          c.participant?.id ||
          c.participants?.[0]?.id;
        return (
          pId &&
          (String(pId).toLowerCase() === String(targetUserId).toLowerCase() ||
            String(pId).toLowerCase() === String(tailorId).toLowerCase())
        );
      });

      if (existing && existing.id) {
        router.push({
          pathname: `/messages/${existing.id}`,
          params: {
            conversationId: existing.id,
            recipientId: targetUserId,
            name,
            avatar: avatarUrl,
          },
        } as any);
        return;
      }

      // 2. Try to start a new conversation
      try {
        const startRes = await conversationsApi.startConversation({
          participantId: targetUserId,
        });

        if (startRes?.data && startRes.data.id) {
          router.push({
            pathname: `/messages/${startRes.data.id}`,
            params: {
              conversationId: startRes.data.id,
              recipientId: targetUserId,
              name,
              avatar: avatarUrl,
            },
          } as any);
          return;
        }
      } catch {}

      // 3. Fallback: Open chat screen in new conversation mode
      router.push({
        pathname: `/messages/new`,
        params: {
          conversationId: "new",
          recipientId: targetUserId,
          name,
          avatar: avatarUrl,
        },
      } as any);
    } catch {
      router.push({
        pathname: `/messages/new`,
        params: {
          conversationId: "new",
          recipientId: targetUserId,
          name,
          avatar: avatarUrl,
        },
      } as any);
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <TailorScreenShell bottomTabs={<TailorBottomTabs />}>
      <View className="relative">
        <TailorPlaceholder
          image={profileHeroImage}
          variant="map"
          size="wide"
          tone="cream"
        />
        <View className="absolute left-0 right-0 top-0">
          <TailorHeader title="" showBack rightIcon="heart-outline" />
        </View>
        <View className="absolute bottom-4 right-4">
          <TailorBadge label="Verified" />
        </View>
      </View>

      <View className="px-5 pb-8">
        <View className="-mt-8 flex-row items-end">
          <TailorPlaceholder image={avatarSource} size="md" tone="coral" />
          <View className="ml-4 flex-1 pb-1">
            <Text className="text-[21px] font-bold text-brand-dark">
              {name}
            </Text>
            <RatingLine rating={rating} reviews={reviewsCount} distance={distance} />
            <Text className="mt-1 text-[12px] text-brand-gray">
              {location}
            </Text>
          </View>
        </View>

        {tailor?.experienceYears ? (
          <View className="mt-3 self-start rounded-md bg-primary-50 px-3 py-1">
            <Text className="text-[11px] font-bold text-primary">
              ⭐ {tailor.experienceYears} Years of Experience
            </Text>
          </View>
        ) : null}

        {tags.length > 0 ? (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <View
                key={tag}
                className="rounded-md border border-brand-border px-3 py-2 bg-white shadow-xs"
              >
                <Text className="text-[11px] font-semibold text-brand-dark">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {bio ? (
          <>
            <Text className="mb-2 mt-5 text-[14px] font-semibold text-brand-dark">
              About
            </Text>
            <Text className="text-[12px] leading-5 text-brand-gray">
              {bio}
            </Text>
          </>
        ) : null}

        {services && services.length > 0 ? (
          <>
            <SectionHeader title="Services" />
            <View className="flex-row flex-wrap gap-3">
              {services.map((service, index) => (
                <View
                  key={service.id || service.title || index}
                  className="w-[48%] rounded-md border border-brand-border p-3 bg-white shadow-xs"
                >
                  <TailorPlaceholder
                    image={serviceImages[index % serviceImages.length]}
                    variant="garment"
                    size="sm"
                    tone={index % 2 === 0 ? "teal" : "coral"}
                  />
                  <Text className="mt-3 text-[12px] font-semibold text-brand-dark" numberOfLines={1}>
                    {service.title}
                  </Text>
                  <Text className="mt-1 text-[13px] font-bold text-brand-dark">
                    Rs. {Number(service.price).toLocaleString()}
                  </Text>
                  {service.description ? (
                    <Text className="mt-1 text-[10px] text-brand-gray" numberOfLines={2}>
                      {service.description}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            onPress={handleMessageTailor}
            disabled={isStartingChat}
            className="h-[50px] flex-1 flex-row items-center justify-center rounded-md border border-primary bg-white shadow-xs"
          >
            {isStartingChat ? (
              <ActivityIndicator size="small" color="#14919B" />
            ) : (
              <>
                <Ionicons name="chatbubble-outline" size={17} color="#14919B" />
                <Text className="ml-2 text-[14px] font-semibold text-primary">
                  Message
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/booking/${tailorId || "1"}` as never)}
            className="h-[50px] flex-1 flex-row items-center justify-center rounded-md bg-primary shadow-xs"
          >
            <Ionicons name="calendar-outline" size={17} color="#FFFFFF" />
            <Text className="ml-2 text-[14px] font-semibold text-white">
              Book Appointment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TailorScreenShell>
  );
}
