import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { SectionTitle } from "../components/SectionTitle";
import { TabPlaceholder } from "../components/TabPlaceholder";
import { useDesigns } from "../../design-studio/hooks/useDesigns";

const newDesignDress = require("@/assets/illustrations/customer-tabs/design/new-design-dress.png");

function DesignOption({
  title,
  subtitle,
  icon,
  href,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
}) {
  return (
    <TouchableOpacity
      onPress={() => router.push(href as never)}
      className="mb-3 flex-row items-center rounded-md border border-brand-border p-4"
    >
      <View className="h-10 w-10 items-center justify-center rounded-md bg-primary-50">
        <Ionicons name={icon} size={20} color="#14919B" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[14px] font-bold text-brand-dark">{title}</Text>
        <Text className="mt-0.5 text-[11px] font-medium text-brand-gray">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#1A1D1F" />
    </TouchableOpacity>
  );
}

export default function DesignTabScreen() {
  const { designs, templates, isLoading } = useDesigns();

  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Design" />}>
      <CustomerHeader title="AI Design Studio" subtitle="Create something extraordinary ✨" />
      <View className="px-5 pb-8">
        <TouchableOpacity
          onPress={() => router.push("/design-studio" as never)}
          activeOpacity={0.85}
          className="mb-4 min-h-[130px] flex-row items-center justify-between overflow-hidden rounded-md bg-primary p-5 shadow-sm"
        >
          <View className="flex-row items-center flex-1 pr-3">
            <View className="h-14 w-14 items-center justify-center rounded-md bg-white shadow-xs">
              <Ionicons name="add" size={28} color="#14919B" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-[20px] font-black text-white tracking-tight">
                New Design
              </Text>
              <Text className="mt-1 text-[13px] font-medium text-white/90">
                Start from scratch
              </Text>
            </View>
          </View>
          <View className="h-20 w-20 overflow-hidden rounded-md bg-white items-center justify-center">
            <Image
              source={newDesignDress}
              contentFit="contain"
              style={{ height: "100%", width: "100%" }}
            />
          </View>
        </TouchableOpacity>

        <DesignOption title="Text to Design" subtitle="Describe your dream outfit" icon="text" href="/design-studio/text-to-design" />
        <DesignOption title="Image to Design" subtitle="Upload image & transform" icon="image-outline" href="/design-studio/image-to-design" />
        <DesignOption title="Sketch to Design" subtitle="Upload sketch & visualize" icon="color-wand-outline" href="/design-studio/sketch-to-design" />

        <SectionTitle title="My Designs" />
        {isLoading ? (
          <View className="py-4 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        ) : designs.length > 0 ? (
          <View className="flex-row gap-3">
            {designs.slice(0, 3).map((design, index) => (
              <View key={design.id || index} className="flex-1">
                <TabPlaceholder image={design.imageUrl || design.image} variant="garment" size="wide" tone="mint" label={design.name} />
              </View>
            ))}
          </View>
        ) : (
          <View className="rounded-md border border-dashed border-brand-border p-4 items-center justify-center bg-brand-surface/20">
            <Text className="text-[13px] font-medium text-brand-gray">No saved designs yet. Tap above to create one!</Text>
          </View>
        )}

        <SectionTitle title="Templates" />
        {isLoading ? (
          <View className="py-4 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        ) : templates.length > 0 ? (
          <View className="flex-row gap-3">
            {templates.slice(0, 3).map((template, index) => (
              <View key={template.id || index} className="flex-1">
                <TabPlaceholder image={template.imageUrl || template.image} variant="garment" size="wide" tone="cream" label={template.name} />
              </View>
            ))}
          </View>
        ) : (
          <View className="rounded-md border border-dashed border-brand-border p-4 items-center justify-center bg-brand-surface/20">
            <Text className="text-[13px] font-medium text-brand-gray">Templates will appear here</Text>
          </View>
        )}
      </View>
    </CustomerTabShell>
  );
}
