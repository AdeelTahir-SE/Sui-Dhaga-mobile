import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MainTailorCard } from "../components/MainTailorCard";
import { QuickAction } from "../components/QuickAction";
import { SectionTitle } from "../components/SectionTitle";
import { TabPlaceholder } from "../components/TabPlaceholder";
import { useAuthStore } from "../../../stores/auth.store";
import { useTailors } from "../../tailors/hooks/useTailors";
import { useDesigns } from "../../design-studio/hooks/useDesigns";

const homeHero = require("@/assets/illustrations/customer-tabs/home-hero.png");
const categoryKurtas = require("@/assets/illustrations/customer-tabs/home/category-kurtas-suits.png");
const categoryLehengas = require("@/assets/illustrations/customer-tabs/home/category-lehengas.png");
const categorySarees = require("@/assets/illustrations/customer-tabs/home/category-sarees.png");
const categoryShirts = require("@/assets/illustrations/customer-tabs/home/category-shirts.png");

const categories = [
  { title: "Kurtas & Suits", image: categoryKurtas, tone: "mint" },
  { title: "Lehengas", image: categoryLehengas, tone: "coral" },
  { title: "Sarees", image: categorySarees, tone: "gold" },
  { title: "Shirts", image: categoryShirts, tone: "blue" },
] as const;

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { tailors, isLoading: tailorsLoading } = useTailors();
  const { designs, isLoading: designsLoading } = useDesigns();

  const userName = user?.fullName?.split(" ")[0] || user?.name?.split(" ")[0] || "there";

  const recommendedTailor = tailors[0];

  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Home" />}>
      <View className="px-5 pt-3 pb-8">
        <View className="mb-4 flex-row items-start justify-between">
          <View>
            <Text className="text-[17px] font-bold text-brand-dark">
              Hello, {userName} 👋
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
          <Image
            source={homeHero}
            contentFit="cover"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              height: "100%",
              width: "58%",
            }}
          />
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
          {categories.map((category) => (
            <View key={category.title} className="flex-1">
              <TabPlaceholder
                image={category.image}
                variant="garment"
                size="sm"
                tone={category.tone}
                label={category.title}
              />
            </View>
          ))}
        </View>

        <SectionTitle title="Recommended Tailors" />
        {tailorsLoading ? (
          <View className="py-6 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        ) : recommendedTailor ? (
          <MainTailorCard
            name={recommendedTailor.name || recommendedTailor.businessName || "Tailor"}
            rating={`${recommendedTailor.rating || 4.8} (${recommendedTailor.reviews || recommendedTailor.reviewsCount || 0} reviews)`}
            distance={recommendedTailor.distance || "2.1 km away"}
            specialty={recommendedTailor.specialty || recommendedTailor.specialties?.join(', ') || "Bridal, Suits, Sarees"}
            image={recommendedTailor.image || recommendedTailor.imageUrl}
            topRated={recommendedTailor.topRated || recommendedTailor.isTopRated}
          />
        ) : (
          <View className="rounded-xl border border-brand-border p-4 items-center justify-center bg-brand-surface/30">
            <Text className="text-[12px] text-brand-gray">No tailors available right now</Text>
          </View>
        )}

        {designs.length > 0 ? (
          <>
            <SectionTitle title="Recent Designs" />
            <View className="flex-row gap-2">
              {designs.slice(0, 4).map((design, index) => (
                <View key={design.id || index} className="flex-1">
                  <TabPlaceholder
                    image={design.imageUrl || design.image}
                    variant="garment"
                    size="sm"
                    tone="coral"
                    label={design.name}
                  />
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </CustomerTabShell>
  );
}
