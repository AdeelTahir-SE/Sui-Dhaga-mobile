import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { ChatBubble } from "../components/ChatBubble";
import { ScreenShell } from "../components/ScreenShell";
import { StudioHeader } from "../components/StudioHeader";
import {
  royalDesignImages,
} from "../constants/designStudioAssets";

export default function AiChatScreen() {
  return (
    <ScreenShell>
      <StudioHeader
        title="AI Design Assistant"
        rightIcon="cloud-upload-outline"
        rightLabel="Upload"
      />
      <View className="px-5">
        <ChatBubble>Hi Ayesha! How can I help you design today?</ChatBubble>
        <ChatBubble outgoing>
          I want a royal blue lehenga for a wedding.
        </ChatBubble>
        <ChatBubble>Great choice! Here are some ideas for you.</ChatBubble>

        <View className="mb-4 flex-row gap-3">
          <Image
            source={royalDesignImages[0]}
            contentFit="cover"
            style={{
              flex: 1,
              height: 156,
              borderRadius: 12,
              backgroundColor: "#F7F8FA",
            }}
          />
          <View className="flex-1">
            <Image
              source={royalDesignImages[1]}
              contentFit="cover"
              style={{
                height: 156,
                width: "100%",
                borderRadius: 12,
                backgroundColor: "#F7F8FA",
              }}
            />
            <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-white">
              <Ionicons name="heart-outline" size={18} color="#6F767E" />
            </View>
          </View>
        </View>

        <ChatBubble>Want to customize any of these designs?</ChatBubble>

        <View className="mb-5 flex-row flex-wrap gap-2">
          {["Make it lighter", "Add more embroidery", "Show other colors"].map(
            (reply) => (
              <TouchableOpacity
                key={reply}
                className="rounded-xl border border-brand-border bg-white px-4 py-2"
              >
                <Text className="text-[12px] text-brand-dark">{reply}</Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        <View className="h-[48px] flex-row items-center rounded-full border border-brand-border bg-white pl-4 pr-2">
          <Text className="flex-1 text-[12px] text-brand-gray">
            Ask anything about your design...
          </Text>
          <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenShell>
  );
}
