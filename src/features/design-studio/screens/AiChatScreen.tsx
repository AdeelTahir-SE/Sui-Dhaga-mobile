import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  aiSuggestionImages,
  designPreviewImages,
  royalDesignImages,
} from "../constants/designStudioAssets";

const skinTexture = require("@/assets/texture/skin-texture.png");

interface DesignCardData {
  title: string;
  subtitle: string;
  image: any;
  tags: string[];
  priceEstimate?: string;
  itemName: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  attachedImageUri?: string;
  designCard?: DesignCardData;
  suggestions?: string[];
}

const STARTER_PROMPTS = [
  {
    id: "starter-1",
    title: "Bridal Lehenga",
    icon: "sparkles" as const,
    prompt: "Design a royal blue bridal lehenga with intricate gold zardozi embroidery and velvet finish",
    tag: "Trending",
  },
  {
    id: "starter-2",
    title: "Pastel Anarkali",
    icon: "flower-outline" as const,
    prompt: "A pastel mint green Anarkali with floral embroidery, sheer organza sleeves, and a boat neckline",
    tag: "Festive",
  },
  {
    id: "starter-3",
    title: "Summer Kurta Set",
    icon: "shirt-outline" as const,
    prompt: "Suggest a breathable pastel lawn kurta set with delicate Schiffli lace borders and straight trousers",
    tag: "Casual",
  },
  {
    id: "starter-4",
    title: "Fabric & Drape Advice",
    icon: "cut-outline" as const,
    prompt: "Which fabric drape and lining work best for a flared Pakistani wedding silhouette?",
    tag: "Tailor Advice",
  },
];

function getFormattedTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default function AiChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Animated dots for thinking indicator
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isGenerating) {
      const animateDot = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: -6,
              duration: 280,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 280,
              useNativeDriver: true,
            }),
            Animated.delay(500 - delay),
          ])
        );
      };

      const a1 = animateDot(dot1, 0);
      const a2 = animateDot(dot2, 160);
      const a3 = animateDot(dot3, 320);

      a1.start();
      a2.start();
      a3.start();

      return () => {
        a1.stop();
        a2.stop();
        a3.stop();
        dot1.setValue(0);
        dot2.setValue(0);
        dot3.setValue(0);
      };
    }
  }, [isGenerating]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("Could not open image picker:", err);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputText("");
    setSelectedImage(null);
    setIsGenerating(false);
  };

  const handlePlaceOrder = (itemName: string) => {
    router.push({
      pathname: "/orders/create",
      params: { itemName },
    } as any);
  };

  const generateAiResponse = (userPrompt: string): {
    text: string;
    designCard?: DesignCardData;
    suggestions: string[];
  } => {
    const lower = userPrompt.toLowerCase();

    if (lower.includes("lehenga") || lower.includes("bridal") || lower.includes("wedding")) {
      return {
        text: "Here is a bespoke bridal silhouette crafted for you. The deep royal palette is paired with hand-embroidered zardozi and dabka motifs across a 16-panel circular flare. The velvet choli features a classic sweetheart neckline and French piping along the edges.",
        designCard: {
          title: "Royal Velvet Bridal Lehenga",
          subtitle: "16-panel circular cut with handcrafted zardozi",
          image: royalDesignImages[0],
          tags: ["Micro Velvet", "Zardozi & Dabka", "Full Can-Can", "Dual Dupatta"],
          priceEstimate: "PKR 48,000 - 62,000",
          itemName: "Royal Velvet Bridal Lehenga",
        },
        suggestions: [
          "Show in pastel blush pink",
          "Can I do a lighter net dupatta?",
          "Recommend matching jewelry",
          "Add tailor notes for custom sizing",
        ],
      };
    }

    if (lower.includes("anarkali") || lower.includes("gown") || lower.includes("pastel")) {
      return {
        text: "For this look, I recommend a floor-length Anarkali crafted in pure organza and silk satin lining. The bodice features fine floral resham embroidery with a boat neckline, flowing into 24 panels that give a graceful, lightweight swirl.",
        designCard: {
          title: "Pastel Flora Floor-Length Anarkali",
          subtitle: "24-kali flared organza with floral resham work",
          image: designPreviewImages[0],
          tags: ["Organza & Silk", "Resham Floral", "Floor Length", "Pastel Tone"],
          priceEstimate: "PKR 22,000 - 32,000",
          itemName: "Pastel Flora Floor-Length Anarkali",
        },
        suggestions: [
          "Suggest back neckline cut",
          "Show matching churidar options",
          "Make sleeves full sheer",
          "Book a tailor for stitching",
        ],
      };
    }

    if (lower.includes("kurta") || lower.includes("lawn") || lower.includes("casual")) {
      return {
        text: "A breathable summer ensemble featuring pure Pakistani lawn with intricate Schiffli lace accents on the daman and sleeve cuffs. Paired with straight-cut cotton cigarette trousers and an airy printed chiffon dupatta.",
        designCard: {
          title: "Bespoke Lawn Kurta Set",
          subtitle: "Pure lawn with cutwork lace & straight pants",
          image: designPreviewImages[2],
          tags: ["Pure Lawn", "Schiffli Cutwork", "Straight Cut", "Daily Luxury"],
          priceEstimate: "PKR 7,500 - 11,000",
          itemName: "Bespoke Lawn Kurta Set",
        },
        suggestions: [
          "Add pockets to the kurta",
          "Suggest contrasting dupatta",
          "Change color to ivory",
          "Calculate tailor stitching fee",
        ],
      };
    }

    if (lower.includes("fabric") || lower.includes("drape") || lower.includes("lining")) {
      return {
        text: "For flared ethnic cuts like Anarkalis and Lehengas, the secret is layering:\n\n• Base Shell: Pure Organza, Raw Silk, or Georgette for natural volume.\n• Inner Lining: Butter Crepe or Soft Cotton Silk prevents clinging.\n• Flare Support: A lightweight horsehair braid or stiff net hem creates that effortless runway swoosh without weighing you down.",
        suggestions: [
          "Which fabric is best for humid weather?",
          "How many meters of fabric needed?",
          "Suggest silk blends for party wear",
        ],
      };
    }

    if (lower.includes("saree") || lower.includes("sari")) {
      return {
        text: "A timeless drape concept: woven gold tissue silk saree with a scalloped zari border, paired with an embroidered jewel-neck blouse. Perfect for evening receptions and celebratory soirees.",
        designCard: {
          title: "Golden Tissue Silk Saree",
          subtitle: "Hand-scalloped zari border with designer blouse",
          image: royalDesignImages[2],
          tags: ["Tissue Silk", "Hand Scalloped", "Festive", "Jewel Neck Blouse"],
          priceEstimate: "PKR 28,000 - 38,000",
          itemName: "Golden Tissue Silk Saree",
        },
        suggestions: [
          "Suggest blouse back designs",
          "How to drape for a slimmer look?",
          "Can I do pre-stitched pleats?",
        ],
      };
    }

    return {
      text: `I've analyzed your request for "${userPrompt}". We can style this with balanced proportions, tailored darts for a flattering drape, and artisanal threadwork tailored specifically to your measurements.`,
      designCard: {
        title: "Bespoke Couture Concept",
        subtitle: "Custom silhouette based on your vision",
        image: aiSuggestionImages[1],
        tags: ["Custom Cut", "Hand Finish", "Premium Fabric"],
        priceEstimate: "Custom Quote",
        itemName: "Custom Couture Concept",
      },
      suggestions: [
        "Tell me about suitable fabrics",
        "Add heavier embroidery",
        "Show color swatches",
        "Book a tailor consultation",
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const messageContent = (textToSend ?? inputText).trim();
    if (!messageContent && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: messageContent,
      timestamp: getFormattedTime(),
      attachedImageUri: selectedImage ?? undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setSelectedImage(null);
    setIsGenerating(true);
    scrollToBottom();

    setTimeout(() => {
      const aiResult = generateAiResponse(messageContent);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: aiResult.text,
        timestamp: getFormattedTime(),
        designCard: aiResult.designCard,
        suggestions: aiResult.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
      scrollToBottom();
    }, 1100);
  };

  const handleStopGenerating = () => {
    setIsGenerating(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F5" }}>
      {/* Background Texture */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <RNImage
          source={skinTexture}
          resizeMode="repeat"
          style={[StyleSheet.absoluteFill, { width: "100%", height: "100%", opacity: 0.7 }]}
        />
      </View>

      {/* Header Bar */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 12),
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#EAE5DD",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <View
          style={{
            height: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
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
          >
            <Ionicons name="arrow-back" size={20} color="#1A1D1F" />
          </TouchableOpacity>

          {/* AI Identity Info */}
          <View style={{ alignItems: "center", flex: 1, marginHorizontal: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#14919B",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 6,
                }}
              >
                <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#1A1D1F",
                  letterSpacing: -0.2,
                }}
              >
                Sui Dhaga AI
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#10B981",
                  marginRight: 5,
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: "#6F767E",
                }}
              >
                Fashion Stylist • Online
              </Text>
            </View>
          </View>

          {/* New Chat Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="New Chat"
            onPress={handleNewChat}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 36,
              paddingHorizontal: 12,
              borderRadius: 18,
              backgroundColor: "#F0FAFA",
              borderWidth: 1,
              borderColor: "#CCF0EE",
            }}
          >
            <Ionicons name="create-outline" size={15} color="#14919B" />
            <Text
              style={{
                marginLeft: 5,
                fontSize: 12,
                fontWeight: "700",
                color: "#14919B",
              }}
            >
              New
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Chat Feed */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            /* Empty State: ChatGPT / DeepSeek / Claude Welcome Screen */
            <View style={{ flex: 1, justifyContent: "center", paddingVertical: 20 }}>
              {/* Sui Dhaga AI Badge */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: "#E0F7F7",
                    borderWidth: 2,
                    borderColor: "#14919B",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#14919B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Ionicons name="sparkles" size={36} color="#14919B" />
                </View>
                <Text
                  style={{
                    marginTop: 14,
                    fontSize: 22,
                    fontWeight: "800",
                    color: "#1A1D1F",
                    textAlign: "center",
                    letterSpacing: -0.3,
                  }}
                >
                  What outfit are we creating?
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    lineHeight: 19,
                    color: "#6F767E",
                    textAlign: "center",
                    maxWidth: "88%",
                  }}
                >
                  Chat with your personal AI stylist. Ask for bridal lehengas,
                  lawn kurtas, fabric draping, or custom silhouettes.
                </Text>
              </View>

              {/* Starter Prompt Cards */}
              <View style={{ marginTop: 10 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#8B909A",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 10,
                    marginLeft: 2,
                  }}
                >
                  Suggested Design Starters
                </Text>
                <View style={{ gap: 10 }}>
                  {STARTER_PROMPTS.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => handleSendMessage(item.prompt)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "#EAE5DD",
                        padding: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 3,
                        elevation: 1,
                      }}
                    >
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          backgroundColor: "#F0FAFA",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name={item.icon} size={20} color="#14919B" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: "#1A1D1F",
                            }}
                          >
                            {item.title}
                          </Text>
                          <View
                            style={{
                              marginLeft: 8,
                              backgroundColor: "#F7F8FA",
                              borderRadius: 6,
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "600",
                                color: "#6F767E",
                              }}
                            >
                              {item.tag}
                            </Text>
                          </View>
                        </View>
                        <Text
                          numberOfLines={2}
                          style={{
                            fontSize: 12,
                            color: "#6F767E",
                            marginTop: 3,
                            lineHeight: 16,
                          }}
                        >
                          {item.prompt}
                        </Text>
                      </View>
                      <Ionicons
                        name="arrow-forward-circle"
                        size={22}
                        color="#14919B"
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            /* Conversation Messages */
            messages.map((msg) => (
              <View
                key={msg.id}
                style={{
                  marginBottom: 16,
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: msg.sender === "user" ? "82%" : "92%",
                }}
              >
                {/* Assistant Label and Avatar */}
                {msg.sender === "assistant" && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: "#14919B",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 6,
                      }}
                    >
                      <Ionicons name="sparkles" size={11} color="#FFFFFF" />
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#14919B",
                      }}
                    >
                      Sui Dhaga AI
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#9CA3AF",
                        marginLeft: 6,
                      }}
                    >
                      {msg.timestamp}
                    </Text>
                  </View>
                )}

                {/* User image attachment preview */}
                {msg.attachedImageUri && (
                  <View
                    style={{
                      marginBottom: 8,
                      borderRadius: 14,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: "#EAE5DD",
                    }}
                  >
                    <Image
                      source={{ uri: msg.attachedImageUri }}
                      style={{ width: 180, height: 180 }}
                      contentFit="cover"
                    />
                  </View>
                )}

                {/* Bubble Container */}
                <View
                  style={
                    msg.sender === "user"
                      ? {
                          backgroundColor: "#14919B",
                          borderRadius: 18,
                          borderBottomRightRadius: 3,
                          paddingHorizontal: 15,
                          paddingVertical: 12,
                          shadowColor: "#14919B",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 3,
                          elevation: 2,
                        }
                      : {
                          backgroundColor: "#FFFFFF",
                          borderRadius: 18,
                          borderTopLeftRadius: 3,
                          borderWidth: 1,
                          borderColor: "#EAE5DD",
                          paddingHorizontal: 15,
                          paddingVertical: 13,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.04,
                          shadowRadius: 3,
                          elevation: 1,
                        }
                  }
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 21,
                      fontWeight: "500",
                      color: msg.sender === "user" ? "#FFFFFF" : "#1A1D1F",
                    }}
                  >
                    {msg.text}
                  </Text>
                </View>

                {/* User timestamp */}
                {msg.sender === "user" && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#9CA3AF",
                      marginTop: 4,
                      alignSelf: "flex-end",
                    }}
                  >
                    {msg.timestamp}
                  </Text>
                )}

                {/* AI Design Concept Card */}
                {msg.designCard && (
                  <View
                    style={{
                      marginTop: 12,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: "#EAE5DD",
                      overflow: "hidden",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Image
                      source={msg.designCard.image}
                      contentFit="cover"
                      style={{ width: "100%", height: 190 }}
                    />
                    <View style={{ padding: 14 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "800",
                          color: "#1A1D1F",
                          letterSpacing: -0.2,
                        }}
                      >
                        {msg.designCard.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6F767E",
                          marginTop: 3,
                          lineHeight: 16,
                        }}
                      >
                        {msg.designCard.subtitle}
                      </Text>

                      {/* Attribute Badges */}
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 6,
                          marginTop: 10,
                        }}
                      >
                        {msg.designCard.tags.map((tag) => (
                          <View
                            key={tag}
                            style={{
                              backgroundColor: "#F0FAFA",
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderWidth: 0.5,
                              borderColor: "#CCF0EE",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "600",
                                color: "#14919B",
                              }}
                            >
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Estimate & Order Button */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: 14,
                          paddingTop: 12,
                          borderTopWidth: 1,
                          borderTopColor: "#F1EEE9",
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "600",
                              color: "#8B909A",
                              textTransform: "uppercase",
                            }}
                          >
                            Est. Stitching
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "800",
                              color: "#0D7377",
                              marginTop: 1,
                            }}
                          >
                            {msg.designCard.priceEstimate ?? "Custom Quote"}
                          </Text>
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => handlePlaceOrder(msg.designCard!.itemName)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#14919B",
                            paddingHorizontal: 14,
                            paddingVertical: 9,
                            borderRadius: 12,
                            shadowColor: "#14919B",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 3,
                            elevation: 2,
                          }}
                        >
                          <Ionicons name="bag-handle" size={14} color="#FFFFFF" />
                          <Text
                            style={{
                              marginLeft: 5,
                              fontSize: 12,
                              fontWeight: "700",
                              color: "#FFFFFF",
                            }}
                          >
                            Place Order
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {/* Follow-up Suggestions Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {msg.suggestions.map((suggestion) => (
                      <TouchableOpacity
                        key={suggestion}
                        activeOpacity={0.75}
                        onPress={() => handleSendMessage(suggestion)}
                        style={{
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: "#EAE5DD",
                          backgroundColor: "#FFFFFF",
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.02,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#1A1D1F",
                          }}
                        >
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}

          {/* DeepSeek / ChatGPT Style Thinking State */}
          {isGenerating && (
            <View
              style={{
                marginBottom: 16,
                alignSelf: "flex-start",
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                borderTopLeftRadius: 3,
                borderWidth: 1,
                borderColor: "#EAE5DD",
                paddingHorizontal: 14,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#14919B",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <Ionicons name="sparkles" size={10} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#6F767E",
                  marginRight: 8,
                }}
              >
                Sui Dhaga AI is designing
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Animated.View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: "#14919B",
                    transform: [{ translateY: dot1 }],
                  }}
                />
                <Animated.View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: "#14919B",
                    transform: [{ translateY: dot2 }],
                  }}
                />
                <Animated.View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: "#14919B",
                    transform: [{ translateY: dot3 }],
                  }}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Selected Image Preview Dock */}
        {selectedImage && (
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 8,
              backgroundColor: "#FAF8F5",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 8,
                borderWidth: 1,
                borderColor: "#EAE5DD",
                alignSelf: "flex-start",
              }}
            >
              <Image
                source={{ uri: selectedImage }}
                style={{ width: 44, height: 44, borderRadius: 8 }}
                contentFit="cover"
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#1A1D1F",
                  marginLeft: 8,
                  marginRight: 10,
                }}
              >
                Inspiration attached
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: "#F1EEE9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={14} color="#6F767E" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom Input Dock (ChatGPT / Claude / DeepSeek Style) */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: "#FAF8F5",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              borderWidth: 1.2,
              borderColor: "#EAE5DD",
              paddingLeft: 8,
              paddingRight: 6,
              paddingVertical: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Attachment Button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Attach reference image"
              onPress={handlePickImage}
              activeOpacity={0.7}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F8F6F0",
                marginBottom: 2,
              }}
            >
              <Ionicons name="image-outline" size={20} color="#6F767E" />
            </TouchableOpacity>

            {/* Expanding Text Input */}
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message Sui Dhaga AI or describe an outfit..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={600}
              style={{
                flex: 1,
                fontSize: 14,
                lineHeight: 20,
                color: "#1A1D1F",
                paddingHorizontal: 10,
                paddingTop: Platform.OS === "ios" ? 8 : 6,
                paddingBottom: Platform.OS === "ios" ? 8 : 6,
                maxHeight: 110,
              }}
            />

            {/* Send or Stop Generation Button */}
            {isGenerating ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Stop generation"
                onPress={handleStopGenerating}
                activeOpacity={0.8}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#1A1D1F",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 2,
                }}
              >
                <Ionicons name="square" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Send message"
                onPress={() => handleSendMessage()}
                disabled={!inputText.trim() && !selectedImage}
                activeOpacity={0.8}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor:
                    inputText.trim() || selectedImage ? "#14919B" : "#EAE5DD",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 2,
                }}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={inputText.trim() || selectedImage ? "#FFFFFF" : "#9CA3AF"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
