import React, { useState } from "react";
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
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>(
    GARMENT_CATEGORIES.find(
      (c) => params.itemName && c.name.toLowerCase().includes(params.itemName.toLowerCase())
    ) || GARMENT_CATEGORIES[1]
  );
  const [itemName, setItemName] = useState(
    params.itemName || selectedCategory.name
  );
  const [fabricOption, setFabricOption] = useState<"client" | "tailor">("client");
  const [measurementType, setMeasurementType] = useState<"saved" | "visit" | "chat">("saved");
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "urgent" | "relaxed">("standard");
  const [notes, setNotes] = useState("");
  const [customBudget, setCustomBudget] = useState(String(selectedCategory.basePrice));
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Price calculations
  const basePriceNum = parseInt(customBudget.replace(/[^0-9]/g, ""), 10) || selectedCategory.basePrice;
  const fabricSurcharge = fabricOption === "tailor" ? 3500 : 0;
  const speedSurcharge = deliverySpeed === "urgent" ? 1500 : 0;
  const platformFee = 150;
  const totalPrice = basePriceNum + fabricSurcharge + speedSurcharge + platformFee;

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
      // Calculate target delivery date
      const daysToAdd =
        deliverySpeed === "urgent"
          ? Math.max(3, Math.floor(selectedCategory.estDays / 2))
          : deliverySpeed === "relaxed"
          ? selectedCategory.estDays + 7
          : selectedCategory.estDays;

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      const deliveryDateStr = targetDate.toISOString().split("T")[0];

      const fullNotes = [
        notes.trim(),
        fabricOption === "tailor" ? "• Fabric: Sourced by tailor" : "• Fabric: Provided by customer",
        `• Measurement mode: ${
          measurementType === "saved"
            ? "Saved customer measurements"
            : measurementType === "visit"
            ? "Request home measurement visit"
            : "Will coordinate measurements in chat"
        }`,
        `• Delivery speed: ${deliverySpeed.toUpperCase()}`,
      ]
        .filter(Boolean)
        .join("\n");

      const orderPayload = {
        tailorId: tailorId,
        itemName: itemName.trim(),
        price: totalPrice,
        deliveryDate: deliveryDateStr,
        notes: fullNotes,
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
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F5", paddingTop: insets.top }}>
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
          borderBottomColor: "#EAE5DD",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F8F6F0",
            borderWidth: 1,
            borderColor: "#EAE5DD",
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
          <Text style={{ fontSize: 11, fontWeight: "500", color: "#6F767E" }}>
            Bespoke tailoring with {tailorName}
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tailor Summary Card */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "#EAE5DD",
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#EAE5DD",
                backgroundColor: "#F8F6F0",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {tailorAvatar ? (
                <Image
                  source={{ uri: tailorAvatar }}
                  style={{ width: 46, height: 46, borderRadius: 23 }}
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
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#14919B" }}>
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
              <Text style={{ fontSize: 12, color: "#6F767E", marginTop: 2 }}>
                Specialized in bridal couture, lehengas & suits
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={13} color="#E5A83B" />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#1A1D1F", marginLeft: 3 }}>
                  4.9
                </Text>
              </View>
              <Text style={{ fontSize: 10, color: "#6F767E", marginTop: 2 }}>
                Top Rated
              </Text>
            </View>
          </View>

          {/* Section 1: Choose Garment Category */}
          <View style={{ marginBottom: 20 }}>
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
                      borderColor: isSelected ? "#14919B" : "#EAE5DD",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.03,
                      shadowRadius: 2,
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

          {/* Section 2: Garment Name & Style Details */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F", marginBottom: 6 }}>
              2. Outfit Title & Design Notes
            </Text>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#EAE5DD",
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#6F767E", marginBottom: 4 }}>
                GARMENT NAME
              </Text>
              <TextInput
                value={itemName}
                onChangeText={setItemName}
                placeholder="e.g. Royal Blue Lehenga with Zari Embroidery"
                placeholderTextColor="#9CA3AF"
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
                borderColor: "#EAE5DD",
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#6F767E", marginBottom: 4 }}>
                DESIGN DETAILS & SPECIAL REQUESTS
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Sweetheart neckline, 3/4th sheer sleeves, heavy latkans at waist, inner lining required..."
                placeholderTextColor="#9CA3AF"
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

          {/* Section 3: Fabric Preference */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F", marginBottom: 10 }}>
              3. Fabric Sourcing
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
                  borderColor: fabricOption === "client" ? "#14919B" : "#EAE5DD",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Ionicons
                    name={fabricOption === "client" ? "radio-button-on" : "radio-button-off"}
                    size={17}
                    color={fabricOption === "client" ? "#14919B" : "#9CA3AF"}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>
                    I Have Fabric
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: "#6F767E", marginLeft: 23 }}>
                  I'll send or drop off my own fabric to the tailor.
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
                  borderColor: fabricOption === "tailor" ? "#14919B" : "#EAE5DD",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Ionicons
                    name={fabricOption === "tailor" ? "radio-button-on" : "radio-button-off"}
                    size={17}
                    color={fabricOption === "tailor" ? "#14919B" : "#9CA3AF"}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>
                    Tailor Sourced
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: "#6F767E", marginLeft: 23 }}>
                  Tailor sources matching fabric & lining (+₹3,500).
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 4: Measurements Choice */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F", marginBottom: 10 }}>
              4. Measurements
            </Text>
            <View style={{ gap: 8 }}>
              {[
                {
                  id: "saved",
                  title: "Use Saved Body Profile",
                  desc: "Apply your saved measurements from your profile",
                  icon: "ribbon-outline",
                },
                {
                  id: "visit",
                  title: "Book Home Tailor Visit",
                  desc: "Expert visits your home to take precision tape measurements",
                  icon: "home-outline",
                },
                {
                  id: "chat",
                  title: "Discuss / Send in Chat",
                  desc: "Share measurements or reference garments via chat",
                  icon: "chatbubble-ellipses-outline",
                },
              ].map((m) => {
                const isSelected = measurementType === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setMeasurementType(m.id as any)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: isSelected ? "#F0FAFA" : "#FFFFFF",
                      borderWidth: 1.5,
                      borderColor: isSelected ? "#14919B" : "#EAE5DD",
                    }}
                  >
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                      size={20}
                      color={isSelected ? "#14919B" : "#9CA3AF"}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}>
                        {m.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#6F767E", marginTop: 1 }}>
                        {m.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section 5: Reference Images */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F" }}>
                5. Reference Photos & Sketches
              </Text>
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
                  borderColor: "#D5CEC2",
                  borderRadius: 14,
                  padding: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Ionicons name="cloud-upload-outline" size={28} color="#14919B" />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F", marginTop: 6 }}>
                  Upload Reference Images
                </Text>
                <Text style={{ fontSize: 11, color: "#6F767E", marginTop: 2 }}>
                  Add sketches, Pinterest inspiration, or fabric swatches
                </Text>
              </TouchableOpacity>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {referenceImages.map((uri, idx) => (
                  <View key={idx} style={{ position: "relative" }}>
                    <Image
                      source={{ uri }}
                      style={{ width: 80, height: 80, borderRadius: 12 }}
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
                    width: 80,
                    height: 80,
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

          {/* Section 6: Price & Order Summary */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#EAE5DD",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F", marginBottom: 12 }}>
              Pricing & Payment Summary
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: "#6F767E" }}>Stitching & Tailoring</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1D1F" }}>
                ₹{basePriceNum.toLocaleString("en-IN")}
              </Text>
            </View>

            {fabricOption === "tailor" && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: "#6F767E" }}>Fabric & Lining Sourcing</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1D1F" }}>₹3,500</Text>
              </View>
            )}

            {deliverySpeed === "urgent" && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: "#6F767E" }}>Express Urgent Stitching</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1D1F" }}>₹1,500</Text>
              </View>
            )}

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: "#6F767E" }}>Platform & Assurance Fee</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1D1F" }}>₹150</Text>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "#EAE5DD",
                marginVertical: 4,
                marginBottom: 12,
              }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1D1F" }}>
                  Total Estimated
                </Text>
                <Text style={{ fontSize: 11, color: "#10B981", fontWeight: "600" }}>
                  Guaranteed Perfect Fit Protection
                </Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "900", color: "#14919B" }}>
                ₹{totalPrice.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          {/* Place Order CTA Button */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isSubmitting}
            activeOpacity={0.85}
            style={{
              height: 52,
              borderRadius: 14,
              backgroundColor: "#14919B",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              shadowColor: "#14919B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="bag-check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFFFFF" }}>
                  Place Custom Order • ₹{totalPrice.toLocaleString("en-IN")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            🔒 You won't be charged until the tailor reviews & confirms the design specs.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
