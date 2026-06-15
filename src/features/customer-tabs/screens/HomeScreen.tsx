import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MainTailorCard } from "../components/MainTailorCard";
import { QuickAction } from "../components/QuickAction";
import { SectionTitle } from "../components/SectionTitle";
import { TabPlaceholder } from "../components/TabPlaceholder";

export default function HomeScreen() {
  return (
    <CustomerTabShell>
      <View className="px-5 pt-3">
        <View className="mb-4 flex-row items-start justify-between">
          <View>
            <Text className="text-[17px] font-bold text-brand-dark">
              Hello, Ayesha 👋
            </Text>
            <Text className="mt-1 text-[11px] text-brand-gray">
              Ready to look your best today?
            </Text>
          </View>
          <Text className="text-[20px]">♧</Text>
        </View>

        <View className="overflow-hidden rounded-2xl bg-[#FFF7EA] p-4">
          <Text className="w-[48%] text-[22px] font-bold leading-7 text-brand-dark">
            Your Style, Your Story, Our Craft.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/tailors" as never)}
            className="mt-4 self-start rounded-lg bg-primary px-4 py-3"
          >
            <Text className="text-[12px] font-semibold text-white">
              Explore Tailors
            </Text>
          </TouchableOpacity>
          <View className="absolute bottom-0 right-3">
            <TabPlaceholder variant="machine" size="hero" tone="cream" />
          </View>
        </View>

        <SectionTitle title="Quick Actions" />
        <View className="flex-row gap-2">
          <QuickAction title="Book Appointment" icon="calendar-outline" />
          <QuickAction title="AI Design Studio" icon="color-wand-outline" />
          <QuickAction title="My Orders" icon="bag-handle-outline" />
          <QuickAction title="Style Assistant" icon="sparkles-outline" />
        </View>

        <SectionTitle title="Popular Categories" />
        <View className="flex-row gap-2">
          {["Kurtas & Suits", "Lehengas", "Sarees", "Shirts"].map((title, index) => (
            <View key={title} className="flex-1">
              <TabPlaceholder
                variant="garment"
                size="sm"
                tone={["mint", "coral", "gold", "blue"][index] as "mint"}
                label={title}
              />
            </View>
          ))}
        </View>

        <SectionTitle title="Recommended Tailors" />
        <MainTailorCard
          name="Rekha Tailors"
          rating="4.8 (128 reviews)"
          distance="2.1 km away"
          specialty="Bridal, Suits, Sarees"
          topRated
        />

        <SectionTitle title="Recent Designs" />
        <View className="flex-row gap-2">
          {["Look 1", "Look 2", "Look 3", "Look 4"].map((look, index) => (
            <View key={look} className="flex-1">
              <TabPlaceholder
                variant="garment"
                size="sm"
                tone={["coral", "mint", "cream", "blue"][index] as "coral"}
                label={look}
              />
            </View>
          ))}
        </View>

        <CustomerTabsPreview active="Home" />
      </View>
    </CustomerTabShell>
  );
}
