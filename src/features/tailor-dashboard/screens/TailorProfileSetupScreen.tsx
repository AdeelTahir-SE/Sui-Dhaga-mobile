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
  const { profile, isLoading, isSaving, isComplete, saveProfile } =
    useTailorProfile();

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [bio, setBio] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [shopImage, setShopImage] = useState<string | null>(null);

  // Sync profile data once loaded
  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName || "");
      setOwnerName(
        profile.name ||
          user?.fullName ||
          user?.name ||
          (user?.email ? user.email.split("@")[0] : "")
      );
      setPhone(profile.phone || user?.phone || "");
      if (typeof profile.location === "object" && profile.location) {
        setCity(profile.location.city || "");
        setAddress(profile.location.address || "");
      } else if (typeof profile.location === "string") {
        setCity(profile.location);
      }
      setExperienceYears(
        profile.experienceYears ? String(profile.experienceYears) : ""
      );
      setStartingPrice(
        profile.startingPrice ? String(profile.startingPrice) : ""
      );
      setBio(profile.bio || "");
      if (profile.specialties && profile.specialties.length > 0) {
        setSelectedSpecialties(profile.specialties);
      } else if (profile.specialty) {
        setSelectedSpecialties([profile.specialty]);
      }
      setShopImage(
        profile.imageUrl ||
          profile.image ||
          profile.avatar ||
          user?.avatar ||
          user?.avatarUrl ||
          null
      );
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

  const pickShopImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access photos is required to update shop picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setShopImage(uri);
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

    const payload = {
      name:
        ownerName.trim() ||
        user?.fullName ||
        user?.name ||
        (user?.email ? user.email.split("@")[0] : "Tailor"),
      businessName: businessName.trim(),
      phone: phone.trim(),
      location: {
        city: city.trim(),
        address: address.trim(),
      },
      experienceYears: Number(experienceYears) || 0,
      startingPrice: priceNum,
      specialties: selectedSpecialties,
      specialty: selectedSpecialties[0] || "",
      bio: bio.trim(),
      imageUrl: shopImage || undefined,
      image: shopImage || undefined,
    };

    const success = await saveProfile(payload);
    if (success) {
      // Also update user's profile if name/phone updated
      if (user) {
        setUser({
          ...user,
          name: payload.name,
          fullName: payload.name,
          phone: payload.phone || user.phone,
          avatar: shopImage || user.avatar,
          avatarUrl: shopImage || user.avatarUrl,
        });
      }
      Alert.alert(
        "Profile Saved",
        "Your tailor profile has been updated successfully!",
        [
          {
            text: "Go to Dashboard",
            onPress: () => router.replace("/tailor-dashboard" as any),
          },
        ]
      );
    } else {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <TailorDashboardShell
        bottomTabs={<TailorDashboardTabs active="Profile" />}
      >
        <View className="flex-1 items-center justify-center py-24">
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
      bottomTabs={<TailorDashboardTabs active="Profile" />}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="h-14 flex-row items-center justify-between border-b border-brand-border px-4">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.replace("/tailor-dashboard" as any)}
            className="h-10 w-10 items-center justify-center rounded-md"
          >
            <Ionicons name="arrow-back" size={22} color="#1A1D1F" />
          </TouchableOpacity>
          <Text className="text-[17px] font-black tracking-tight text-brand-dark">
            Tailor Profile & Details
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

          {/* Shop Image / Photo Banner */}
          <View className="mb-5 items-center">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickShopImage}
              className="relative h-28 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-primary/40 bg-primary-50"
            >
              {shopImage ? (
                <Image
                  source={{ uri: shopImage }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center justify-center p-4">
                  <Ionicons name="camera-outline" size={30} color="#14919B" />
                  <Text className="mt-1 text-[12px] font-semibold text-primary">
                    Upload Shop or Brand Photo
                  </Text>
                  <Text className="text-[10px] text-brand-gray">
                    Tap to select an image from gallery
                  </Text>
                </View>
              )}

              {shopImage && (
                <View className="absolute bottom-2 right-2 flex-row items-center rounded-md bg-black/60 px-2.5 py-1">
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                  <Text className="ml-1 text-[11px] font-semibold text-white">
                    Change
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Business & Personal Info Section */}
          <Text className="mb-2 text-[14px] font-black tracking-tight text-brand-dark">
            Shop & Personal Details
          </Text>

          {/* Shop / Business Name */}
          <View className="mb-3">
            <Text className="mb-1 text-[12px] font-bold text-brand-dark">
              Business / Shop Name *
            </Text>
            <TextInput
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="e.g. Rekha Designer Tailors"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-md border border-brand-border bg-white px-3 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Owner Full Name */}
          <View className="mb-3">
            <Text className="mb-1 text-[12px] font-bold text-brand-dark">
              Tailor / Master Name
            </Text>
            <TextInput
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="e.g. Master Rekha"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-md border border-brand-border bg-white px-3 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Phone Number */}
          <View className="mb-3">
            <Text className="mb-1 text-[12px] font-bold text-brand-dark">
              Phone / WhatsApp Number
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +91 98765 43210"
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-md border border-brand-border bg-white px-3 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Location & Experience */}
          <View className="mt-2 mb-2 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-1 text-[12px] font-bold text-brand-dark">
                City / Town *
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Delhi, Lahore"
                placeholderTextColor="#9CA3AF"
                className="h-11 rounded-md border border-brand-border bg-white px-3 text-[13px] font-medium text-brand-dark"
              />
            </View>
            <View className="w-32">
              <Text className="mb-1 text-[12px] font-bold text-brand-dark">
                Exp. (Years)
              </Text>
              <TextInput
                value={experienceYears}
                onChangeText={setExperienceYears}
                placeholder="e.g. 8"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
                className="h-11 rounded-md border border-brand-border bg-white px-3 text-[13px] font-medium text-brand-dark"
              />
            </View>
          </View>

          {/* Shop Address */}
          <View className="mb-3">
            <Text className="mb-1 text-[12px] font-bold text-brand-dark">
              Shop / Workshop Address
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. Shop 12, Fashion Street Market"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-md border border-brand-border bg-white px-3 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Starting Price */}
          <View className="mb-4">
            <Text className="mb-1 text-[12px] font-bold text-brand-dark">
              Starting Stitching Price (₹ / PKR) *
            </Text>
            <TextInput
              value={startingPrice}
              onChangeText={setStartingPrice}
              placeholder="e.g. 500"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-md border border-brand-border bg-white px-3 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Specialties */}
          <Text className="mt-2 mb-1 text-[14px] font-black tracking-tight text-brand-dark">
            Tailoring Specialties *
          </Text>
          <Text className="mb-2 text-[11px] text-brand-gray">
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
            <Text className="mb-1 text-[12px] font-bold text-brand-dark">
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
              className="h-24 rounded-md border border-brand-border bg-white p-3 text-[13px] font-medium text-brand-dark"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isSaving}
            className="h-12 flex-row items-center justify-center rounded-md bg-primary shadow-sm"
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
                <Text className="text-[14px] font-bold text-white">
                  Save Tailor Profile
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TailorDashboardShell>
  );
}
