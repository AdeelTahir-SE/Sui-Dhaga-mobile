import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { router } from "expo-router";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PlaceholderVisual } from "../components/PlaceholderVisual";
import { measurementsApi } from "../../../api/measurements.api";

const bustGuide = require("@/assets/illustrations/measurements-community-checkout/measurements/bust-guide.png");

export default function AddMeasurementScreen() {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [profileName, setProfileName] = useState("Standard Profile");
  const [chest, setChest] = useState("34");
  const [waist, setWaist] = useState("28");
  const [hips, setHips] = useState("36");
  const [shoulder, setShoulder] = useState("14.5");
  const [sleeveLength, setSleeveLength] = useState("22");
  const [shirtLength, setShirtLength] = useState("15");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!profileName.trim()) {
      Alert.alert("Missing Profile Name", "Please provide a name for this measurement set.");
      return;
    }

    setIsSubmitting(true);
    try {
      await measurementsApi.createMeasurement({
        profileName: profileName.trim(),
        unit: unit === "in" ? "inches" : "cm",
        chest: parseFloat(chest) || undefined,
        waist: parseFloat(waist) || undefined,
        hips: parseFloat(hips) || undefined,
        shoulder: parseFloat(shoulder) || undefined,
        sleeveLength: parseFloat(sleeveLength) || undefined,
        shirtLength: parseFloat(shirtLength) || undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert("Success! 📏", "Your measurement profile has been saved.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert("Save Error", err.message || "Failed to save measurements. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MccScreenShell>
      <MccHeader title="Add Measurement" showBack rightText="" />
      <View className="px-5 pb-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[13px] font-semibold text-brand-dark">Unit Preference</Text>
          <View className="flex-row rounded-xl bg-brand-surface p-1 border border-brand-border">
            <TouchableOpacity
              onPress={() => setUnit("cm")}
              className={`rounded-lg px-4 py-1.5 ${unit === "cm" ? "bg-primary" : "bg-transparent"}`}
            >
              <Text className={`text-[12px] font-semibold ${unit === "cm" ? "text-white" : "text-brand-dark"}`}>cm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUnit("in")}
              className={`rounded-lg px-4 py-1.5 ${unit === "in" ? "bg-primary" : "bg-transparent"}`}
            >
              <Text className={`text-[12px] font-semibold ${unit === "in" ? "text-white" : "text-brand-dark"}`}>in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-[13px] font-semibold text-brand-dark">Profile Name</Text>
          <View className="rounded-xl border border-brand-border px-4 py-3 bg-white">
            <TextInput
              value={profileName}
              onChangeText={setProfileName}
              placeholder="e.g. Bridal Lehenga, Formal Suit"
              placeholderTextColor="#9CA3AF"
              className="text-[13px] text-brand-dark"
            />
          </View>
        </View>

        <Text className="mb-2 text-[13px] font-semibold text-brand-dark">How to Measure</Text>
        <View className="mb-4 flex-row rounded-xl border border-brand-border p-3 bg-brand-surface/30">
          <Text className="flex-1 text-[12px] leading-5 text-brand-dark">
            Measure around the fullest part of your bust/chest, waist, and hips with measuring tape relaxed.
          </Text>
          <PlaceholderVisual image={bustGuide} variant="body" size="sm" tone="cream" />
        </View>

        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="mb-1 text-[12px] font-medium text-brand-gray">Bust / Chest ({unit})</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2.5 bg-white">
              <TextInput value={chest} onChangeText={setChest} keyboardType="numeric" className="text-[13px] text-brand-dark" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-[12px] font-medium text-brand-gray">Waist ({unit})</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2.5 bg-white">
              <TextInput value={waist} onChangeText={setWaist} keyboardType="numeric" className="text-[13px] text-brand-dark" />
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="mb-1 text-[12px] font-medium text-brand-gray">Hips ({unit})</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2.5 bg-white">
              <TextInput value={hips} onChangeText={setHips} keyboardType="numeric" className="text-[13px] text-brand-dark" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-[12px] font-medium text-brand-gray">Shoulder ({unit})</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2.5 bg-white">
              <TextInput value={shoulder} onChangeText={setShoulder} keyboardType="numeric" className="text-[13px] text-brand-dark" />
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="mb-1 text-[12px] font-medium text-brand-gray">Arm Length ({unit})</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2.5 bg-white">
              <TextInput value={sleeveLength} onChangeText={setSleeveLength} keyboardType="numeric" className="text-[13px] text-brand-dark" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-[12px] font-medium text-brand-gray">Top Length ({unit})</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2.5 bg-white">
              <TextInput value={shirtLength} onChangeText={setShirtLength} keyboardType="numeric" className="text-[13px] text-brand-dark" />
            </View>
          </View>
        </View>

        <View className="mb-7">
          <Text className="mb-2 text-[13px] font-semibold text-brand-dark">Notes (Optional)</Text>
          <View className="rounded-xl border border-brand-border px-4 py-3 bg-white">
            <TextInput
              multiline
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Prefer relaxed fit around shoulders"
              placeholderTextColor="#9CA3AF"
              className="min-h-[70px] text-[13px] text-brand-dark"
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          className="h-[52px] items-center justify-center rounded-xl bg-primary"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-semibold text-white">Save Measurement</Text>
          )}
        </TouchableOpacity>
      </View>
    </MccScreenShell>
  );
}
