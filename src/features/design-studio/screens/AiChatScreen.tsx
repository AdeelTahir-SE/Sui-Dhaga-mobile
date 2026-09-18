import { Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ChatBubble } from "../components/ChatBubble";
import { ScreenShell } from "../components/ScreenShell";
import { StudioHeader } from "../components/StudioHeader";
import { royalDesignImages } from "../constants/designStudioAssets";

const skinTexture = require("@/assets/texture/skin-texture.png");

export default function AiChatScreen() {
  const handlePlaceOrder = () => {
    router.push({
      pathname: "/orders/create",
      params: {
        itemName: "Royal Blue Wedding Lehenga",
      },
    } as any);
  };

  return (
    <ScreenShell>
      <StudioHeader
        title="AI Design Assistant"
        rightAction={
          <TouchableOpacity
            onPress={handlePlaceOrder}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#14919B",
              paddingHorizontal: 11,
              paddingVertical: 7,
              borderRadius: 20,
              shadowColor: "#14919B",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.22,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Ionicons name="bag-handle" size={13} color="#FFFFFF" />
            <Text
              style={{
                marginLeft: 4,
                fontSize: 12,
                fontWeight: "700",
                color: "#FFFFFF",
                letterSpacing: 0.2,
              }}
            >
              Place Order
            </Text>
          </TouchableOpacity>
        }
      />
      <View style={{ flex: 1, position: "relative", backgroundColor: "#FAF8F5" }}>
        {/* Repeated Texture Background for Chat Section */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <RNImage
            source={skinTexture}
            resizeMode="repeat"
            style={[
              StyleSheet.absoluteFill,
              {
                width: "100%",
                height: "100%",
              },
            ]}
          />
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 12, flex: 1 }}>
          <ChatBubble>Hi Ayesha! How can I help you design today?</ChatBubble>
        <ChatBubble outgoing>
          I want a royal blue lehenga for a wedding.
        </ChatBubble>
        <ChatBubble>Great choice! Here are some ideas for you.</ChatBubble>

        <View style={{ marginBottom: 16, flexDirection: "row", gap: 12 }}>
          <Image
            source={royalDesignImages[0]}
            contentFit="cover"
            style={{
              flex: 1,
              height: 160,
              borderRadius: 14,
              backgroundColor: "#F8F6F0",
              borderWidth: 1,
              borderColor: "#EAE5DD",
            }}
          />
          <View style={{ flex: 1, position: "relative" }}>
            <Image
              source={royalDesignImages[1]}
              contentFit="cover"
              style={{
                height: 160,
                width: "100%",
                borderRadius: 14,
                backgroundColor: "#F8F6F0",
                borderWidth: 1,
                borderColor: "#EAE5DD",
              }}
            />
            <View
              style={{
                position: "absolute",
                right: 8,
                top: 8,
                width: 32,
                height: 32,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Ionicons name="heart-outline" size={17} color="#6F767E" />
            </View>
          </View>
        </View>

        {/* Place Order CTA Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePlaceOrder}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F0FAFA",
            borderWidth: 1.5,
            borderColor: "#14919B",
            borderRadius: 16,
            padding: 14,
            marginBottom: 16,
            shadowColor: "#14919B",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#14919B",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="bag-handle" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#0D7377" }}>
              Love this Royal Blue Lehenga?
            </Text>
            <Text style={{ fontSize: 11, color: "#6F767E", marginTop: 2 }}>
              Tap to place a custom tailoring order with a master craftsman.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#14919B" />
        </TouchableOpacity>

        <ChatBubble>Want to customize any of these designs?</ChatBubble>

        <View style={{ marginBottom: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {["Make it lighter", "Add more embroidery", "Show other colors"].map(
            (reply) => (
              <TouchableOpacity
                key={reply}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#EAE5DD",
                  backgroundColor: "#FFFFFF",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.02,
                  shadowRadius: 1,
                  elevation: 1,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#1A1D1F" }}>{reply}</Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        <View
          style={{
            height: 50,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 25,
            borderWidth: 1,
            borderColor: "#EAE5DD",
            backgroundColor: "#FFFFFF",
            paddingLeft: 16,
            paddingRight: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text style={{ flex: 1, fontSize: 13, color: "#9CA3AF" }}>
            Ask anything about your design...
          </Text>
          <TouchableOpacity
            style={{
              height: 38,
              width: 38,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 19,
              backgroundColor: "#14919B",
            }}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </ScreenShell>
  );
}

