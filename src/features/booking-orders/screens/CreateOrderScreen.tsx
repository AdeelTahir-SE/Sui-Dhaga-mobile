import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { ordersApi } from "../../../api/orders.api";
import { measurementsApi } from "../../../api/measurements.api";
import { conversationsApi } from "../../../api/conversations.api";
import { useAuthStore } from "../../../stores/auth.store";

interface GarmentCategory {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
  estDays: number;
}

const GARMENT_CATEGORIES: GarmentCategory[] = [
  { id: "lehenga", name: "Bridal / Party Lehenga", icon: "sparkles", basePrice: 18000, estDays: 14 },
  { id: "anarkali", name: "Custom Anarkali Suit", icon: "shirt-outline", basePrice: 12500, estDays: 10 },
  { id: "sherwani", name: "Designer Sherwani Set", icon: "ribbon-outline", basePrice: 15500, estDays: 12 },
  { id: "blouse", name: "Designer Saree Blouse", icon: "cut-outline", basePrice: 2800, estDays: 5 },
  { id: "kurta", name: "Kurta Pajama Set", icon: "body-outline", basePrice: 4500, estDays: 7 },
  { id: "alteration", name: "Stitching & Alteration", icon: "construct-outline", basePrice: 1500, estDays: 3 },
];

export default function CreateOrderScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    tailorId?: string;
    tailorName?: string;
    avatar?: string;
    itemName?: string;
    conversationId?: string;
  }>();

  const currentUser = useAuthStore((state) => state.user);

  const tailorName = params.tailorName || "Master Tailor";
  const tailorId = params.tailorId || "1";
  const tailorAvatar = params.avatar;

  // Form State
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>(
    GARMENT_CATEGORIES.find(
      (c) => params.itemName && c.name.toLowerCase().includes(params.itemName.toLowerCase())
    ) || GARMENT_CATEGORIES[1]
  );
  const [itemName, setItemName] = useState(
    params.itemName || selectedCategory.name
  );
  const [fabricOption, setFabricOption] = useState<"client" | "tailor">("client");
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "urgent" | "relaxed">("standard");
  const [notes, setNotes] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [customBudget, setCustomBudget] = useState(String(selectedCategory.basePrice));
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Measurements State (auto-fetched & editable)
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(true);
  const [measurementId, setMeasurementId] = useState<string | undefined>(undefined);
  const [measurementProfileName, setMeasurementProfileName] = useState<string>("");
  const [measurementSource, setMeasurementSource] = useState<"fetched" | "empty">("empty");
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [sleeveLength, setSleeveLength] = useState("");
  const [inseam, setInseam] = useState("");
  const [neck, setNeck] = useState("");
  const [shirtLength, setShirtLength] = useState("");
  const [trouserLength, setTrouserLength] = useState("");

  // Price calculations
  const basePriceNum = parseInt(customBudget.replace(/[^0-9]/g, ""), 10) || selectedCategory.basePrice;
  const fabricSurcharge = fabricOption === "tailor" ? 3500 : 0;
  const speedSurcharge = deliverySpeed === "urgent" ? 1500 : 0;
  const platformFee = 150;
  const totalPrice = basePriceNum + fabricSurcharge + speedSurcharge + platformFee;

  // Auto-fetch user measurements on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMeasurements(true);

    measurementsApi
      .getMyMeasurements()
      .catch(() => measurementsApi.getMeasurements())
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.records)
          ? (data as any).records
          : [];

        if (list && list.length > 0) {
          const m = list[0];
          setMeasurementId(m.id);
          setMeasurementProfileName(m.profileName || m.title || "My Saved Profile");
          setUnit(m.unit === "cm" ? "cm" : "in");
          if (m.chest != null) setChest(String(m.chest));
          if (m.waist != null) setWaist(String(m.waist));
          if (m.hips != null) setHips(String(m.hips));
          if (m.shoulder != null) setShoulder(String(m.shoulder));
          if (m.sleeveLength != null || m.sleeve_length != null) {
            setSleeveLength(String(m.sleeveLength ?? m.sleeve_length));
          }
          if (m.inseam != null) setInseam(String(m.inseam));
          if (m.neck != null) setNeck(String(m.neck));
          if (m.shirtLength != null || m.shirt_length != null) {
            setShirtLength(String(m.shirtLength ?? m.shirt_length));
          }
          if (m.trouserLength != null || m.trouser_length != null) {
            setTrouserLength(String(m.trouserLength ?? m.trouser_length));
          }
          setMeasurementSource("fetched");
        } else {
          setMeasurementSource("empty");
        }
      })
      .catch((err) => {
        console.warn("Could not fetch measurements:", err?.message);
        if (isMounted) setMeasurementSource("empty");
      })
      .finally(() => {
        if (isMounted) setIsLoadingMeasurements(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCategory = (cat: GarmentCategory) => {
    setSelectedCategory(cat);
    setItemName(cat.name);
    setCustomBudget(String(cat.basePrice));
  };

  const handlePickReferenceImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow photo access to upload reference designs.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((a) => a.uri).filter(Boolean);
        setReferenceImages((prev) => [...prev, ...uris]);
      }
    } catch {
      Alert.alert("Upload", "Unable to select photos.");
    }
  };

  const handleRemoveImage = (idx: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePlaceOrder = async () => {
    if (!itemName.trim()) {
      Alert.alert("Required Field", "Please enter what garment you would like stitched.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload attached design images to order-designs bucket
      let uploadedDesignUrls: string[] = [];
      if (referenceImages.length > 0) {
        setIsUploadingImages(true);
        const uploadPromises = referenceImages.map(async (uri, idx) => {
          if (uri.startsWith("http://") || uri.startsWith("https://")) {
            return uri;
          }
          try {
            const fileName = `order-design-${Date.now()}-${idx}.png`;
            return await ordersApi.uploadOrderDesignImage(uri, fileName);
          } catch {
            return uri;
          }
        });
        uploadedDesignUrls = await Promise.all(uploadPromises);
        setIsUploadingImages(false);
      }

      // 2. Calculate target delivery date
      const daysToAdd =
        deliverySpeed === "urgent"
          ? Math.max(3, Math.floor(selectedCategory.estDays / 2))
          : deliverySpeed === "relaxed"
          ? selectedCategory.estDays + 7
          : selectedCategory.estDays;

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      const deliveryDateStr = targetDate.toISOString().split("T")[0];

      // 3. Assemble measurements snapshot
      const measurementsSnapshot: Record<string, any> = {
        unit,
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        hips: hips ? parseFloat(hips) : null,
        shoulder: shoulder ? parseFloat(shoulder) : null,
        sleeveLength: sleeveLength ? parseFloat(sleeveLength) : null,
        inseam: inseam ? parseFloat(inseam) : null,
        neck: neck ? parseFloat(neck) : null,
        shirtLength: shirtLength ? parseFloat(shirtLength) : null,
        trouserLength: trouserLength ? parseFloat(trouserLength) : null,
      };

      const fullNotes = [
        notes.trim(),
        fabricOption === "tailor" ? "• Fabric: Sourced by tailor" : "• Fabric: Provided by customer",
        `• Delivery speed: ${deliverySpeed.toUpperCase()}`,
        additionalNotes.trim() ? `• Additional instructions: ${additionalNotes.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const orderPayload = {
        tailorId,
        itemName: itemName.trim(),
        item_name: itemName.trim(),
        price: totalPrice,
        totalAmount: totalPrice,
        total_amount: totalPrice,
        amount: totalPrice,
        deliveryDate: deliveryDateStr,
        delivery_date: deliveryDateStr,
        notes: fullNotes,
        additionalNotes: additionalNotes.trim(),
        additional_notes: additionalNotes.trim(),
        measurements: measurementsSnapshot,
        measurementId: measurementId || undefined,
        measurementsId: measurementId || undefined,
        designImages: uploadedDesignUrls,
        design_images: uploadedDesignUrls,
      };

      const res = await ordersApi.createOrder(orderPayload).catch(() => null);
      const createdOrder = res?.data;
      const orderId = createdOrder?.id || createdOrder?.orderNumber || "SD-" + Math.floor(1000 + Math.random() * 9000);

      // If came from a conversation, notify the tailor via chat message
      if (params.conversationId && params.conversationId !== "new") {
        try {
          await conversationsApi.sendMessage(params.conversationId, {
            text: `🎉 Hi ${tailorName}! I have placed a custom order: "${itemName.trim()}" (Order #${orderId}) for ₹${totalPrice.toLocaleString("en-IN")}. Looking forward to discussing details!`,
          });
        } catch {}
      }

      Alert.alert(
        "Order Placed Successfully! 🎉",
        `Your custom order for "${itemName}" has been submitted to ${tailorName}. You can track live updates in My Orders.`,
        [
          {
            text: "Go to My Orders",
            onPress: () => router.replace("/orders" as any),
          },
          {
            text: "Back to Chat",
            style: "default",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Order Error", err?.message || "Could not place order. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (currentStage > 1) {
              setCurrentStage((prev) => (prev - 1) as 1 | 2 | 3);
            } else {
              router.back();
            }
          }}
          activeOpacity={0.7}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F8FAFC",
            borderWidth: 1,
            borderColor: "#E2E8F0",
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color="#1A1D1F" />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#1A1D1F" }}>
            Create Custom Order
          </Text>
          <Text style={{ fontSize: 11, fontWeight: "500", color: "#64748B" }}>
            Step {currentStage} of 3 •{" "}
            {currentStage === 1
              ? "Style & Design"
              : currentStage === 2
              ? "Fit & Measurements"
              : "Review & Pricing"}
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* 3-Stage Progress Stepper */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Step 1 */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setCurrentStage(1)}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor:
                  currentStage === 1
                    ? "#14919B"
                    : currentStage > 1
                    ? "#0D7377"
                    : "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 6,
              }}
            >
              {currentStage > 1 ? (
                <Ionicons name="checkmark" size={15} color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: currentStage === 1 ? "#FFFFFF" : "#64748B",
                  }}
                >
                  1
                </Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: currentStage === 1 ? "800" : "600",
                color: currentStage === 1 ? "#0D7377" : "#64748B",
              }}
            >
              Style
            </Text>
          </TouchableOpacity>

          {/* Divider 1-2 */}
          <View
            style={{
              flex: 1,
              height: 2,
              backgroundColor: currentStage > 1 ? "#14919B" : "#E2E8F0",
              marginHorizontal: 8,
            }}
          />

          {/* Step 2 */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (itemName.trim()) setCurrentStage(2);
              else Alert.alert("Required", "Please enter the garment name first.");
            }}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor:
                  currentStage === 2
                    ? "#14919B"
                    : currentStage > 2
                    ? "#0D7377"
                    : "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 6,
              }}
            >
              {currentStage > 2 ? (
                <Ionicons name="checkmark" size={15} color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: currentStage === 2 ? "#FFFFFF" : "#64748B",
                  }}
                >
                  2
                </Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: currentStage === 2 ? "800" : "600",
                color: currentStage === 2 ? "#0D7377" : "#64748B",
              }}
            >
              Fit
            </Text>
          </TouchableOpacity>

          {/* Divider 2-3 */}
          <View
            style={{
              flex: 1,
              height: 2,
              backgroundColor: currentStage > 2 ? "#14919B" : "#E2E8F0",
              marginHorizontal: 8,
            }}
          />

          {/* Step 3 */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (itemName.trim()) setCurrentStage(3);
              else Alert.alert("Required", "Please complete garment details first.");
            }}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor:
                  currentStage === 3 ? "#14919B" : "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: currentStage === 3 ? "#FFFFFF" : "#64748B",
                }}
              >
                3
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: currentStage === 3 ? "800" : "600",
                color: currentStage === 3 ? "#0D7377" : "#64748B",
              }}
            >
              Review
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: "#FFFFFF" }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tailor Summary Card */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F8FAFC",
              borderRadius: 16,
              padding: 12,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {tailorAvatar ? (
                <Image
                  source={{ uri: tailorAvatar }}
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#E0F7F7",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 17, fontWeight: "800", color: "#14919B" }}>
                    {tailorName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#1A1D1F" }}>
                  {tailorName}
                </Text>
                <View
                  style={{
                    marginLeft: 6,
                    backgroundColor: "#E0F7F7",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#14919B" }}>
                    Verified
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                Specialized in bespoke couture, lehengas & suits
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={13} color="#E5A83B" />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A1D1F", marginLeft: 3 }}>
                  4.9
                </Text>
              </View>
              <Text style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                Top Rated
              </Text>
            </View>
          </View>

          {/* ================= STAGE 1: STYLE & INSPIRATION ================= */}
          {currentStage === 1 && (
            <View>
              {/* Choose Garment Category */}
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F", marginBottom: 10 }}>
                  1. Choose Garment Style
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {GARMENT_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory.id === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => handleSelectCategory(cat)}
                        activeOpacity={0.8}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: isSelected ? "#14919B" : "#FFFFFF",
                          borderWidth: 1,
                          borderColor: isSelected ? "#14919B" : "#E2E8F0",
                          elevation: isSelected ? 2 : 0,
                        }}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={15}
                          color={isSelected ? "#FFFFFF" : "#14919B"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: isSelected ? "700" : "600",
                            color: isSelected ? "#FFFFFF" : "#1A1D1F",
                          }}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Garment Title & Design Notes */}
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F", marginBottom: 8 }}>
                  2. Outfit Title & Design Notes
                </Text>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    padding: 12,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 4 }}>
                    GARMENT NAME *
                  </Text>
                  <TextInput
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="e.g. Royal Blue Lehenga with Zari Embroidery"
                    placeholderTextColor="#94A3B8"
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#1A1D1F",
                      paddingVertical: 4,
                    }}
                  />
                </View>

                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    padding: 12,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 4 }}>
                    DESIGN DETAILS & SPECIAL REQUESTS
                  </Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="e.g. Sweetheart neckline, 3/4th sheer sleeves, heavy latkans at waist, inner lining required..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                    style={{
                      fontSize: 13,
                      color: "#1A1D1F",
                      minHeight: 65,
                      textAlignVertical: "top",
                    }}
                  />
                </View>
              </View>

              {/* Reference Images & Designs */}
              <View style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F" }}>
                      3. Design Photos & Inspiration
                    </Text>
                    <Text style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
                      Attach reference images, sketches or fabric photos
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handlePickReferenceImage} activeOpacity={0.7}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#14919B" }}>
                      + Add Photos
                    </Text>
                  </TouchableOpacity>
                </View>

                {referenceImages.length === 0 ? (
                  <TouchableOpacity
                    onPress={handlePickReferenceImage}
                    activeOpacity={0.8}
                    style={{
                      borderWidth: 1.5,
                      borderStyle: "dashed",
                      borderColor: "#CBD5E1",
                      borderRadius: 14,
                      padding: 22,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#F8FAFC",
                    }}
                  >
                    <Ionicons name="cloud-upload-outline" size={28} color="#14919B" />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F", marginTop: 6 }}>
                      Upload Reference Designs
                    </Text>
                    <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                      Attach sketches, neck design photos, embroidery patterns, or fabric swatches
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                    {referenceImages.map((uri, idx) => (
                      <View key={idx} style={{ position: "relative" }}>
                        <Image
                          source={{ uri }}
                          style={{ width: 85, height: 85, borderRadius: 12 }}
                          contentFit="cover"
                        />
                        <TouchableOpacity
                          onPress={() => handleRemoveImage(idx)}
                          style={{
                            position: "absolute",
                            top: -5,
                            right: -5,
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            backgroundColor: "#EF4444",
                            borderWidth: 1.5,
                            borderColor: "#FFFFFF",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="close" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity
                      onPress={handlePickReferenceImage}
                      style={{
                        width: 85,
                        height: 85,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderStyle: "dashed",
                        borderColor: "#14919B",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#F0FAFA",
                      }}
                    >
                      <Ionicons name="add" size={24} color="#14919B" />
                      <Text style={{ fontSize: 10, fontWeight: "700", color: "#14919B" }}>Add</Text>
                    </TouchableOpacity>
                  </ScrollView>
                )}
              </View>
            </View>
          )}

          {/* ================= STAGE 2: FIT & FABRIC ================= */}
          {currentStage === 2 && (
            <View>
              {/* Fabric Preference */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F", marginBottom: 10 }}>
                  1. Fabric Sourcing
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setFabricOption("client")}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: fabricOption === "client" ? "#F0FAFA" : "#FFFFFF",
                      borderWidth: 1.5,
                      borderColor: fabricOption === "client" ? "#14919B" : "#E2E8F0",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                      <Ionicons
                        name={fabricOption === "client" ? "radio-button-on" : "radio-button-off"}
                        size={17}
                        color={fabricOption === "client" ? "#14919B" : "#94A3B8"}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>
                        I Have Fabric
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: "#64748B", marginLeft: 23 }}>
                      I'll provide or deliver my own fabric to the tailor.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setFabricOption("tailor")}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: fabricOption === "tailor" ? "#F0FAFA" : "#FFFFFF",
                      borderWidth: 1.5,
                      borderColor: fabricOption === "tailor" ? "#14919B" : "#E2E8F0",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                      <Ionicons
                        name={fabricOption === "tailor" ? "radio-button-on" : "radio-button-off"}
                        size={17}
                        color={fabricOption === "tailor" ? "#14919B" : "#94A3B8"}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>
                        Tailor Sourced
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: "#64748B", marginLeft: 23 }}>
                      Tailor sources matching fabric & lining (+₹3,500).
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Custom Measurements */}
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F" }}>
                    2. Custom Measurements
                  </Text>
                  {/* Unit Toggle */}
                  <View style={{ flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 8, padding: 2 }}>
                    <TouchableOpacity
                      onPress={() => setUnit("in")}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: unit === "in" ? "#14919B" : "transparent",
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: unit === "in" ? "#FFFFFF" : "#64748B" }}>
                        in
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setUnit("cm")}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: unit === "cm" ? "#14919B" : "transparent",
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: unit === "cm" ? "#FFFFFF" : "#64748B" }}>
                        cm
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Fetch Status Banner */}
                {isLoadingMeasurements ? (
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F0FAFA", padding: 10, borderRadius: 10, marginBottom: 12 }}>
                    <ActivityIndicator size="small" color="#14919B" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 12, color: "#14919B", fontWeight: "600" }}>
                      Fetching your saved measurements...
                    </Text>
                  </View>
                ) : measurementSource === "fetched" ? (
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ECFDF5", padding: 10, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#A7F3D0" }}>
                    <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: "#065F46", fontWeight: "600", flex: 1 }}>
                      Auto-loaded from {measurementProfileName || "saved profile"}. You can adjust any measurement for this order.
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F0FAFA", padding: 10, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#E0F7F7" }}>
                    <Ionicons name="information-circle" size={16} color="#14919B" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: "#0D7377", fontWeight: "500", flex: 1 }}>
                      Enter your custom dimensions below for a bespoke tailored fit.
                    </Text>
                  </View>
                )}

                {/* Editable Measurements Grid */}
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                  }}
                >
                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 }}>
                    {[
                      { label: "CHEST / BUST", value: chest, setter: setChest, placeholder: "36" },
                      { label: "WAIST", value: waist, setter: setWaist, placeholder: "30" },
                      { label: "HIPS", value: hips, setter: setHips, placeholder: "38" },
                      { label: "SHOULDER", value: shoulder, setter: setShoulder, placeholder: "15" },
                      { label: "SLEEVE LENGTH", value: sleeveLength, setter: setSleeveLength, placeholder: "22" },
                      { label: "SHIRT LENGTH", value: shirtLength, setter: setShirtLength, placeholder: "38" },
                      { label: "TROUSER LENGTH", value: trouserLength, setter: setTrouserLength, placeholder: "39" },
                      { label: "INSEAM / PANT", value: inseam, setter: setInseam, placeholder: "30" },
                      { label: "COLLAR / NECK", value: neck, setter: setNeck, placeholder: "14" },
                    ].map((field, idx) => (
                      <View key={idx} style={{ width: "50%", paddingHorizontal: 5, marginBottom: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B", marginBottom: 3 }}>
                          {field.label} ({unit})
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#E2E8F0",
                            borderRadius: 10,
                            backgroundColor: "#F8FAFC",
                            paddingHorizontal: 10,
                            height: 40,
                          }}
                        >
                          <TextInput
                            value={field.value}
                            onChangeText={field.setter}
                            placeholder={field.placeholder}
                            placeholderTextColor="#94A3B8"
                            keyboardType="decimal-pad"
                            style={{
                              flex: 1,
                              fontSize: 14,
                              fontWeight: "700",
                              color: "#1A1D1F",
                            }}
                          />
                          <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "600" }}>
                            {unit}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2, textAlign: "center" }}>
                    📐 Custom measurements guarantee a bespoke fit tailored to your silhouette.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ================= STAGE 3: REVIEW & PRICING ================= */}
          {currentStage === 3 && (
            <View>
              {/* Delivery Timeline Preference */}
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F", marginBottom: 8 }}>
                  1. Delivery Timeline
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[
                    { id: "standard", label: "Standard", time: `${selectedCategory.estDays} days`, extra: "Free" },
                    { id: "urgent", label: "Express Urgent", time: `${Math.max(3, Math.floor(selectedCategory.estDays / 2))} days`, extra: "+₹1,500" },
                    { id: "relaxed", label: "Flexible", time: `${selectedCategory.estDays + 7} days`, extra: "Standard" },
                  ].map((speed) => {
                    const isSelected = deliverySpeed === speed.id;
                    return (
                      <TouchableOpacity
                        key={speed.id}
                        onPress={() => setDeliverySpeed(speed.id as any)}
                        activeOpacity={0.8}
                        style={{
                          flex: 1,
                          padding: 12,
                          borderRadius: 12,
                          backgroundColor: isSelected ? "#F0FAFA" : "#FFFFFF",
                          borderWidth: 1.5,
                          borderColor: isSelected ? "#14919B" : "#E2E8F0",
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#0D7377" : "#1A1D1F" }}>
                          {speed.label}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          {speed.time}
                        </Text>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: isSelected ? "#14919B" : "#94A3B8", marginTop: 2 }}>
                          {speed.extra}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Order Summary Snapshot Card */}
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  marginBottom: 18,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#1A1D1F", marginBottom: 8 }}>
                  Order Summary Review
                </Text>

                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: "#64748B" }}>Outfit:</Text>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A1D1F", flex: 1, textAlign: "right" }} numberOfLines={1}>
                      {itemName}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: "#64748B" }}>Category:</Text>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#1A1D1F" }}>
                      {selectedCategory.name}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: "#64748B" }}>Fabric:</Text>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#1A1D1F" }}>
                      {fabricOption === "tailor" ? "Tailor Sourced Fabric" : "Customer Provided Fabric"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 12, color: "#64748B" }}>Delivery:</Text>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#1A1D1F" }}>
                      {deliverySpeed.toUpperCase()} Delivery
                    </Text>
                  </View>
                  {referenceImages.length > 0 && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 12, color: "#64748B" }}>Attached Designs:</Text>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#14919B" }}>
                        {referenceImages.length} photo(s) attached
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Additional Notes */}
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F", marginBottom: 6 }}>
                  2. Special Tailor Instructions
                </Text>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    padding: 12,
                  }}
                >
                  <TextInput
                    value={additionalNotes}
                    onChangeText={setAdditionalNotes}
                    placeholder="Any fitting instructions, border placement, pocket requirements, or urgent handling requests..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                    style={{
                      fontSize: 13,
                      color: "#1A1D1F",
                      minHeight: 60,
                      textAlignVertical: "top",
                    }}
                  />
                </View>
              </View>

              {/* Pricing & Total Amount */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F", marginBottom: 12 }}>
                  3. Pricing & Payment Breakdown
                </Text>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>Stitching & Tailoring Base</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F", marginRight: 6 }}>
                      ₹
                    </Text>
                    <TextInput
                      value={customBudget}
                      onChangeText={setCustomBudget}
                      keyboardType="numeric"
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#1A1D1F",
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        minWidth: 70,
                        textAlign: "right",
                        backgroundColor: "#F8FAFC",
                      }}
                    />
                  </View>
                </View>

                {fabricOption === "tailor" && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, color: "#64748B" }}>Fabric & Lining Sourcing</Text>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1D1F" }}>+₹3,500</Text>
                  </View>
                )}

                {deliverySpeed === "urgent" && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, color: "#64748B" }}>Express Urgent Stitching</Text>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1D1F" }}>+₹1,500</Text>
                  </View>
                )}

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>Platform & Assurance Fee</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1D1F" }}>+₹150</Text>
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#E2E8F0",
                    marginVertical: 4,
                    marginBottom: 12,
                  }}
                />

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F" }}>
                      Total Amount
                    </Text>
                    <Text style={{ fontSize: 11, color: "#10B981", fontWeight: "600" }}>
                      Guaranteed Fit Protection Included
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: "900", color: "#14919B" }}>
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Persistent Bottom Action Bar */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom + 8, 16),
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        {currentStage > 1 && (
          <TouchableOpacity
            onPress={() => setCurrentStage((prev) => (prev - 1) as 1 | 2 | 3)}
            activeOpacity={0.7}
            style={{
              paddingHorizontal: 16,
              height: 48,
              borderRadius: 12,
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Ionicons name="arrow-back" size={16} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#475569" }}>
              Back
            </Text>
          </TouchableOpacity>
        )}

        {currentStage < 3 ? (
          <TouchableOpacity
            onPress={() => {
              if (currentStage === 1 && !itemName.trim()) {
                Alert.alert("Required", "Please enter the garment name to proceed.");
                return;
              }
              setCurrentStage((prev) => (prev + 1) as 1 | 2 | 3);
            }}
            activeOpacity={0.85}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              backgroundColor: "#14919B",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF", marginRight: 6 }}>
              {currentStage === 1 ? "Next: Fit & Measurements" : "Next: Review & Pricing"}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isSubmitting}
            activeOpacity={0.85}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              backgroundColor: isSubmitting ? "#A5D6D9" : "#14919B",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            {isSubmitting ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                  {isUploadingImages ? "Uploading Designs..." : "Submitting Order..."}
                </Text>
              </View>
            ) : (
              <>
                <Ionicons name="bag-check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}>
                  Place Order • ₹{totalPrice.toLocaleString("en-IN")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
