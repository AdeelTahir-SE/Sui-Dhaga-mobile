import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { useMeasurements } from "../hooks/useMeasurements";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

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
  { id: "universal", label: "Universal", sub: "All apparel, tops, bottoms & dresses" },
  { id: "kurti_suit", label: "Kurti & Shalwar", sub: "Kameez, Kurti & Pants" },
  { id: "blouse_lehenga", label: "Blouse & Lehenga", sub: "Choli & Flared Skirt" },
  { id: "mens_kurta", label: "Men's Kurta", sub: "Kurta Pajama & Shalwar" },
  { id: "mens_suit", label: "Suit & Formal", sub: "Blazers, Shirts & Trousers" },
];

export default function AddMeasurementScreen() {
  const { measurements, addMeasurement, updateMeasurement } = useMeasurements();
  const params = useLocalSearchParams<{ editId?: string }>();
  const editId = params.editId;
  const isEditing = Boolean(editId);

  // Multi-step wizard state: 1: Person & Fit, 2: Dimensions, 3: Notes & Review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [person, setPerson] = useState("");
  const [garmentType, setGarmentType] = useState("universal");
  const [profileName, setProfileName] = useState("");
  const [profileNameManuallyEdited, setProfileNameManuallyEdited] = useState(false);
  const [fitPreference, setFitPreference] = useState<"fitted" | "regular" | "loose">("regular");

  // Measurement values (default empty)
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [sleeveLength, setSleeveLength] = useState("");
  const [shirtLength, setShirtLength] = useState("");
  const [trouserLength, setTrouserLength] = useState("");
  const [inseam, setInseam] = useState("");
  const [neck, setNeck] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepopulate if editing
  useEffect(() => {
    if (editId && measurements.length > 0) {
      const existing = measurements.find((m) => m.id === editId);
      if (existing) {
        setProfileName(existing.profileName || "");
        setProfileNameManuallyEdited(true);

        const forMatch = existing.notes?.match(/For:\s*([^\]]+)/i);
        const fitMatch = existing.notes?.match(/Fit:\s*([^,\s\]]+)/i);
        if (forMatch) {
          setPerson(forMatch[1].trim());
        } else {
          setPerson(existing.profileName?.replace(/'s Measurements.*/i, "").trim() || "Myself");
        }

        if (fitMatch && ["fitted", "regular", "loose"].includes(fitMatch[1].toLowerCase())) {
          setFitPreference(fitMatch[1].toLowerCase() as any);
        }

        setUnit(existing.unit === "cm" ? "cm" : "in");
        setChest(existing.chest !== undefined ? String(existing.chest) : "");
        setWaist(existing.waist !== undefined ? String(existing.waist) : "");
        setHips(existing.hips !== undefined ? String(existing.hips) : "");
        setShoulder(existing.shoulder !== undefined ? String(existing.shoulder) : "");
        setSleeveLength(existing.sleeveLength !== undefined ? String(existing.sleeveLength) : "");
        setShirtLength(existing.shirtLength !== undefined ? String(existing.shirtLength) : "");
        setTrouserLength(existing.trouserLength !== undefined ? String(existing.trouserLength) : "");
        setInseam(existing.inseam !== undefined ? String(existing.inseam) : "");
        setNeck(existing.neck !== undefined ? String(existing.neck) : "");

        const cleanNotes = existing.notes
          ? existing.notes.replace(/\[Fit:[^\]]+\]\s*/g, "").trim()
          : "";
        setNotes(cleanNotes);
      }
    }
  }, [editId, measurements]);

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

  const handleNextToStep2 = () => {
    if (!person.trim()) {
      Alert.alert(
        "Person Name Required",
        "Please enter the person's name for whom these measurements are taken (e.g. Fatima, Ahmed, or Myself)."
      );
      return;
    }
    setStep(2);
  };

  const handleSave = async () => {
    if (!person.trim()) {
      Alert.alert("Missing Person Name", "Please enter the person's name.");
      setStep(1);
      return;
    }
    const finalProfileName = profileName.trim() || `${person.trim()}'s Measurements`;

    setIsSubmitting(true);
    try {
      const payload = {
        profileName: finalProfileName,
        unit: (unit === "in" ? "inches" : "cm") as "inches" | "cm",
        chest: parseFloat(chest) || undefined,
        waist: parseFloat(waist) || undefined,
        hips: parseFloat(hips) || undefined,
        shoulder: parseFloat(shoulder) || undefined,
        sleeveLength: parseFloat(sleeveLength) || undefined,
        shirtLength: parseFloat(shirtLength) || undefined,
        trouserLength: parseFloat(trouserLength) || undefined,
        inseam: parseFloat(inseam) || undefined,
        neck: parseFloat(neck) || undefined,
        notes: `[Fit: ${fitPreference}, For: ${person.trim()}] ${notes.trim()}`.trim(),
      };

      if (isEditing && editId) {
        await updateMeasurement(editId, payload);
        Alert.alert("Updated! 📏", "Your measurement profile has been updated.", [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ]);
      } else {
        await addMeasurement(payload);
        Alert.alert("Saved! 📏", "Your bespoke measurement profile is ready.", [
          {
            text: "View Measurements",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (err: any) {
      Alert.alert("Save Error", err.message || "Failed to save measurements.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledMeasurementsList = [
    { label: "Bust / Chest", val: chest },
    { label: "Waist", val: waist },
    { label: "Hips", val: hips },
    { label: "Shoulder Width", val: shoulder },
    { label: "Arm / Sleeve", val: sleeveLength },
    { label: "Top / Shirt", val: shirtLength },
    { label: "Trouser / Bottom", val: trouserLength },
    { label: "Inseam", val: inseam },
    { label: "Neck / Collar", val: neck },
  ].filter((item) => item.val.trim() !== "");

  return (
    <MccScreenShell>
      <MccHeader
        title={
          isEditing
            ? `Edit Measurements`
            : step === 1
            ? "Person & Fit"
            : step === 2
            ? "Body Dimensions"
            : "Review & Save"
        }
        subtitle={`Step ${step} of 3`}
        showBack={true}
        hideRight={true}
        onBackPress={() => {
          if (step > 1) {
            setStep((s) => (s - 1) as 1 | 2 | 3);
          } else {
            router.back();
          }
        }}
      />

      <ScrollView className="px-5 pb-12" showsVerticalScrollIndicator={false}>
        {/* Step Indicator Tabs */}
        <View className="my-4 flex-row items-center justify-between">
          {[
            { s: 1, label: "Person & Fit" },
            { s: 2, label: "Dimensions" },
            { s: 3, label: "Review & Notes" },
          ].map((item, idx) => {
            const isActive = step === item.s;
            const isCompleted = step > item.s;
            return (
              <React.Fragment key={item.s}>
                {idx > 0 && (
                  <View
                    className={`h-[2px] flex-1 mx-2 ${
                      step >= item.s ? "bg-[#00949D]" : "bg-[#E5E7EB]"
                    }`}
                  />
                )}
                <TouchableOpacity
                  onPress={() => {
                    if (isCompleted) setStep(item.s as 1 | 2 | 3);
                  }}
                  disabled={!isCompleted}
                  className="items-center"
                >
                  <View
                    className={`h-8 w-8 rounded-full items-center justify-center ${
                      isActive
                        ? "bg-[#00949D] shadow-xs"
                        : isCompleted
                        ? "bg-[#00949D]/20 border border-[#00949D]"
                        : "bg-[#F3F4F6] border border-[#E5E7EB]"
                    }`}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="#00949D" />
                    ) : (
                      <Text
                        className={`text-[12px] font-bold ${
                          isActive ? "text-white" : "text-[#6B7280]"
                        }`}
                      >
                        {item.s}
                      </Text>
                    )}
                  </View>
                  <Text
                    className={`mt-1 text-[10px] font-bold ${
                      isActive ? "text-[#00949D]" : isCompleted ? "text-brand-dark" : "text-[#9CA3AF]"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* STEP 1: Person & Fit Preference */}
        {step === 1 && (
          <View>
            <View className="mb-4">
              <Text className="text-[20px] font-black text-brand-dark tracking-tight">
                Who is this for?
              </Text>
              <Text className="mt-0.5 text-[12px] font-medium text-brand-gray">
                Enter the person&apos;s name and choose their silhouette & fit preference.
              </Text>
            </View>

            {/* Person Name Input */}
            <View className="mb-4">
              <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">Person Name *</Text>
              <View className="rounded-xl border border-brand-border px-3.5 py-2.5 bg-white shadow-xs">
                <TextInput
                  value={person}
                  onChangeText={(text) => {
                    setPerson(text);
                    if (!profileNameManuallyEdited) {
                      setProfileName(text.trim() ? `${text.trim()}'s Measurements` : "");
                    }
                  }}
                  placeholder="e.g. Fatima, Ahmed, Sarah, or Myself"
                  placeholderTextColor="#9CA3AF"
                  className="text-[14px] font-semibold text-brand-dark"
                />
              </View>
            </View>

            {/* Quick Suggestion Chips */}
            <View className="mb-4">
              <Text className="mb-1.5 text-[11px] font-bold text-brand-gray uppercase tracking-wide">
                Quick Suggestions
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {PERSON_OPTIONS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => {
                      setPerson(p);
                      if (!profileNameManuallyEdited) {
                        setProfileName(`${p}'s Measurements`);
                      }
                    }}
                    className={`mr-2 rounded-full px-3 py-1.5 border ${
                      person === p ? "bg-[#00949D] border-[#00949D]" : "bg-white border-brand-border"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-semibold ${
                        person === p ? "text-white" : "text-brand-dark"
                      }`}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Profile Label (Optional) */}
            <View className="mb-4">
              <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                Profile Label / Title (Optional)
              </Text>
              <View className="rounded-xl border border-brand-border px-3.5 py-2.5 bg-white shadow-xs">
                <TextInput
                  value={profileName}
                  onChangeText={(text) => {
                    setProfileName(text);
                    setProfileNameManuallyEdited(true);
                  }}
                  placeholder={person ? `${person}'s Measurements` : "e.g. Daily Fit, Formal Wear"}
                  placeholderTextColor="#9CA3AF"
                  className="text-[13px] text-brand-dark"
                />
              </View>
            </View>

            {/* Silhouette / Garment Type - NO ICONS / NO EMOJIS */}
            <View className="mb-4">
              <Text className="mb-1.5 text-[12px] font-bold text-brand-dark uppercase tracking-wide">
                Garment Silhouette
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {GARMENT_TYPES.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setGarmentType(g.id)}
                    className={`mr-2.5 rounded-2xl p-3 border min-w-[135px] ${
                      garmentType === g.id
                        ? "bg-[#00949D]/8 border-[#00949D]"
                        : "bg-white border-brand-border"
                    }`}
                  >
                    <Text className="text-[13px] font-bold text-brand-dark">{g.label}</Text>
                    <Text className="text-[10px] text-brand-gray mt-0.5">{g.sub}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Fit Preference - FULL WIDTH */}
            <View className="mb-6 w-full">
              <Text className="mb-1.5 text-[12px] font-bold text-brand-dark uppercase tracking-wide">
                Fit Ease
              </Text>
              <View className="flex-row rounded-xl border border-brand-border bg-[#F8FAFC] p-1 w-full">
                {(["fitted", "regular", "loose"] as const).map((fit) => (
                  <TouchableOpacity
                    key={fit}
                    onPress={() => setFitPreference(fit)}
                    className={`flex-1 items-center justify-center rounded-lg py-2.5 ${
                      fitPreference === fit ? "bg-[#00949D] shadow-xs" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-bold capitalize ${
                        fitPreference === fit ? "text-white" : "text-brand-dark"
                      }`}
                    >
                      {fit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="mt-1.5 text-[11px] text-brand-gray">
                {fitPreference === "fitted" && "• Fitted: Snug body-hugging ease (+0.5 to 1 in)"}
                {fitPreference === "regular" && "• Regular: Everyday standard comfort ease (+1.5 to 2.5 in)"}
                {fitPreference === "loose" && "• Loose: Relaxed airy comfort ease (+3 to 4 in)"}
              </Text>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleNextToStep2}
              activeOpacity={0.85}
              className="relative h-[52px] w-full items-center justify-center rounded-xl overflow-hidden shadow-sm"
            >
              <ButtonTexture variant="greenish" borderRadius={12} />
              <View className="z-10 flex-row items-center justify-center px-4">
                <Text
                  className="text-[15px] font-bold text-white"
                  style={{
                    textShadowColor: "rgba(0,0,0,0.22)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Continue to Dimensions →
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Body Dimensions */}
        {step === 2 && (
          <View>
            <View className="mb-4">
              <Text className="text-[20px] font-black text-brand-dark tracking-tight">
                Body Dimensions
              </Text>
              <Text className="mt-0.5 text-[12px] font-medium text-brand-gray">
                Universal anatomical measurements for all styles of clothing.
              </Text>
            </View>

            {/* Measurement Unit Selector in Dimensions Stage */}
            <View className="mb-4 rounded-2xl border border-brand-border bg-white p-4 shadow-2xs">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-xl bg-[#00949D]/10 items-center justify-center mr-2.5">
                    <Ionicons name="resize-outline" size={16} color="#00949D" />
                  </View>
                  <View>
                    <Text className="text-[13px] font-bold text-brand-dark">Measurement Unit</Text>
                    <Text className="text-[11px] text-brand-gray">Auto-converts values when switched</Text>
                  </View>
                </View>
              </View>

              {/* Styled Full-Width Segmented Control */}
              <View className="flex-row rounded-xl border border-brand-border/70 bg-[#F1F5F9] p-1">
                <TouchableOpacity
                  onPress={() => handleUnitToggle("in")}
                  activeOpacity={0.85}
                  className={`flex-1 flex-row items-center justify-center rounded-lg py-2.5 ${
                    unit === "in" ? "bg-[#00949D] shadow-xs" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-[13px] font-bold ${
                      unit === "in" ? "text-white" : "text-[#475569]"
                    }`}
                  >
                    Inches (in)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleUnitToggle("cm")}
                  activeOpacity={0.85}
                  className={`flex-1 flex-row items-center justify-center rounded-lg py-2.5 ${
                    unit === "cm" ? "bg-[#00949D] shadow-xs" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-[13px] font-bold ${
                      unit === "cm" ? "text-white" : "text-[#475569]"
                    }`}
                  >
                    Centimeters (cm)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Fill Presets */}
            <View className="mb-5 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[11px] font-bold text-brand-dark">
                  ⚡ Quick Baseline Presets ({unit === "in" ? "Inches" : "CM"}):
                </Text>
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

            {/* Upper Body Card */}
            <View className="mb-4 rounded-2xl border border-brand-border bg-white p-4 shadow-2xs">
              <Text className="mb-3 text-[12px] font-bold text-brand-dark uppercase tracking-wider">
                Upper Torso & Chest ({unit === "in" ? "Inches" : "CM"})
              </Text>
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-medium text-brand-gray">Bust / Chest</Text>
                  <View className="flex-row items-center rounded-xl border border-brand-border px-3 py-2 bg-[#FAFAF9]">
                    <TextInput
                      value={chest}
                      onChangeText={setChest}
                      keyboardType="numeric"
                      placeholder="e.g. 36"
                      className="flex-1 text-[14px] font-bold text-brand-dark"
                    />
                    <Text className="text-[11px] font-bold text-[#94A3B8] ml-1">{unit}</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-medium text-brand-gray">Natural Waist</Text>
                  <View className="flex-row items-center rounded-xl border border-brand-border px-3 py-2 bg-[#FAFAF9]">
                    <TextInput
                      value={waist}
                      onChangeText={setWaist}
                      keyboardType="numeric"
                      placeholder="e.g. 30"
                      className="flex-1 text-[14px] font-bold text-brand-dark"
                    />
                    <Text className="text-[11px] font-bold text-[#94A3B8] ml-1">{unit}</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-medium text-brand-gray">Hips / Seat</Text>
                  <View className="flex-row items-center rounded-xl border border-brand-border px-3 py-2 bg-[#FAFAF9]">
                    <TextInput
                      value={hips}
                      onChangeText={setHips}
                      keyboardType="numeric"
                      placeholder="e.g. 40"
                      className="flex-1 text-[14px] font-bold text-brand-dark"
                    />
                    <Text className="text-[11px] font-bold text-[#94A3B8] ml-1">{unit}</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-medium text-brand-gray">Shoulder Width</Text>
                  <View className="flex-row items-center rounded-xl border border-brand-border px-3 py-2 bg-[#FAFAF9]">
                    <TextInput
                      value={shoulder}
                      onChangeText={setShoulder}
                      keyboardType="numeric"
                      placeholder="e.g. 15"
                      className="flex-1 text-[14px] font-bold text-brand-dark"
                    />
                    <Text className="text-[11px] font-bold text-[#94A3B8] ml-1">{unit}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Lengths & Sleeves Card */}
            <View className="mb-6 rounded-2xl border border-brand-border bg-white p-4 shadow-2xs">
              <Text className="mb-3 text-[12px] font-bold text-brand-dark uppercase tracking-wider">
                Lengths & Sleeves ({unit === "in" ? "Inches" : "CM"})
              </Text>
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-medium text-brand-gray">Arm / Sleeve Length</Text>
                  <View className="flex-row items-center rounded-xl border border-brand-border px-3 py-2 bg-[#FAFAF9]">
                    <TextInput
                      value={sleeveLength}
                      onChangeText={setSleeveLength}
                      keyboardType="numeric"
                      placeholder="e.g. 21"
                      className="flex-1 text-[14px] font-bold text-brand-dark"
                    />
                    <Text className="text-[11px] font-bold text-[#94A3B8] ml-1">{unit}</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-medium text-brand-gray">Shirt / Top Length</Text>
                  <View className="flex-row items-center rounded-xl border border-brand-border px-3 py-2 bg-[#FAFAF9]">
                    <TextInput
                      value={shirtLength}
                      onChangeText={setShirtLength}
                      keyboardType="numeric"
                      placeholder="e.g. 40"
                      className="flex-1 text-[14px] font-bold text-brand-dark"
                    />
                    <Text className="text-[11px] font-bold text-[#94A3B8] ml-1">{unit}</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-medium text-brand-gray">Trouser / Bottom Length</Text>
                  <View className="flex-row items-center rounded-xl border border-brand-border px-3 py-2 bg-[#FAFAF9]">
                    <TextInput
                      value={trouserLength}
                      onChangeText={setTrouserLength}
                      keyboardType="numeric"
                      placeholder="e.g. 38"
                      className="flex-1 text-[14px] font-bold text-brand-dark"
                    />
                    <Text className="text-[11px] font-bold text-[#94A3B8] ml-1">{unit}</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-medium text-brand-gray">Inseam (Inner Leg)</Text>
                  <View className="flex-row items-center rounded-xl border border-brand-border px-3 py-2 bg-[#FAFAF9]">
                    <TextInput
                      value={inseam}
                      onChangeText={setInseam}
                      keyboardType="numeric"
                      placeholder="e.g. 28"
                      className="flex-1 text-[14px] font-bold text-brand-dark"
                    />
                    <Text className="text-[11px] font-bold text-[#94A3B8] ml-1">{unit}</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-medium text-brand-gray">Neck / Collar</Text>
                  <View className="flex-row items-center rounded-xl border border-brand-border px-3 py-2 bg-[#FAFAF9]">
                    <TextInput
                      value={neck}
                      onChangeText={setNeck}
                      keyboardType="numeric"
                      placeholder="e.g. 14.5"
                      className="flex-1 text-[14px] font-bold text-brand-dark"
                    />
                    <Text className="text-[11px] font-bold text-[#94A3B8] ml-1">{unit}</Text>
                  </View>
                </View>
                <View className="flex-1 justify-center pt-4">
                  <Text className="text-[11px] text-brand-gray italic">
                    Fill what you need; leave optional points blank.
                  </Text>
                </View>
              </View>
            </View>

            {/* Navigation Buttons Row */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setStep(1)}
                className="h-[52px] flex-1 items-center justify-center rounded-xl border border-brand-border bg-white"
              >
                <Text className="text-[14px] font-bold text-brand-dark">← Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep(3)}
                activeOpacity={0.85}
                className="relative h-[52px] flex-[1.6] items-center justify-center rounded-xl overflow-hidden shadow-sm"
              >
                <ButtonTexture variant="greenish" borderRadius={12} />
                <View className="z-10 flex-row items-center justify-center px-4">
                  <Text
                    className="text-[15px] font-bold text-white"
                    style={{
                      textShadowColor: "rgba(0,0,0,0.22)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    Review & Notes →
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: Review & Special Instructions */}
        {step === 3 && (
          <View>
            <View className="mb-4">
              <Text className="text-[20px] font-black text-brand-dark tracking-tight">
                Review & Notes
              </Text>
              <Text className="mt-0.5 text-[12px] font-medium text-brand-gray">
                Verify summary details and add tailor alteration notes.
              </Text>
            </View>

            {/* Profile Summary Card */}
            <View className="mb-4 rounded-2xl border border-brand-border bg-white p-4 shadow-2xs">
              <View className="flex-row items-center justify-between pb-3 border-b border-brand-border/60">
                <View>
                  <Text className="text-[16px] font-bold text-brand-dark">
                    {profileName.trim() || `${person.trim()}'s Measurements`}
                  </Text>
                  <Text className="text-[12px] text-brand-gray">
                    For: <Text className="font-semibold text-brand-dark">{person}</Text> • Fit:{" "}
                    <Text className="font-semibold capitalize text-[#00949D]">{fitPreference}</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border"
                >
                  <Text className="text-[11px] font-bold text-brand-dark">Edit Details</Text>
                </TouchableOpacity>
              </View>

              <View className="mt-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">
                    Recorded Dimensions ({unit}):
                  </Text>
                  <TouchableOpacity onPress={() => setStep(2)}>
                    <Text className="text-[11px] font-bold text-[#00949D]">Edit Numbers</Text>
                  </TouchableOpacity>
                </View>

                {filledMeasurementsList.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {filledMeasurementsList.map((item) => (
                      <View
                        key={item.label}
                        className="rounded-lg bg-[#F8FAFC] border border-brand-border px-2.5 py-1.5"
                      >
                        <Text className="text-[10px] text-brand-gray">{item.label}</Text>
                        <Text className="text-[13px] font-black text-brand-dark">
                          {item.val} {unit}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-[12px] text-brand-gray italic py-1">
                    No individual numbers entered. Tailor will use standard ready-to-wear baseline sizing.
                  </Text>
                )}
              </View>
            </View>

            {/* Tailor Special Instructions */}
            <View className="mb-6 rounded-2xl border border-brand-border bg-white p-4 shadow-2xs">
              <Text className="mb-1.5 text-[12px] font-bold text-brand-dark uppercase tracking-wider">
                Tailor Special Instructions
              </Text>
              <Text className="text-[11px] text-brand-gray mb-2">
                Specify inner seam margins, shoulder slopes, lining, or posture adjustments.
              </Text>
              <View className="rounded-xl border border-brand-border px-3.5 py-2.5 bg-[#FAFAF9]">
                <TextInput
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. Leave 2 inches extra fabric inside side seams for future alterations. Low back neckline. Padded cups."
                  placeholderTextColor="#9CA3AF"
                  className="min-h-[72px] text-[13px] text-brand-dark leading-5"
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Action Buttons Row */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setStep(2)}
                className="h-[52px] flex-1 items-center justify-center rounded-xl border border-brand-border bg-white"
              >
                <Text className="text-[14px] font-bold text-brand-dark">← Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={isSubmitting}
                activeOpacity={0.85}
                className="relative h-[52px] flex-[1.6] items-center justify-center rounded-xl overflow-hidden shadow-sm"
              >
                <ButtonTexture variant="greenish" borderRadius={12} />
                <View className="z-10 flex-row items-center justify-center px-4">
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      className="text-[15px] font-bold text-white"
                      style={{
                        textShadowColor: "rgba(0,0,0,0.22)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      {isEditing ? "Update Profile" : "Save Profile"}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </MccScreenShell>
  );
}
