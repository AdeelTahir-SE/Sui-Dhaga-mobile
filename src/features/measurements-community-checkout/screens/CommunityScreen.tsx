import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { MccTabsPreview } from "../components/MccTabsPreview";
import { PostCard } from "../components/PostCard";

const authorRekha = require("@/assets/illustrations/measurements-community-checkout/community/author-rekha.png");
const authorStitchStyle = require("@/assets/illustrations/measurements-community-checkout/community/author-stitch-style.png");
const postPastelAnarkali = require("@/assets/illustrations/measurements-community-checkout/community/post-pastel-anarkali.png");
const postNavyLehenga = require("@/assets/illustrations/measurements-community-checkout/community/post-navy-lehenga.png");

export default function CommunityScreen() {
  return (
    <MccScreenShell bottomTabs={<MccTabsPreview active="Community" />}>
      <MccHeader title="Community" rightIcon="notifications-outline" />
      <View className="px-5">
        <View className="mb-4 flex-row gap-2">
          {["For You", "Trending", "Following"].map((tab, index) => (
            <View key={tab} className={`rounded-lg px-4 py-2 ${index === 0 ? "bg-brand-surface" : "bg-white"}`}>
              <Text className="text-[11px] font-medium text-brand-dark">{tab}</Text>
            </View>
          ))}
        </View>
        <PostCard
          author="Rekha Designs"
          handle="@rekhadesigns"
          caption="Pastel green Anarkali with delicate floral embroidery."
          avatarImage={authorRekha}
          postImage={postPastelAnarkali}
          tone="mint"
        />
        <PostCard
          author="Stitch & Style"
          handle="@stitchstyle"
          caption="Navy blue lehenga with sequin work."
          avatarImage={authorStitchStyle}
          postImage={postNavyLehenga}
          tone="blue"
        />
        <TouchableOpacity
          onPress={() => router.push("/community/create" as never)}
          className="absolute bottom-16 right-5 h-14 w-14 items-center justify-center rounded-full bg-[#F05A57]"
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </MccScreenShell>
  );
}
