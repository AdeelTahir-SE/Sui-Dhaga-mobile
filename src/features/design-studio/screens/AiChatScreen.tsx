import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
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
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  aiSuggestionImages,
  designPreviewImages,
  royalDesignImages,
} from "../constants/designStudioAssets";
import { AiChatDrawer, ChatSession } from "../components/AiChatDrawer";

const whiteTexture = require("@/assets/texture/white-texture.png");
const aiAssistantIcon = require("@/assets/illustrations/customer-tabs/home/ai-assistant-icon.png");
const aiAssistantIcon2 = require("@/assets/illustrations/customer-tabs/home/image-ai-assistant.png");

export type ChatTab = "assistant" | "designer";

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

const ASSISTANT_STARTER_PROMPTS = [
  {
    id: "as-1",
    title: "Fabric Drape Advice",
    icon: "leaf-outline" as const,
    prompt: "Which fabric drape and lining work best for a flared Pakistani wedding silhouette?",
    tag: "Fabrics",
  },
  {
    id: "as-2",
    title: "Fabric Meters Needed",
    icon: "resize-outline" as const,
    prompt: "How many meters of fabric do I need for a 16-kali Anarkali with a dupatta?",
    tag: "Measurements",
  },
  {
    id: "as-3",
    title: "Color Palette Matching",
    icon: "color-palette-outline" as const,
    prompt: "What dupatta and jewelry colors complement a warm golden ivory silk outfit?",
    tag: "Color Styling",
  },
  {
    id: "as-4",
    title: "Garment Care & Storage",
    icon: "shield-checkmark-outline" as const,
    prompt: "How should I clean and preserve pure velvet and heavy zardozi garments?",
    tag: "Care Guide",
  },
];

const DESIGNER_STARTER_PROMPTS = [
  {
    id: "des-1",
    title: "Bridal Lehenga",
    icon: "sparkles" as const,
    prompt: "Design a royal blue bridal lehenga with intricate gold zardozi embroidery and velvet finish",
    tag: "Trending",
  },
  {
    id: "des-2",
    title: "Pastel Anarkali",
    icon: "flower-outline" as const,
    prompt: "A pastel mint green Anarkali with floral embroidery, sheer organza sleeves, and a boat neckline",
    tag: "Festive",
  },
  {
    id: "des-3",
    title: "Summer Kurta Set",
    icon: "shirt-outline" as const,
    prompt: "Suggest a breathable pastel lawn kurta set with delicate Schiffli lace borders and straight trousers",
    tag: "Casual",
  },
  {
    id: "des-4",
    title: "Tissue Silk Saree",
    icon: "diamond-outline" as const,
    prompt: "Create a gold tissue silk saree concept with hand-scalloped zari border and designer blouse",
    tag: "Classic",
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

const SEED_SESSIONS: ChatSession[] = [
  {
    id: "seed-session-1",
    title: "Royal Velvet Bridal Lehenga",
    mode: "designer",
    createdAt: "Yesterday, 4:15 PM",
    lastMessageSnippet: "16-panel circular cut with handcrafted zardozi...",
    messages: [
      {
        id: "msg-1-1",
        sender: "user",
        text: "Design a royal blue bridal lehenga with intricate gold zardozi embroidery and velvet finish",
        timestamp: "Yesterday, 4:14 PM",
      },
      {
        id: "msg-1-2",
        sender: "assistant",
        text: "Here is a bespoke bridal silhouette crafted for you. The deep royal palette is paired with hand-embroidered zardozi and dabka motifs across a 16-panel circular flare. The micro-velvet choli features a classic sweetheart neckline and French piping along the edges.",
        timestamp: "Yesterday, 4:15 PM",
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
          "Order custom stitching with tailor",
        ],
      },
    ],
  },
  {
    id: "seed-session-2",
    title: "Fabric Drape & Lining Guide",
    mode: "assistant",
    createdAt: "2 days ago",
    lastMessageSnippet: "For Flared Silhouettes: Pure Organza, Chiffon, or Raw Silk...",
    messages: [
      {
        id: "msg-2-1",
        sender: "user",
        text: "Which fabric drape and lining work best for a flared Pakistani wedding silhouette?",
        timestamp: "2 days ago",
      },
      {
        id: "msg-2-2",
        sender: "assistant",
        text: "Here is our expert tailoring guide for ethnic drapes and fabrics:\n\n• For Flared Silhouettes (Anarkali/Lehenga): Pure Organza, Chiffon, or Raw Silk offer optimal drape. Pair with butter crepe or soft cotton silk lining to prevent clinging.\n• Flare Structure: Add a 2-inch horsehair canvas hem or soft can-can net inside the lower third for effortless runway volume without stiffness.\n• Summer Daywear: 100% fine cotton lawn or modal mulmul ensures breathability while holding tailored darts neatly.",
        timestamp: "2 days ago",
        suggestions: [
          "How many meters of fabric do I need?",
          "Best lining for raw silk",
          "Which fabrics don't wrinkle easily?",
          "Switch to Designer tab to create this outfit",
        ],
      },
    ],
  },
  {
    id: "seed-session-3",
    title: "Bespoke Lawn Kurta Set",
    mode: "designer",
    createdAt: "3 days ago",
    lastMessageSnippet: "Pure lawn with Schiffli cutwork lace & straight pants...",
    messages: [
      {
        id: "msg-3-1",
        sender: "user",
        text: "Suggest a breathable pastel lawn kurta set with delicate Schiffli lace borders and straight trousers",
        timestamp: "3 days ago",
      },
      {
        id: "msg-3-2",
        sender: "assistant",
        text: "A breathable summer ensemble featuring pure Pakistani lawn with intricate Schiffli lace accents on the daman and sleeve cuffs. Paired with straight-cut cotton cigarette trousers and an airy printed chiffon dupatta.",
        timestamp: "3 days ago",
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
      },
    ],
  },
];

export default function AiChatScreen() {
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);

  const initialTab: ChatTab = mode === "designer" ? "designer" : "assistant";
  const [activeTab, setActiveTab] = useState<ChatTab>(initialTab);

  // Chat Sessions & Hamburger Drawer state
  const [sessions, setSessions] = useState<ChatSession[]>(SEED_SESSIONS);
  const [currentSessionId, setCurrentSessionId] = useState<string>("session-active");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Maintain separate conversation histories for Assistant vs Designer
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([]);
  const [designerMessages, setDesignerMessages] = useState<ChatMessage[]>([]);

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

  const currentMessages =
    activeTab === "assistant" ? assistantMessages : designerMessages;
  const currentAiIcon =
    activeTab === "assistant" ? aiAssistantIcon : aiAssistantIcon2;

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

  const syncSessionWithMessages = (
    sessionId: string,
    msgs: ChatMessage[],
    tabMode: ChatTab,
    firstPrompt?: string
  ) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === sessionId);
      const lastMsg = msgs[msgs.length - 1];
      const snippet = lastMsg
        ? lastMsg.text.length > 55
          ? lastMsg.text.slice(0, 52) + "..."
          : lastMsg.text
        : "No messages yet";

      if (idx >= 0) {
        const copy = [...prev];
        const current = copy[idx];
        let title = current.title;
        if (
          (title.startsWith("New ") || title === "Untitled Chat") &&
          firstPrompt
        ) {
          title =
            firstPrompt.length > 30
              ? firstPrompt.slice(0, 28) + "..."
              : firstPrompt;
        }
        copy[idx] = {
          ...current,
          title,
          mode: tabMode,
          lastMessageSnippet: snippet,
          messages: msgs,
        };
        return copy;
      } else {
        const title = firstPrompt
          ? firstPrompt.length > 30
            ? firstPrompt.slice(0, 28) + "..."
            : firstPrompt
          : tabMode === "assistant"
          ? "Tailor Consultation"
          : "Custom Outfit Design";
        const newSession: ChatSession = {
          id: sessionId,
          title,
          mode: tabMode,
          createdAt: "Just now",
          lastMessageSnippet: snippet,
          messages: msgs,
        };
        return [newSession, ...prev];
      }
    });
  };

  const handleStartNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setAssistantMessages([]);
    setDesignerMessages([]);
    setInputText("");
    setSelectedImage(null);
    setIsGenerating(false);
    setIsDrawerOpen(false);
  };

  const handleNewChat = handleStartNewChat;

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setActiveTab(session.mode);
    if (session.mode === "assistant") {
      setAssistantMessages(session.messages);
      setDesignerMessages([]);
    } else {
      setDesignerMessages(session.messages);
      setAssistantMessages([]);
    }
    setInputText("");
    setSelectedImage(null);
    setIsGenerating(false);
    setIsDrawerOpen(false);
    scrollToBottom();
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this conversation from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (sessionId === currentSessionId) {
              handleStartNewChat();
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all previous chat conversations?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            setSessions([]);
            handleStartNewChat();
          },
        },
      ]
    );
  };

  const handleDrawerBack = () => {
    setIsDrawerOpen(false);
    router.back();
  };

  const handlePlaceOrder = (itemName: string) => {
    router.push({
      pathname: "/orders/create",
      params: { itemName },
    } as any);
  };

  // Assistant Logic: Answers queries, advice, fabrics, cuts, maintenance
  const generateAssistantResponse = (
    userPrompt: string
  ): {
    text: string;
    suggestions: string[];
  } => {
    const lower = userPrompt.toLowerCase();

    if (
      lower.includes("fabric") ||
      lower.includes("drape") ||
      lower.includes("lining") ||
      lower.includes("material")
    ) {
      return {
        text: `Here is our expert tailoring guide for ethnic drapes and fabrics:\n\n• For Flared Silhouettes (Anarkali/Lehenga): Pure Organza, Chiffon, or Raw Silk offer optimal drape. Pair with butter crepe or soft cotton silk lining to prevent clinging.\n• Flare Structure: Add a 2-inch horsehair canvas hem or soft can-can net inside the lower third for effortless runway volume without stiffness.\n• Summer Daywear: 100% fine cotton lawn or modal mulmul ensures breathability while holding tailored darts neatly.`,
        suggestions: [
          "How many meters of fabric do I need?",
          "Best lining for raw silk",
          "Which fabrics don't wrinkle easily?",
          "Switch to Designer tab to create this outfit",
        ],
      };
    }

    if (
      lower.includes("meter") ||
      lower.includes("yard") ||
      lower.includes("measure") ||
      lower.includes("size") ||
      lower.includes("kali")
    ) {
      return {
        text: `Here are the standard fabric calculations tailored to your silhouette:\n\n• 16-24 Kali Anarkali / Gown: 5.5 to 6.5 meters of main fabric (44" width) + 4.5 meters lining.\n• Full Flare Bridal Lehenga: 4.5 to 5.5 meters main fabric + 3.5 meters inner can-can lining.\n• Straight Kurta with Trousers: 4.5 to 5 meters total for both shirt and cigarette pants.\n• Standard Dupatta: 2.5 meters length (1.25 meters width).\n\nTip: If choosing wide-width fabric (54"+), you can save approximately 20% on total yardage.`,
        suggestions: [
          "How to measure waist and bust at home?",
          "What length is best for floor-length Anarkali?",
          "Save measurements to my profile",
          "Open Designer tab to style this",
        ],
      };
    }

    if (
      lower.includes("color") ||
      lower.includes("combination") ||
      lower.includes("contrast") ||
      lower.includes("match")
    ) {
      return {
        text: `Styling & Color Contrast Recommendations:\n\n• Ivory / Off-White Silks: Pair beautifully with emerald green, burnt rust organza, or vintage gold zari borders.\n• Royal Navy & Deep Jewel Tones: Contrast with antique champagne gold or dusty rose pink dupattas for regal balance.\n• Pastel Lilac & Mint: Complement with mother-of-pearl sequin work and soft silver French wire embroidery.\n• Evening Wedding Rule: Choose warm metallic accents (zari/tilla) if attending under candlelight or warm banquet lighting.`,
        suggestions: [
          "Suggest jewelry options for this palette",
          "Which color suits day wedding events?",
          "How to balance heavy embroidery with dupatta?",
        ],
      };
    }

    if (
      lower.includes("clean") ||
      lower.includes("wash") ||
      lower.includes("care") ||
      lower.includes("store") ||
      lower.includes("iron")
    ) {
      return {
        text: `Care & Preservation Guidelines for Artisanal Outfits:\n\n• Hand-Embroidered Zardozi / Tilla: Never wash at home. Dry clean only at specialized heritage cleaners.\n• Storage: Wrap in unbleached pure cotton or muslin cloth. Avoid plastic zip covers as trapped moisture can tarnish metallic threads.\n• Ironing: Always iron on the reverse side over a padded towel or use a vertical garment steamer.\n• Velvet Care: Never press iron directly onto velvet pile; steam gently from the inner side while hanging.`,
        suggestions: [
          "How often should festive garments be dry cleaned?",
          "Prevent silver gota tarnish",
          "Ask another tailoring query",
        ],
      };
    }

    return {
      text: `Regarding "${userPrompt}":\n\nOur master stylists recommend focusing on balanced proportions and precise body fit. For tailored Pakistani and South Asian silhouettes, getting the shoulder slope, armhole depth, and flare drop measured accurately makes all the difference.\n\nWould you like guidance on fabric selection, measuring yourself, or shall we generate a full custom outfit concept in the Designer tab?`,
      suggestions: [
        "Which fabrics are trending this season?",
        "How to prepare custom measurements for a tailor?",
        "Show color recommendations",
        "Switch to Designer tab to visualize",
      ],
    };
  };

  // Designer Logic: Generates visual couture concepts with design cards and ordering
  const generateDesignerResponse = (
    userPrompt: string
  ): {
    text: string;
    designCard?: DesignCardData;
    suggestions: string[];
  } => {
    const lower = userPrompt.toLowerCase();

    if (
      lower.includes("lehenga") ||
      lower.includes("bridal") ||
      lower.includes("wedding")
    ) {
      return {
        text: "Here is a bespoke bridal silhouette crafted for you. The deep royal palette is paired with hand-embroidered zardozi and dabka motifs across a 16-panel circular flare. The micro-velvet choli features a classic sweetheart neckline and French piping along the edges.",
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
          "Order custom stitching with tailor",
        ],
      };
    }

    if (
      lower.includes("anarkali") ||
      lower.includes("gown") ||
      lower.includes("pastel")
    ) {
      return {
        text: "For this look, I recommend a floor-length Anarkali crafted in pure organza with silk satin lining. The bodice features fine floral resham embroidery with a boat neckline, flowing into 24 panels that give a graceful, lightweight swirl.",
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
          "Book tailor consultation",
        ],
      };
    }

    if (
      lower.includes("kurta") ||
      lower.includes("lawn") ||
      lower.includes("casual")
    ) {
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
          "Order stitching for blouse",
        ],
      };
    }

    return {
      text: `I've created a custom couture concept for "${userPrompt}". Designed with balanced proportions, tailored darts for a flattering drape, and artisanal threadwork tailored specifically to your measurements.`,
      designCard: {
        title: "Bespoke Couture Concept",
        subtitle: "Custom silhouette crafted for your measurements",
        image: aiSuggestionImages[1],
        tags: ["Custom Cut", "Hand Finish", "Premium Fabric"],
        priceEstimate: "Custom Quote",
        itemName: "Custom Couture Concept",
      },
      suggestions: [
        "Tell me about suitable fabrics",
        "Add heavier embroidery on sleeves",
        "Show color swatches",
        "Book a tailor consultation",
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const messageContent = (textToSend ?? inputText).trim();
    if (!messageContent && !selectedImage) return;

    // Check if suggestion wants to switch tab
    if (
      messageContent.toLowerCase().includes("switch to designer") ||
      messageContent.toLowerCase().includes("open designer tab")
    ) {
      setActiveTab("designer");
      setInputText("");
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: messageContent,
      timestamp: getFormattedTime(),
      attachedImageUri: selectedImage ?? undefined,
    };

    let updatedUserMsgs: ChatMessage[] = [];
    if (activeTab === "assistant") {
      updatedUserMsgs = [...assistantMessages, userMessage];
      setAssistantMessages(updatedUserMsgs);
    } else {
      updatedUserMsgs = [...designerMessages, userMessage];
      setDesignerMessages(updatedUserMsgs);
    }
    syncSessionWithMessages(currentSessionId, updatedUserMsgs, activeTab, messageContent);

    setInputText("");
    setSelectedImage(null);
    setIsGenerating(true);
    scrollToBottom();

    setTimeout(() => {
      if (activeTab === "assistant") {
        const aiResult = generateAssistantResponse(messageContent);
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: aiResult.text,
          timestamp: getFormattedTime(),
          suggestions: aiResult.suggestions,
        };
        setAssistantMessages((prev) => {
          const next = [...prev, assistantMessage];
          syncSessionWithMessages(currentSessionId, next, "assistant");
          return next;
        });
      } else {
        const aiResult = generateDesignerResponse(messageContent);
        const designerMessage: ChatMessage = {
          id: `designer-${Date.now()}`,
          sender: "assistant",
          text: aiResult.text,
          timestamp: getFormattedTime(),
          designCard: aiResult.designCard,
          suggestions: aiResult.suggestions,
        };
        setDesignerMessages((prev) => {
          const next = [...prev, designerMessage];
          syncSessionWithMessages(currentSessionId, next, "designer");
          return next;
        });
      }

      setIsGenerating(false);
      scrollToBottom();
    }, 1000);
  };

  const handleStopGenerating = () => {
    setIsGenerating(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Background Texture */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <RNImage
          source={whiteTexture}
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
          borderBottomColor: "#E5E7EB",
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
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1D1F" />
          </TouchableOpacity>

          {/* AI Identity Info with currentAiIcon */}
          <View style={{ alignItems: "center", justifyContent: "center", flex: 1, marginHorizontal: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={currentAiIcon}
                style={{ width: 22, height: 22, marginRight: 7 }}
                contentFit="contain"
              />
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
          </View>

          {/* Hamburger Menu Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            onPress={() => setIsDrawerOpen(true)}
            activeOpacity={0.7}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="menu" size={22} color="#1A1D1F" />
          </TouchableOpacity>
        </View>

        {/* Dual Mode Tabs: Assistant vs Designer */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 10,
            paddingTop: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#F3F4F6",
              borderRadius: 14,
              padding: 4,
              gap: 4,
            }}
          >
            {/* Tab 1: Assistant */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveTab("assistant")}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor:
                  activeTab === "assistant" ? "#FFFFFF" : "transparent",
                shadowColor: activeTab === "assistant" ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: activeTab === "assistant" ? 0.08 : 0,
                shadowRadius: 2,
                elevation: activeTab === "assistant" ? 2 : 0,
              }}
            >
              <Image
                source={aiAssistantIcon}
                style={{
                  width: 18,
                  height: 18,
                  marginRight: 6,
                  opacity: activeTab === "assistant" ? 1 : 0.6,
                }}
                contentFit="contain"
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: activeTab === "assistant" ? "800" : "600",
                  color: activeTab === "assistant" ? "#14919B" : "#6F767E",
                }}
              >
                Assistant
              </Text>
            </TouchableOpacity>

            {/* Tab 2: Designer */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveTab("designer")}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor:
                  activeTab === "designer" ? "#FFFFFF" : "transparent",
                shadowColor: activeTab === "designer" ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: activeTab === "designer" ? 0.08 : 0,
                shadowRadius: 2,
                elevation: activeTab === "designer" ? 2 : 0,
              }}
            >
              <Image
                source={aiAssistantIcon2}
                style={{
                  width: 18,
                  height: 18,
                  marginRight: 6,
                  opacity: activeTab === "designer" ? 1 : 0.6,
                }}
                contentFit="contain"
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: activeTab === "designer" ? "800" : "600",
                  color: activeTab === "designer" ? "#14919B" : "#6F767E",
                }}
              >
                Designer
              </Text>
            </TouchableOpacity>
          </View>
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
          {currentMessages.length === 0 ? (
            /* Empty State with aiAssistantIcon and tailored starters */
            <View style={{ paddingTop: 12, paddingBottom: 24 }}>
              {/* Hero Banner with aiAssistantIcon */}
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                <View
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: 24,
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#14919B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 8,
                    elevation: 4,
                    borderWidth: 1.5,
                    borderColor: "#CCF0EE",
                  }}
                >
                  <Image
                    source={currentAiIcon}
                    style={{ width: 52, height: 52 }}
                    contentFit="contain"
                  />
                </View>
                <Text
                  style={{
                    marginTop: 14,
                    fontSize: 21,
                    fontWeight: "800",
                    color: "#1A1D1F",
                    textAlign: "center",
                    letterSpacing: -0.3,
                  }}
                >
                  {activeTab === "assistant"
                    ? "How can I help you today?"
                    : "What outfit are we creating?"}
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
                  {activeTab === "assistant"
                    ? "Ask styling queries, fabric drape guides, meter calculations, garment care, or tailor advice."
                    : "Describe an outfit idea or upload inspiration. I'll craft a bespoke couture concept with stitching estimates."}
                </Text>
              </View>

              {/* Starter Prompt Cards */}
              <View style={{ marginTop: 4 }}>
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
                  {activeTab === "assistant"
                    ? "Suggested Queries"
                    : "Suggested Design Starters"}
                </Text>
                <View style={{ gap: 10 }}>
                  {(activeTab === "assistant"
                    ? ASSISTANT_STARTER_PROMPTS
                    : DESIGNER_STARTER_PROMPTS
                  ).map((item) => (
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
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
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
            currentMessages.map((msg) => (
              <View
                key={msg.id}
                style={{
                  marginBottom: 16,
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: msg.sender === "user" ? "82%" : "92%",
                }}
              >
                {/* Assistant Label and Avatar using aiAssistantIcon */}
                {msg.sender === "assistant" && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Image
                      source={currentAiIcon}
                      style={{ width: 18, height: 18, marginRight: 6 }}
                      contentFit="contain"
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#14919B",
                      }}
                    >
                      {activeTab === "assistant"
                        ? "Sui Dhaga Assistant"
                        : "Sui Dhaga Designer"}
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
              <Image
                source={currentAiIcon}
                style={{ width: 18, height: 18, marginRight: 8 }}
                contentFit="contain"
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#6F767E",
                  marginRight: 8,
                }}
              >
                {activeTab === "assistant"
                  ? "Sui Dhaga AI is finding advice"
                  : "Sui Dhaga AI is designing"}
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
              backgroundColor: "#FFFFFF",
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
                borderColor: "#E5E7EB",
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
                  backgroundColor: "#F3F4F6",
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
            backgroundColor: "#FFFFFF",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              borderWidth: 1.2,
              borderColor: "#E5E7EB",
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
                backgroundColor: selectedImage ? "#14919B" : "#F0FAFA",
                borderWidth: 1.2,
                borderColor: selectedImage ? "#14919B" : "#CCF0EE",
                marginBottom: 2,
              }}
            >
              <Ionicons
                name="image-outline"
                size={19}
                color={selectedImage ? "#FFFFFF" : "#14919B"}
              />
            </TouchableOpacity>

            {/* Expanding Text Input */}
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                activeTab === "assistant"
                  ? "Ask styling, fabric, or tailoring query..."
                  : "Describe an outfit to design (e.g. emerald lehenga)..."
              }
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
                    inputText.trim() || selectedImage ? "#14919B" : "#F3F4F6",
                  borderWidth: inputText.trim() || selectedImage ? 0 : 1,
                  borderColor: inputText.trim() || selectedImage ? "transparent" : "#E5E7EB",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 2,
                  shadowColor: inputText.trim() || selectedImage ? "#14919B" : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: inputText.trim() || selectedImage ? 0.25 : 0,
                  shadowRadius: 3,
                  elevation: inputText.trim() || selectedImage ? 2 : 0,
                }}
              >
                <Ionicons
                  name="arrow-up"
                  size={19}
                  color={inputText.trim() || selectedImage ? "#FFFFFF" : "#9CA3AF"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Hamburger Menu Drawer */}
      <AiChatDrawer
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onBack={handleDrawerBack}
        onNewChat={handleStartNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAll}
      />
    </View>
  );
}
