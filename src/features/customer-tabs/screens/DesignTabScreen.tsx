import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthStore } from "@/stores/auth.store";
import { useDesigns } from "../../design-studio/hooks/useDesigns";
import { TailorDashboardHeader } from "../../tailor-dashboard/components/TailorDashboardHeader";
import { TailorDashboardTabs } from "../../tailor-dashboard/components/TailorDashboardTabs";
import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { SectionTitle } from "../components/SectionTitle";
import { TabPlaceholder } from "../components/TabPlaceholder";

const newDesignDress = require("@/assets/illustrations/customer-tabs/design/new-design-dress.png");
const buttonGreenishTexture = require("@/assets/texture/button-greenish-texture.original.png");
const aiAssistantIcon = require("@/assets/illustrations/customer-tabs/home/ai-assistant-icon.png");
const aiAssistantIcon2 = require("@/assets/illustrations/customer-tabs/home/image-ai-assistant.png");

function DesignOption({
  title,
  subtitle,
  icon,
  image,
  href,
}: {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  image?: any;
  href: string;
}) {
  return (
    <TouchableOpacity
      onPress={() => router.push(href as never)}
      className="mb-3 flex-row items-center rounded-md border border-brand-border p-4 bg-white"
    >
      <View className="w-10 h-10 items-center justify-center">
        {image ? (
          <Image
            source={image}
            style={{ width: 38, height: 38 }}
            contentFit="contain"
          />
        ) : (
          <Ionicons name={icon || "sparkles"} size={32} color="#14919B" />
        )}
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[14px] font-bold text-brand-dark">{title}</Text>
        <Text className="mt-0.5 text-[11px] font-medium text-brand-gray">
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#1A1D1F" />
    </TouchableOpacity>
  );
}

export default function DesignTabScreen() {
  const { designs, templates, isLoading } = useDesigns();
  const user = useAuthStore((state) => state.user);
  const params = useLocalSearchParams<{ from?: string; role?: string }>();
  const isTailor =
    user?.role === "tailor" ||
    params.from === "tailor" ||
    params.role === "tailor";

  return (
    <CustomerTabShell
      bottomTabs={
        isTailor ? (
          <TailorDashboardTabs active="Design" />
        ) : (
          <CustomerTabsPreview active="Design" />
        )
      }
    >
      {isTailor ? (
        <TailorDashboardHeader
          title="AI Design Studio"
          subtitle="Create something extraordinary ✨"
          showBack={true}
          onBackPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/tailor-dashboard" as never);
            }
          }}
          hideRightIcon={true}
        />
      ) : (
        <CustomerHeader
          title="AI Design Studio"
          subtitle="Create something extraordinary ✨"
          hideRightIcon={true}
        />
      )}
      <View className="px-5 pb-8">
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/design-studio/chat",
              params: { mode: "designer" },
            } as never)
          }
          activeOpacity={0.85}
          className="relative mb-4 min-h-[130px] flex-row items-center justify-between overflow-hidden rounded-md bg-primary px-5 pb-0 shadow-sm"
        >
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Image
              source={buttonGreenishTexture}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
          </View>
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
          <View className="h-36 w-32 rounded-md items-center justify-center">
            <Image
              source={newDesignDress}
              contentFit="cover"
              style={{ height: "100%", width: "100%" }}
            />
          </View>
        </TouchableOpacity>

        <DesignOption
          title="AI Chat"
          subtitle="Assistant queries & outfit designer"
          image={aiAssistantIcon}
          href="/design-studio/chat"
        />
        <DesignOption
          title="Image to Design"
          subtitle="Upload image & transform"
          icon="image-outline"
          image={aiAssistantIcon2}
          href="/design-studio/image-to-design"
        />

        <SectionTitle title="My Designs" />
        {isLoading ? (
          <View className="py-4 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        ) : designs.length > 0 ? (
          <View className="flex-row gap-3">
            {designs.slice(0, 3).map((design, index) => (
              <View key={design.id || index} className="flex-1">
                <TabPlaceholder
                  image={design.imageUrl || design.image}
                  variant="garment"
                  size="wide"
                  tone="mint"
                  label={design.name}
                />
              </View>
            ))}
          </View>
        ) : (
          <View className="rounded-md border border-dashed border-brand-border py-8 px-4 items-center justify-center bg-brand-surface/20">
            <Text className="text-[13px] font-medium text-brand-gray text-center">
              No saved designs yet. Tap above to create one!
            </Text>
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
                <TabPlaceholder
                  image={template.imageUrl || template.image}
                  variant="garment"
                  size="wide"
                  tone="cream"
                  label={template.name}
                />
              </View>
            ))}
          </View>
        ) : (
          <View className="rounded-md border border-dashed border-brand-border py-8 px-4 items-center justify-center bg-brand-surface/20">
            <Text className="text-[13px] font-medium text-brand-gray text-center">
              Templates will appear here
            </Text>
          </View>
        )}
      </View>
    </CustomerTabShell>
  );
}
