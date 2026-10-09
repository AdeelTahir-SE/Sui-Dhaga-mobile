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
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorLocationPickerModal, SelectedLocation } from "../components/TailorLocationPickerModal";
import { TailorLeafletMap } from "../../tailors/components/TailorLeafletMap";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";
import { toast } from "../../../stores/toast.store";
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

const STEPS = [
  { id: 1, title: "Basic Info", subtitle: "Shop & master identity", icon: "storefront-outline" },
  { id: 2, title: "Photos", subtitle: "Avatar & shop banner", icon: "images-outline" },
  { id: 3, title: "Location", subtitle: "Address & map pin", icon: "location-outline" },
  { id: 4, title: "Services", subtitle: "Specialties & pricing", icon: "cut-outline" },
];

export default function TailorProfileSetupScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { profile, isLoading, isSaving, isComplete, error, saveProfile } =
    useTailorProfile();

  const [currentStep, setCurrentStep] = useState<number>(1);
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
  const [organizationName, setOrganizationName] = useState("");
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
      setOrganizationName(
        p.organizationName ||
          p.organization_name ||
          p.organization ||
          ""
      );
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
          toast.success("Profile avatar updated successfully!");
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
          toast.info("Profile avatar saved locally.");
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    } catch (err: any) {
      setIsUploadingAvatar(false);
      toast.error(err?.message || "Failed to update profile picture");
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
      organizationName: organizationName.trim() || undefined,
      organization: organizationName.trim() || undefined,
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

  const validateCurrentStep = (step: number) => {
    if (step === 1) {
      if (!businessName.trim()) {
        Alert.alert("Required Field", "Please enter your Workshop / Shop Name.");
        return false;
      }
    } else if (step === 3) {
      if (!city.trim() && !hasLocationPinned) {
        Alert.alert("Location Pin Required", "Please tap 'Set on Map' above to pin your shop location.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep(currentStep)) return;
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSave();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/tailor-dashboard/profile" as any);
      }
    }
  };

  const handleStepSelect = (stepId: number) => {
    if (stepId > currentStep && currentStep === 1 && !businessName.trim()) {
      Alert.alert("Required Field", "Please enter your Workshop / Shop Name first.");
      return;
    }
    setCurrentStep(stepId);
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
        {/* Themed Dashboard Header */}
        <TailorDashboardHeader
          title={isComplete ? "Edit Tailor Profile" : "Tailor Profile Setup"}
          subtitle={
            isComplete
              ? "Manage your workshop branding, craft & pricing"
              : "Complete your store profile to start receiving orders"
          }
          showBack={true}
          onBackPress={handlePrevStep}
          rightText={isComplete ? (isSaving ? "Saving..." : "Save") : undefined}
          onRightPress={isComplete ? handleSave : undefined}
          showDivider={false}
        />

        {/* Craft Segmented Steps & Progress Bar */}
        <View className="bg-white border-b border-brand-border px-4 pt-1 pb-3 shadow-xs">
          {/* Step indicator */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1">
              <Text className="text-[12px] font-black text-brand-dark" numberOfLines={1}>
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].subtitle}
              </Text>
            </View>
          </View>

          <View className="h-1.5 w-full rounded-full bg-brand-surface overflow-hidden mb-2.5">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </View>

          {/* Segmented Pill Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id || isComplete;
              return (
                <TouchableOpacity
                  key={step.id}
                  activeOpacity={0.7}
                  onPress={() => handleStepSelect(step.id)}
                  className={`flex-row items-center px-3.5 py-2 rounded-xl border ${
                    isActive
                      ? "bg-primary-50 border-primary shadow-xs"
                      : isPast
                      ? "bg-white border-brand-border"
                      : "bg-brand-surface/60 border-transparent"
                  }`}
                >
                  <View
                    className={`h-6 w-6 rounded-lg items-center justify-center mr-2 ${
                      isActive
                        ? "bg-primary"
                        : isPast
                        ? "bg-primary/15"
                        : "bg-brand-surface"
                    }`}
                  >
                    {isPast && !isActive ? (
                      <Ionicons name="checkmark" size={13} color="#14919B" />
                    ) : (
                      <Ionicons
                        name={step.icon as any}
                        size={13}
                        color={isActive ? "#FFFFFF" : "#6F767E"}
                      />
                    )}
                  </View>
                  <Text
                    className={`text-[12px] ${
                      isActive
                        ? "font-black text-primary"
                        : isPast
                        ? "font-bold text-brand-dark"
                        : "font-medium text-brand-gray"
                    }`}
                  >
                    {step.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          className="px-5 pt-4"
        >
          {/* STEP 1: Basic & Contact Details */}
          {currentStep === 1 && (
            <View>
              {/* Status Badge */}
              {!isComplete ? (
                <View className="mb-4 flex-row items-start rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                  <View className="h-8 w-8 rounded-xl bg-amber-100 items-center justify-center mr-3 mt-0.5">
                    <Ionicons name="sparkles" size={16} color="#D97706" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[13px] font-black text-amber-900">
                      Profile Setup In Progress
                    </Text>
                    <Text className="mt-0.5 text-[12px] leading-4 text-amber-700">
                      Complete all 4 steps to start receiving stitching orders and appear in local tailor search results.
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="mb-4 flex-row items-center rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5">
                  <View className="h-8 w-8 rounded-xl bg-emerald-100 items-center justify-center mr-3">
                    <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[13px] font-black text-emerald-900">
                      Storefront Live & Verified
                    </Text>
                    <Text className="text-[11px] text-emerald-700">
                      Your tailor profile is visible to customers across the region.
                    </Text>
                  </View>
                </View>
              )}

              <View className="rounded-2xl border border-brand-border bg-white p-5 shadow-xs mb-4">
                <Text className="mb-1 text-[16px] font-black tracking-tight text-brand-dark">
                  Shop & Master Details
                </Text>
                <Text className="mb-4 text-[12px] font-medium text-brand-gray">
                  Provide your business identity and primary contact information
                </Text>

                {/* Shop / Business Name */}
                <View className="mb-4">
                  <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                    Business / Shop Name *
                  </Text>
                  <TextInput
                    value={businessName}
                    onChangeText={setBusinessName}
                    placeholder="e.g. Rekha Designer Tailors"
                    placeholderTextColor="#9CA3AF"
                    className="h-12 rounded-xl border border-brand-border bg-brand-surface/30 px-4 text-[13.5px] font-medium text-brand-dark"
                  />
                </View>

                {/* Owner Full Name */}
                <View className="mb-4">
                  <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                    Tailor / Master Name
                  </Text>
                  <TextInput
                    value={ownerName}
                    onChangeText={setOwnerName}
                    placeholder="e.g. Master Rekha"
                    placeholderTextColor="#9CA3AF"
                    className="h-12 rounded-xl border border-brand-border bg-brand-surface/30 px-4 text-[13.5px] font-medium text-brand-dark"
                  />
                </View>

                {/* Phone Number */}
                <View className="mb-4">
                  <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                    Phone / WhatsApp Number
                  </Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="e.g. +91 98765 43210"
                    keyboardType="phone-pad"
                    placeholderTextColor="#9CA3AF"
                    className="h-12 rounded-xl border border-brand-border bg-brand-surface/30 px-4 text-[13.5px] font-medium text-brand-dark"
                  />
                </View>

                {/* Experience Years */}
                <View className="mb-4">
                  <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                    Years of Experience
                  </Text>
                  <TextInput
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                    placeholder="e.g. 8"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                    className="h-12 rounded-xl border border-brand-border bg-brand-surface/30 px-4 text-[13.5px] font-medium text-brand-dark"
                  />
                </View>

                {/* Organization Name */}
                <View>
                  <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                    Organization Name (Optional)
                  </Text>
                  <TextInput
                    value={organizationName}
                    onChangeText={setOrganizationName}
                    placeholder="e.g. sundrop"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    className="h-12 rounded-xl border border-brand-border bg-brand-surface/30 px-4 text-[13.5px] font-medium text-brand-dark"
                  />
                  <Text className="mt-1 text-[11px] text-brand-gray">
                    Set to "sundrop" to display your store in the Sundrop collection.
                  </Text>
                </View>
              </View>

              <View className="rounded-2xl border border-primary/20 bg-primary-50/60 p-4 flex-row items-center">
                <Ionicons name="information-circle-outline" size={20} color="#14919B" />
                <Text className="ml-2.5 flex-1 text-[12px] leading-4 text-brand-dark">
                  Customers reach out to this contact number when confirming fit appointments or asking questions about fabric choices.
                </Text>
              </View>
            </View>
          )}

          {/* STEP 2: Photos & Branding */}
          {currentStep === 2 && (
            <View>
              <View className="rounded-2xl border border-brand-border bg-white p-5 shadow-xs mb-4">
                <Text className="mb-1 text-[16px] font-black tracking-tight text-brand-dark">
                  Profile & Workshop Photos
                </Text>
                <Text className="mb-4 text-[12px] font-medium text-brand-gray">
                  Visual presentation helps build trust with prospective clients
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
                      <View className="h-16 w-16 rounded-2xl border-2 border-primary/20 bg-primary-50 overflow-hidden items-center justify-center shadow-xs">
                        {avatarUri ? (
                          <Image
                            source={{ uri: avatarUri }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="items-center justify-center w-full h-full bg-primary-50">
                            <Text className="text-[22px] font-black text-primary">
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
                      <Text className="text-[14px] font-black text-brand-dark">
                        Profile Avatar
                      </Text>
                      <Text className="text-[11px] font-medium text-brand-gray mt-0.5">
                        Your face photo or brand emblem
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={pickAvatar}
                    disabled={isUploadingAvatar}
                    className="rounded-xl bg-primary-50 px-3.5 py-2 border border-primary/20 active:bg-primary-100"
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
                      <Text className="text-[14px] font-black text-brand-dark">
                        Workshop Cover Banner
                      </Text>
                      <Text className="text-[11px] font-medium text-brand-gray">
                        Wide photo displayed on your storefront
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={pickShopImage}
                      disabled={isUploadingImage}
                      className="rounded-xl bg-primary-50 px-3.5 py-2 border border-primary/20 active:bg-primary-100"
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
                    className="relative h-36 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-primary-50/40 mt-1"
                  >
                    {shopImage ? (
                      <Image
                        source={{ uri: shopImage }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center justify-center p-4">
                        <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center mb-1">
                          <Ionicons name="image-outline" size={22} color="#14919B" />
                        </View>
                        <Text className="text-[12px] font-bold text-primary">
                          Tap to select banner photo (16:9)
                        </Text>
                        <Text className="text-[11px] text-brand-gray mt-0.5 text-center">
                          Workshop exterior, showroom display or stitching bench
                        </Text>
                      </View>
                    )}

                    {isUploadingImage ? (
                      <View className="absolute inset-0 items-center justify-center bg-black/40">
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="mt-1 text-[11px] font-bold text-white">
                          Uploading banner...
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                </View>
              </View>

              <View className="rounded-2xl border border-primary/20 bg-primary-50/60 p-4 flex-row items-center">
                <Ionicons name="sparkles-outline" size={20} color="#14919B" />
                <Text className="ml-2.5 flex-1 text-[12px] leading-4 text-brand-dark">
                  Photos can also be updated anytime later. Clear, well-lit pictures improve your ranking in local tailor search results.
                </Text>
              </View>
            </View>
          )}

          {/* STEP 3: Location & Map Pin */}
          {currentStep === 3 && (
            <View>
              <View className="rounded-2xl border border-brand-border bg-white p-5 shadow-xs mb-4">
                <Text className="mb-1 text-[16px] font-black tracking-tight text-brand-dark">
                  Shop Location & Map Pin
                </Text>
                <Text className="mb-4 text-[12px] font-medium text-brand-gray">
                  Pin your exact boutique or workshop location on the map. Your city and address are set automatically.
                </Text>

                {/* Interactive Map Pin Box (Placed above address fields) */}
                <View className="rounded-2xl border border-brand-border bg-brand-surface/30 p-4 mb-4">
                  <View className="flex-row items-center justify-between mb-3.5">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="h-8 w-8 rounded-xl bg-primary-50 items-center justify-center mr-2.5">
                        <Ionicons name="location" size={18} color="#14919B" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[13px] font-black text-brand-dark">
                          Exact Map Marker
                        </Text>
                        <Text className="text-[11px] text-brand-gray" numberOfLines={1}>
                          Used for customer search and distance calculations
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      accessibilityRole="button"
                      activeOpacity={0.8}
                      onPress={() => setIsMapModalOpen(true)}
                      className="flex-row items-center rounded-xl bg-primary px-3.5 py-2 shadow-xs"
                    >
                      <Ionicons name="map" size={13} color="#FFFFFF" />
                      <Text className="ml-1 text-[11px] font-bold text-white">
                        {hasLocationPinned ? "Adjust Pin" : "Set on Map"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {hasLocationPinned ? (
                    <View className="overflow-hidden rounded-xl border border-brand-border bg-white">
                      <TailorLeafletMap
                        latitude={latitude}
                        longitude={longitude}
                        shopName={businessName || "Your Tailor Shop"}
                        locationText={address ? `${address}, ${city}` : city || "Shop Location"}
                        height={140}
                        interactive={false}
                      />
                      <View className="bg-primary-50/40 p-3.5 border-t border-brand-border">
                        <View className="flex-row items-center justify-between mb-1.5">
                          <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                            <Ionicons name="pin" size={14} color="#14919B" />
                            <Text className="text-[12px] font-black text-brand-dark" numberOfLines={1}>
                              {address || "Exact Shop Spot Selected"}
                            </Text>
                          </View>
                          <View className="rounded-md bg-emerald-100 px-2 py-0.5">
                            <Text className="text-[10px] font-black text-emerald-800">✓ Pin Linked</Text>
                          </View>
                        </View>
                        <View className="flex-row items-center justify-between mt-1 pt-2 border-t border-brand-border/60">
                          <Text className="text-[11px] font-bold text-brand-dark">
                            City: {city || "Not set"}
                          </Text>
                          <Text className="text-[10px] font-mono font-black text-primary">
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
                      className="items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary-50/40 py-6 px-4"
                    >
                      <View className="h-11 w-11 rounded-2xl bg-primary/10 items-center justify-center mb-2">
                        <Ionicons name="navigate" size={24} color="#14919B" />
                      </View>
                      <Text className="text-[13px] font-black text-primary text-center">
                        Tap to Pin Your Shop on Interactive Map
                      </Text>
                      <Text className="text-[11px] text-brand-gray text-center mt-1">
                        Drag the pin or use GPS. Address, city & coordinates auto-fill automatically.
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* City / Town (Uneditable - auto-set from map) */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-[13px] font-bold text-brand-dark">
                      City / Town *
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="lock-closed" size={11} color="#6F767E" />
                      <Text className="text-[11px] font-semibold text-brand-gray">
                        Auto-set by Map
                      </Text>
                    </View>
                  </View>
                  <TextInput
                    value={city}
                    editable={false}
                    placeholder="Auto-set when you pin shop on map above"
                    placeholderTextColor="#9CA3AF"
                    className="h-12 rounded-xl border border-brand-border bg-gray-100/80 px-4 text-[13.5px] font-semibold text-brand-dark opacity-90"
                  />
                </View>

                {/* Shop / Workshop Address (Uneditable - auto-set from map) */}
                <View className="mb-2">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-[13px] font-bold text-brand-dark">
                      Shop / Workshop Address
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="lock-closed" size={11} color="#6F767E" />
                      <Text className="text-[11px] font-semibold text-brand-gray">
                        Auto-set by Map
                      </Text>
                    </View>
                  </View>
                  <TextInput
                    value={address}
                    editable={false}
                    placeholder="Auto-set when you pin shop on map above"
                    placeholderTextColor="#9CA3AF"
                    className="h-12 rounded-xl border border-brand-border bg-gray-100/80 px-4 text-[13.5px] font-semibold text-brand-dark opacity-90"
                  />
                  <Text className="mt-1 text-[11px] text-brand-gray">
                    Tap "Set on Map" above to position your pin. City and address update automatically.
                  </Text>
                </View>
              </View>

              <View className="rounded-2xl border border-primary/20 bg-primary-50/60 p-4 flex-row items-center">
                <Ionicons name="navigate-outline" size={20} color="#14919B" />
                <Text className="ml-2.5 flex-1 text-[12px] leading-4 text-brand-dark">
                  Customers in your area search tailors by proximity. Accurate coordinates ensure your shop shows in "Nearby Tailors".
                </Text>
              </View>
            </View>
          )}

          {/* STEP 4: Craft, Specialties & Pricing */}
          {currentStep === 4 && (
            <View>
              <View className="rounded-2xl border border-brand-border bg-white p-5 shadow-xs mb-4">
                <Text className="mb-1 text-[16px] font-black tracking-tight text-brand-dark">
                  Services, Specialties & Pricing
                </Text>
                <Text className="mb-4 text-[12px] font-medium text-brand-gray">
                  Define your stitching crafts and starting pricing for customers
                </Text>

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
                    className="h-12 rounded-xl border border-brand-border bg-brand-surface/30 px-4 text-[13.5px] font-medium text-brand-dark"
                  />
                </View>

                {/* Specialties */}
                <Text className="mb-1 text-[13px] font-bold text-brand-dark">
                  Tailoring Specialties *
                </Text>
                <Text className="mb-2.5 text-[11px] font-medium text-brand-gray">
                  Select all garments and stitching services you offer:
                </Text>

                <View className="mb-3.5 flex-row flex-wrap gap-2">
                  {DEFAULT_SPECIALTIES.map((spec) => {
                    const isSelected = selectedSpecialties.includes(spec);
                    return (
                      <TouchableOpacity
                        key={spec}
                        onPress={() => toggleSpecialty(spec)}
                        className={`flex-row items-center rounded-xl border px-3.5 py-2 ${
                          isSelected
                            ? "border-primary bg-primary-50"
                            : "border-brand-border bg-brand-surface/40"
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
                              ? "font-black text-primary"
                              : "font-semibold text-brand-dark"
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
                    className="h-11 flex-1 rounded-xl border border-brand-border bg-brand-surface/30 px-3.5 text-[13px] font-medium text-brand-dark"
                  />
                  <TouchableOpacity
                    onPress={handleAddCustomSpecialty}
                    className="h-11 items-center justify-center rounded-xl bg-primary-50 border border-primary/20 px-4"
                  >
                    <Text className="text-[12px] font-black text-primary">Add</Text>
                  </TouchableOpacity>
                </View>

                {/* Bio / About */}
                <View>
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
                    className="h-28 rounded-xl border border-brand-border bg-brand-surface/30 p-3.5 text-[13px] font-medium text-brand-dark"
                  />
                </View>
              </View>

              {/* Profile Overview Card */}
              <View className="rounded-2xl border border-brand-border bg-brand-surface/70 p-4 mb-2">
                <Text className="text-[13px] font-black text-brand-dark mb-2.5">
                  Quick Profile Summary
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <View className="rounded-xl bg-white border border-brand-border px-3 py-1.5 shadow-2xs">
                    <Text className="text-[11px] text-brand-gray">
                      Shop: <Text className="font-bold text-brand-dark">{businessName || "Not set"}</Text>
                    </Text>
                  </View>
                  <View className="rounded-xl bg-white border border-brand-border px-3 py-1.5 shadow-2xs">
                    <Text className="text-[11px] text-brand-gray">
                      City: <Text className="font-bold text-brand-dark">{city || "Not set"}</Text>
                    </Text>
                  </View>
                  <View className="rounded-xl bg-white border border-brand-border px-3 py-1.5 shadow-2xs">
                    <Text className="text-[11px] text-brand-gray">
                      Price: <Text className="font-black text-primary">₹ {startingPrice || "0"}</Text>
                    </Text>
                  </View>
                  <View className="rounded-xl bg-white border border-brand-border px-3 py-1.5 shadow-2xs">
                    <Text className="text-[11px] text-brand-gray">
                      Specialties: <Text className="font-bold text-brand-dark">{selectedSpecialties.length}</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Bottom Step Actions */}
          <View className="mt-5 flex-row items-center gap-3">
            {currentStep > 1 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePrevStep}
                className="h-12 px-5 flex-row items-center justify-center rounded-xl border border-brand-border bg-white shadow-xs active:bg-brand-surface"
              >
                <Ionicons name="arrow-back" size={17} color="#1A1D1F" />
                <Text className="ml-1.5 text-[13px] font-bold text-brand-dark">
                  Back
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleNextStep}
              disabled={isSaving}
              className="h-12 flex-1 flex-row items-center justify-center rounded-xl overflow-hidden shadow-sm relative"
            >
              <ButtonTexture variant="greenish" borderRadius={12} />
              {isSaving ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-[14px] font-black text-white">Saving...</Text>
                </View>
              ) : currentStep < STEPS.length ? (
                <View className="flex-row items-center">
                  <Text className="mr-1.5 text-[14px] font-black text-white">
                    Next: {STEPS[currentStep].title}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={19}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-[15px] font-black text-white">
                    Save Tailor Profile
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Save Option for existing profile */}
          {isComplete && currentStep < STEPS.length && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSave}
              disabled={isSaving}
              className="mt-3.5 py-2 items-center justify-center"
            >
              <Text className="text-[13px] font-bold text-primary">
                Quick Save All Changes Now
              </Text>
            </TouchableOpacity>
          )}
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
