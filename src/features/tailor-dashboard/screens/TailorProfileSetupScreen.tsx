import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useAuthStore } from "../../../stores/auth.store";
import { useTailorProfile } from "../hooks/useTailorProfile";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { TailorLocationPickerModal, SelectedLocation } from "../components/TailorLocationPickerModal";
import { TailorLeafletMap } from "../../tailors/components/TailorLeafletMap";
import { tailorsApi } from "../../../api/tailors.api";
import { extractAvatarUrl, usersApi } from "../../../api/users.api";
import { storage } from "../../../api/client";
import { User } from "../../../types/api";

const DEFAULT_SPECIALTIES = [
  "Bridal Wear",
  "Lehenga",
  "Kurti & Salwar",
  "Suits & Tuxedos",
  "Blouse Stitching",
  "Western Dresses",
  "Alterations",
  "Hand Embroidery",
  "Custom Design",
  "Kids Wear",
];

export default function TailorProfileSetupScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { profile, isLoading, isSaving, isComplete, error, saveProfile } =
    useTailorProfile();

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number>(31.5204);
  const [longitude, setLongitude] = useState<number>(74.3587);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [hasLocationPinned, setHasLocationPinned] = useState(false);
  const [experienceYears, setExperienceYears] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [bio, setBio] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [shopImage, setShopImage] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [pendingBannerAsset, setPendingBannerAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleLocationConfirm = (loc: SelectedLocation) => {
    setAddress(loc.address);
    setCity(loc.city);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setHasLocationPinned(true);
  };

  // Sync profile & user data once loaded
  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setBusinessName(p.shopName || p.shop_name || p.businessName || "");
      setOwnerName(
        p.profile?.full_name ||
          p.name ||
          p.user?.fullName ||
          p.user?.name ||
          user?.fullName ||
          user?.name ||
          (user?.email ? user.email.split("@")[0] : "")
      );
      setPhone(
        p.phone ||
          p.profile?.phone ||
          p.user?.phone ||
          user?.phone ||
          ""
      );
      if (typeof p.location === "object" && p.location) {
        setCity(p.location.city || p.city || "");
        setAddress(p.location.address || p.address || "");
        if (p.location.latitude) {
          setLatitude(Number(p.location.latitude));
          setHasLocationPinned(true);
        }
        if (p.location.longitude) {
          setLongitude(Number(p.location.longitude));
        }
      } else if (typeof p.location === "string") {
        setCity(p.location);
        setAddress(p.address || "");
      } else {
        setCity(p.city || "");
        setAddress(p.address || "");
      }
      if (p.latitude !== undefined && p.latitude !== null && !isNaN(Number(p.latitude))) {
        setLatitude(Number(p.latitude));
        setHasLocationPinned(true);
      }
      if (p.longitude !== undefined && p.longitude !== null && !isNaN(Number(p.longitude))) {
        setLongitude(Number(p.longitude));
      }
      const expVal =
        p.experienceYears !== undefined && p.experienceYears !== null && p.experienceYears !== ""
          ? p.experienceYears
          : p.experience_years !== undefined && p.experience_years !== null && p.experience_years !== ""
          ? p.experience_years
          : "";
      setExperienceYears(String(expVal));
      setStartingPrice(
        p.startingPrice !== undefined && p.startingPrice !== null && p.startingPrice !== ""
          ? String(p.startingPrice)
          : p.services?.[0]?.price !== undefined
          ? String(p.services[0].price)
          : ""
      );
      setBio(p.bio || p.profile?.bio || "");
      if (p.specialties && p.specialties.length > 0) {
        setSelectedSpecialties(p.specialties);
      } else if (p.specialty) {
        setSelectedSpecialties([p.specialty]);
      } else if (p.services && p.services.length > 0) {
        const serviceTitles = p.services
          .map((s: any) => s.title || s.name)
          .filter(Boolean);
        if (serviceTitles.length > 0) {
          setSelectedSpecialties(serviceTitles);
        }
      }
      setShopImage(
        p.bannerUrl ||
          p.banner_url ||
          p.banner ||
          p.shop_banner ||
          p.shopBanner ||
          null
      );
      const userAvatar =
        user?.avatar_url ||
        user?.avatarUrl ||
        user?.avatar ||
        p.avatarUrl ||
        p.avatar ||
        p.profile?.avatar_url ||
        p.profile?.avatarUrl ||
        p.user?.avatarUrl ||
        p.user?.avatar ||
        null;
      setAvatarUri(userAvatar);
    } else if (user) {
      if (!ownerName) {
        setOwnerName(user.fullName || user.name || (user.email ? user.email.split("@")[0] : ""));
      }
      if (!phone && user.phone) {
        setPhone(user.phone);
      }
      const userAvatar =
        user?.avatar_url ||
        user?.avatarUrl ||
        user?.avatar ||
        null;
      setAvatarUri(userAvatar);
    }
  }, [profile, user]);

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleAddCustomSpecialty = () => {
    const trimmed = customSpecialty.trim();
    if (trimmed && !selectedSpecialties.includes(trimmed)) {
      setSelectedSpecialties((prev) => [...prev, trimmed]);
      setCustomSpecialty("");
    }
  };

  const pickAvatar = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access your photos is required to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploadingAvatar(true);

        try {
          const res = await usersApi.uploadAvatar(asset);
          const newAvatarUrl = extractAvatarUrl(res.data) || asset.uri;

          if (user) {
            const updatedUser: User = {
              ...user,
              avatar: newAvatarUrl,
              avatarUrl: newAvatarUrl,
            };
            setUser(updatedUser);
            await storage.setUser(updatedUser).catch(() => {});
          }

          setAvatarUri(newAvatarUrl);
          Alert.alert("Success", "Profile avatar updated successfully!");
        } catch (uploadErr: any) {
          // Local fallback preview
          const localUri = asset.uri;
          if (user) {
            const updatedUser: User = {
              ...user,
              avatar: localUri,
              avatarUrl: localUri,
            };
            setUser(updatedUser);
            await storage.setUser(updatedUser).catch(() => {});
          }
          setAvatarUri(localUri);
          Alert.alert(
            "Avatar Saved",
            uploadErr?.message
              ? `Profile avatar updated locally. (${uploadErr.message})`
              : "Profile avatar updated locally."
          );
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    } catch (err: any) {
      setIsUploadingAvatar(false);
      Alert.alert("Error", err?.message || "Failed to update profile picture");
    }
  };

  const pickShopImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access photos is required to update shop banner."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setShopImage(asset.uri);
        setPendingBannerAsset(asset);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!businessName.trim()) {
      Alert.alert("Required Field", "Please enter your Workshop / Shop Name.");
      return;
    }
    if (!city.trim()) {
      Alert.alert("Required Field", "Please enter your City.");
      return;
    }
    if (selectedSpecialties.length === 0) {
      Alert.alert(
        "Required Field",
        "Please select at least one tailoring specialty."
      );
      return;
    }
    const priceNum = Number(startingPrice);
    if (!startingPrice.trim() || isNaN(priceNum) || priceNum <= 0) {
      Alert.alert(
        "Required Field",
        "Please enter a valid Starting Price (greater than 0)."
      );
      return;
    }

    const resolvedShopName = businessName.trim();
    const payload = {
      name:
        ownerName.trim() ||
        user?.fullName ||
        user?.name ||
        (user?.email ? user.email.split("@")[0] : "Tailor"),
      businessName: resolvedShopName,
      shopName: resolvedShopName,
      shop_name: resolvedShopName,
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      latitude: hasLocationPinned ? Number(latitude) : undefined,
      longitude: hasLocationPinned ? Number(longitude) : undefined,
      location: {
        city: city.trim(),
        address: address.trim(),
        latitude: hasLocationPinned ? Number(latitude) : undefined,
        longitude: hasLocationPinned ? Number(longitude) : undefined,
      },
      experienceYears: Number(experienceYears) || 0,
      startingPrice: priceNum,
      specialties: selectedSpecialties,
      specialty: selectedSpecialties[0] || "",
      bio: bio.trim(),
      bannerUrl: shopImage || undefined,
      banner: shopImage || undefined,
    };

    try {
      const success = await saveProfile(payload);
      if (success) {
        // Upload banner if user picked a new image
        if (pendingBannerAsset) {
          const targetTailorId = profile?.id;
          if (targetTailorId) {
            setIsUploadingImage(true);
            try {
              const res = await tailorsApi.uploadBanner(targetTailorId, pendingBannerAsset);
              const newBannerUrl =
                res?.data?.bannerUrl ||
                res?.data?.banner_url ||
                res?.data?.banner ||
                res?.data?.shop_banner ||
                res?.data?.shopBanner ||
                res?.data?.url ||
                res?.data?.tailor?.banner_url ||
                res?.data?.tailor?.bannerUrl ||
                pendingBannerAsset.uri;
              setShopImage(newBannerUrl);
              setPendingBannerAsset(null);
            } catch (uploadErr: any) {
              Alert.alert(
                "Banner Upload Warning",
                "Profile saved, but banner upload failed: " +
                  (uploadErr?.message || "Unknown error") +
                  ". You can try updating the banner again."
              );
            } finally {
              setIsUploadingImage(false);
            }
          }
        }

        // Also update user's profile name/phone only — DO NOT TOUCH AVATAR
        if (user) {
          const updatedUser = {
            ...user,
            name: payload.name,
            fullName: payload.name,
            phone: payload.phone || user.phone,
          };
          setUser(updatedUser);
          await storage.setUser(updatedUser).catch(() => {});
        }
        Alert.alert(
          "Profile Saved",
          "Your tailor profile has been updated successfully!",
          [
            {
              text: "View Profile",
              onPress: () => router.replace("/tailor-dashboard/profile" as any),
            },
          ]
        );
      } else {
        // NEVER EVER show success on failure or error!
        Alert.alert(
          "Save Failed",
          error || "Failed to save profile. Please check your connection and try again."
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Save Error",
        err?.message || "An unexpected error occurred while saving profile."
      );
    }
  };

  if (isLoading) {
    return (
      <TailorDashboardShell
        bottomTabs={isComplete ? <TailorDashboardTabs active="Profile" /> : undefined}
      >
        <View className="flex-1 items-center justify-center py-20" style={{ minHeight: 520 }}>
          <ActivityIndicator size="large" color="#14919B" />
          <Text className="mt-3 text-[14px] font-medium text-brand-gray">
            Loading your tailor profile...
          </Text>
        </View>
      </TailorDashboardShell>
    );
  }

  return (
    <TailorDashboardShell
      bottomTabs={isComplete ? <TailorDashboardTabs active="Profile" /> : undefined}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="h-14 flex-row items-center justify-between border-b border-brand-border px-4">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/tailor-dashboard/profile" as any);
              }
            }}
            className="h-10 w-10 items-center justify-center rounded-md"
          >
            <Ionicons name="arrow-back" size={22} color="#1A1D1F" />
          </TouchableOpacity>
          <Text className="text-[17px] font-black tracking-tight text-brand-dark">
            Edit Tailor Profile
          </Text>
          <View className="h-10 w-10" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          className="px-5 pt-4"
        >
          {/* Status Badge */}
          {!isComplete ? (
            <View className="mb-4 flex-row items-start rounded-md border border-amber-200 bg-amber-50 p-3">
              <Ionicons
                name="alert-circle"
                size={20}
                color="#D97706"
                style={{ marginTop: 2 }}
              />
              <View className="ml-2.5 flex-1">
                <Text className="text-[13px] font-bold text-amber-800">
                  Profile Incomplete
                </Text>
                <Text className="mt-0.5 text-[11px] leading-4 text-amber-700">
                  Fill in your workshop name, specialties, city, and pricing to
                  start receiving stitching orders and appear on the customer
                  tailors page.
                </Text>
              </View>
            </View>
          ) : (
            <View className="mb-4 flex-row items-center rounded-md border border-emerald-200 bg-emerald-50 p-3">
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <View className="ml-2.5 flex-1">
                <Text className="text-[13px] font-bold text-emerald-800">
                  Profile Complete & Active
                </Text>
                <Text className="text-[11px] text-emerald-700">
                  Your profile is live on Sui Dhaga tailor search.
                </Text>
              </View>
            </View>
          )}

          {/* Photos & Branding Section */}
          <View className="mb-6 rounded-2xl border border-brand-border bg-white p-4 shadow-xs">
            <Text className="mb-3 text-[15px] font-black tracking-tight text-brand-dark">
              Profile & Workshop Photos
            </Text>

            {/* Profile Avatar Row */}
            <View className="flex-row items-center justify-between pb-4 border-b border-brand-border/60">
              <View className="flex-row items-center flex-1 mr-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={pickAvatar}
                  disabled={isUploadingAvatar}
                  className="relative"
                >
                  <View className="h-16 w-16 rounded-2xl border border-brand-border bg-primary-50 overflow-hidden items-center justify-center">
                    {avatarUri ? (
                      <Image
                        source={{ uri: avatarUri }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center justify-center w-full h-full bg-primary-50">
                        <Text className="text-[20px] font-black text-primary">
                          {(businessName || ownerName || "T").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  {isUploadingAvatar ? (
                    <View className="absolute inset-0 items-center justify-center rounded-2xl bg-black/40">
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  ) : (
                    <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-primary border-2 border-white shadow-xs">
                      <Ionicons name="camera" size={11} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                <View className="ml-3.5 flex-1">
                  <Text className="text-[14px] font-bold text-brand-dark">
                    Profile Avatar
                  </Text>
                  <Text className="text-[11px] font-medium text-brand-gray mt-0.5">
                    Your personal face / tailor photo
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={pickAvatar}
                disabled={isUploadingAvatar}
                className="rounded-xl bg-primary-50 px-3 py-1.5 border border-primary/20"
              >
                <Text className="text-[12px] font-bold text-primary">
                  {avatarUri ? "Change" : "Upload"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Shop Banner Box */}
            <View className="pt-4">
              <View className="flex-row items-center justify-between mb-2">
                <View>
                  <Text className="text-[14px] font-bold text-brand-dark">
                    Workshop Cover Banner
                  </Text>
                  <Text className="text-[11px] font-medium text-brand-gray">
                    Wide photo displayed on your storefront
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={pickShopImage}
                  disabled={isUploadingImage}
                  className="rounded-xl bg-primary-50 px-3 py-1.5 border border-primary/20"
                >
                  <Text className="text-[12px] font-bold text-primary">
                    {shopImage ? "Change" : "Upload"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={pickShopImage}
                disabled={isUploadingImage}
                className="relative h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-primary/40 bg-primary-50/50 mt-1"
              >
                {shopImage ? (
                  <Image
                    source={{ uri: shopImage }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center justify-center p-3">
                    <Ionicons name="image-outline" size={26} color="#14919B" />
                    <Text className="mt-1 text-[12px] font-bold text-primary">
                      Tap to select banner photo (16:9)
                    </Text>
                    <Text className="text-[10px] text-brand-gray">
                      Workshop exterior, showroom or stitching bench
                    </Text>
                  </View>
                )}

                {isUploadingImage ? (
                  <View className="absolute inset-0 items-center justify-center bg-black/40">
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="mt-1 text-[11px] font-bold text-white">
                      Uploading...
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>
          </View>

          {/* Business & Personal Info Section */}
          <Text className="mb-3 mt-2 text-[16px] font-black tracking-tight text-brand-dark">
            Shop & Personal Details
          </Text>

          {/* Shop / Business Name */}
          <View className="mb-3.5">
            <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
              Business / Shop Name *
            </Text>
            <TextInput
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="e.g. Rekha Designer Tailors"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-md border border-brand-border bg-white px-3.5 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Owner Full Name */}
          <View className="mb-3.5">
            <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
              Tailor / Master Name
            </Text>
            <TextInput
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="e.g. Master Rekha"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-md border border-brand-border bg-white px-3.5 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Phone Number */}
          <View className="mb-3.5">
            <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
              Phone / WhatsApp Number
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +91 98765 43210"
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-md border border-brand-border bg-white px-3.5 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Location & Experience */}
          <View className="mb-3.5 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                City / Town *
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Delhi, Lahore"
                placeholderTextColor="#9CA3AF"
                className="h-11 rounded-md border border-brand-border bg-white px-3.5 text-[13px] font-medium text-brand-dark"
              />
            </View>
            <View className="w-32">
              <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                Exp. (Years)
              </Text>
              <TextInput
                value={experienceYears}
                onChangeText={setExperienceYears}
                placeholder="e.g. 8"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
                className="h-11 rounded-md border border-brand-border bg-white px-3.5 text-[13px] font-medium text-brand-dark"
              />
            </View>
          </View>

          {/* Shop Address */}
          <View className="mb-3.5">
            <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
              Shop / Workshop Address
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. Shop 12, Fashion Street Market"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-md border border-brand-border bg-white px-3.5 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Set Address on Map Section */}
          <View className="mb-4 rounded-xl border border-brand-border bg-white p-4 shadow-xs">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="h-7 w-7 rounded-md bg-primary-50 items-center justify-center mr-2">
                  <Ionicons name="location" size={16} color="#078B87" />
                </View>
                <View>
                  <Text className="text-[13px] font-black text-brand-dark">
                    Shop Location & Map Pin
                  </Text>
                  <Text className="text-[10px] text-brand-gray">
                    Used to match nearby customers searching for tailors
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.8}
                onPress={() => setIsMapModalOpen(true)}
                className="flex-row items-center rounded-md bg-primary px-3 py-1.5 shadow-xs"
              >
                <Ionicons name="map" size={13} color="#FFFFFF" />
                <Text className="ml-1 text-[11px] font-bold text-white">
                  {hasLocationPinned ? "Adjust Pin" : "Set on Map"}
                </Text>
              </TouchableOpacity>
            </View>

            {hasLocationPinned ? (
              <View className="overflow-hidden rounded-lg border border-brand-border">
                <TailorLeafletMap
                  latitude={latitude}
                  longitude={longitude}
                  shopName={businessName || "Your Tailor Shop"}
                  locationText={address ? `${address}, ${city}` : city || "Shop Location"}
                  height={140}
                  interactive={false}
                />
                <View className="bg-[#F7FCFC] p-3 border-t border-brand-border">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                      <Ionicons name="pin" size={13} color="#078B87" />
                      <Text className="text-[12px] font-black text-brand-dark" numberOfLines={1}>
                        {address || "Exact Shop Spot Selected"}
                      </Text>
                    </View>
                    <View className="rounded bg-emerald-100 px-2 py-0.5">
                      <Text className="text-[10px] font-bold text-emerald-800">✓ Pin Linked</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between mt-1 pt-1.5 border-t border-gray-100">
                    <Text className="text-[11px] font-semibold text-brand-dark">
                      City: {city || "Not set"}
                    </Text>
                    <Text className="text-[10px] font-mono font-bold text-primary">
                      GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.7}
                onPress={() => setIsMapModalOpen(true)}
                className="items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-primary-50/40 py-5 px-4"
              >
                <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center mb-1.5">
                  <Ionicons name="navigate" size={22} color="#078B87" />
                </View>
                <Text className="text-[13px] font-black text-primary text-center">
                  Tap to Pin Your Shop on Interactive Map
                </Text>
                <Text className="text-[11px] text-brand-gray text-center mt-1">
                  Drag the pin, search your area or use GPS. Address, city & coordinates auto-fill.
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Starting Price */}
          <View className="mb-4">
            <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
              Starting Stitching Price (₹ / PKR) *
            </Text>
            <TextInput
              value={startingPrice}
              onChangeText={setStartingPrice}
              placeholder="e.g. 500"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-md border border-brand-border bg-white px-3.5 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Specialties */}
          <Text className="mb-1 mt-3 text-[16px] font-black tracking-tight text-brand-dark">
            Tailoring Specialties *
          </Text>
          <Text className="mb-3 text-[12px] font-medium text-brand-gray">
            Select what outfits and services you specialize in:
          </Text>

          <View className="mb-3 flex-row flex-wrap gap-2">
            {DEFAULT_SPECIALTIES.map((spec) => {
              const isSelected = selectedSpecialties.includes(spec);
              return (
                <TouchableOpacity
                  key={spec}
                  onPress={() => toggleSpecialty(spec)}
                  className={`flex-row items-center rounded-md border px-3 py-1.5 ${
                    isSelected
                      ? "border-primary bg-primary-50"
                      : "border-brand-border bg-white"
                  }`}
                >
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                    size={15}
                    color={isSelected ? "#14919B" : "#6F767E"}
                  />
                  <Text
                    className={`ml-1.5 text-[12px] ${
                      isSelected
                        ? "font-bold text-primary"
                        : "font-medium text-brand-dark"
                    }`}
                  >
                    {spec}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Specialty Input */}
          <View className="mb-4 flex-row gap-2">
            <TextInput
              value={customSpecialty}
              onChangeText={setCustomSpecialty}
              placeholder="Add other specialty..."
              placeholderTextColor="#9CA3AF"
              className="h-10 flex-1 rounded-md border border-brand-border bg-white px-3 text-[12px] font-medium text-brand-dark"
            />
            <TouchableOpacity
              onPress={handleAddCustomSpecialty}
              className="h-10 items-center justify-center rounded-md bg-primary-light px-4"
            >
              <Text className="text-[12px] font-bold text-primary">Add</Text>
            </TouchableOpacity>
          </View>

          {/* Bio / About */}
          <View className="mb-6">
            <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
              About & Workshop Bio
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell customers about your craftsmanship, fabrics you work with, turnaround time..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="h-24 rounded-md border border-brand-border bg-white p-3.5 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isSaving}
            className="mb-8 h-12 flex-row items-center justify-center rounded-md bg-primary shadow-sm"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="save-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-[15px] font-bold text-white">
                  Save Tailor Profile
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <TailorLocationPickerModal
        visible={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirm={handleLocationConfirm}
        initialLat={latitude}
        initialLng={longitude}
        initialAddress={address}
        initialCity={city}
      />
    </TailorDashboardShell>
  );
}
