import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CustomerTabsPreview } from "@/features/customer-tabs/components/CustomerTabsPreview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth.store";
import { ButtonTexture } from "@/components/ui/ButtonTexture";
import { RatingLine } from "../components/RatingLine";
import { TailorHeader } from "../components/TailorHeader";
import { TailorLeafletMap } from "../components/TailorLeafletMap";
import { TailorPlaceholder } from "../components/TailorPlaceholder";
import { TailorScreenShell } from "../components/TailorScreenShell";
import { useTailorDetails } from "../hooks/useTailors";
import { useTailorProfile } from "@/features/tailor-dashboard/hooks/useTailorProfile";
import { TailorProfileSkeleton, ReviewsListSkeleton } from "@/components/ui/Skeleton";
import { reviewsApi } from "@/api/reviews.api";
import type { ReviewItem } from "@/types/api";

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
  const params = useLocalSearchParams<{
    tailorId?: string;
    id?: string;
    from?: string;
    role?: string;
  }>();
  const tailorId = params.tailorId || params.id || "";
  const { tailor, isLoading } = useTailorDetails(tailorId);
  const currentUser = useAuthStore((state) => state.user);
  const { profile: myTailorProfile } = useTailorProfile();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapZoomLevel, setMapZoomLevel] = useState(1);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    const tId = tailor?.id || tailorId;
    if (!tId) return;
    setIsLoadingReviews(true);
    reviewsApi
      .getTailorReviews(tId)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setReviews(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingReviews(false));
  }, [tailor?.id, tailorId]);

  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <TailorHeader title="Tailor Profile" showBack rightIcon={null} />
        <TailorProfileSkeleton />
      </View>
    );
  }

  if (!tailor && !isLoading) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <TailorHeader title="Tailor Profile" showBack rightIcon={null} />
        <View className="flex-1 items-center justify-center py-8 px-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Ionicons name="storefront-outline" size={32} color="#14919B" />
          </View>
          <Text className="text-[18px] font-bold text-brand-dark text-center">
            Tailor Not Found
          </Text>
          <Text className="mt-2 text-center text-[13px] font-medium text-brand-gray max-w-[280px]">
            The tailor profile you are looking for does not exist or has been removed.
          </Text>
          <View className="mt-6 w-full max-w-[260px] gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/tailors" as any)}
              className="h-[48px] rounded-xl bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
            >
              <Text className="text-[13px] font-bold text-white">
                Explore Tailors
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              className="h-[48px] rounded-xl border border-brand-border bg-white items-center justify-center"
            >
              <Text className="text-[13px] font-bold text-brand-dark">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const name =
    tailor?.shopName ||
    tailor?.businessName ||
    tailor?.name ||
    "Tailor Profile";
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

  const avatarSource = rawAvatarUri ? { uri: rawAvatarUri } : rekhaImage;

  const rawBannerUri =
    tailor?.bannerUrl ||
    tailor?.banner ||
    (tailor as any)?.shop_banner ||
    (tailor as any)?.shopBanner ||
    null;

  const bannerSource = rawBannerUri ? { uri: rawBannerUri } : profileHeroImage;

  const cityLower = (
    tailor?.city ||
    tailor?.address ||
    location ||
    ""
  ).toLowerCase();
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
    defaultLng = 73.135;
  }
  const latitude = Number(
    (tailor as any)?.latitude || (tailor as any)?.lat || defaultLat,
  );
  const longitude = Number(
    (tailor as any)?.longitude || (tailor as any)?.lng || defaultLng,
  );

  const profileUrl = `https://suidhaga.app/tailors/${tailor?.id || tailorId || ""}`;

  const isTailor =
    currentUser?.role?.toLowerCase() === "tailor" ||
    (currentUser as any)?.user_metadata?.role?.toLowerCase() === "tailor" ||
    (currentUser as any)?.role_name?.toLowerCase() === "tailor" ||
    params.from?.toLowerCase() === "tailor" ||
    params.role?.toLowerCase() === "tailor" ||
    Boolean(myTailorProfile?.id && (myTailorProfile?.shopName || myTailorProfile?.businessName));

  const isOwnProfile = Boolean(
    (currentUser?.id &&
      ((tailor?.userId &&
        String(currentUser.id).toLowerCase() ===
          String(tailor.userId).toLowerCase()) ||
        ((tailor as any)?.user_id &&
          String(currentUser.id).toLowerCase() ===
            String((tailor as any).user_id).toLowerCase()) ||
        ((tailor as any)?.user?.id &&
          String(currentUser.id).toLowerCase() ===
            String((tailor as any).user?.id).toLowerCase()) ||
        ((tailor as any)?.profile?.id &&
          String(currentUser.id).toLowerCase() ===
            String((tailor as any).profile?.id).toLowerCase()) ||
        (tailor?.id &&
          String(currentUser.id).toLowerCase() ===
            String(tailor.id).toLowerCase()) ||
        (tailorId &&
          String(currentUser.id).toLowerCase() ===
            String(tailorId).toLowerCase()))) ||
      (currentUser?.email &&
        (((tailor as any)?.user?.email &&
          String(currentUser.email).toLowerCase() ===
            String((tailor as any).user.email).toLowerCase()) ||
          ((tailor as any)?.email &&
            String(currentUser.email).toLowerCase() ===
              String((tailor as any).email).toLowerCase()))) ||
      (myTailorProfile?.id &&
        (String(myTailorProfile.id).toLowerCase() ===
          String(tailor?.id || tailorId).toLowerCase()))
  );

  const shouldHideActionButtons = isTailor || isOwnProfile;

  const handleMessageTailor = async () => {
    if (isTailor) {
      Alert.alert(
        "Notice",
        "Tailor accounts cannot message other tailors.",
      );
      return;
    }

    if (!currentUser) {
      Alert.alert("Sign In Required", "Please log in to message this tailor.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log In",
          onPress: () => router.push("/auth/login" as any),
        },
      ]);
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
      isOwnProfile ||
      (currentUser.id &&
        String(currentUser.id).toLowerCase() ===
          String(targetUserId).toLowerCase())
    ) {
      Alert.alert("Note", "This is your own tailor profile.");
      return;
    }

    setIsStartingChat(true);
    const avatarUrl =
      rawAvatarUri ||
      (typeof avatarSource === "object" && avatarSource && "uri" in avatarSource
        ? (avatarSource as any).uri
        : typeof avatarSource === "string"
          ? avatarSource
          : "");

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
      bottomTabs={
        isTailor ? undefined : (
          <CustomerTabsPreview active="Tailors" />
        )
      }
      fixedBottomAction={
        shouldHideActionButtons ? undefined : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 10,
              elevation: 8,
              borderWidth: 1,
              borderColor: "rgba(230, 232, 236, 0.8)",
            }}
          >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Message tailor"
              onPress={handleMessageTailor}
              disabled={isStartingChat}
              activeOpacity={0.8}
              style={{
                height: 48,
                flex: 0.85,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: "#14919B",
                backgroundColor: "#F0FAFA",
                paddingHorizontal: 8,
              }}
            >
              {isStartingChat ? (
                <ActivityIndicator size="small" color="#14919B" />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="chatbubble-outline" size={18} color="#14919B" />
                  <Text
                    numberOfLines={1}
                    style={{
                      marginLeft: 6,
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#14919B",
                    }}
                  >
                    Message
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Book appointment"
              onPress={() => {
                const targetId = tailor?.id || tailor?.userId || tailorId || "1";
                router.push(`/booking/${targetId}` as never);
              }}
              activeOpacity={0.85}
              style={{
                height: 48,
                flex: 1.15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                backgroundColor: "#00949D",
                overflow: "hidden",
                position: "relative",
                paddingHorizontal: 8,
                shadowColor: "#14919B",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <ButtonTexture variant="greenish" borderRadius={12} />
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                <Text
                  numberOfLines={1}
                  style={{
                    marginLeft: 6,
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#FFFFFF",
                    textShadowColor: "rgba(0,0,0,0.22)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Book Appointment
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )
      }
    >
      {/* Tailor Cover Banner with rounded bottom corners */}
      <View
        className="relative overflow-hidden shadow-sm"
        style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
      >
        <TailorPlaceholder
          image={bannerSource}
          variant="map"
          size="wide"
          tone="cream"
          style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        />

        <View className="absolute left-0 right-0 top-0">
          <TailorHeader
            title=""
            showBack
            rightIcon={isOwnProfile ? "create-outline" : null}
            onPressRight={
              isOwnProfile
                ? () => router.push("/tailor-dashboard/complete-profile" as any)
                : undefined
            }
            floating
          />
        </View>
      </View>

      {/* Main Content Container below banner */}
      <View className="bg-white px-5 pb-6">
        {/* Tailor Avatar positioned over banner bottom */}
        <View className="-mt-11 flex-row items-end justify-between">
          <View className="overflow-hidden rounded-2xl border-[3.5px] border-white bg-white shadow-md">
            <TailorPlaceholder image={avatarSource} size="md" tone="teal" />
          </View>
        </View>

        {/* Tailor Name, Rating & Details clearly below the banner */}
        <View className="mt-3">
          <Text className="text-[23px] font-black text-brand-dark leading-[28px]">
            {name}
          </Text>
          <View className="mt-1">
            <RatingLine
              rating={rating}
              reviews={reviewsCount}
              distance={distance}
            />
          </View>
          <Text className="mt-1 text-[13.5px] font-medium text-brand-gray">
            {location}
          </Text>
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
            <Text className="text-[18px] font-bold text-brand-dark">About</Text>
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
          </TouchableOpacity>

          {/* Bottom address row & Full Screen action button */}
          <View className="mt-3.5 flex-row items-center justify-between">
            <View className="mr-3 flex-1 flex-row items-start">
              <Ionicons
                name="location-sharp"
                size={17}
                color="#14919B"
                style={{ marginTop: 1 }}
              />
              <Text className="ml-1.5 flex-1 text-[13.5px] font-semibold text-brand-dark leading-[19px]">
                {location}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsMapModalVisible(true)}
              className="flex-shrink-0 flex-row items-center rounded-lg border border-[#14919B] bg-white px-3.5 py-1.5 shadow-xs active:bg-primary-50"
            >
              <Ionicons name="expand-outline" size={15} color="#14919B" />
              <Text className="ml-1.5 text-[13px] font-bold text-[#14919B]">
                Full Screen
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer Reviews */}
        <View className="mb-3 mt-7">
          <Text className="text-[18px] font-bold text-brand-dark">
            Customer Reviews
          </Text>
        </View>

        {isLoadingReviews ? (
          <ReviewsListSkeleton count={2} />
        ) : reviews.length > 0 ? (
          <View className="gap-3">
            {reviews.map((rev, idx) => {
              const cust = rev.customer;
              const reviewerName =
                cust?.fullName ||
                cust?.full_name ||
                cust?.name ||
                "Verified Customer";
              const reviewerAvatar = cust?.avatarUrl || cust?.avatar_url;
              const revDate = rev.createdAt || rev.created_at;
              const formattedRevDate = revDate
                ? new Date(revDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <View
                  key={rev.id || idx}
                  className="rounded-2xl border border-brand-border bg-white p-4 shadow-2xs"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 pr-2">
                      {reviewerAvatar ? (
                        <Image
                          source={{ uri: reviewerAvatar }}
                          style={{ width: 36, height: 36, borderRadius: 18 }}
                          contentFit="cover"
                        />
                      ) : (
                        <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                          <Ionicons name="person" size={18} color="#14919B" />
                        </View>
                      )}
                      <View className="ml-2.5 flex-1">
                        <Text
                          className="text-[13.5px] font-bold text-brand-dark"
                          numberOfLines={1}
                        >
                          {reviewerName}
                        </Text>
                        <Text className="text-[11px] text-brand-gray">
                          {formattedRevDate}
                        </Text>
                      </View>
                    </View>

                    {/* Star Rating */}
                    <View className="flex-row items-center bg-amber-50 px-2 py-0.5 rounded-md">
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text className="ml-1 text-[12px] font-black text-amber-700">
                        {rev.rating}.0
                      </Text>
                    </View>
                  </View>

                  {rev.comment ? (
                    <Text className="mt-2.5 text-[13px] leading-5 text-brand-dark/90 font-normal">
                      {rev.comment}
                    </Text>
                  ) : null}

                  {rev.images && rev.images.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8, marginTop: 10 }}
                    >
                      {rev.images.map((imgUri, imgIdx) => (
                        <View
                          key={imgIdx}
                          className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200"
                        >
                          <Image
                            source={{ uri: imgUri }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                          />
                        </View>
                      ))}
                    </ScrollView>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <View className="rounded-2xl border border-dashed border-brand-border bg-[#F8FAFC] p-4 items-center justify-center">
            <Ionicons name="chatbubbles-outline" size={26} color="#94A3B8" />
            <Text className="mt-1.5 text-[13px] font-bold text-brand-dark text-center">
              No Written Reviews Yet
            </Text>
            <Text className="mt-0.5 text-[11.5px] text-brand-gray text-center max-w-[280px]">
              Clients who complete stitching orders with this tailor can rate and share outfit photos here.
            </Text>
          </View>
        )}
      </View>

      {/* Full Screen Interactive Leaflet Map Modal */}
      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsMapModalVisible(false)}
      >
        <View className="flex-1 bg-brand-surface">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between border-b border-brand-border bg-white px-5 pb-3.5 pt-12 shadow-xs">
            <View className="flex-1 pr-3">
              <Text
                className="text-[19px] font-extrabold text-brand-dark"
                numberOfLines={1}
              >
                {name}
              </Text>
              <View className="mt-0.5 flex-row items-center">
                <Ionicons name="location-sharp" size={14} color="#14919B" />
                <Text
                  className="ml-1 text-[13px] font-medium text-brand-gray"
                  numberOfLines={1}
                >
                  {location}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsMapModalVisible(false)}
              className="h-8 w-8 items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200"
            >
              <Ionicons name="close" size={18} color="#64748B" />
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

            {/* Floating Bottom Shop Info & Directions Card */}
            <View className="absolute bottom-8 left-4 right-4 rounded-2xl border border-brand-border bg-white/95 p-4 shadow-2xl backdrop-blur-md">
              <View className="flex-row items-center">
                <TailorPlaceholder
                  image={avatarSource}
                  size="sm"
                  tone="coral"
                />
                <View className="ml-3 flex-1 pr-2">
                  <Text
                    className="text-[17px] font-black text-brand-dark leading-[22px]"
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  <Text className="mt-0.5 text-[12.5px] font-semibold text-primary">
                    ⭐ {rating} ({reviewsCount}) • {distance}
                  </Text>
                  <Text
                    className="mt-0.5 text-[12px] font-medium text-brand-gray"
                    numberOfLines={1}
                  >
                    {location}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const query = encodeURIComponent(`${name} ${location}`);
                    Linking.openURL(
                      `https://www.google.com/maps/search/?api=1&query=${query}`,
                    ).catch(() => {});
                  }}
                  className="flex-row items-center justify-center rounded-xl bg-primary px-4 py-3 shadow-md active:bg-primary-600"
                >
                  <Ionicons name="navigate-sharp" size={16} color="#FFFFFF" />
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
