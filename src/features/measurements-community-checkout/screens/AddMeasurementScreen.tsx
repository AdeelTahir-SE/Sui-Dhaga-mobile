import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { useMeasurements } from "../hooks/useMeasurements";

const RTW_PRESETS: Record<string, Record<string, number>> = {
  "XS (32)": { chest: 32, waist: 26, hips: 36, shoulder: 13.5, sleeveLength: 20, shirtLength: 38, trouserLength: 36, neck: 14 },
  "S (34)": { chest: 34, waist: 28, hips: 38, shoulder: 14, sleeveLength: 20.5, shirtLength: 39, trouserLength: 37, neck: 15 },
  "M (36)": { chest: 36, waist: 30, hips: 40, shoulder: 14.5, sleeveLength: 21, shirtLength: 40, trouserLength: 38, neck: 15.5 },
  "L (38)": { chest: 38, waist: 32, hips: 42, shoulder: 15, sleeveLength: 21.5, shirtLength: 41, trouserLength: 38.5, neck: 16 },
  "XL (40)": { chest: 40, waist: 35, hips: 44, shoulder: 15.5, sleeveLength: 22, shirtLength: 41.5, trouserLength: 39, neck: 16.5 },
  "XXL (42)": { chest: 42, waist: 38, hips: 47, shoulder: 16, sleeveLength: 22.5, shirtLength: 42, trouserLength: 39.5, neck: 17 },
};

const PERSON_OPTIONS = ["Myself", "Mother", "Sister", "Spouse", "Daughter", "Son", "Friend"];
const GARMENT_TYPES = [
  { id: "kurti_suit", label: "👗 Kurti & Shalwar", sub: "Kameez, Kurti & Pants" },
  { id: "blouse_lehenga", label: "🥻 Blouse & Lehenga", sub: "Choli & Flared Skirt" },
  { id: "mens_kurta", label: "👳 Men's Kurta Pajama", sub: "Kurta, Shalwar & Sherwani" },
  { id: "mens_suit", label: "🤵 Suit & Formal", sub: "Blazers, Shirts & Trousers" },
  { id: "universal", label: "📏 Universal Profile", sub: "All-purpose dimensions" },
];

export default function AddMeasurementScreen() {
  const { addMeasurement } = useMeasurements();

  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [person, setPerson] = useState("Myself");
  const [garmentType, setGarmentType] = useState("kurti_suit");
  const [profileName, setProfileName] = useState("Ayesha - Formal Kurti");
  const [fitPreference, setFitPreference] = useState<"fitted" | "regular" | "loose">("regular");

  // Measurement values
  const [chest, setChest] = useState("36");
  const [waist, setWaist] = useState("30");
  const [hips, setHips] = useState("40");
  const [shoulder, setShoulder] = useState("14.5");
  const [sleeveLength, setSleeveLength] = useState("21");
  const [shirtLength, setShirtLength] = useState("40");
  const [trouserLength, setTrouserLength] = useState("37.5");
  const [inseam, setInseam] = useState("28");
  const [neck, setNeck] = useState("14");
  const [notes, setNotes] = useState("Leave 2-inch inner seam margin for alterations.");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Unit Conversion
  const handleUnitToggle = (newUnit: "in" | "cm") => {
    if (newUnit === unit) return;
    const factor = newUnit === "cm" ? 2.54 : 1 / 2.54;

    const convert = (val: string) => {
      const num = parseFloat(val);
      if (!num || isNaN(num)) return "";
      return newUnit === "cm"
        ? (Math.round(num * factor * 10) / 10).toString()
        : (Math.round(num * factor * 2) / 2).toString();
    };

    setChest(convert(chest));
    setWaist(convert(waist));
    setHips(convert(hips));
    setShoulder(convert(shoulder));
    setSleeveLength(convert(sleeveLength));
    setShirtLength(convert(shirtLength));
    setTrouserLength(convert(trouserLength));
    setInseam(convert(inseam));
    setNeck(convert(neck));
    setUnit(newUnit);
  };

  // Apply Standard Preset
  const applyPreset = (presetName: string) => {
    const data = RTW_PRESETS[presetName];
    if (!data) return;
    const factor = unit === "cm" ? 2.54 : 1;
    const roundVal = (v: number) =>
      unit === "cm" ? (Math.round(v * factor * 10) / 10).toString() : v.toString();

    setChest(roundVal(data.chest));
    setWaist(roundVal(data.waist));
    setHips(roundVal(data.hips));
    setShoulder(roundVal(data.shoulder));
    setSleeveLength(roundVal(data.sleeveLength));
    setShirtLength(roundVal(data.shirtLength));
    setTrouserLength(roundVal(data.trouserLength));
    setNeck(roundVal(data.neck));

    Alert.alert("Preset Applied", `Baseline dimensions from ${presetName} loaded.`);
  };

  const handleSave = async () => {
    if (!profileName.trim()) {
      Alert.alert("Missing Profile Name", "Please give this measurement set a memorable name.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addMeasurement({
        profileName: profileName.trim(),
        unit: unit === "in" ? "inches" : "cm",
        chest: parseFloat(chest) || undefined,
        waist: parseFloat(waist) || undefined,
        hips: parseFloat(hips) || undefined,
        shoulder: parseFloat(shoulder) || undefined,
        sleeveLength: parseFloat(sleeveLength) || undefined,
        shirtLength: parseFloat(shirtLength) || undefined,
        trouserLength: parseFloat(trouserLength) || undefined,
        inseam: parseFloat(inseam) || undefined,
        neck: parseFloat(neck) || undefined,
        notes: `[Fit: ${fitPreference}, For: ${person}] ${notes.trim()}`.trim(),
      });

      Alert.alert("Saved! 📏", "Your bespoke measurement profile is ready.", [
        {
          text: "View Measurements",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert("Save Error", err.message || "Failed to save measurements.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MccScreenShell>
      <MccHeader title="Add Measurement Profile" showBack rightText="" />
      <ScrollView className="px-5 pb-12" showsVerticalScrollIndicator={false}>
        {/* Profile Name */}
        <View className="mb-4">
          <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">Profile Name *</Text>
          <View className="rounded-xl border border-brand-border px-3.5 py-2.5 bg-white shadow-xs">
            <TextInput
              value={profileName}
              onChangeText={setProfileName}
              placeholder="e.g. Ayesha - Formal Kurti, Mom Salwar"
              placeholderTextColor="#9CA3AF"
              className="text-[13px] text-brand-dark"
            />
          </View>
        </View>

        {/* Target Person Pills */}
        <View className="mb-4">
          <Text className="mb-1.5 text-[12px] font-bold text-brand-dark uppercase tracking-wide">
            Who is this for?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {PERSON_OPTIONS.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => {
                  setPerson(p);
                  if (p !== "Myself") setProfileName(`${p}'s Measurements`);
                }}
                className={`mr-2 rounded-full px-3.5 py-1.5 border ${
                  person === p ? "bg-primary border-primary" : "bg-white border-brand-border"
                }`}
              >
                <Text
                  className={`text-[12px] font-semibold ${
                    person === p ? "text-white" : "text-brand-dark"
                  }`}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Silhouette / Garment Type */}
        <View className="mb-4">
          <Text className="mb-1.5 text-[12px] font-bold text-brand-dark uppercase tracking-wide">
            Garment Silhouette
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {GARMENT_TYPES.map((g) => (
              <TouchableOpacity
                key={g.id}
                onPress={() => setGarmentType(g.id)}
                className={`mr-2.5 rounded-2xl p-3 border min-w-[140px] ${
                  garmentType === g.id
                    ? "bg-[#FFF8F6] border-primary"
                    : "bg-white border-brand-border"
                }`}
              >
                <Text className="text-[13px] font-bold text-brand-dark">{g.label}</Text>
                <Text className="text-[10px] text-brand-gray mt-0.5">{g.sub}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Fit Preference & Unit Selection Row */}
        <View className="mb-4 flex-row gap-3">
          {/* Fit Preference */}
          <View className="flex-1">
            <Text className="mb-1.5 text-[12px] font-bold text-brand-dark uppercase tracking-wide">
              Fit Ease
            </Text>
            <View className="flex-row rounded-xl border border-brand-border bg-brand-surface p-1">
              {(["fitted", "regular", "loose"] as const).map((fit) => (
                <TouchableOpacity
                  key={fit}
                  onPress={() => setFitPreference(fit)}
                  className={`flex-1 items-center justify-center rounded-lg py-1.5 ${
                    fitPreference === fit ? "bg-primary" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold capitalize ${
                      fitPreference === fit ? "text-white" : "text-brand-dark"
                    }`}
                  >
                    {fit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Unit Toggle */}
          <View className="w-[110px]">
            <Text className="mb-1.5 text-[12px] font-bold text-brand-dark uppercase tracking-wide">
              Unit
            </Text>
            <View className="flex-row rounded-xl border border-brand-border bg-brand-surface p-1">
              <TouchableOpacity
                onPress={() => handleUnitToggle("in")}
                className={`flex-1 items-center justify-center rounded-lg py-1.5 ${
                  unit === "in" ? "bg-primary" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    unit === "in" ? "text-white" : "text-brand-dark"
                  }`}
                >
                  in
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleUnitToggle("cm")}
                className={`flex-1 items-center justify-center rounded-lg py-1.5 ${
                  unit === "cm" ? "bg-primary" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    unit === "cm" ? "text-white" : "text-brand-dark"
                  }`}
                >
                  cm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Fill Presets */}
        <View className="mb-5 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold text-brand-dark">⚡ Quick Baseline Presets:</Text>
            <Text className="text-[10px] text-brand-gray">Tap to auto-fill</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {Object.keys(RTW_PRESETS).map((pName) => (
              <TouchableOpacity
                key={pName}
                onPress={() => applyPreset(pName)}
                className="mr-2 rounded-lg border border-brand-border bg-white px-2.5 py-1"
              >
                <Text className="text-[11px] font-semibold text-brand-dark">{pName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Section 1: Upper Body */}
        <Text className="mb-2 text-[12px] font-bold text-brand-dark uppercase tracking-wider">
          📐 Upper Body Dimensions ({unit})
        </Text>
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="mb-1 text-[11px] font-medium text-brand-gray">Bust / Chest</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2 bg-white shadow-xs">
              <TextInput value={chest} onChangeText={setChest} keyboardType="numeric" className="text-[13px] font-bold text-brand-dark" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-[11px] font-medium text-brand-gray">Waist</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2 bg-white shadow-xs">
              <TextInput value={waist} onChangeText={setWaist} keyboardType="numeric" className="text-[13px] font-bold text-brand-dark" />
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="mb-1 text-[11px] font-medium text-brand-gray">Hips</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2 bg-white shadow-xs">
              <TextInput value={hips} onChangeText={setHips} keyboardType="numeric" className="text-[13px] font-bold text-brand-dark" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-[11px] font-medium text-brand-gray">Shoulder (Teera)</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2 bg-white shadow-xs">
              <TextInput value={shoulder} onChangeText={setShoulder} keyboardType="numeric" className="text-[13px] font-bold text-brand-dark" />
            </View>
          </View>
        </View>

        {/* Section 2: Sleeves & Lengths */}
        <Text className="mb-2 text-[12px] font-bold text-brand-dark uppercase tracking-wider">
          📏 Sleeves & Lengths ({unit})
        </Text>
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="mb-1 text-[11px] font-medium text-brand-gray">Sleeve Length</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2 bg-white shadow-xs">
              <TextInput value={sleeveLength} onChangeText={setSleeveLength} keyboardType="numeric" className="text-[13px] font-bold text-brand-dark" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-[11px] font-medium text-brand-gray">Shirt / Top Length</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2 bg-white shadow-xs">
              <TextInput value={shirtLength} onChangeText={setShirtLength} keyboardType="numeric" className="text-[13px] font-bold text-brand-dark" />
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="mb-1 text-[11px] font-medium text-brand-gray">Trouser / Bottom Length</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2 bg-white shadow-xs">
              <TextInput value={trouserLength} onChangeText={setTrouserLength} keyboardType="numeric" className="text-[13px] font-bold text-brand-dark" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-[11px] font-medium text-brand-gray">Neck / Collar</Text>
            <View className="rounded-xl border border-brand-border px-3 py-2 bg-white shadow-xs">
              <TextInput value={neck} onChangeText={setNeck} keyboardType="numeric" className="text-[13px] font-bold text-brand-dark" />
            </View>
          </View>
        </View>

        {/* Tailor Notes */}
        <View className="mb-6">
          <Text className="mb-1.5 text-[12px] font-bold text-brand-dark uppercase tracking-wider">
            📝 Tailor Special Instructions
          </Text>
          <View className="rounded-xl border border-brand-border px-3.5 py-2.5 bg-white shadow-xs">
            <TextInput
              multiline
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Leave 2 inch inner margin, deep back neck, padded choli cups"
              placeholderTextColor="#9CA3AF"
              className="min-h-[64px] text-[13px] text-brand-dark"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          className="h-[52px] items-center justify-center rounded-xl bg-primary shadow-sm"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-bold text-white">Save Measurement Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </MccScreenShell>
  );
}
