import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PlaceholderVisual } from "../components/PlaceholderVisual";
import { measurementsApi } from "../../../api/measurements.api";

const bustGuide = require("@/assets/illustrations/measurements-community-checkout/measurements/bust-guide.png");

export default function MeasurementDetailsScreen() {
  const { measurementId } = useLocalSearchParams<{ measurementId?: string }>();

  const handleDelete = () => {
    Alert.alert(
      "Delete Measurement",
      "Are you sure you want to delete this measurement profile?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (measurementId) {
              await measurementsApi.deleteMeasurement(measurementId).catch(() => {});
            }
            router.back();
          },
        },
      ]
    );
  };

  return (
    <MccScreenShell>
      <MccHeader title="Measurement Details" showBack rightText="" />
      <View className="px-5 pb-8">
        <Text className="text-[15px] font-semibold text-brand-dark">Standard Profile</Text>
        <View className="mt-4 flex-row items-end">
          <Text className="text-[36px] font-bold text-brand-dark">34</Text>
          <Text className="mb-2 ml-2 text-[14px] text-brand-dark">in</Text>
        </View>
        <Text className="mb-8 mt-1 text-[12px] text-brand-gray">inches</Text>

        <Text className="mb-3 text-[13px] font-semibold text-brand-dark">How to Measure</Text>
        <View className="mb-6 flex-row rounded-xl border border-brand-border p-3 bg-white">
          <Text className="flex-1 text-[12px] leading-5 text-brand-dark">
            Measure around the fullest part of your bust and waist with measuring tape relaxed.
          </Text>
          <PlaceholderVisual image={bustGuide} variant="body" size="sm" tone="cream" />
        </View>

        <Text className="text-[12px] font-semibold text-brand-dark">Added On</Text>
        <Text className="mb-5 mt-2 text-[12px] text-brand-dark">October 2026</Text>
        <Text className="text-[12px] font-semibold text-brand-dark">Last Updated</Text>
        <Text className="mt-2 text-[12px] text-brand-dark">October 2026</Text>

        <View className="mt-20 flex-row gap-3">
          <TouchableOpacity
            onPress={handleDelete}
            className="h-[52px] flex-1 items-center justify-center rounded-xl border border-[#F5D1D1] bg-[#FFF3F3]"
          >
            <Text className="text-[14px] font-semibold text-[#D73232]">Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/measurements/new" as any)}
            className="h-[52px] flex-1 items-center justify-center rounded-xl bg-primary"
          >
            <Text className="text-[14px] font-semibold text-white">Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </MccScreenShell>
  );
}
