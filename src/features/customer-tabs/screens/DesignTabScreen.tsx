import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { SectionTitle } from "../components/SectionTitle";
import { TabPlaceholder } from "../components/TabPlaceholder";

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
      className="mb-3 flex-row items-center rounded-xl border border-brand-border p-4"
    >
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
        <Ionicons name={icon} size={20} color="#14919B" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[13px] font-semibold text-brand-dark">{title}</Text>
        <Text className="mt-1 text-[10px] text-brand-gray">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#1A1D1F" />
    </TouchableOpacity>
  );
}

export default function DesignTabScreen() {
  return (
    <CustomerTabShell>
      <CustomerHeader title="AI Design Studio" subtitle="Create something extraordinary ✨" />
      <View className="px-5">
        <TouchableOpacity
          onPress={() => router.push("/design-studio" as never)}
          className="mb-4 flex-row items-center overflow-hidden rounded-2xl bg-primary p-4"
        >
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
            <Ionicons name="add" size={26} color="#14919B" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-[16px] font-bold text-white">New Design</Text>
            <Text className="mt-1 text-[12px] text-white">Start from scratch</Text>
          </View>
          <TabPlaceholder variant="garment" size="sm" tone="cream" />
        </TouchableOpacity>

        <DesignOption title="Text to Design" subtitle="Describe your dream outfit" icon="text" href="/design-studio/text-to-design" />
        <DesignOption title="Image to Design" subtitle="Upload image & transform" icon="image-outline" href="/design-studio/image-to-design" />
        <DesignOption title="Sketch to Design" subtitle="Upload sketch & visualize" icon="color-wand-outline" href="/design-studio/sketch-to-design" />

        <SectionTitle title="My Designs" />
        <View className="flex-row gap-3">
          {["mint", "cream", "gold"].map((tone, index) => (
            <View key={tone} className="flex-1">
              <TabPlaceholder variant="garment" size="wide" tone={tone as "mint"} label={`Design ${index + 1}`} />
            </View>
          ))}
        </View>
        <SectionTitle title="Templates" />
        <View className="flex-row gap-3">
          {["coral", "mint", "cream"].map((tone, index) => (
            <View key={tone} className="flex-1">
              <TabPlaceholder variant="garment" size="wide" tone={tone as "coral"} label={`Template ${index + 1}`} />
            </View>
          ))}
        </View>
        <CustomerTabsPreview active="Design" />
      </View>
    </CustomerTabShell>
  );
}
