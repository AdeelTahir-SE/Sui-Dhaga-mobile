import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { MccButton } from "../components/MccButton";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PlaceholderVisual } from "../components/PlaceholderVisual";
import { SectionTitle } from "../components/SectionTitle";

const authorRekha = require("@/assets/illustrations/measurements-community-checkout/community/author-rekha.png");
const commentAyesha = require("@/assets/illustrations/measurements-community-checkout/community/comment-ayesha.png");
const postPastelAnarkali = require("@/assets/illustrations/measurements-community-checkout/community/post-pastel-anarkali.png");

export default function PostDetailsScreen() {
  return (
    <MccScreenShell>
      <MccHeader title="Post Details" showBack rightText="" />
      <View className="px-5">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <PlaceholderVisual image={authorRekha} variant="person" size="xs" tone="coral" />
            <View className="ml-3">
              <Text className="text-[13px] font-bold text-brand-dark">Rekha Designs</Text>
              <Text className="text-[10px] text-brand-gray">@rekhadesigns</Text>
            </View>
          </View>
          <TouchableOpacity className="rounded-lg border border-[#F05A57] px-3 py-2">
            <Text className="text-[11px] font-semibold text-[#F05A57]">Follow</Text>
          </TouchableOpacity>
        </View>
        <View className="h-[300px] overflow-hidden rounded-xl bg-brand-surface">
          <Image
            source={postPastelAnarkali}
            contentFit="cover"
            style={{ height: "100%", width: "100%" }}
          />
        </View>
        <Text className="mt-3 text-[12px] leading-5 text-brand-dark">
          Pastel green Anarkali with delicate floral embroidery.
        </Text>
        <View className="mt-3 flex-row items-center border-b border-brand-border pb-4">
          <Ionicons name="heart" size={18} color="#F05A57" />
          <Text className="ml-2 mr-8 text-[12px] text-brand-dark">128</Text>
          <Ionicons name="chatbubble-outline" size={18} color="#1A1D1F" />
          <Text className="ml-2 flex-1 text-[12px] text-brand-dark">24</Text>
          <Ionicons name="bookmark-outline" size={19} color="#1A1D1F" />
        </View>

        <SectionTitle title="Comments (24)" />
        <View className="flex-row">
          <PlaceholderVisual image={commentAyesha} variant="person" size="xs" tone="blue" />
          <View className="ml-3 flex-1">
            <Text className="text-[12px] font-bold text-brand-dark">Ayesha Khan</Text>
            <Text className="mt-1 text-[12px] text-brand-dark">Beautiful color combination!</Text>
            <Text className="mt-2 text-[10px] text-brand-gray">1h      Reply</Text>
          </View>
          <Text className="text-[11px] text-brand-gray">♡ 12</Text>
        </View>

        <View className="mt-8 flex-row gap-3">
          <View className="flex-1">
            <MccButton title="Use as Reference" variant="outline" />
          </View>
          <TouchableOpacity className="h-[52px] w-[52px] items-center justify-center rounded-xl border border-brand-border">
            <Ionicons name="share-social-outline" size={20} color="#1A1D1F" />
          </TouchableOpacity>
        </View>
      </View>
    </MccScreenShell>
  );
}
