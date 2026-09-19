import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PostCard } from "../components/PostCard";

const authorRekha = require("@/assets/illustrations/measurements-community-checkout/community/author-rekha.png");
const authorStitchStyle = require("@/assets/illustrations/measurements-community-checkout/community/author-stitch-style.png");
const postPastelAnarkali = require("@/assets/illustrations/measurements-community-checkout/community/post-pastel-anarkali.png");
const postNavyLehenga = require("@/assets/illustrations/measurements-community-checkout/community/post-navy-lehenga.png");

const CATEGORIES = [
  "For You",
  "Trending",
  "Tailor Work",
  "Bespoke Fits",
  "Fabrics & Care",
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("For You");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MccScreenShell
      header={
        <MccHeader
          title="Community"
          showBack
          titleClassName="text-[22px] font-bold text-brand-dark"
        />
      }
      floatingAction={
        <TouchableOpacity
          onPress={() => router.push("/community/create" as any)}
          accessibilityRole="button"
          accessibilityLabel="Create Post"
          activeOpacity={0.85}
          style={{
            position: "absolute",
            right: 20,
            bottom: insets.bottom + 16,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#14919B",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#14919B",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 99,
          }}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      }
    >
      <View className="px-4 pb-20">
        {/* Search Bar */}
        <View className="mb-3 flex-row items-center rounded-xl border border-brand-border bg-brand-surface px-3.5 py-2.5">
          <Ionicons name="search-outline" size={18} color="#6F767E" />
          <TextInput
            placeholder="Search designs, tailors, fabrics..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-2 flex-1 text-[13px] text-brand-dark"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 -mx-4 px-4"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <View className="flex-row gap-2">
            {CATEGORIES.map((tab) => {
              const isActive = selectedCategory === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedCategory(tab)}
                  activeOpacity={0.7}
                  className={`rounded-full px-4 py-2 ${
                    isActive
                      ? "bg-primary shadow-sm shadow-primary/30"
                      : "border border-brand-border bg-white"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-medium ${
                      isActive ? "text-white" : "text-brand-gray"
                    }`}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Community Highlight Banner */}
        <View className="mb-4 rounded-2xl border border-primary/20 bg-primary-50 p-4">
          <View className="flex-row items-center">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15">
              <Ionicons name="sparkles" size={18} color="#14919B" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[13px] font-bold text-brand-dark">
                Sui Dhaga Community Feed
              </Text>
              <Text className="mt-0.5 text-[11px] leading-4 text-brand-gray">
                Discover bespoke tailoring, share your stitched fits & connect with master tailors.
              </Text>
            </View>
          </View>
        </View>

        {/* Posts */}
        <PostCard
          author="Rekha Designs"
          handle="@rekhadesigns"
          caption="Pastel green Anarkali with delicate floral threadwork and hand-pleated organza dupatta. Custom stitched for summer wedding guest."
          avatarImage={authorRekha}
          postImage={postPastelAnarkali}
          tone="mint"
          category="Anarkali"
          timeAgo="1h ago"
          initialLikes={142}
          commentsCount={28}
          verifiedTailor={true}
          onPress={() => router.push("/community/1" as any)}
        />

        <PostCard
          author="Stitch & Style"
          handle="@stitchstyle"
          caption="Navy blue silk lehenga with hand-embroidered sequin border and custom sweetheart neckline blouse."
          avatarImage={authorStitchStyle}
          postImage={postNavyLehenga}
          tone="blue"
          category="Bridal Lehenga"
          timeAgo="3h ago"
          initialLikes={215}
          commentsCount={45}
          verifiedTailor={true}
          onPress={() => router.push("/community/2" as any)}
        />
      </View>
    </MccScreenShell>
  );
}
